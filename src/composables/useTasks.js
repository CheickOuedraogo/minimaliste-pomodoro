import { ref, computed } from 'vue'

const defaultTasks = [
  { id: 1, title: 'Architecture & Modélisation technique', done: true, category: 'Recherche' },
  { id: 2, title: 'Cadran analogique Braun & calcul SVG', done: false, category: 'Deep Work' },
  { id: 3, title: 'Mixeur d’ambiance sonore & flux YouTube', done: false, category: 'Deep Work' },
  { id: 4, title: 'Revue des micro-animations & layout PC', done: false, category: 'Écriture' },
]

const saved = localStorage.getItem('focus_tasks_list')
const tasks = ref(saved ? JSON.parse(saved) : defaultTasks)

function persist() {
  localStorage.setItem('focus_tasks_list', JSON.stringify(tasks.value))
}

export function useTasks() {
  const pendingTasks = computed(() => tasks.value.filter(t => !t.done))
  const completedTasks = computed(() => tasks.value.filter(t => t.done))

  function addTask(title, category = 'Deep Work') {
    if (!title || !title.trim()) return
    tasks.value.unshift({
      id: Date.now(),
      title: title.trim(),
      done: false,
      category,
    })
    persist()
  }

  function toggleTask(id) {
    const t = tasks.value.find(item => item.id === id)
    if (t) {
      t.done = !t.done
      persist()
    }
  }

  function removeTask(id) {
    tasks.value = tasks.value.filter(item => item.id !== id)
    persist()
  }

  return {
    tasks,
    pendingTasks,
    completedTasks,
    addTask,
    toggleTask,
    removeTask,
  }
}
