<script setup>
import { useTimer } from '../../composables/useTimer'
import CategoryDropdown from './CategoryDropdown.vue'
import FocusDial from './FocusDial.vue'
import DurationPresets from './DurationPresets.vue'
import AmbientQuickBar from './AmbientQuickBar.vue'
import QuickTasksSection from './QuickTasksSection.vue'
import DailyHorizonMini from './DailyHorizonMini.vue'

const emit = defineEmits(['openSoundModal'])

const {
  isRunning,
  isPaused,
  toggleSession,
  stopSession,
  remainingSeconds,
  durationMinutes,
  completedSessionsToday,
} = useTimer()
</script>

<template>
  <div class="flex flex-col w-full pb-8">
    <!-- Layout Responsive : Mobile 1 colonne / PC Desktop 2 colonnes (Split View) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- COLONNE GAUCHE (Sur PC: Cadran & Contrôles horlogers) -->
      <div class="flex flex-col items-center w-full lg:col-span-6 lg:sticky lg:top-24">
        <!-- Indicateurs de session de la journée -->
        <section class="flex flex-col items-center text-center mt-1 mb-4 w-full">
          <div class="flex items-center gap-1.5 mb-3 opacity-60">
            <span
              v-for="i in 5"
              :key="i"
              class="w-1.5 h-1.5 rounded-full transition-colors duration-300"
              :class="i <= completedSessionsToday ? 'bg-primary' : 'bg-outline-variant'"
            />
          </div>

          <!-- Catégorie de focus sans intention forcée -->
          <CategoryDropdown />
        </section>

        <!-- Cadran analogique central horloger -->
        <FocusDial />

        <!-- Presets de durée (15, 25, 45, 60 min) -->
        <div class="flex justify-center my-3 w-full max-w-xs">
          <DurationPresets />
        </div>

        <!-- Barre rapide d'ambiance sonore -->
        <div class="w-full max-w-sm">
          <AmbientQuickBar @open-modal="emit('openSoundModal')" />
        </div>

        <!-- Actions de Session : Démarrer / Mettre en pause / Arrêter -->
        <section class="flex flex-col items-center w-full max-w-sm px-1 mt-2">
          <!-- Cas 1 : Session en cours OU en pause -> Proposer Pause/Reprendre ET Arrêter -->
          <div v-if="isRunning || isPaused" class="flex items-center gap-2.5 w-full">
            <!-- Bouton Pause ou Reprendre -->
            <button
              type="button"
              class="flex-1 h-[52px] rounded-full text-on-primary font-label-lg text-label-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.985]"
              :class="[
                isRunning
                  ? 'bg-tertiary-container hover:bg-tertiary shadow-[0_4px_14px_rgba(100,89,89,0.25)]'
                  : 'bg-primary hover:bg-primary-container shadow-[0_4px_14px_rgba(171,45,42,0.28)]'
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

            <!-- Bouton Arrêter la session -->
            <button
              type="button"
              title="Arrêter et réinitialiser la session"
              class="h-[52px] px-5 rounded-full bg-surface-container hover:bg-error/15 text-tertiary hover:text-error border border-surface-container-high font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              @click="stopSession"
            >
              <span class="material-symbols-outlined text-[20px]">stop</span>
              <span class="hidden sm:inline">Arrêter</span>
            </button>
          </div>

          <!-- Cas 2 : Au repos ou Terminé -> Démarrer / Nouvelle session -->
          <button
            v-else
            type="button"
            class="w-full h-[52px] rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(171,45,42,0.28)] transition-all active:scale-[0.985]"
            @click="toggleSession"
          >
            <span class="material-symbols-outlined text-[22px]">
              {{ remainingSeconds === 0 ? 'replay' : 'play_arrow' }}
            </span>
            <span>
              {{ remainingSeconds === 0 ? 'Nouvelle session' : 'Démarrer la session' }}
            </span>
          </button>

          <!-- Réassurance discrète -->
          <p class="font-body-sm text-body-sm text-tertiary mt-3 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[15px] text-primary">do_not_disturb_on</span>
            Immersion sans notification ni distraction
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
  </div>
</template>
