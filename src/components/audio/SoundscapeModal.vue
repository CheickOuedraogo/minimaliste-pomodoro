<script setup>
import { ref } from 'vue'
import { useAudioAmbience } from '../../composables/useAudioAmbience'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const {
  isAudioEnabled,
  fadeOutEnabled,
  tracks,
  playlists,
  youtubeLinks,
  localFiles,
  activeYouTubeId,
  isYouTubePlaying,
  activeTracksCount,
  toggleTrack,
  setTrackVolume,
  addYouTubeLink,
  removeYouTubeLink,
  playYouTube,
  pauseYouTube,
  createPlaylist,
  deletePlaylist,
  importLocalAudio,
} = useAudioAmbience()

const currentTab = ref('mixer') // 'mixer' | 'playlists' | 'youtube' | 'import'

// Formulaire nouveau lien YouTube
const newYtTitle = ref('')
const newYtUrl = ref('')
const ytError = ref('')

function handleAddYouTube() {
  ytError.value = ''
  if (!newYtUrl.value) {
    ytError.value = 'Veuillez saisir une URL YouTube'
    return
  }
  const success = addYouTubeLink(newYtTitle.value, newYtUrl.value)
  if (success) {
    newYtTitle.value = ''
    newYtUrl.value = ''
  } else {
    ytError.value = 'URL YouTube invalide (ex: https://youtube.com/watch?v=...)'
  }
}

// Formulaire nouvelle playlist
const newPlaylistTitle = ref('')
function handleCreatePlaylist() {
  if (!newPlaylistTitle.value.trim()) return
  createPlaylist(newPlaylistTitle.value.trim())
  newPlaylistTitle.value = ''
}

