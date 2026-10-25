<script setup>
import { ref, computed } from 'vue'
import { useSessions } from '../../composables/useSessions'
import { useTasks } from '../../composables/useTasks'

const {
  currentWeekDays,
  getSessionsForDate,
  getCategoriesStats,
  getTotalMinutes,
  getSessionCount,
} = useSessions()

const { completedTasks } = useTasks()

const currentPeriod = ref('today') // 'today' | 'week' | 'month'

// Jour sélectionné dans le semainier
const todayIndex = computed(() => {
  const idx = currentWeekDays.value.findIndex(d => d.isToday)
  return idx >= 0 ? idx : 0
})

const selectedDayIndex = ref(todayIndex.value)

const selectedDay = computed(() => {
  return currentWeekDays.value[selectedDayIndex.value] || currentWeekDays.value[0]
})

function selectDay(index) {
  if (index >= 0 && index < currentWeekDays.value.length) {
    selectedDayIndex.value = index
  }
}

// Formatage de la date du jour sélectionné
const formattedSelectedDate = computed(() => {
  if (!selectedDay.value?.date) return ''
  const d = selectedDay.value.date
  const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(d)
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  const dayNum = d.getDate()
  const month = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(d)
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1)
  return `${capitalizedWeekday} ${dayNum} ${capitalizedMonth}`
})

// Sessions réelles du jour sélectionné
const daySessions = computed(() => {
  if (!selectedDay.value?.dateKey) return []
  return getSessionsForDate(selectedDay.value.dateKey)
})

// Statistiques par catégorie pour la période choisie
const categoriesBreakdown = computed(() => {
  return getCategoriesStats(currentPeriod.value)
})

// Minutes totales pour la période
const totalMinutesPeriod = computed(() => {
  return getTotalMinutes(currentPeriod.value)
})

