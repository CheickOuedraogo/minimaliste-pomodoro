<script setup>
import { ref } from 'vue'
import { useTasks } from '../../composables/useTasks'

const { tasks, addTask, toggleTask, removeTask } = useTasks()

const newTitle = ref('')

function handleAdd() {
  if (!newTitle.value.trim()) return
  addTask(newTitle.value)
  newTitle.value = ''
}
</script>

<template>
  <section class="mt-6 rounded-3xl bg-surface-container-low p-4 shadow-sm border border-surface-container/60">
    <!-- En-tête des tâches -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px] text-primary">checklist</span>
        <h3 class="font-headline-sm text-[16px] text-on-surface font-semibold tracking-tight">
          Tâches de la session
        </h3>
      </div>
      <span class="font-label-sm text-label-sm text-tertiary">
        {{ tasks.filter(t => !t.done).length }} restante(s)
      </span>
    </div>

    <!-- Champ d'ajout rapide (avant ou pendant la session) -->
    <div class="relative flex items-center w-full rounded-2xl bg-surface-container-lowest px-3.5 py-2.5 mb-3 border border-surface-container/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] focus-within:ring-1 focus-within:ring-primary/40 transition-all">
      <span class="material-symbols-outlined text-[18px] text-tertiary mr-2">add</span>
      <input
        v-model="newTitle"
        type="text"
        placeholder="Ajouter une tâche au vol (Entrée pour valider)..."
        class="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-tertiary/60 outline-none"
        @keydown.enter="handleAdd"
      />
      <button
        v-if="newTitle.trim()"
        type="button"
        class="text-primary hover:text-primary-container font-label-sm text-label-sm px-2 py-1 rounded-lg hover:bg-surface-container transition-colors font-medium"
        @click="handleAdd"
      >
        Ajouter
      </button>
    </div>

    <!-- Liste des tâches -->
    <div class="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="flex items-center justify-between p-2.5 rounded-xl transition-all group"
        :class="task.done ? 'bg-surface-container-low/60 opacity-60' : 'bg-surface-container-lowest shadow-sm'"
      >
        <div
          class="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
          @click="toggleTask(task.id)"
        >
          <!-- Checkbox circulaire Dieter Rams -->
          <button
            type="button"
            class="w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0"
            :class="task.done ? 'bg-primary border-primary text-on-primary' : 'border-outline hover:border-primary'"
          >
            <span v-if="task.done" class="material-symbols-outlined text-[13px]">check</span>
          </button>
          <span
            class="font-body-md text-body-md text-on-surface truncate"
            :class="{ 'line-through': task.done }"
          >
            {{ task.title }}
          </span>
        </div>

        <button
          type="button"
          title="Supprimer la tâche"
          class="opacity-0 group-hover:opacity-100 text-tertiary hover:text-error transition-opacity p-1 rounded-full hover:bg-surface-container"
          @click="removeTask(task.id)"
        >
          <span class="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>

      <div v-if="tasks.length === 0" class="text-center py-4 text-tertiary font-body-sm text-body-sm">
        Aucune tâche. Ajoutez-en une librement ci-dessus !
      </div>
    </div>
  </section>
</template>
