<script setup>
import { useTimer } from '../../composables/useTimer'

const { sessionCompleteNotice, acceptNextSession, dismissNotice } = useTimer()
</script>

<template>
  <div
    v-if="sessionCompleteNotice"
    class="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4 animate-in fade-in"
  >
    <div
      class="relative w-full max-w-sm bg-surface-container-lowest rounded-3xl shadow-2xl p-6 border border-surface-container flex flex-col gap-4 animate-in zoom-in-95 duration-200"
    >
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[26px]">celebration</span>
        </div>
        <div>
          <h3 class="font-headline-sm text-[18px] text-on-surface font-semibold tracking-tight">
            {{ sessionCompleteNotice.title }}
          </h3>
          <p class="font-body-sm text-tertiary text-[13px] mt-1">
            {{ sessionCompleteNotice.message }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 pt-2">
        <button
          type="button"
          class="flex-1 h-11 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors"
          @click="dismissNotice"
        >
          Plus tard
        </button>
        <button
          type="button"
          class="flex-1 h-11 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-colors shadow-sm"
          @click="acceptNextSession"
        >
          {{ sessionCompleteNotice.nextLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
