<script setup>
import { useTimer } from '../../composables/useTimer'
import { useSessions } from '../../composables/useSessions'

const { durationMinutes, selectedCategory, isRunning, isPaused } = useTimer()
const { todaySessions } = useSessions()
</script>

<template>
  <section class="rounded-3xl bg-surface-container-low p-4 shadow-sm border border-surface-container/60">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px] text-tertiary">today</span>
        <h4 class="font-headline-sm text-[16px] text-on-surface font-semibold tracking-tight">
          Aujourd'hui
        </h4>
      </div>
      <span class="font-label-sm text-label-sm text-tertiary">
        {{ todaySessions.length === 0 ? 'Aucune session terminée' : `${todaySessions.length} session${todaySessions.length > 1 ? 's' : ''} réalisée${todaySessions.length > 1 ? 's' : ''}` }}
      </span>
    </div>

    <!-- Blocs des sessions de la journée -->
    <div class="flex flex-col gap-2">
      <!-- Liste des sessions réellement complétées aujourd'hui -->
      <div
        v-for="s in todaySessions"
        :key="s.id"
        class="flex items-center justify-between p-2.5 rounded-2xl bg-surface-container-lowest"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-1.5 h-7 rounded-full"
            :style="{ backgroundColor: s.categoryColor || '#ab2d2a' }"
          />
          <div>
            <div class="font-body-md text-body-md text-on-surface">
              Session {{ s.categoryName }}
            </div>
            <div class="font-body-sm text-[11px] text-tertiary">
              {{ s.startTime }} — {{ s.endTime }} • {{ s.durationMinutes }} min
            </div>
          </div>
        </div>
        <span class="material-symbols-outlined text-[18px] text-primary">done</span>
      </div>

      <!-- Bloc session en cours ou en pause -->
      <div
        v-if="isRunning || isPaused"
        class="flex items-center justify-between p-2.5 rounded-2xl bg-surface-container-lowest border border-primary/20 animate-in fade-in duration-200"
      >
        <div class="flex items-center gap-3">
          <div class="w-1.5 h-7 rounded-full bg-primary animate-pulse" />
          <div>
            <div class="font-body-md text-body-md text-on-surface font-medium">
              Session {{ selectedCategory.name }}
            </div>
            <div class="font-body-sm text-[11px] text-primary">
              {{ isRunning ? 'En cours' : 'En pause' }} • {{ durationMinutes }} min
            </div>
          </div>
        </div>
        <span class="material-symbols-outlined text-[18px] text-primary">hourglass_empty</span>
      </div>

      <!-- Si aucune session et aucune en cours -->
      <div
        v-if="todaySessions.length === 0 && !isRunning && !isPaused"
        class="text-center py-4 text-tertiary font-body-sm text-[13px]"
      >
        Prêt pour votre première immersion de la journée.
      </div>
    </div>
  </section>
</template>
