<script setup>
import { ref } from 'vue'

const props = defineProps({
  currentTab: {
    type: String,
    default: 'focus',
  },
})

const emit = defineEmits(['openSoundModal'])

const isFullscreen = ref(false)

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      isFullscreen.value = true
    }).catch(() => {})
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen.value = false
    }).catch(() => {})
  }
}

const tabLabels = {
  focus: 'Focus',
  timeline: 'Timeline',
  tasks: 'Tâches',
  bilan: 'Bilan',
}
</script>

<template>
  <header class="fixed top-0 w-full z-40 bg-surface/85 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.02)] border-b border-surface-container/40">
    <div class="h-16 px-margin flex items-center justify-between max-w-lg mx-auto">
      <!-- Logo & Fil d'Ariane -->
      <div class="flex items-center gap-space-sm select-none">
        <div class="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm">
          <span class="material-symbols-outlined text-[16px]">timer</span>
        </div>
        <span class="font-headline-sm text-headline-sm text-on-surface tracking-tight font-semibold">
          Focus
        </span>
        <span class="text-outline/40 mx-space-2xs">/</span>
        <span class="font-label-md text-label-md text-tertiary tracking-normal">
          {{ tabLabels[currentTab] || 'Focus' }}
        </span>
      </div>

      <!-- Actions rapides droites -->
      <div class="flex items-center gap-space-xs">
        <button
          type="button"
          aria-label="Ambiance sonore"
          title="Ouvrir le mixeur d'ambiances"
          class="w-11 h-11 rounded-full flex items-center justify-center text-tertiary hover:text-on-surface hover:bg-surface-container-low transition-colors"
          @click="emit('openSoundModal')"
        >
          <span class="material-symbols-outlined text-[20px]">graphic_eq</span>
        </button>

        <button
          type="button"
          aria-label="Plein écran"
          title="Mode plein écran pour immersion"
          class="w-11 h-11 rounded-full flex items-center justify-center text-tertiary hover:text-on-surface hover:bg-surface-container-low transition-colors"
          @click="toggleFullscreen"
        >
          <span class="material-symbols-outlined text-[20px]">
            {{ isFullscreen ? 'fullscreen_exit' : 'fullscreen' }}
          </span>
        </button>

        <div
          class="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-xs text-on-primary shadow-sm select-none"
          title="Profil utilisateur"
        >
          <span class="material-symbols-outlined text-[18px]">person</span>
        </div>
      </div>
    </div>
  </header>
</template>
