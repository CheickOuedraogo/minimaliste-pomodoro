<script setup>
import { useAudioAmbience } from '../../composables/useAudioAmbience'

const emit = defineEmits(['openModal'])

const { activePresetId, currentSoundLabel, selectPreset } = useAudioAmbience()

const ambientOptions = [
  { id: 'silence', name: 'Silence', icon: 'volume_off' },
  { id: 'pluie', name: 'Pluie', icon: 'rainy' },
  { id: 'cafe', name: 'Café', icon: 'coffee' },
  { id: 'blanc', name: 'Blanc', icon: 'waves' },
]

function handleSelect(id) {
  selectPreset(id)
}
</script>

<template>
  <section class="mt-4 mb-7 px-1">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-1.5 cursor-pointer group" @click="emit('openModal')">
        <span class="font-label-sm text-label-sm text-tertiary uppercase tracking-wider group-hover:text-on-surface transition-colors">
          Atmosphère sonore
        </span>
        <span class="material-symbols-outlined text-[14px] text-tertiary group-hover:text-primary transition-colors">
          tune
        </span>
      </div>
      <button
        type="button"
        class="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-1"
        @click="emit('openModal')"
      >
        <span>{{ currentSoundLabel }}</span>
        <span class="material-symbols-outlined text-[13px]">open_in_new</span>
      </button>
    </div>

    <div class="grid grid-cols-4 gap-2">
      <button
        v-for="opt in ambientOptions"
        :key="opt.id"
        type="button"
        class="ambient-chip flex flex-col items-center justify-center py-2.5 px-1.5 rounded-2xl transition-all"
        :class="[
          activePresetId === opt.id
            ? 'bg-surface-container-lowest shadow-sm ring-1 ring-primary/20'
            : 'bg-surface-container-low hover:bg-surface-container text-tertiary'
        ]"
        @click="handleSelect(opt.id)"
      >
        <span
          class="material-symbols-outlined text-[20px] mb-1"
          :class="activePresetId === opt.id ? 'text-primary' : 'text-tertiary'"
        >
          {{ opt.icon }}
        </span>
        <span
          class="font-label-sm text-label-sm truncate w-full text-center"
          :class="activePresetId === opt.id ? 'text-on-surface font-medium' : 'text-tertiary'"
        >
          {{ opt.name }}
        </span>
      </button>
    </div>
  </section>
</template>
