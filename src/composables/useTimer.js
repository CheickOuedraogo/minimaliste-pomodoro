import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * Catégories de focus prédéfinies avec leurs codes couleurs du design system Serene Focus.
 */
export const FOCUS_CATEGORIES = [
  { id: 'deep-work', name: 'Deep Work', color: '#ab2d2a', badgeClass: 'bg-primary' },
  { id: 'ecriture', name: 'Écriture', color: '#a13d39', badgeClass: 'bg-secondary' },
  { id: 'recherche', name: 'Recherche', color: '#7e7271', badgeClass: 'bg-tertiary-container' },
  { id: 'admin', name: 'Admin & Tri', color: '#8c706e', badgeClass: 'bg-outline' },
]

/**
 * État partagé (Singleton pattern via Composable)
 * Cela permet de conserver l'état du timer même lorsqu'on navigue entre les onglets (Focus, Timeline, Tâches, Bilan).
 */
const durationMinutes = ref(25)
const remainingSeconds = ref(25 * 60)
const isRunning = ref(false)
const intention = ref('')
const selectedCategory = ref(FOCUS_CATEGORIES[0])
const completedSessionsToday = ref(3) // sessions initiales de démonstration réaliste
const totalMinutesToday = ref(115) // 1h55

let timerInterval = null
let targetTimestamp = null

export function useTimer() {
  /**
   * Calcul du temps formaté (MM:SS) avec padding
   */
  const formattedTime = computed(() => {
    const mins = Math.floor(remainingSeconds.value / 60)
    const secs = remainingSeconds.value % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  })

  /**
   * Calcul de l'angle de l'aiguille en degrés (0° à 360°)
   * Une minute = 6 degrés. On calcule au dixième de seconde pour une fluidité analogique.
   */
  const needleRotation = computed(() => {
    const currentMins = remainingSeconds.value / 60
    return (currentMins % 60) * 6
  })

  /**
   * Calcul du chemin SVG (d) pour le secteur coloré (wedge)
   * Centre du cadran : (120, 120), rayon : 92.
   * L'angle part de midi (12h, -90° trigonométrique) et tourne dans le sens horaire.
   */
  const svgWedgePath = computed(() => {
    const mins = remainingSeconds.value / 60
    const degrees = Math.min((mins % 60) * 6, 359.99)

    // Cas où le cadran est vide ou à 0
    if (degrees <= 0.1) {
      return ''
    }

    // Cas où le temps couvre 60 minutes pleines
    if (degrees >= 359.9) {
      return 'M 120 120 L 120 28 A 92 92 0 1 1 119.99 28 Z'
    }

    // Conversion en radians (-90 degrés pour commencer au sommet / 12h)
    const radians = (degrees - 90) * (Math.PI / 180)
    const endX = 120 + 92 * Math.cos(radians)
    const endY = 120 + 92 * Math.sin(radians)
    const largeArc = degrees > 180 ? 1 : 0

    return `M 120 120 L 120 28 A 92 92 0 ${largeArc} 1 ${endX.toFixed(1)} ${endY.toFixed(1)} Z`
  })

  /**
   * Fenêtre temporelle estimée : heure de début -> heure de fin prévue
   * Ex: "14:20 → 14:45"
   */
  const horizonWindow = computed(() => {
    const now = new Date()
    const minsLeft = Math.ceil(remainingSeconds.value / 60)
    const endTime = new Date(now.getTime() + minsLeft * 60000)

    const pad = (n) => n.toString().padStart(2, '0')
    const startStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`
    const endStr = `${pad(endTime.getHours())}:${pad(endTime.getMinutes())}`

    return `${startStr} → ${endStr}`
  })

  /**
   * Pourcentage d'avancement de la session en cours
   */
  const progressRatio = computed(() => {
    const totalSecs = durationMinutes.value * 60
    if (totalSecs <= 0) return 0
    return Math.max(0, Math.min(1, 1 - remainingSeconds.value / totalSecs))
  })

  /**
   * Sélection d'une durée prédéfinie (15, 25, 45, 60 minutes)
   */
  function setDuration(mins) {
    if (isRunning.value) return // Empêche de modifier en cours de session active
    durationMinutes.value = mins
    remainingSeconds.value = mins * 60
  }

  /**
   * Sélection de la catégorie
   */
  function setCategory(cat) {
    selectedCategory.value = cat
  }

  /**
   * Démarre le minuteur avec synchronisation basée sur le timestamp système
   * Pourquoi un timestamp plutôt qu'un simple decrement ?
   * -> Dans les navigateurs et WebViews, les intervalles sont throttle lorsque l'onglet ou l'écran est en veille.
   * -> En comparant le temps réel Date.now(), le timer reste mathématiquement exact sans dérive temporelle !
   */
  function startSession() {
    if (remainingSeconds.value <= 0) {
      remainingSeconds.value = durationMinutes.value * 60
    }
    targetTimestamp = Date.now() + remainingSeconds.value * 1000
    isRunning.value = true

    clearInterval(timerInterval)
    timerInterval = setInterval(() => {
      const msLeft = targetTimestamp - Date.now()
      if (msLeft <= 0) {
        remainingSeconds.value = 0
        completeSession()
      } else {
        remainingSeconds.value = Math.ceil(msLeft / 1000)
      }
    }, 250) // cadence rapide pour un affichage réactif
  }

  /**
   * Met en pause la session active
   */
  function pauseSession() {
    isRunning.value = false
    clearInterval(timerInterval)
    timerInterval = null
  }

  /**
   * Bascule entre Démarrer et Pause
   */
  function toggleSession() {
    if (isRunning.value) {
      pauseSession()
    } else {
      startSession()
    }
  }

  /**
   * Réinitialise le minuteur à la durée initiale
   */
  function resetSession() {
    pauseSession()
    remainingSeconds.value = durationMinutes.value * 60
  }

  /**
   * Fin de session réussie
   */
  function completeSession() {
    pauseSession()
    completedSessionsToday.value += 1
    totalMinutesToday.value += durationMinutes.value

    // Notification sonore discrète si supportée
    playChime()
  }

  /**
   * Gong subtil de fin de session via l'API Web Audio (aucun fichier MP3 requis !)
   */
  function playChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      // Fréquence douce 528 Hz (note apaisante "Solfeggio")
      osc.type = 'sine'
      osc.frequency.setValueAtTime(528, ctx.currentTime)

      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 2.6)
    } catch {
      // Ignorer si audio non autorisé
    }
  }

  return {
    durationMinutes,
    remainingSeconds,
    isRunning,
    intention,
    selectedCategory,
    categories: FOCUS_CATEGORIES,
    formattedTime,
    needleRotation,
    svgWedgePath,
    horizonWindow,
    progressRatio,
    completedSessionsToday,
    totalMinutesToday,
    setDuration,
    setCategory,
    startSession,
    pauseSession,
    toggleSession,
    resetSession,
  }
}
