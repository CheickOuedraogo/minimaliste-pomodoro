<script setup>
import { useTimer } from '../../composables/useTimer'

const { isStopModalOpen, cancelStop, confirmStop, sessionMode } = useTimer()
</script>

<template>
  <div
    v-if="isStopModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4 animate-in fade-in"
    @click.self="cancelStop"
  >
    <div
      class="relative w-full max-w-sm bg-surface-container-lowest rounded-3xl shadow-2xl p-6 border border-surface-container flex flex-col gap-4 animate-in zoom-in-95 duration-200"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[22px]">stop_circle</span>
        </div>
        <div>
          <h3 class="font-headline-sm text-[17px] text-on-surface font-semibold tracking-tight">
            Arrêter la session ?
          </h3>
          <p class="font-body-sm text-tertiary text-[12px] mt-0.5">
            {{ sessionMode === 'focus' ? 'Le temps de travail déjà accompli sera enregistré dans votre bilan.' : 'Votre pause sera interrompue.' }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 pt-2">
        <button
          type="button"
          class="flex-1 h-11 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors"
          @click="cancelStop"
        >
          Continuer
        </button>
        <button
          type="button"
          class="flex-1 h-11 rounded-full bg-error hover:bg-error/90 text-on-error font-label-md text-label-md font-semibold transition-colors shadow-sm"
          @click="confirmStop"
        >
          Confirmer l'arrêt
        </button>
      </div>
    </div>
  </div>
</template>
