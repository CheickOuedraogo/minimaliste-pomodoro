import { ref, computed, watch } from 'vue'
import { useSessions } from './useSessions'
import { useSettings } from './useSettings'

/**
 * Catégories par défaut si les paramètres ne sont pas encore chargés
 */
const fallbackCategory = { id: 'deep-work', name: 'Deep Work', color: '#ab2d2a' }

// États partagés singleton
const sessionMode = ref('focus') // 'focus' | 'shortBreak' | 'longBreak'
const durationMinutes = ref(25)
const remainingSeconds = ref(25 * 60)
const isRunning = ref(false)
const selectedCategory = ref(fallbackCategory)
const pomodoroCycleCount = ref(0) // Compteur de sessions pour pause longue tous les X cycles

// Modals
const isStopModalOpen = ref(false)
const isTimePickerOpen = ref(false)
const sessionCompleteNotice = ref(null) // Notification feutrée de fin de session

let timerInterval = null
let targetTimestamp = null
let sessionStartTimeStr = null

export function useTimer() {
  const { todaySessions, todayMinutes, addSession } = useSessions()
  const { settings } = useSettings()

  // Initialisation de la catégorie avec les paramètres
  if (settings.value.categories?.length > 0 && selectedCategory.value.id === fallbackCategory.id) {
    selectedCategory.value = settings.value.categories[0]
  }

  // Synchroniser la catégorie si elle est mise à jour dans les paramètres
  watch(() => settings.value.categories, (cats) => {
    if (cats?.length > 0) {
      const match = cats.find(c => c.id === selectedCategory.value.id)
      if (match) {
        selectedCategory.value = match
      } else {
        selectedCategory.value = cats[0]
      }
    }
  }, { deep: true })

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
   * Détermine si le cadran doit être un cercle complet plein (60 min)
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

  const needleRotation = computed(() => {
    return currentDegrees.value
  })

  /**
   * Calcul géométrique du chemin SVG
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
   * Fenêtre temporelle estimée
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
   * État de pause active
   */
  const isPaused = computed(() => {
    return !isRunning.value && remainingSeconds.value < durationMinutes.value * 60 && remainingSeconds.value > 0
  })

  /**
   * Couleurs du cadran selon le mode
   */
  const modeColors = computed(() => {
    if (sessionMode.value === 'shortBreak' || sessionMode.value === 'longBreak') {
      return {
        primary: '#3d7a5a', // Vert sauge apaisant
        secondary: '#70b28e',
        light: '#e8f4ec',
        label: sessionMode.value === 'shortBreak' ? 'Pause courte' : 'Pause longue',
      }
    }
    return {
      primary: selectedCategory.value?.color || '#ab2d2a',
      secondary: '#ff847d',
      light: '#ffdad6',
      label: 'Focus',
    }
  })

  /**
   * Changement de mode Pomodoro (Focus, Pause courte, Pause longue)
   */
  function setMode(mode) {
    if (isRunning.value) return // Empêche de changer en plein vol
    sessionMode.value = mode

    let defaultMins = 25
    if (mode === 'focus') {
      defaultMins = settings.value.focusDuration || 25
    } else if (mode === 'shortBreak') {
      defaultMins = settings.value.shortBreakDuration || 5
    } else if (mode === 'longBreak') {
      defaultMins = settings.value.longBreakDuration || 15
    }

    setDuration(defaultMins)
  }

  /**
   * Sélection d'une durée (minutes)
   */
  function setDuration(mins) {
    if (isRunning.value) return
    const clamped = Math.max(1, Math.min(60, Number(mins) || 25))
    durationMinutes.value = clamped
    remainingSeconds.value = clamped * 60
  }

  function setCategory(cat) {
    selectedCategory.value = cat
  }

  function getNowTimeStr() {
    const d = new Date()
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

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

  function pauseSession() {
    isRunning.value = false
    clearInterval(timerInterval)
    timerInterval = null
  }

  /**
   * Demande de confirmation d'arrêt (ouvre la pop-up)
   */
  function requestStop() {
    isStopModalOpen.value = true
  }

  function cancelStop() {
    isStopModalOpen.value = false
  }

  /**
   * Confirme l'arrêt de la session
   */
  function confirmStop() {
    isStopModalOpen.value = false
    pauseSession()

    const totalSecs = durationMinutes.value * 60
    const elapsedSecs = totalSecs - remainingSeconds.value

    if (elapsedSecs >= 60 && sessionMode.value === 'focus') {
      const minsWorked = Math.floor(elapsedSecs / 60)
      addSession({
        category: selectedCategory.value,
        durationMinutes: minsWorked,
        mode: sessionMode.value,
        startTime: sessionStartTimeStr || getNowTimeStr(),
        endTime: getNowTimeStr(),
      })
    }

    sessionStartTimeStr = null
    remainingSeconds.value = durationMinutes.value * 60
  }

  function toggleSession() {
    if (isRunning.value) {
      pauseSession()
    } else {
      startSession()
    }
  }

  /**
   * Fin de session réussie : gong + enchaînement Pomodoro
   */
  function completeSession() {
    pauseSession()
    playChime()

    if (sessionMode.value === 'focus') {
      // Enregistrer la session de focus
      addSession({
        category: selectedCategory.value,
        durationMinutes: durationMinutes.value,
        mode: 'focus',
        startTime: sessionStartTimeStr || getNowTimeStr(),
        endTime: getNowTimeStr(),
      })

      pomodoroCycleCount.value += 1
      const isLong = pomodoroCycleCount.value % (settings.value.longBreakInterval || 4) === 0
      const nextMode = isLong ? 'longBreak' : 'shortBreak'
      const breakMins = isLong ? (settings.value.longBreakDuration || 15) : (settings.value.shortBreakDuration || 5)

      sessionCompleteNotice.value = {
        title: 'Session de focus accomplie !',
        message: `Superbe concentration. Prenez ${breakMins} min de pause pour régénérer votre énergie.`,
        nextMode,
        nextLabel: isLong ? 'Lancer la pause longue' : 'Lancer la pause',
      }
    } else {
      // Fin de pause
      sessionCompleteNotice.value = {
        title: 'Pause terminée',
        message: 'Votre esprit est reposé. Prêt pour une nouvelle session de focus ?',
        nextMode: 'focus',
        nextLabel: 'Reprendre le focus',
      }
    }

    sessionStartTimeStr = null
  }

  function acceptNextSession() {
    if (sessionCompleteNotice.value) {
      const target = sessionCompleteNotice.value.nextMode
      sessionCompleteNotice.value = null
      setMode(target)
      if (settings.value.autoStartBreaks) {
        startSession()
      }
    }
  }

  function dismissNotice() {
    sessionCompleteNotice.value = null
  }

  function playChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      // Son différent et apaisant selon le mode
      const freq = sessionMode.value === 'focus' ? 528 : 432
      osc.frequency.setValueAtTime(freq, ctx.currentTime)

      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 2.6)
    } catch {
      // Ignorer
    }
  }

  return {
    sessionMode,
    durationMinutes,
    remainingSeconds,
    isRunning,
    isPaused,
    isFullCircle,
    currentDegrees,
    selectedCategory,
    modeColors,
    pomodoroCycleCount,
    formattedTime,
    needleRotation,
    svgWedgePath,
    horizonWindow,
    completedSessionsToday,
    totalMinutesToday,
    isStopModalOpen,
    isTimePickerOpen,
    sessionCompleteNotice,
    setMode,
    setDuration,
    setCategory,
    startSession,
    pauseSession,
    requestStop,
    cancelStop,
    confirmStop,
    toggleSession,
    acceptNextSession,
    dismissNotice,
  }
}
