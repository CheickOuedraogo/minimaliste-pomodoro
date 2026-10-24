<script setup>
import { useTimer } from '../../composables/useTimer'

const { durationMinutes, setDuration, isRunning } = useTimer()

const presets = [15, 25, 45, 60]
</script>

<template>
  <div class="flex items-center gap-2 p-1 rounded-full bg-surface-container-low max-w-xs w-full justify-between px-2">
    <button
      v-for="mins in presets"
      :key="mins"
      type="button"
      :disabled="isRunning"
      class="dur-btn flex-1 py-1.5 px-2.5 rounded-full font-label-md text-label-md transition-all text-center"
      :class="[
        durationMinutes === mins
          ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
          : 'text-tertiary hover:text-on-surface',
        isRunning ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      ]"
      @click="setDuration(mins)"
    >
      {{ mins }}m
    </button>
  </div>
</template>