// Gestion import local
const fileInputRef = ref(null)
function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (file) {
    importLocalAudio(file)
  }
}
function triggerFileInput() {
  fileInputRef.value?.click()
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-end justify-center bg-inverse-surface/40 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
    @click.self="emit('close')"
  >
    <div
      class="relative w-full max-w-lg bg-surface-container-lowest rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300"
    >
      <!-- Barre poignée supérieure -->
      <div class="flex justify-center pt-3 pb-2">
        <div class="w-10 h-1.5 rounded-full bg-outline-variant/60" />
      </div>

      <!-- En-tête du modal -->
      <div class="flex items-start justify-between px-6 pt-1 pb-4 border-b border-surface-container">
        <div class="flex-1 pr-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[22px]">graphic_eq</span>
            <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
              Ambiances sonores
            </h2>
          </div>
          <p class="font-body-sm text-body-sm text-tertiary mt-1">
            Bruits de fond favorisant la concentration sans distraction
          </p>
        </div>
        <button
          type="button"
          aria-label="Fermer"
          class="w-9 h-9 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-tertiary hover:text-on-surface transition-colors"
          @click="emit('close')"
        >
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <!-- Onglets du modal -->
      <div class="flex items-center gap-1 px-6 pt-3 pb-1 border-b border-surface-container/60 overflow-x-auto">
        <button
          type="button"
          class="px-3 py-1.5 rounded-full font-label-md text-label-md transition-colors whitespace-nowrap"
          :class="currentTab === 'mixer' ? 'bg-primary text-on-primary font-semibold' : 'text-tertiary hover:text-on-surface hover:bg-surface-container'"
          @click="currentTab = 'mixer'"
        >
          Mixeur
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded-full font-label-md text-label-md transition-colors whitespace-nowrap"
          :class="currentTab === 'playlists' ? 'bg-primary text-on-primary font-semibold' : 'text-tertiary hover:text-on-surface hover:bg-surface-container'"
          @click="currentTab = 'playlists'"
        >
          Playlists ({{ playlists.length }})
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded-full font-label-md text-label-md transition-colors whitespace-nowrap"
          :class="currentTab === 'youtube' ? 'bg-primary text-on-primary font-semibold' : 'text-tertiary hover:text-on-surface hover:bg-surface-container'"
          @click="currentTab = 'youtube'"
        >
          YouTube
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded-full font-label-md text-label-md transition-colors whitespace-nowrap"
          :class="currentTab === 'import' ? 'bg-primary text-on-primary font-semibold' : 'text-tertiary hover:text-on-surface hover:bg-surface-container'"
          @click="currentTab = 'import'"
        >
          Import Local
        </button>
      </div>

      <!-- Corps du modal déroulant -->
      <div class="px-6 py-4 overflow-y-auto flex flex-col gap-5 flex-1">
        <!-- Switch d'activation générale -->
        <div class="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-low border border-surface-container">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-[22px]">volume_up</span>
            </div>
            <div>
              <div class="font-label-lg text-label-lg text-on-surface font-medium">
                Activer le fond sonore
              </div>
              <div class="font-body-sm text-body-sm text-tertiary">
                Mixage audio doux en arrière-plan
              </div>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="isAudioEnabled" type="checkbox" class="sr-only peer" />
            <div class="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
          </label>
        </div>

        <!-- VUE 1 : MIXEUR DE PISTES LOCALES -->
        <div v-if="currentTab === 'mixer'" class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
              Mixage & Volume des pistes
            </span>
            <span class="font-label-sm text-label-sm text-primary font-medium">
              {{ activeTracksCount }} piste(s) active(s)
            </span>
          </div>

          <div class="flex flex-col gap-2.5">
            <div
              v-for="track in tracks"
              :key="track.id"
              class="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container/80 flex flex-col gap-2.5 transition-all"
              :class="{ 'ring-1 ring-primary/20 bg-surface-container-lowest': track.isPlaying }"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center"
                    :class="track.colorClass"
                  >
                    <span class="material-symbols-outlined text-[18px]">{{ track.icon }}</span>
                  </div>
                  <div>
                    <div class="font-label-lg text-label-lg text-on-surface font-medium">
                      {{ track.name }}
                    </div>
                    <div class="font-body-sm text-body-sm text-tertiary">
                      {{ track.description }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span class="font-label-sm text-label-sm font-semibold" :class="track.colorClass">
                    {{ track.volume }}%
                  </span>
                  <button
                    type="button"
                    class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center transition-colors hover:bg-surface-container-high"
                    :class="track.colorClass"
                    @click="toggleTrack(track.id)"
                  >
                    <span class="material-symbols-outlined text-[18px]">
                      {{ track.isPlaying ? 'pause' : 'play_arrow' }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Curseur de volume fin -->
              <div class="flex items-center gap-3 px-1">
                <span class="material-symbols-outlined text-[16px] text-tertiary">volume_mute</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  :value="track.volume"
                  class="w-full h-1.5 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
                  @input="setTrackVolume(track.id, $event.target.value)"
                />
                <span class="material-symbols-outlined text-[16px] text-tertiary">volume_up</span>
              </div>
            </div>
          </div>
        </div>

        <!-- VUE 2 : PLAYLISTS PERSONNALISÉES -->
        <div v-else-if="currentTab === 'playlists'" class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
              Mes Playlists d'ambiance
            </span>
          </div>

          <!-- Créer une playlist -->
          <div class="flex items-center gap-2">
            <input
              v-model="newPlaylistTitle"
              type="text"
              placeholder="Nom de la nouvelle playlist..."
              class="flex-1 px-3.5 py-2 rounded-xl bg-surface-container-low border border-surface-container text-body-md text-on-surface outline-none focus:bg-surface-container-lowest"
              @keydown.enter="handleCreatePlaylist"
            />
            <button
              type="button"
              class="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors"
              @click="handleCreatePlaylist"
            >
              Créer
            </button>
          </div>

          <!-- Liste des playlists -->
          <div class="flex flex-col gap-2">
            <div
              v-for="pl in playlists"
              :key="pl.id"
              class="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container flex items-center justify-between hover:bg-surface-container transition-all"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary">
                  <span class="material-symbols-outlined text-[20px]">{{ pl.icon || 'queue_music' }}</span>
                </div>
                <div>
                  <div class="font-label-lg text-label-lg text-on-surface font-medium">
                    {{ pl.title }}
                  </div>
                  <div class="font-body-sm text-body-sm text-tertiary">
                    {{ pl.tracks.length }} pistes associées
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  title="Supprimer la playlist"
                  class="w-8 h-8 rounded-full hover:bg-error/10 text-tertiary hover:text-error flex items-center justify-center transition-colors"
                  @click="deletePlaylist(pl.id)"
                >
                  <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- VUE 3 : AMBIANCES YOUTUBE -->
        <div v-else-if="currentTab === 'youtube'" class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
              Flux d'ambiance YouTube
            </span>
          </div>

          <!-- Formulaire ajout lien YouTube -->
          <div class="flex flex-col gap-2 p-3.5 rounded-2xl bg-surface-container-low border border-surface-container">
            <input
              v-model="newYtTitle"
              type="text"
              placeholder="Titre de la vidéo (ex: Pluie & Jazz Lofi)"
              class="px-3 py-2 rounded-xl bg-surface-container-lowest border border-surface-container/60 text-body-md outline-none"
            />
            <div class="flex items-center gap-2">
              <input
                v-model="newYtUrl"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                class="flex-1 px-3 py-2 rounded-xl bg-surface-container-lowest border border-surface-container/60 text-body-md outline-none"
              />
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors"
                @click="handleAddYouTube"
              >
                Ajouter
              </button>
            </div>
            <p v-if="ytError" class="text-error text-body-sm">{{ ytError }}</p>
          </div>

          <!-- Liste des vidéos YouTube -->
          <div class="flex flex-col gap-2">
            <div
              v-for="yt in youtubeLinks"
              :key="yt.id"
              class="p-3 rounded-2xl bg-surface-container-low border border-surface-container flex items-center justify-between"
              :class="{ 'ring-1 ring-primary/30 bg-surface-container-lowest': activeYouTubeId === yt.id }"
            >
              <div class="flex items-center gap-3 flex-1 min-w-0 pr-2">
                <div class="w-8 h-8 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-[18px]">smart_display</span>
                </div>
                <div class="truncate">
                  <div class="font-label-md text-label-md text-on-surface truncate">
                    {{ yt.title }}
                  </div>
                  <div class="font-body-sm text-body-sm text-tertiary truncate">
                    ID: {{ yt.videoId }}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors"
                  @click="activeYouTubeId === yt.id && isYouTubePlaying ? pauseYouTube() : playYouTube(yt.id)"
                >
                  <span class="material-symbols-outlined text-[18px]">
                    {{ activeYouTubeId === yt.id && isYouTubePlaying ? 'pause' : 'play_arrow' }}
                  </span>
                </button>
                <button
                  type="button"
                  class="w-8 h-8 rounded-full hover:bg-error/10 text-tertiary hover:text-error flex items-center justify-center transition-colors"
                  @click="removeYouTubeLink(yt.id)"
                >
                  <span class="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Lecteur YouTube discret intégré pour l'ambiance sonore -->
          <div v-if="activeYouTubeId" class="mt-2 rounded-2xl overflow-hidden border border-surface-container">
            <iframe
              v-for="yt in youtubeLinks.filter(y => y.id === activeYouTubeId)"
              :key="yt.id"
              class="w-full h-32"
              :src="`https://www.youtube-nocookie.com/embed/${yt.videoId}?autoplay=1&enablejsapi=1`"
              title="YouTube Ambient Audio"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>
        </div>

        <!-- VUE 4 : IMPORT LOCAL -->
        <div v-else-if="currentTab === 'import'" class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
              Fichiers Audio Locaux
            </span>
          </div>

          <input
            ref="fileInputRef"
            type="file"
            accept="audio/*"
            class="hidden"
            @change="handleFileChange"
          />

          <!-- Zone de glisser-déposer / bouton d'import -->
          <div
            class="border-2 border-dashed border-outline-variant/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container transition-colors"
            @click="triggerFileInput"
          >
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <span class="material-symbols-outlined text-[24px]">audio_file</span>
            </div>
            <div class="font-label-md text-label-md text-on-surface font-semibold">
              Importer une musique ou ambiance
            </div>
            <p class="font-body-sm text-body-sm text-tertiary mt-1">
              MP3, WAV, FLAC, AAC ou son binaural depuis votre appareil
            </p>
          </div>

          <!-- Liste des fichiers importés -->
          <div v-if="localFiles.length > 0" class="flex flex-col gap-2">
            <div
              v-for="file in localFiles"
              :key="file.id"
              class="p-3 rounded-2xl bg-surface-container-low border border-surface-container flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary">
                  <span class="material-symbols-outlined text-[18px]">music_note</span>
                </div>
                <div>
                  <div class="font-label-md text-label-md text-on-surface">
                    {{ file.name }}
                  </div>
                  <div class="font-body-sm text-body-sm text-tertiary">
                    {{ file.size }}
                  </div>
                </div>
              </div>

              <!-- Mini lecteur audio HTML5 -->
              <audio :src="file.url" controls class="h-8 max-w-[140px]" />
            </div>
          </div>
        </div>

        <!-- Options communes de fin de session -->
        <div class="flex flex-col gap-2 mt-1">
          <span class="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
            Options de fin de séance
          </span>
          <div class="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low border border-surface-container">
            <div class="flex items-center gap-2.5">
              <span class="material-symbols-outlined text-[18px] text-primary">fade</span>
              <div>
                <div class="font-label-md text-label-md text-on-surface font-medium">
                  Fondu en fin de session
                </div>
                <div class="font-body-sm text-body-sm text-tertiary">
                  Fade-out progressif 2 min avant la fin
                </div>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="fadeOutEnabled" type="checkbox" class="sr-only peer" />
              <div class="w-10 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>
        </div>

        <!-- Badge de réassurance locale -->
        <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low text-tertiary">
          <span class="material-symbols-outlined text-[16px] text-primary">offline_bolt</span>
          <span class="font-body-sm text-body-sm">
            Lectures audio générées localement (zéro streaming • faible conso)
          </span>
        </div>
      </div>

      <!-- Pied du modal -->
      <div class="p-4 border-t border-surface-container bg-surface-container-lowest flex items-center gap-3">
        <button
          type="button"
          class="flex-1 h-12 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 transition-colors"
          @click="toggleTrack('blanc')"
        >
          <span class="material-symbols-outlined text-[18px]">play_circle</span>
          Tester l'ambiance
        </button>
        <button
          type="button"
          class="flex-1 h-12 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md uppercase tracking-wider font-semibold shadow-[0_4px_14px_rgba(171,45,42,0.3)] flex items-center justify-center gap-1.5 transition-all"
          @click="emit('close')"
        >
          Appliquer à la session
        </button>
      </div>
    </div>
  </div>
</template>
