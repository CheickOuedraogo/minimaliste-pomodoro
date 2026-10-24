<script setup>
import { ref, computed } from 'vue'
import { useTimer } from '../../composables/useTimer'

const emit = defineEmits(['startTaskSession'])

const { intention, setDuration, startSession } = useTimer()

const currentFilter = ref('todo') // 'todo' | 'current' | 'done'
const newTaskTitle = ref('')
const selectedDurationPreset = ref('25')

const tasks = ref([
  {
    id: 1,
    title: 'Rédiger l\'architecture technique et modélisation',
    duration: '25 min',
    category: 'Recherche',
    status: 'done',
    color: '#7e7271',
  },
  {
    id: 2,
    title: 'Conception du cadran analogique et SVG trigonométrique',
    duration: '50 min',
    category: 'Deep Work',
    status: 'current',
    color: '#ab2d2a',
  },
  {
    id: 3,
    title: 'Intégration du mixeur audio et ambiances synthétisées',
    duration: '25 min',
    category: 'Deep Work',
    status: 'todo',
    color: '#ab2d2a',
  },
  {
    id: 4,
    title: 'Revue des micro-animations et design tokens',
    duration: '25 min',
    category: 'Écriture',
    status: 'todo',
    color: '#a13d39',
  },
  {
    id: 5,
    title: 'Vérification accessibilité et contrastes WCAG',
    duration: 'Libre',
    category: 'Admin & Tri',
    status: 'todo',
    color: '#8c706e',
  },
])

const todoTasks = computed(() => tasks.value.filter(t => t.status === 'todo'))
const currentTasks = computed(() => tasks.value.filter(t => t.status === 'current'))
const doneTasks = computed(() => tasks.value.filter(t => t.status === 'done'))

const filteredTasks = computed(() => {
  if (currentFilter.value === 'todo') return todoTasks.value
  if (currentFilter.value === 'current') return currentTasks.value
  return doneTasks.value
})

function addTask() {
  if (!newTaskTitle.value.trim()) return
  tasks.value.unshift({
    id: Date.now(),
    title: newTaskTitle.value.trim(),
    duration: selectedDurationPreset.value === 'libre' ? 'Libre' : `${selectedDurationPreset.value} min`,
    category: 'Deep Work',
    status: 'todo',
    color: '#ab2d2a',
  })
  newTaskTitle.value = ''
}

function toggleStatus(task) {
  if (task.status === 'done') {
    task.status = 'todo'
  } else {
    task.status = 'done'
  }
}

function launchTaskSession(task) {
  intention.value = task.title
  if (task.duration === '25 min') setDuration(25)
  if (task.duration === '50 min') setDuration(45)
  startSession()
  emit('startTaskSession')
}
</script>

<template>
  <div class="flex flex-col w-full pb-8 select-none">
    <!-- En-tête -->
    <header class="flex flex-col mb-space-lg">
      <div class="flex items-center justify-between">
        <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          Tâches
        </h1>
        <span class="font-label-md text-label-md text-tertiary px-space-sm py-space-xs rounded-full bg-surface-container-high">
          {{ todoTasks.length }} en attente
        </span>
      </div>
      <p class="font-body-md text-body-md text-tertiary mt-space-2xs">
        Organisez vos priorités avant de lancer une session.
      </p>
    </header>

    <!-- Boîte d'ajout rapide -->
    <section class="bg-surface-container-low rounded-2xl p-space-md mb-space-lg shadow-sm border border-surface-container">
      <div class="flex items-center gap-space-sm mb-space-sm">
        <span class="material-symbols-outlined text-primary text-[20px]">add_circle</span>
        <input
          v-model="newTaskTitle"
          type="text"
          placeholder="Rédiger la spécification..."
          class="w-full bg-transparent font-body-lg text-body-lg text-on-surface placeholder:text-outline/70 focus:outline-none"
          @keydown.enter="addTask"
        />
      </div>

      <div class="flex items-center justify-between pt-space-xs">
        <div class="flex items-center gap-space-xs overflow-x-auto">
          <span class="font-label-sm text-label-sm text-tertiary">Durée :</span>
          <button
            v-for="preset in ['25', '50', 'libre']"
            :key="preset"
            type="button"
            class="px-space-sm py-space-2xs rounded-full font-label-sm text-label-sm transition-colors"
            :class="selectedDurationPreset === preset ? 'bg-primary text-on-primary font-semibold' : 'bg-surface-container text-tertiary hover:text-on-surface'"
            @click="selectedDurationPreset = preset"
          >
            {{ preset === 'libre' ? 'Libre' : `${preset} min` }}
          </button>
        </div>

        <button
          type="button"
          aria-label="Ajouter la tâche"
          class="h-8 px-space-md rounded-full bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center shadow-sm hover:bg-primary-container transition-colors"
          @click="addTask"
        >
          Ajouter
        </button>
      </div>
    </section>

    <!-- Onglets segmentés -->
    <div class="flex items-center gap-space-xs p-space-xs bg-surface-container rounded-full mb-space-lg">
      <button
        type="button"
        class="flex-1 py-space-xs text-center rounded-full font-label-md text-label-md transition-all"
        :class="currentFilter === 'todo' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold' : 'text-tertiary hover:text-on-surface'"
        @click="currentFilter = 'todo'"
      >
        À faire ({{ todoTasks.length }})
      </button>
      <button
        type="button"
        class="flex-1 py-space-xs text-center rounded-full font-label-md text-label-md transition-all"
        :class="currentFilter === 'current' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold' : 'text-tertiary hover:text-on-surface'"
        @click="currentFilter = 'current'"
      >
        En cours ({{ currentTasks.length }})
      </button>
      <button
        type="button"
        class="flex-1 py-space-xs text-center rounded-full font-label-md text-label-md transition-all"
        :class="currentFilter === 'done' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold' : 'text-tertiary hover:text-on-surface'"
        @click="currentFilter = 'done'"
      >
        Accomplies ({{ doneTasks.length }})
      </button>
    </div>

    <!-- Liste des tâches -->
    <div class="flex flex-col gap-2.5">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex items-center justify-between hover:border-outline-variant transition-all"
      >
        <div class="flex items-center gap-3 flex-1 min-w-0 pr-2">
          <!-- Checkbox circulaire sobre -->
          <button
            type="button"
            class="w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0"
            :class="task.status === 'done' ? 'bg-primary border-primary text-on-primary' : 'border-outline hover:border-primary'"
            @click="toggleStatus(task)"
          >
            <span v-if="task.status === 'done'" class="material-symbols-outlined text-[14px]">check</span>
          </button>

          <div class="truncate">
            <div
              class="font-body-md text-body-md text-on-surface truncate"
              :class="{ 'line-through opacity-60': task.status === 'done' }"
            >
              {{ task.title }}
            </div>
            <div class="font-body-sm text-body-sm text-tertiary flex items-center gap-2 mt-0.5">
              <span>{{ task.duration }}</span>
              <span>•</span>
              <span class="flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: task.color }" />
                {{ task.category }}
              </span>
            </div>
          </div>
        </div>

        <!-- Lancer le focus directement sur cette tâche -->
        <button
          v-if="task.status !== 'done'"
          type="button"
          title="Démarrer le focus sur cette tâche"
          class="w-8 h-8 rounded-full bg-surface-container hover:bg-primary hover:text-on-primary text-tertiary flex items-center justify-center transition-colors shrink-0"
          @click="launchTaskSession(task)"
        >
          <span class="material-symbols-outlined text-[18px]">play_arrow</span>
        </button>
      </div>
    </div>
  </div>
</template>
