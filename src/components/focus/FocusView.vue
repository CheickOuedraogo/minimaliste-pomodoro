<script setup>
import { useTimer } from '../../composables/useTimer'
import CategoryDropdown from './CategoryDropdown.vue'
import FocusDial from './FocusDial.vue'
import DurationPresets from './DurationPresets.vue'
import AmbientQuickBar from './AmbientQuickBar.vue'
import QuickTasksSection from './QuickTasksSection.vue'
import DailyHorizonMini from './DailyHorizonMini.vue'
import TimePickerModal from './TimePickerModal.vue'
import StopConfirmModal from './StopConfirmModal.vue'
import SessionCompleteNotice from './SessionCompleteNotice.vue'

const emit = defineEmits(['openSoundModal'])

const {
  sessionMode,
  setMode,
  isRunning,
  isPaused,
  toggleSession,
  requestStop,
  remainingSeconds,
  completedSessionsToday,
  pomodoroCycleCount,
} = useTimer()
</script>

<template>
  <div class="flex flex-col w-full pb-8">
    <!-- Switcher de Mode Pomodoro : Focus / Pause courte / Pause longue -->
    <div class="flex items-center justify-center mb-4">
      <div class="inline-flex items-center p-1 rounded-full bg-surface-container-low border border-surface-container shadow-sm">
        <button
          type="button"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-label-md text-label-md transition-all"
          :class="sessionMode === 'focus' ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm' : 'text-tertiary hover:text-on-surface'"
          :disabled="isRunning"
          @click="setMode('focus')"
        >
          <span class="material-symbols-outlined text-[16px]">target</span>
          <span>Focus</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-label-md text-label-md transition-all"
          :class="sessionMode === 'shortBreak' ? 'bg-surface-container-lowest text-[#3d7a5a] font-semibold shadow-sm' : 'text-tertiary hover:text-on-surface'"
          :disabled="isRunning"
          @click="setMode('shortBreak')"
        >
          <span class="material-symbols-outlined text-[16px]">coffee</span>
          <span>Pause</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-label-md text-label-md transition-all"
          :class="sessionMode === 'longBreak' ? 'bg-surface-container-lowest text-[#3d7a5a] font-semibold shadow-sm' : 'text-tertiary hover:text-on-surface'"
          :disabled="isRunning"
          @click="setMode('longBreak')"
        >
          <span class="material-symbols-outlined text-[16px]">spa</span>
          <span>Pause longue</span>
        </button>
      </div>
    </div>

    <!-- Layout Responsive : Mobile 1 colonne / PC Desktop 2 colonnes (Split View) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- COLONNE GAUCHE (Sur PC: Cadran & Contrôles horlogers) -->
      <div class="flex flex-col items-center w-full lg:col-span-6 lg:sticky lg:top-24">
        <!-- Indicateurs de session de la journée -->
        <section class="flex flex-col items-center text-center mt-1 mb-3 w-full">
          <div class="flex items-center gap-1.5 mb-2 opacity-60">
            <span
              v-for="i in 5"
              :key="i"
              class="w-1.5 h-1.5 rounded-full transition-colors duration-300"
              :class="i <= completedSessionsToday ? 'bg-primary' : 'bg-outline-variant'"
            />
          </div>

          <!-- Catégorie de focus (affichée uniquement en mode Focus) -->
          <CategoryDropdown v-if="sessionMode === 'focus'" />
          <div v-else class="text-tertiary font-label-md text-label-md py-1">
            Mode Pause • Détendez vos yeux et respirez
          </div>
        </section>

        <!-- Cadran analogique central horloger (cliquable au repos) -->
        <FocusDial />

        <!-- Presets de durée rapides -->
        <div class="flex justify-center my-3 w-full max-w-xs">
          <DurationPresets />
        </div>

        <!-- Barre rapide d'ambiance sonore -->
        <div class="w-full max-w-sm">
          <AmbientQuickBar @open-modal="emit('openSoundModal')" />
        </div>

        <!-- Actions de Session : Démarrer / Mettre en pause / Arrêter (avec confirmation) -->
        <section class="flex flex-col items-center w-full max-w-sm px-1 mt-2">
          <!-- Cas 1 : Session en cours OU en pause -> Proposer Pause/Reprendre ET Arrêter -->
          <div v-if="isRunning || isPaused" class="flex items-center gap-2.5 w-full">
            <button
              type="button"
              class="flex-1 h-[52px] rounded-full text-on-primary font-label-lg text-label-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.985]"
              :class="[
                isRunning
                  ? 'bg-tertiary-container hover:bg-tertiary shadow-[0_4px_14px_rgba(100,89,89,0.25)]'
                  : (sessionMode === 'focus' ? 'bg-primary hover:bg-primary-container shadow-[0_4px_14px_rgba(171,45,42,0.28)]' : 'bg-[#3d7a5a] hover:bg-[#346a4d] shadow-[0_4px_14px_rgba(61,122,90,0.28)]')
              ]"
              @click="toggleSession"
            >
              <span class="material-symbols-outlined text-[22px]">
                {{ isRunning ? 'pause' : 'play_arrow' }}
              </span>
              <span>
                {{ isRunning ? 'Mettre en pause' : 'Reprendre' }}
              </span>
            </button>

            <!-- Bouton Arrêter : Ouvre la pop-up de confirmation -->
            <button
              type="button"
              title="Arrêter et sauvegarder la session"
              class="h-[52px] px-5 rounded-full bg-surface-container hover:bg-error/15 text-tertiary hover:text-error border border-surface-container-high font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              @click="requestStop"
            >
              <span class="material-symbols-outlined text-[20px]">stop</span>
              <span class="hidden sm:inline">Arrêter</span>
            </button>
          </div>

          <!-- Cas 2 : Au repos ou Terminé -> Démarrer -->
          <button
            v-else
            type="button"
            class="w-full h-[52px] rounded-full text-on-primary font-label-lg text-label-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.985]"
            :class="[
              sessionMode === 'focus'
                ? 'bg-primary hover:bg-primary-container shadow-[0_6px_20px_rgba(171,45,42,0.28)]'
                : 'bg-[#3d7a5a] hover:bg-[#346a4d] shadow-[0_6px_20px_rgba(61,122,90,0.28)]'
            ]"
            @click="toggleSession"
          >
            <span class="material-symbols-outlined text-[22px]">
              {{ remainingSeconds === 0 ? 'replay' : 'play_arrow' }}
            </span>
            <span>
              {{ remainingSeconds === 0 ? 'Recommencer' : (sessionMode === 'focus' ? 'Démarrer le focus' : 'Démarrer la pause') }}
            </span>
          </button>

          <!-- Réassurance discrète -->
          <p class="font-body-sm text-body-sm text-tertiary mt-3 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[15px] text-primary">do_not_disturb_on</span>
            {{ sessionMode === 'focus' ? 'Immersion sans distraction' : 'Moment de repos pour l’esprit' }}
          </p>
        </section>
      </div>

      <!-- COLONNE DROITE (Sur PC: Tâches de la session & Activité du jour) -->
      <div class="flex flex-col w-full lg:col-span-6 gap-6">
        <!-- Tâches définies avant ou pendant la session -->
        <QuickTasksSection />

        <!-- Horizon d'activité de la journée -->
        <DailyHorizonMini />
      </div>
    </div>

    <!-- Modals -->
    <TimePickerModal />
    <StopConfirmModal />
    <SessionCompleteNotice />
  </div>
</template>
