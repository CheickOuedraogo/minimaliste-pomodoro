<script setup>
import { useTimer } from '../../composables/useTimer'
import CategoryDropdown from './CategoryDropdown.vue'
import IntentionInput from './IntentionInput.vue'
import FocusDial from './FocusDial.vue'
import DurationPresets from './DurationPresets.vue'
import AmbientQuickBar from './AmbientQuickBar.vue'
import DailyHorizonMini from './DailyHorizonMini.vue'

const emit = defineEmits(['openSoundModal'])

const {
  isRunning,
  toggleSession,
  remainingSeconds,
  durationMinutes,
  completedSessionsToday,
} = useTimer()
</script>

<template>
  <div class="flex flex-col w-full pb-8">
    <!-- En-tête de session minimaliste -->
    <section class="flex flex-col items-center text-center mt-2 mb-6">
      <!-- Indicateurs visuels discrets (dots de sessions de la journée) -->
      <div class="flex items-center gap-1.5 mb-5 opacity-60">
        <span
          v-for="i in 5"
          :key="i"
          class="w-1.5 h-1.5 rounded-full transition-colors duration-300"
          :class="i <= completedSessionsToday ? 'bg-primary' : 'bg-outline-variant'"
        />
      </div>

      <h1 class="font-headline-md text-headline-md text-on-surface tracking-tight mb-3">
        Quel est votre focus ?
      </h1>

      <!-- Sélecteur de catégorie -->
      <CategoryDropdown />

      <!-- Champ de saisie d'intention -->
      <IntentionInput />
    </section>

    <!-- Cadran analogique central -->
    <FocusDial />

    <!-- Presets de durée rapides -->
    <div class="flex justify-center my-3">
      <DurationPresets />
    </div>

    <!-- Barre rapide d'ambiance sonore -->
    <AmbientQuickBar @open-modal="emit('openSoundModal')" />

    <!-- Action principale : Démarrer / Mettre en pause -->
    <section class="flex flex-col items-center px-1">
      <button
        type="button"
        class="w-full h-[52px] rounded-full text-on-primary font-label-lg text-label-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.985]"
        :class="[
          isRunning
            ? 'bg-tertiary-container hover:bg-tertiary shadow-[0_6px_20px_rgba(100,89,89,0.25)]'
            : 'bg-primary hover:bg-primary-container shadow-[0_6px_20px_rgba(171,45,42,0.28)]'
        ]"
        @click="toggleSession"
      >
        <span class="material-symbols-outlined text-[22px]">
          {{ isRunning ? 'pause' : (remainingSeconds === 0 ? 'replay' : 'play_arrow') }}
        </span>
        <span>
          {{ isRunning ? 'Mettre en pause' : (remainingSeconds === 0 ? 'Nouvelle session' : (remainingSeconds < durationMinutes * 60 ? 'Reprendre le focus' : 'Démarrer la session')) }}
        </span>
      </button>

      <!-- Réassurance sobre -->
      <p class="font-body-sm text-body-sm text-tertiary mt-3 flex items-center gap-1.5">
        <span class="material-symbols-outlined text-[15px] text-primary">do_not_disturb_on</span>
        Mode Ne pas déranger suggéré durant l'immersion
      </p>
    </section>

    <!-- Horizon de la journée -->
    <DailyHorizonMini />
  </div>
</template>
