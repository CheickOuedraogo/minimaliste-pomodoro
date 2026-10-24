<script setup>
import { ref } from 'vue'
import HeaderBar from './components/navigation/HeaderBar.vue'
import BottomNav from './components/navigation/BottomNav.vue'
import FocusView from './components/focus/FocusView.vue'
import TimelineView from './components/timeline/TimelineView.vue'
import TasksView from './components/tasks/TasksView.vue'
import BilanView from './components/bilan/BilanView.vue'
import SoundscapeModal from './components/audio/SoundscapeModal.vue'

const currentTab = ref('focus')
const isSoundModalOpen = ref(false)

function openSoundModal() {
  isSoundModalOpen.value = true
}

function closeSoundModal() {
  isSoundModalOpen.value = false
}

function handleStartTaskSession() {
  currentTab.value = 'focus'
}
</script>

<template>
  <div class="bg-surface font-body-md text-body-md text-on-surface antialiased flex flex-col min-h-screen">
    <!-- Barre d'en-tête supérieure avec navigation intégrée sur PC -->
    <HeaderBar
      :current-tab="currentTab"
      @update:current-tab="currentTab = $event"
      @open-sound-modal="openSoundModal"
    />

    <!-- Contenu principal adaptable PC & Mobile -->
    <main class="flex-1 flex flex-col relative w-full pt-20 pb-24 lg:pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <Transition name="fade-slide" mode="out-in">
        <FocusView
          v-if="currentTab === 'focus'"
          @open-sound-modal="openSoundModal"
        />
        <TimelineView
          v-else-if="currentTab === 'timeline'"
        />
        <TasksView
          v-else-if="currentTab === 'tasks'"
          @start-task-session="handleStartTaskSession"
        />
        <BilanView
          v-else-if="currentTab === 'bilan'"
        />
      </Transition>
    </main>

    <!-- Navigation inférieure mobile uniquement (masquée sur PC) -->
    <BottomNav
      :active-tab="currentTab"
      @update:active-tab="currentTab = $event"
    />

    <!-- Modal / Bottom Sheet d'Ambiances Sonores -->
    <SoundscapeModal
      :is-open="isSoundModalOpen"
      @close="closeSoundModal"
    />
  </div>
</template>

<style scoped>
/* Transition douce et feutrée entre les vues */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
