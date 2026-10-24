<script setup>
import { ref } from 'vue'

const props = defineProps({
  currentTab: {
    type: String,
    default: 'focus',
  },
})

const emit = defineEmits(['openSoundModal', 'update:currentTab'])

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

const navTabs = [
  { id: 'focus', label: 'Focus', icon: 'timer' },
  { id: 'timeline', label: 'Timeline', icon: 'calendar_today' },
  { id: 'tasks', label: 'Tâches', icon: 'check_circle' },
  { id: 'bilan', label: 'Bilan', icon: 'bar_chart' },
]
</script>

<template>
  <header class="fixed top-0 w-full z-40 bg-surface/85 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.02)] border-b border-surface-container/40">
    <div class="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between max-w-6xl mx-auto">
      <!-- Logo & Fil d'Ariane -->
      <div class="flex items-center gap-space-sm select-none cursor-pointer" @click="emit('update:currentTab', 'focus')">
        <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm">
          <span class="material-symbols-outlined text-[18px]">timer</span>
        </div>
        <span class="font-headline-sm text-headline-sm text-on-surface tracking-tight font-semibold">
          Focus
        </span>
        <span class="text-outline/40 mx-1 hidden sm:inline">/</span>
        <span class="font-label-md text-label-md text-tertiary tracking-normal hidden sm:inline capitalize">
          {{ currentTab }}
        </span>
      </div>

      <!-- Navigation d'onglets intégrée sur PC Desktop (lg:) -->
      <nav class="hidden lg:flex items-center gap-1 bg-surface-container-low p-1 rounded-full border border-surface-container">
        <button
          v-for="tab in navTabs"
          :key="tab.id"
          type="button"
          class="flex items-center gap-2 px-4 py-1.5 rounded-full font-label-md text-label-md transition-all"
          :class="currentTab === tab.id ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm' : 'text-tertiary hover:text-on-surface'"
          @click="emit('update:currentTab', tab.id)"
        >
          <span class="material-symbols-outlined text-[18px]">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </button>
      </nav>

      <!-- Actions rapides droites -->
      <div class="flex items-center gap-space-xs">
        <button
          type="button"
          aria-label="Ambiance sonore"
          title="Ouvrir le mixeur d'ambiances"
          class="w-10 h-10 rounded-full flex items-center justify-center text-tertiary hover:text-on-surface hover:bg-surface-container-low transition-colors"
          @click="emit('openSoundModal')"
        >
          <span class="material-symbols-outlined text-[20px]">graphic_eq</span>
        </button>

        <button
          type="button"
          aria-label="Plein écran"
          title="Mode plein écran pour immersion"
          class="w-10 h-10 rounded-full flex items-center justify-center text-tertiary hover:text-on-surface hover:bg-surface-container-low transition-colors"
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
