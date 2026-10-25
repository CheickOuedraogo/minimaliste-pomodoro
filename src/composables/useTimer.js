import { ref, computed } from 'vue'
import { useSessions } from './useSessions'

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
 * État partagé (Singleton réactif)
 */
const durationMinutes = ref(25)
const remainingSeconds = ref(25 * 60)
const isRunning = ref(false)
const selectedCategory = ref(FOCUS_CATEGORIES[0])

let timerInterval = null
let targetTimestamp = null
let sessionStartTimeStr = null

export function useTimer() {
  const { todaySessions, todayMinutes, addSession } = useSessions()

  const completedSessionsToday = computed(() => todaySessions.value.length)
  const totalMinutesToday = computed(() => todayMinutes.value)

  /**
   * Calcul du temps formaté (MM:SS) avec padding
   */
  const formattedTime = computed(() => {
    const mins = Math.floor(remainingSeconds.value / 60)
    const secs = remainingSeconds.value % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  })

  /**
   * Détermine si le cadran doit être un cercle complet plein (ex: 60 min)
   * Corrige le bug où 60 min faisait disparaître le rouge !
   */
  const isFullCircle = computed(() => {
    return remainingSeconds.value >= 3600
  })

  /**
   * Calcul de l'angle en degrés (0° à 360°)
   */
  const currentDegrees = computed(() => {
    const secs = remainingSeconds.value
    if (secs <= 0) return 0
    if (secs >= 3600) return 360
    return (secs / 3600) * 360
  })

  /**
   * Angle de rotation de l'aiguille
   */
  const needleRotation = computed(() => {
    return currentDegrees.value
  })

  /**
   * Calcul géométrique du chemin SVG (d) pour le secteur coloré (wedge)
   */
  const svgWedgePath = computed(() => {
    const deg = currentDegrees.value

    if (deg <= 0.1) return ''
    if (deg >= 359.5) return 'FULL'

    const radians = (deg - 90) * (Math.PI / 180)
    const endX = 120 + 92 * Math.cos(radians)
    const endY = 120 + 92 * Math.sin(radians)
    const largeArc = deg > 180 ? 1 : 0

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
   * État de pause active (la session a commencé mais est actuellement suspendue)
   */
  const isPaused = computed(() => {
    return !isRunning.value && remainingSeconds.value < durationMinutes.value * 60 && remainingSeconds.value > 0
  })

  /**
   * Sélection d'une durée prédéfinie (15, 25, 45, 60 minutes)
   */
  function setDuration(mins) {
    if (isRunning.value) return
    durationMinutes.value = mins
    remainingSeconds.value = mins * 60
  }

  /**
   * Sélection de la catégorie
   */
  function setCategory(cat) {
    selectedCategory.value = cat
  }

  function getNowTimeStr() {
    const d = new Date()
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  /**
   * Démarre la session de concentration
   */
  function startSession() {
    if (remainingSeconds.value <= 0) {
      remainingSeconds.value = durationMinutes.value * 60
    }
    if (!sessionStartTimeStr) {
      sessionStartTimeStr = getNowTimeStr()
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
    }, 250)
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
   * Arrête définitivement la session en cours et réinitialise le cadran
   * Enregistre les minutes effectivement travaillées si >= 1 min
   */
  function stopSession() {
    pauseSession()
    const totalSecs = durationMinutes.value * 60
    const elapsedSecs = totalSecs - remainingSeconds.value

    if (elapsedSecs >= 60) {
      const minsWorked = Math.floor(elapsedSecs / 60)
      addSession({
        category: selectedCategory.value,
        durationMinutes: minsWorked,
        startTime: sessionStartTimeStr || getNowTimeStr(),
        endTime: getNowTimeStr(),
      })
    }

    sessionStartTimeStr = null
    remainingSeconds.value = durationMinutes.value * 60
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
   * Fin de session réussie
   */
  function completeSession() {
    pauseSession()
    addSession({
      category: selectedCategory.value,
      durationMinutes: durationMinutes.value,
      startTime: sessionStartTimeStr || getNowTimeStr(),
      endTime: getNowTimeStr(),
    })
    sessionStartTimeStr = null
    playChime()
  }

  /**
   * Gong subtil de fin de session via l'API Web Audio
   */
  function playChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

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
    isPaused,
    isFullCircle,
    currentDegrees,
    selectedCategory,
    categories: FOCUS_CATEGORIES,
    formattedTime,
    needleRotation,
    svgWedgePath,
    horizonWindow,
    completedSessionsToday,
    totalMinutesToday,
    setDuration,
    setCategory,
    startSession,
    pauseSession,
    stopSession,
    toggleSession,
  }
}
