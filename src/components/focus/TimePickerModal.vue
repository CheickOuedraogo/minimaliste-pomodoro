<script setup>
import { ref, watch } from 'vue'
import { useTimer } from '../../composables/useTimer'

const { durationMinutes, setDuration, isTimePickerOpen, isRunning } = useTimer()

const tempMinutes = ref(durationMinutes.value)

watch(isTimePickerOpen, (isOpen) => {
  if (isOpen) {
    tempMinutes.value = durationMinutes.value
  }
})

const quickPresets = [5, 10, 15, 20, 25, 30, 45, 60]

function selectPreset(m) {
  tempMinutes.value = m
}

function confirm() {
  setDuration(tempMinutes.value)
  isTimePickerOpen.value = false
}

function close() {
  isTimePickerOpen.value = false
}
</script>

<template>
  <div
    v-if="isTimePickerOpen && !isRunning"
    class="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4 animate-in fade-in"
    @click.self="close"
  >
    <div
      class="relative w-full max-w-sm bg-surface-container-lowest rounded-3xl shadow-2xl p-6 border border-surface-container flex flex-col gap-5 animate-in zoom-in-95 duration-200"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[22px]">tune</span>
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
            Régler la durée
          </h3>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-tertiary hover:text-on-surface transition-colors"
          @click="close"
        >
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <!-- Affichage numérique central agrandi -->
      <div class="flex flex-col items-center justify-center py-2">
        <div class="flex items-baseline gap-1">
          <span class="font-display text-[52px] text-primary tracking-tight font-semibold tabular-nums">
            {{ tempMinutes }}
          </span>
          <span class="font-headline-sm text-tertiary">min</span>
        </div>
        <span class="font-body-sm text-tertiary mt-1">Glissez le curseur ou touchez une pastille</span>
      </div>

      <!-- Curseur de réglage fin 1 à 60 minutes -->
      <div class="flex items-center gap-3 px-2">
        <span class="font-label-sm text-tertiary">1m</span>
        <input
          v-model.number="tempMinutes"
          type="range"
          min="1"
          max="60"
          step="1"
          class="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <span class="font-label-sm text-tertiary">60m</span>
      </div>

      <!-- Pastilles de durées rapides -->
      <div class="grid grid-cols-4 gap-2 pt-1">
        <button
          v-for="preset in quickPresets"
          :key="preset"
          type="button"
          class="py-2 rounded-xl font-label-md text-label-md transition-all text-center"
          :class="tempMinutes === preset ? 'bg-primary text-on-primary font-semibold shadow-sm' : 'bg-surface-container-low text-tertiary hover:text-on-surface hover:bg-surface-container'"
          @click="selectPreset(preset)"
        >
          {{ preset }}m
        </button>
      </div>

      <!-- Boutons de validation -->
      <div class="flex items-center gap-2 pt-2">
        <button
          type="button"
          class="flex-1 h-11 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors"
          @click="close"
        >
          Annuler
        </button>
        <button
          type="button"
          class="flex-1 h-11 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-colors shadow-sm"
          @click="confirm"
        >
          Appliquer
        </button>
      </div>
    </div>
  </div>
</template>
