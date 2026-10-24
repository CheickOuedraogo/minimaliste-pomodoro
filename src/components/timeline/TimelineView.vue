<script setup>
import { ref } from 'vue'

const selectedDayIndex = ref(2) // Mercredi 20 par défaut

const weekDays = [
  { name: 'Lun', num: 18, totalTime: '2h 45', isSelected: false },
  { name: 'Mar', num: 19, totalTime: '3h 10', isSelected: false },
  { name: 'Mer', num: 20, totalTime: '1h 55', isSelected: true },
  { name: 'Jeu', num: 21, totalTime: '0h 00', isSelected: false },
  { name: 'Ven', num: 22, totalTime: '0h 00', isSelected: false },
  { name: 'Sam', num: 23, totalTime: '0h 00', isSelected: false },
  { name: 'Dim', num: 24, totalTime: '0h 00', isSelected: false },
]

function selectDay(index) {
  selectedDayIndex.value = index
  weekDays.forEach((d, i) => {
    d.isSelected = i === index
  })
}

// Sessions de la journée
const sessions = ref([
  {
    id: 1,
    title: 'Architecture & Modélisation API',
    category: 'Recherche',
    start: '09:00',
    end: '09:45',
    duration: '45 min',
    color: '#7e7271',
    completed: true,
  },
  {
    id: 2,
    title: 'Rédaction du cahier des charges',
    category: 'Écriture',
    start: '10:15',
    end: '10:40',
    duration: '25 min',
    color: '#a13d39',
    completed: true,
  },
  {
    id: 3,
    title: 'Composants du dial & Vue 3',
    category: 'Deep Work',
    start: '11:00',
    end: '11:45',
    duration: '45 min',
    color: '#ab2d2a',
    completed: true,
  },
  {
    id: 4,
    title: 'Intégration audio & YouTube stream',
    category: 'Deep Work',
    start: '14:30',
    end: '15:15',
    duration: '45 min',
    color: '#ab2d2a',
    completed: false,
    isNext: true,
  },
])
</script>

<template>
  <div class="flex flex-col w-full pb-10 select-none">
    <!-- En-tête de navigation de date -->
    <section class="flex flex-col gap-space-sm pt-space-xs pb-space-sm">
      <div class="flex items-center justify-between">
        <button
          type="button"
          aria-label="Jour précédent"
          class="w-10 h-10 rounded-full flex items-center justify-center text-tertiary hover:text-on-surface bg-surface-container-low transition-colors"
          @click="selectDay(Math.max(0, selectedDayIndex - 1))"
        >
          <span class="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>

        <div class="flex flex-col items-center">
          <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
            {{ weekDays[selectedDayIndex].name }}credi {{ weekDays[selectedDayIndex].num }} Novembre
          </h2>
          <span class="font-label-sm text-label-sm text-tertiary mt-0.5">
            3 sessions réalisées · {{ weekDays[selectedDayIndex].totalTime }} au total
          </span>
        </div>

        <button
          type="button"
          aria-label="Jour suivant"
          class="w-10 h-10 rounded-full flex items-center justify-center text-tertiary hover:text-on-surface bg-surface-container-low transition-colors"
          @click="selectDay(Math.min(weekDays.length - 1, selectedDayIndex + 1))"
        >
          <span class="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>

      <!-- Bandeau semainier (Week Strip) -->
      <div class="grid grid-cols-7 gap-1 pt-space-xs px-space-2xs">
        <button
          v-for="(day, idx) in weekDays"
          :key="day.num"
          type="button"
          class="flex flex-col items-center py-2 px-1 rounded-DEFAULT transition-all relative"
          :class="[
            selectedDayIndex === idx
              ? 'bg-surface-container-lowest shadow-sm'
              : 'bg-surface-container-low text-tertiary hover:text-on-surface'
          ]"
          @click="selectDay(idx)"
        >
          <span
            class="font-label-sm text-label-sm uppercase"
            :class="selectedDayIndex === idx ? 'text-primary font-semibold' : 'text-tertiary/80'"
          >
            {{ day.name }}
          </span>
          <span
            class="font-headline-sm text-headline-sm mt-0.5"
            :class="selectedDayIndex === idx ? 'text-primary font-semibold' : 'text-on-surface font-medium'"
          >
            {{ day.num }}
          </span>

          <!-- Point rouge indicatif Braun -->
          <span
            v-if="selectedDayIndex === idx"
            class="w-1.5 h-1.5 rounded-full bg-primary mt-1"
          />
          <span
            v-else
            class="w-1.5 h-1.5 rounded-full bg-transparent mt-1"
          />

          <span class="font-body-sm text-[10px] mt-0.5 text-tertiary">
            {{ day.totalTime }}
          </span>
        </button>
      </div>
    </section>

    <!-- Axe Chronologique 24h & Blocs de temps -->
    <section class="mt-4 flex flex-col gap-3">
      <div class="flex items-center justify-between px-1">
        <span class="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
          Déroulé chronologique
        </span>
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          En temps réel
        </div>
      </div>

      <div class="flex flex-col gap-2.5">
        <div
          v-for="s in sessions"
          :key="s.id"
          class="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex items-start justify-between"
          :class="{ 'border-primary/40 bg-surface-container-low/50': s.isNext }"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-1.5 h-10 rounded-full mt-0.5"
              :style="{ backgroundColor: s.color }"
            />
            <div>
              <div class="font-label-lg text-label-lg text-on-surface font-medium" :class="{ 'line-through opacity-70': s.completed }">
                {{ s.title }}
              </div>
              <div class="font-body-sm text-body-sm text-tertiary mt-0.5">
                {{ s.start }} — {{ s.end }} • {{ s.duration }} • {{ s.category }}
              </div>
            </div>
          </div>

          <span
            v-if="s.completed"
            class="material-symbols-outlined text-[20px] text-primary"
          >
            check_circle
          </span>
          <span
            v-else-if="s.isNext"
            class="material-symbols-outlined text-[20px] text-primary"
          >
            hourglass_empty
          </span>
        </div>
      </div>
    </section>
  </div>
</template>
