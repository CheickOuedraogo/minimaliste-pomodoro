import { ref, computed, watch } from 'vue'

/**
 * Moteur Audio d'Ambiances Sonores
 * Gère à la fois :
 * 1. Synthèse locale temps réel Web Audio API (zéro réseau, faible consommation, autonomie maximale)
 * 2. Pistes audio locales importées par l'utilisateur (MP3, WAV, FLAC, AAC)
 * 3. Ambiances YouTube (intégration IFrame API / player background)
 * 4. Playlists personnalisées avec persistance dans le localStorage
 */

// États globaux partagés
const isAudioEnabled = ref(true)
const masterVolume = ref(80)
const fadeOutEnabled = ref(true)
const activePresetId = ref('silence') // 'silence' | 'pluie' | 'cafe' | 'blanc'

// Pistes de mixage avec volumes individuels
const tracks = ref([
  {
    id: 'blanc',
    name: 'Bruit blanc',
    description: 'Fréquence apaisante & masquage acoustique',
    icon: 'waves',
    volume: 60,
    isPlaying: false,
    colorClass: 'text-primary',
  },
  {
    id: 'pluie',
    name: 'Pluie douce',
    description: 'Averse régulière sur vitres',
    icon: 'rainy',
    volume: 40,
    isPlaying: false,
    colorClass: 'text-secondary',
  },
  {
    id: 'cafe',
    name: 'Café tranquille',
    description: 'Murmures feutrés & cliquetis de tasses',
    icon: 'coffee',
    volume: 20,
    isPlaying: false,
    colorClass: 'text-tertiary',
  },
  {
    id: 'foret',
    name: 'Forêt & Vent',
    description: 'Bruissement de feuilles & souffle boréal',
    icon: 'forest',
    volume: 30,
    isPlaying: false,
    colorClass: 'text-outline',
  },
])

// Playlists de l'utilisateur
const defaultPlaylists = []

const savedPlaylists = localStorage.getItem('focus_playlists')
const playlists = ref(savedPlaylists ? JSON.parse(savedPlaylists) : defaultPlaylists)
const activePlaylistId = ref(null)

// YouTube links list
const savedYouTube = localStorage.getItem('focus_youtube_links')
const youtubeLinks = ref(savedYouTube ? JSON.parse(savedYouTube) : [])

const activeYouTubeId = ref(null)
const isYouTubePlaying = ref(false)

// Pistes importées localement
const localFiles = ref([])

// Contexte Web Audio singleton
let audioCtx = null
const synthNodes = {}

