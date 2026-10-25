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

// État partagé singleton
const sessions = ref(loadSessions())

function formatDateKey(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTime(d) {
  const hours = String(d.getHours()).padStart(2, '0')
  const mins = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${mins}`
}

const todayKey = computed(() => formatDateKey(new Date()))

const todaySessions = computed(() => {
  return sessions.value.filter(s => s.dateKey === todayKey.value)
})

const todayMinutes = computed(() => {
  return todaySessions.value.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)
})

const currentWeekDays = computed(() => {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const distanceToMonday = (dayOfWeek + 6) % 7

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

    const daySessions = sessions.value.filter(s => s.dateKey === key)
    const minutes = daySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)

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

export function useSessions() {
  function addSession({ category, durationMinutes, mode = 'focus', startTime, endTime }) {
    if (!durationMinutes || durationMinutes <= 0) return

    const now = new Date()
    const newSession = {
      id: `sess-${Date.now()}`,
      mode, // 'focus' | 'shortBreak' | 'longBreak'
      categoryName: category?.name || (mode === 'focus' ? 'Deep Work' : 'Pause'),
      categoryColor: category?.color || (mode === 'focus' ? '#ab2d2a' : '#438e65'),
      durationMinutes,
      dateKey: formatDateKey(now),
      startTime: startTime || formatTime(new Date(now.getTime() - durationMinutes * 60000)),
      endTime: endTime || formatTime(now),
      timestamp: now.getTime(),
    }

    sessions.value.unshift(newSession)
    persist(sessions.value)
  }

  function getSessionsForDate(dateKey) {
    return sessions.value.filter(s => s.dateKey === dateKey)
  }

  function getMinutesForDate(dateKey) {
    return getSessionsForDate(dateKey).reduce((acc, s) => acc + (s.durationMinutes || 0), 0)
  }

  function getFilteredSessions(period = 'today') {
    const now = new Date()
    if (period === 'today') {
      return sessions.value.filter(s => s.dateKey === todayKey.value)
    } else if (period === 'week') {
      const weekKeys = new Set(currentWeekDays.value.map(d => d.dateKey))
      return sessions.value.filter(s => weekKeys.has(s.dateKey))
    } else if (period === 'month') {
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const prefix = `${year}-${month}`
      return sessions.value.filter(s => s.dateKey.startsWith(prefix))
    }
    return sessions.value
  }

  function getCategoriesStats(period = 'today') {
    const filtered = getFilteredSessions(period)
    const focusOnly = filtered.filter(s => s.mode !== 'shortBreak' && s.mode !== 'longBreak')
    const totalMins = focusOnly.reduce((acc, s) => acc + s.durationMinutes, 0)

    if (totalMins === 0) return []

    const map = {}
    focusOnly.forEach(s => {
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

  function getTotalMinutes(period = 'today') {
    const filtered = getFilteredSessions(period)
    return filtered
      .filter(s => s.mode !== 'shortBreak' && s.mode !== 'longBreak')
      .reduce((acc, s) => acc + s.durationMinutes, 0)
  }

  function getSessionCount(period = 'today') {
    const filtered = getFilteredSessions(period)
    return filtered.filter(s => s.mode !== 'shortBreak' && s.mode !== 'longBreak').length
  }

  function clearHistory() {
    sessions.value = []
    persist([])
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
    clearHistory,
  }
}