const formattedPeriodTime = computed(() => {
  const mins = totalMinutesPeriod.value
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${String(m).padStart(2, '0')}`
})

// Nombre de sessions pour la période
const sessionCountPeriod = computed(() => {
  return getSessionCount(currentPeriod.value)
})

// Barres hebdomadaires dynamiques
const weekBars = computed(() => {
  const maxMinutes = Math.max(...currentWeekDays.value.map(d => d.minutes), 60)
  return currentWeekDays.value.map(d => {
    const heightPercent = d.minutes > 0 ? Math.round((d.minutes / maxMinutes) * 100) : 0
    return {
      day: d.name,
      height: `${Math.max(heightPercent, 4)}%`,
      hasData: d.minutes > 0,
      time: d.minutes > 0 ? d.totalTime : '0h 00',
      isToday: d.isToday,
    }
  })
})

const weeklyAverageTime = computed(() => {
  const totalMins = currentWeekDays.value.reduce((acc, d) => acc + d.minutes, 0)
  const avg = Math.round(totalMins / 7)
  const h = Math.floor(avg / 60)
  const m = avg % 60
  return `${h}h ${String(m).padStart(2, '0')}/j`
})
</script>

<template>
  <div class="flex flex-col w-full gap-space-lg select-none pb-12 max-w-3xl mx-auto">
    <!-- En-tête & Filtre temporel -->
    <div class="flex flex-col gap-space-sm">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
            Activité & Bilan
          </h1>
          <p class="font-body-sm text-body-sm text-tertiary">
            Chronométrie factuelle & historique de concentration
          </p>
        </div>
        <div class="flex items-center gap-space-2xs bg-surface-container-high px-space-xs py-space-2xs rounded-full">
          <span class="w-2 h-2 rounded-full bg-primary inline-block" />
          <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            Données locales
          </span>
        </div>
      </div>

      <!-- Contrôle de filtre segmenté -->
      <div class="flex items-center p-space-2xs bg-surface-container-low rounded-xl">
        <button
          type="button"
          class="flex-1 py-space-xs text-center font-label-md text-label-md rounded-lg transition-all"
          :class="currentPeriod === 'today' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold' : 'text-tertiary hover:text-on-surface'"
          @click="currentPeriod = 'today'"
        >
          Aujourd'hui
        </button>
        <button
          type="button"
          class="flex-1 py-space-xs text-center font-label-md text-label-md rounded-lg transition-all"
          :class="currentPeriod === 'week' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold' : 'text-tertiary hover:text-on-surface'"
          @click="currentPeriod = 'week'"
        >
          Cette semaine
        </button>
        <button
          type="button"
          class="flex-1 py-space-xs text-center font-label-md text-label-md rounded-lg transition-all"
          :class="currentPeriod === 'month' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold' : 'text-tertiary hover:text-on-surface'"
          @click="currentPeriod = 'month'"
        >
          Ce mois
        </button>
      </div>
    </div>

    <!-- 3 Cartes de métriques sobres -->
    <div class="grid grid-cols-3 gap-2">
      <div class="flex flex-col bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container">
        <div class="flex items-center gap-1 text-tertiary mb-1">
          <span class="material-symbols-outlined text-[15px]">schedule</span>
          <span class="font-label-sm text-[10px] uppercase tracking-wide truncate">Concentré</span>
        </div>
        <div class="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
          {{ formattedPeriodTime }}
        </div>
        <div class="font-body-sm text-[11px] text-outline mt-1">
          {{ totalMinutesPeriod > 0 ? 'temps accumulé' : 'aucune session' }}
        </div>
      </div>

      <div class="flex flex-col bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container">
        <div class="flex items-center gap-1 text-tertiary mb-1">
          <span class="material-symbols-outlined text-[15px]">hourglass_bottom</span>
          <span class="font-label-sm text-[10px] uppercase tracking-wide truncate">Sessions</span>
        </div>
        <div class="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
          {{ sessionCountPeriod }}
        </div>
        <div class="font-body-sm text-[11px] text-outline mt-1">
          {{ sessionCountPeriod > 0 ? 'réalisées' : 'à démarrer' }}
        </div>
      </div>

      <div class="flex flex-col bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container">
        <div class="flex items-center gap-1 text-tertiary mb-1">
          <span class="material-symbols-outlined text-[15px]">task_alt</span>
          <span class="font-label-sm text-[10px] uppercase tracking-wide truncate">Tâches</span>
        </div>
        <div class="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
          {{ completedTasks.length }}
        </div>
        <div class="font-body-sm text-[11px] text-outline mt-1">
          accomplie{{ completedTasks.length > 1 ? 's' : '' }}
        </div>
      </div>
    </div>

    <!-- Section Déroulé Semainier & Sessions journalières (Timeline Fusionnée) -->
    <section class="bg-surface-container-lowest p-4 sm:p-5 rounded-3xl border border-surface-container shadow-sm flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
          <h3 class="font-headline-sm text-[17px] text-on-surface font-semibold tracking-tight">
            Semaine courante & Déroulé
          </h3>
        </div>
        <span class="font-label-sm text-label-sm text-tertiary">
          {{ selectedDay?.totalTime || '0h 00' }} le {{ selectedDay?.name }}
        </span>
      </div>

      <!-- Bandeau semainier cliquable -->
      <div class="grid grid-cols-7 gap-1 px-1">
        <button
          v-for="day in currentWeekDays"
          :key="day.dateKey"
          type="button"
          class="flex flex-col items-center py-2 px-1 rounded-DEFAULT transition-all relative"
          :class="[
            selectedDayIndex === day.index
              ? 'bg-surface-container shadow-sm ring-1 ring-primary/30'
              : 'bg-surface-container-low text-tertiary hover:text-on-surface'
          ]"
          @click="selectDay(day.index)"
        >
          <span
            class="font-label-sm text-label-sm uppercase"
            :class="selectedDayIndex === day.index ? 'text-primary font-semibold' : 'text-tertiary/80'"
          >
            {{ day.name }}
          </span>
          <span
            class="font-headline-sm text-headline-sm mt-0.5"
            :class="selectedDayIndex === day.index ? 'text-primary font-semibold' : 'text-on-surface font-medium'"
          >
            {{ day.num }}
          </span>
          <span
            v-if="day.isToday"
            class="w-1.5 h-1.5 rounded-full bg-primary mt-1"
          />
          <span
            v-else
            class="w-1.5 h-1.5 rounded-full bg-transparent mt-1"
          />
          <span class="font-body-sm text-[10px] mt-0.5 text-tertiary">
            {{ day.minutes > 0 ? day.totalTime : '0h' }}
          </span>
        </button>
      </div>

      <!-- Détail des sessions du jour sélectionné -->
      <div class="border-t border-surface-container pt-3">
        <div class="flex items-center justify-between mb-2.5">
          <h4 class="font-label-md text-label-md text-on-surface font-medium">
            Sessions du {{ formattedSelectedDate }}
          </h4>
          <span class="font-label-sm text-tertiary text-[12px]">
            {{ daySessions.length }} session{{ daySessions.length > 1 ? 's' : '' }}
          </span>
        </div>

        <div v-if="daySessions.length > 0" class="flex flex-col gap-2">
          <div
            v-for="s in daySessions"
            :key="s.id"
            class="p-3 rounded-2xl bg-surface-container-low border border-surface-container/70 flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-1.5 h-8 rounded-full"
                :style="{ backgroundColor: s.categoryColor || '#ab2d2a' }"
              />
              <div>
                <div class="font-label-md text-label-md text-on-surface">
                  {{ s.categoryName }}
                </div>
                <div class="font-body-sm text-tertiary text-[12px]">
                  {{ s.startTime }} — {{ s.endTime }} • {{ s.durationMinutes }} min
                </div>
              </div>
            </div>
            <span class="material-symbols-outlined text-[18px] text-primary">check_circle</span>
          </div>
        </div>

        <div
          v-else
          class="text-center py-5 text-tertiary font-body-sm text-[13px] bg-surface-container-low/40 rounded-2xl"
        >
          Aucune session enregistrée pour cette journée.
        </div>
      </div>
    </section>

    <!-- Répartition par catégorie -->
    <section class="bg-surface-container-lowest p-4 sm:p-5 rounded-3xl border border-surface-container shadow-sm flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <span class="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
          Répartition de l'attention
        </span>
        <span class="font-label-sm text-label-sm text-primary font-medium">
          {{ categoriesBreakdown.length }} catégorie{{ categoriesBreakdown.length > 1 ? 's' : '' }}
        </span>
      </div>

      <!-- Barre de proportion multicouleur -->
      <div
        v-if="categoriesBreakdown.length > 0"
        class="w-full h-3 rounded-full bg-surface-container overflow-hidden flex"
      >
        <div
          v-for="cat in categoriesBreakdown"
          :key="cat.name"
          :style="{ width: `${cat.percent}%`, backgroundColor: cat.color }"
          class="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
        />
      </div>

      <!-- Légende -->
      <div v-if="categoriesBreakdown.length > 0" class="flex flex-col gap-2 pt-1">
        <div
          v-for="cat in categoriesBreakdown"
          :key="cat.name"
          class="flex items-center justify-between text-body-sm"
        >
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: cat.color }" />
            <span class="text-on-surface font-medium">{{ cat.name }}</span>
          </div>
          <div class="text-tertiary">
            <span>{{ cat.time }}</span>
            <span class="ml-1.5 opacity-60">({{ cat.percent }}%)</span>
          </div>
        </div>
      </div>

      <div
        v-else
        class="text-center py-4 text-tertiary font-body-sm text-[13px]"
      >
        Aucune session enregistrée pour cette période.
      </div>
    </section>

    <!-- Graphique hebdomadaire dynamique -->
    <section class="bg-surface-container-lowest p-4 sm:p-5 rounded-3xl border border-surface-container shadow-sm flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <span class="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
          Activité de la semaine
        </span>
        <span class="font-label-sm text-label-sm text-tertiary">
          Moyenne : {{ weeklyAverageTime }}
        </span>
      </div>

      <div class="flex items-end justify-between h-36 pt-4 px-2">
        <div
          v-for="bar in weekBars"
          :key="bar.day"
          class="flex flex-col items-center gap-2 h-full justify-end flex-1"
        >
          <div class="w-full max-w-[24px] bg-surface-container-low rounded-t-lg h-full flex items-end overflow-hidden">
            <div
              class="w-full rounded-t-lg transition-all duration-500"
              :class="bar.isToday ? 'bg-primary' : (bar.hasData ? 'bg-primary/50' : 'bg-surface-container')"
              :style="{ height: bar.height }"
            />
          </div>
          <span
            class="font-label-sm text-[11px]"
            :class="bar.isToday ? 'text-primary font-semibold' : 'text-tertiary'"
          >
            {{ bar.day }}
          </span>
        </div>
      </div>
    </section>
  </div>
</template>
