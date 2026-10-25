import { ref, watch } from 'vue'

const STORAGE_KEY = 'focus_pomodoro_settings'

const defaultSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  categories: [
    { id: 'deep-work', name: 'Deep Work', color: '#ab2d2a' },
    { id: 'ecriture', name: 'Écriture', color: '#a13d39' },
    { id: 'recherche', name: 'Recherche', color: '#7e7271' },
    { id: 'admin', name: 'Admin & Tri', color: '#8c706e' },
  ],
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSettings
    const parsed = JSON.parse(raw)
    return {
      ...defaultSettings,
      ...parsed,
      categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : defaultSettings.categories,
    }
  } catch {
    return defaultSettings
  }
}

const settings = ref(loadSettings())

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
  } catch {
    // Ignore
  }
}

watch(settings, persist, { deep: true })

export function useSettings() {
  function addCategory(name, color = '#ab2d2a') {
    if (!name || !name.trim()) return
    const id = `cat-${Date.now()}`
    settings.value.categories.push({
      id,
      name: name.trim(),
      color,
    })
  }

  function updateCategory(id, name, color) {
    const cat = settings.value.categories.find(c => c.id === id)
    if (cat) {
      if (name) cat.name = name.trim()
      if (color) cat.color = color
    }
  }

  function deleteCategory(id) {
    if (settings.value.categories.length <= 1) return // Garder au moins 1 catégorie
    settings.value.categories = settings.value.categories.filter(c => c.id !== id)
  }

  function resetToDefaults() {
    settings.value = JSON.parse(JSON.stringify(defaultSettings))
  }

  return {
    settings,
    categories: settings.value.categories,
    addCategory,
    updateCategory,
    deleteCategory,
    resetToDefaults,
  }
}
