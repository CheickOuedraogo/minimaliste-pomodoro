<script setup>
import { useTimer } from '../../composables/useTimer'

const { durationMinutes, intention } = useTimer()
</script>

<template>
  <section class="mt-8 rounded-3xl bg-surface-container-low p-4 shadow-sm border border-surface-container/60">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px] text-tertiary">today</span>
        <span class="font-headline-sm text-headline-sm text-on-surface">Aujourd'hui</span>
      </div>
      <span class="font-label-md text-label-md text-tertiary">3 sessions prévues</span>
    </div>

    <!-- Mini blocs de l'horizon quotidien -->
    <div class="flex flex-col gap-2">
      <!-- Session 1 : Terminée -->
      <div class="flex items-center justify-between p-2.5 rounded-2xl bg-surface-container-lowest">
        <div class="flex items-center gap-3">
          <div class="w-1.5 h-7 rounded-full bg-outline-variant" />
          <div>
            <div class="font-body-md text-body-md text-on-surface line-through opacity-70">
              Architecture de l'API & Modélisation
            </div>
            <div class="font-body-sm text-body-sm text-tertiary">
              09:00 — 09:45 • Recherche
            </div>
          </div>
        </div>
        <span class="material-symbols-outlined text-[18px] text-outline">done</span>
      </div>

      <!-- Session 2 : En cours / Prévue -->
      <div class="flex items-center justify-between p-2.5 rounded-2xl bg-surface-container-lowest border border-primary/20">
        <div class="flex items-center gap-3">
          <div class="w-1.5 h-7 rounded-full bg-primary" />
          <div>
            <div class="font-body-md text-body-md text-on-surface font-medium">
              {{ intention || "Rédaction du cahier des charges" }}
            </div>
            <div class="font-body-sm text-body-sm text-primary">
              Prévu pour ce bloc • {{ durationMinutes }} min
            </div>
          </div>
        </div>
        <span class="material-symbols-outlined text-[18px] text-primary">hourglass_empty</span>
      </div>
    </div>
  </section>
</template>
