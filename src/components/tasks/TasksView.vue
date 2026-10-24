<script setup>
import { ref, computed } from 'vue'
import { useTasks } from '../../composables/useTasks'
import { useTimer } from '../../composables/useTimer'

const emit = defineEmits(['startTaskSession'])

const { tasks, addTask, toggleTask, removeTask } = useTasks()
const { startSession } = useTimer()

const currentFilter = ref('all') // 'all' | 'pending' | 'completed'
const newTaskTitle = ref('')

const pendingTasks = computed(() => tasks.value.filter(t => !t.done))
const completedTasks = computed(() => tasks.value.filter(t => t.done))

const displayedTasks = computed(() => {
  if (currentFilter.value === 'pending') return pendingTasks.value
  if (currentFilter.value === 'completed') return completedTasks.value
  return tasks.value
})

function handleAdd() {
  if (!newTaskTitle.value.trim()) return
  addTask(newTaskTitle.value.trim())
  newTaskTitle.value = ''
}

function launchSession() {
  startSession()
  emit('startTaskSession')
}
</script>

<template>
  <div class="flex flex-col w-full pb-8 select-none max-w-2xl mx-auto">
    <!-- En-tête -->
    <header class="flex flex-col mb-space-lg">
      <div class="flex items-center justify-between">
        <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          Tâches
        </h1>
        <span class="font-label-md text-label-md text-tertiary px-space-sm py-space-xs rounded-full bg-surface-container-high">
          {{ pendingTasks.length }} en attente
        </span>
      </div>
      <p class="font-body-md text-body-md text-tertiary mt-space-2xs">
        Listez et cochez librement vos priorités avant ou pendant vos séances.
      </p>
    </header>

    <!-- Boîte d'ajout rapide -->
    <section class="bg-surface-container-low rounded-2xl p-space-md mb-space-lg shadow-sm border border-surface-container">
      <div class="flex items-center gap-space-sm">
        <span class="material-symbols-outlined text-primary text-[22px]">add_circle</span>
        <input
          v-model="newTaskTitle"
          type="text"
          placeholder="Nouvelle tâche (ex: Rédiger la spécification, Revue de code...)"
          class="w-full bg-transparent font-body-lg text-body-lg text-on-surface placeholder:text-outline/70 focus:outline-none"
          @keydown.enter="handleAdd"
        />
        <button
          type="button"
          class="h-9 px-4 rounded-full bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center shadow-sm hover:bg-primary-container transition-colors shrink-0"
          @click="handleAdd"
        >
          Ajouter
        </button>
      </div>
    </section>

    <!-- Onglets segmentés de filtre -->
    <div class="flex items-center gap-space-xs p-space-xs bg-surface-container rounded-full mb-space-lg">
      <button
        type="button"
        class="flex-1 py-space-xs text-center rounded-full font-label-md text-label-md transition-all"
        :class="currentFilter === 'all' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold' : 'text-tertiary hover:text-on-surface'"
        @click="currentFilter = 'all'"
      >
        Toutes ({{ tasks.length }})
      </button>
      <button
        type="button"
        class="flex-1 py-space-xs text-center rounded-full font-label-md text-label-md transition-all"
        :class="currentFilter === 'pending' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold' : 'text-tertiary hover:text-on-surface'"
        @click="currentFilter = 'pending'"
      >
        À faire ({{ pendingTasks.length }})
      </button>
      <button
        type="button"
        class="flex-1 py-space-xs text-center rounded-full font-label-md text-label-md transition-all"
        :class="currentFilter === 'completed' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold' : 'text-tertiary hover:text-on-surface'"
        @click="currentFilter = 'completed'"
      >
        Faites ({{ completedTasks.length }})
      </button>
    </div>

    <!-- Liste des tâches -->
    <div class="flex flex-col gap-2.5">
      <div
        v-for="task in displayedTasks"
        :key="task.id"
        class="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex items-center justify-between hover:border-outline-variant transition-all group"
      >
        <div
          class="flex items-center gap-3 flex-1 min-w-0 pr-2 cursor-pointer"
          @click="toggleTask(task.id)"
        >
          <!-- Checkbox circulaire -->
          <button
            type="button"
            class="w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0"
            :class="task.done ? 'bg-primary border-primary text-on-primary' : 'border-outline hover:border-primary'"
          >
            <span v-if="task.done" class="material-symbols-outlined text-[14px]">check</span>
          </button>

          <span
            class="font-body-md text-body-md text-on-surface truncate"
            :class="{ 'line-through opacity-60': task.done }"
          >
            {{ task.title }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Supprimer la tâche -->
          <button
            type="button"
            title="Supprimer la tâche"
            class="opacity-0 group-hover:opacity-100 text-tertiary hover:text-error transition-opacity p-1.5 rounded-full hover:bg-surface-container"
            @click="removeTask(task.id)"
          >
            <span class="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </div>

      <div v-if="displayedTasks.length === 0" class="text-center py-8 text-tertiary font-body-md">
        Aucune tâche dans cette section.
      </div>
    </div>
  </div>
</template>
