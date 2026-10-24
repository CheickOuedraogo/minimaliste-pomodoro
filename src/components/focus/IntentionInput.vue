<script setup>
import { ref } from 'vue'
import { useTimer } from '../../composables/useTimer'

const { intention } = useTimer()

const suggestions = [
  "Rédiger 2 pages sans interruption",
  "Concevoir l'architecture de la fonctionnalité",
  "Revue de code approfondie & tests",
  "Synthétiser les retours utilisateurs",
  "Résoudre le bug bloquant de production",
]

function showIntentionHelp() {
  if (!intention.value) {
    const random = suggestions[Math.floor(Math.random() * suggestions.length)]
    intention.value = random
  }
}
</script>

<template>
  <div class="w-full max-w-sm px-1">
    <div
      class="relative flex items-center w-full rounded-2xl bg-surface-container-low px-4 py-3 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] focus-within:bg-surface-container-lowest focus-within:ring-1 focus-within:ring-outline-variant/50 transition-all"
    >
      <span class="material-symbols-outlined text-[18px] text-tertiary mr-2.5">
        edit_note
      </span>
      <input
        v-model="intention"
        type="text"
        placeholder="Définir une intention claire pour cette session..."
        class="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-tertiary/60 outline-none"
      />
      <button
        type="button"
        aria-label="Conseil de formulation d'intention"
        title="Suggérer une intention"
        class="text-tertiary hover:text-on-surface ml-1 flex items-center p-1 rounded-full hover:bg-surface-container transition-colors"
        @click="showIntentionHelp"
      >
        <span class="material-symbols-outlined text-[16px]">help_outline</span>
      </button>
    </div>
  </div>
</template>
