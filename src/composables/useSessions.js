import { ref, computed } from 'vue'

const STORAGE_KEY = 'focus_sessions_history'

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persist(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Stockage indisponible
  }
}

const sessions = ref(loadSessions())

export function useSessions() {
  /**
   * Formatage YYYY-MM-DD local
   */
  function formatDateKey(date) {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const todayKey = computed(() => formatDateKey(new Date()))

  /**
   * Sessions réalisées aujourd'hui
   */
  const todaySessions = computed(() => {
    return sessions.value.filter(s => s.dateKey === todayKey.value)
  })

  /**
   * Total de minutes concentrées aujourd'hui
   */
  const todayMinutes = computed(() => {
    return todaySessions.value.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)
  })

  /**
   * Enregistrer une nouvelle session terminée
   */
  function addSession({ category, durationMinutes, startTime, endTime }) {
    if (!durationMinutes || durationMinutes <= 0) return

    const now = new Date()
    const newSession = {
      id: `sess-${Date.now()}`,
      categoryName: category?.name || 'Deep Work',
      categoryColor: category?.color || '#ab2d2a',
      durationMinutes,
      dateKey: formatDateKey(now),
      startTime: startTime || formatTime(new Date(now.getTime() - durationMinutes * 60000)),
      endTime: endTime || formatTime(now),
      timestamp: now.getTime(),
    }

    sessions.value.unshift(newSession)
    persist(sessions.value)
  }

  function formatTime(d) {
    const hours = String(d.getHours()).padStart(2, '0')
    const mins = String(d.getMinutes()).padStart(2, '0')
    return `${hours}:${mins}`
  }

  /**
   * Récupérer les sessions pour une date donnée
   */
  function getSessionsForDate(dateKey) {
    return sessions.value.filter(s => s.dateKey === dateKey)
  }

  /**
   * Récupérer le total de minutes pour une date donnée
   */
  function getMinutesForDate(dateKey) {
    return getSessionsForDate(dateKey).reduce((acc, s) => acc + (s.durationMinutes || 0), 0)
  }

  /**
   * Calcul des stats de la semaine courante (du Lundi au Dimanche)
   */
  const currentWeekDays = computed(() => {
    const now = new Date()
    // Trouver le lundi de la semaine courante (0 = dimanche, 1 = lundi, ...)
    const dayOfWeek = now.getDay()
    const distanceToMonday = (dayOfWeek + 6) % 7 // lundi = 0, mardi = 1, ..., dimanche = 6

    const monday = new Date(now)
    monday.setDate(now.getDate() - distanceToMonday)
    monday.setHours(0, 0, 0, 0)

    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    const result = []

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const key = formatDateKey(d)
      const isToday = key === todayKey.value
      const minutes = getMinutesForDate(key)

      const h = Math.floor(minutes / 60)
      const m = minutes % 60
      const totalTimeStr = `${h}h ${String(m).padStart(2, '0')}`

      result.push({
        index: i,
        name: dayNames[i],
        num: d.getDate(),
        date: d,
        dateKey: key,
        isToday,
        minutes,
        totalTime: totalTimeStr,
      })
    }

    return result
  })

  /**
   * Statistiques par catégorie pour une période donnée ('today' | 'week' | 'month')
   */
  function getCategoriesStats(period = 'today') {
    const now = new Date()
    let filtered = sessions.value

    if (period === 'today') {
      filtered = sessions.value.filter(s => s.dateKey === todayKey.value)
    } else if (period === 'week') {
      const weekKeys = new Set(currentWeekDays.value.map(d => d.dateKey))
      filtered = sessions.value.filter(s => weekKeys.has(s.dateKey))
    } else if (period === 'month') {
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const prefix = `${year}-${month}`
      filtered = sessions.value.filter(s => s.dateKey.startsWith(prefix))
    }

    const totalMins = filtered.reduce((acc, s) => acc + s.durationMinutes, 0)
    if (totalMins === 0) return []

    const map = {}
    filtered.forEach(s => {
      const cat = s.categoryName
      if (!map[cat]) {
        map[cat] = {
          name: cat,
          color: s.categoryColor,
          minutes: 0,
        }
      }
      map[cat].minutes += s.durationMinutes
    })

    return Object.values(map).map(c => {
      const percent = Math.round((c.minutes / totalMins) * 100)
      const h = Math.floor(c.minutes / 60)
      const m = c.minutes % 60
      return {
        name: c.name,
        color: c.color,
        minutes: c.minutes,
        percent,
        time: `${h}h ${String(m).padStart(2, '0')}`,
      }
    })
  }

  /**
   * Minutes totales pour une période donnée
   */
  function getTotalMinutes(period = 'today') {
    const stats = getCategoriesStats(period)
    return stats.reduce((acc, c) => acc + c.minutes, 0)
  }

  /**
   * Nombre de sessions pour une période donnée
   */
  function getSessionCount(period = 'today') {
    const now = new Date()
    if (period === 'today') {
      return todaySessions.value.length
    } else if (period === 'week') {
      const weekKeys = new Set(currentWeekDays.value.map(d => d.dateKey))
      return sessions.value.filter(s => weekKeys.has(s.dateKey)).length
    } else {
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const prefix = `${year}-${month}`
      return sessions.value.filter(s => s.dateKey.startsWith(prefix)).length
    }
  }

  return {
    sessions,
    todaySessions,
    todayMinutes,
    currentWeekDays,
    addSession,
    getSessionsForDate,
    getMinutesForDate,
    getCategoriesStats,
    getTotalMinutes,
    getSessionCount,
  }
}