function getAudioContext() {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (AudioCtx) {
      audioCtx = new AudioCtx()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

/**
 * Générateur de bruit blanc / rose / marron natif Web Audio
 */
function startSynthSound(type, volumeRatio) {
  const ctx = getAudioContext()
  if (!ctx) return

  // Arrêter l'ancien si existant
  stopSynthSound(type)

  const bufferSize = 2 * ctx.sampleRate
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const output = noiseBuffer.getChannelData(0)

  let lastOut = 0.0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    if (type === 'blanc') {
      output[i] = white * 0.15
    } else if (type === 'pluie') {
      // Bruit rose filtré pour imiter la pluie
      lastOut = (lastOut + 0.02 * white) / 1.02
      output[i] = lastOut * 1.5
    } else if (type === 'cafe') {
      // Bruit feutré basse fréquence
      lastOut = (lastOut + 0.01 * white) / 1.01
      output[i] = lastOut * 1.2
    } else {
      // Forêt / vent
      output[i] = (Math.sin(i / 1000) * 0.05 + white * 0.08)
    }
  }

  const whiteNoiseSource = ctx.createBufferSource()
  whiteNoiseSource.buffer = noiseBuffer
  whiteNoiseSource.loop = true

  const gainNode = ctx.createGain()
  const computedGain = (volumeRatio / 100) * (masterVolume.value / 100) * 0.3
  gainNode.gain.setValueAtTime(computedGain, ctx.currentTime)

  // Filtre passe-bas pour adoucir le spectre
  const filter = ctx.createBiquadFilter()
  filter.type = type === 'blanc' ? 'lowpass' : 'bandpass'
  filter.frequency.setValueAtTime(type === 'blanc' ? 1200 : 800, ctx.currentTime)
  filter.Q.setValueAtTime(1, ctx.currentTime)

  whiteNoiseSource.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(ctx.destination)

  whiteNoiseSource.start(0)

  synthNodes[type] = {
    source: whiteNoiseSource,
    gain: gainNode,
    filter,
  }
}

function stopSynthSound(type) {
  if (synthNodes[type]) {
    try {
      synthNodes[type].source.stop()
      synthNodes[type].source.disconnect()
    } catch {
      // Ignorer
    }
    delete synthNodes[type]
  }
}

function updateSynthGain(type, volumeRatio) {
  if (synthNodes[type] && audioCtx) {
    const computedGain = (volumeRatio / 100) * (masterVolume.value / 100) * 0.3
    synthNodes[type].gain.gain.setValueAtTime(computedGain, audioCtx.currentTime)
  }
}

function stopAllSynth() {
  Object.keys(synthNodes).forEach(type => stopSynthSound(type))
}

export function useAudioAmbience() {
  /**
   * Nombre de pistes actives
   */
  const activeTracksCount = computed(() => {
    return tracks.value.filter(t => t.isPlaying).length
  })

  /**
   * Libellé d'ambiance actuel pour l'en-tête et la barre rapide
   */
  const currentSoundLabel = computed(() => {
    if (!isAudioEnabled.value) return 'Muet'
    if (activePresetId.value === 'silence') return 'Silence'
    if (activePresetId.value === 'pluie') return 'Pluie douce'
    if (activePresetId.value === 'cafe') return 'Café calme'
    if (activePresetId.value === 'blanc') return 'Bruit blanc'
    if (activeYouTubeId.value) return 'YouTube'
    if (activePlaylistId.value) return 'Playlist'
    return 'Ambiance personnalisée'
  })

  /**
   * Sélection d'un preset rapide (Silence, Pluie, Café, Bruit blanc)
   */
  function selectPreset(presetId) {
    activePresetId.value = presetId
    activeYouTubeId.value = null
    isYouTubePlaying.value = false

    if (presetId === 'silence' || !isAudioEnabled.value) {
      stopAllSynth()
      tracks.value.forEach(t => (t.isPlaying = false))
      return
    }

    // Activer la piste correspondante
    tracks.value.forEach(t => {
      if (t.id === presetId) {
        t.isPlaying = true
        startSynthSound(t.id, t.volume)
      } else {
        t.isPlaying = false
        stopSynthSound(t.id)
      }
    })
  }

  /**
   * Bascule play/pause sur une piste individuelle du mixeur
   */
  function toggleTrack(trackId) {
    const tr = tracks.value.find(t => t.id === trackId)
    if (!tr) return

    tr.isPlaying = !tr.isPlaying
    if (tr.isPlaying) {
      activePresetId.value = 'custom'
      startSynthSound(tr.id, tr.volume)
    } else {
      stopSynthSound(tr.id)
    }
  }

  /**
   * Modification du volume d'une piste
   */
  function setTrackVolume(trackId, val) {
    const tr = tracks.value.find(t => t.id === trackId)
    if (tr) {
      tr.volume = Number(val)
      if (tr.isPlaying) {
        updateSynthGain(tr.id, tr.volume)
      }
    }
  }

  /**
   * Extraire l'ID vidéo d'un lien YouTube
   */
  function extractYouTubeId(url) {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  /**
   * Ajouter un lien YouTube
   */
  function addYouTubeLink(title, url) {
    const videoId = extractYouTubeId(url)
    if (!videoId) return false

    const item = {
      id: `yt-${Date.now()}`,
      title: title || 'Ambiance YouTube',
      url,
      videoId,
    }
    youtubeLinks.value.push(item)
    localStorage.setItem('focus_youtube_links', JSON.stringify(youtubeLinks.value))
    return true
  }

  /**
   * Supprimer un lien YouTube
   */
  function removeYouTubeLink(id) {
    youtubeLinks.value = youtubeLinks.value.filter(yt => yt.id !== id)
    localStorage.setItem('focus_youtube_links', JSON.stringify(youtubeLinks.value))
    if (activeYouTubeId.value === id) {
      activeYouTubeId.value = null
      isYouTubePlaying.value = false
    }
  }

  /**
   * Jouer un flux YouTube
   */
  function playYouTube(id) {
    stopAllSynth()
    tracks.value.forEach(t => (t.isPlaying = false))
    activePresetId.value = 'youtube'
    activeYouTubeId.value = id
    isYouTubePlaying.value = true
  }

  function pauseYouTube() {
    isYouTubePlaying.value = false
  }

  /**
   * Créer une playlist personnalisée
   */
  function createPlaylist(title, icon = 'queue_music') {
    if (!title) return
    const pl = {
      id: `pl-${Date.now()}`,
      title,
      icon,
      tracksCount: 0,
      tracks: [],
    }
    playlists.value.push(pl)
    localStorage.setItem('focus_playlists', JSON.stringify(playlists.value))
  }

  /**
   * Supprimer une playlist
   */
  function deletePlaylist(id) {
    playlists.value = playlists.value.filter(p => p.id !== id)
    localStorage.setItem('focus_playlists', JSON.stringify(playlists.value))
    if (activePlaylistId.value === id) {
      activePlaylistId.value = null
    }
  }

  /**
   * Importer un fichier audio local
   */
  function importLocalAudio(file) {
    if (!file) return
    const url = URL.createObjectURL(file)
    const track = {
      id: `local-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      size: `${(file.size / (1024 * 1024)).toFixed(1)} Mo`,
      url,
      isPlaying: false,
    }
    localFiles.value.push(track)
  }

  // Observer le masterVolume
  watch(masterVolume, () => {
    tracks.value.forEach(t => {
      if (t.isPlaying) updateSynthGain(t.id, t.volume)
    })
  })

  // Observer l'activation globale
  watch(isAudioEnabled, (enabled) => {
    if (!enabled) {
      stopAllSynth()
      isYouTubePlaying.value = false
    } else if (activePresetId.value !== 'silence') {
      selectPreset(activePresetId.value)
    }
  })

  return {
    isAudioEnabled,
    masterVolume,
    fadeOutEnabled,
    activePresetId,
    tracks,
    playlists,
    youtubeLinks,
    localFiles,
    activeYouTubeId,
    isYouTubePlaying,
    activeTracksCount,
    currentSoundLabel,
    selectPreset,
    toggleTrack,
    setTrackVolume,
    addYouTubeLink,
    removeYouTubeLink,
    playYouTube,
    pauseYouTube,
    createPlaylist,
    deletePlaylist,
    importLocalAudio,
  }
}
