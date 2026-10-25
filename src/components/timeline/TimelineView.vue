<script setup>
import { ref, computed } from 'vue'
import { useSessions } from '../../composables/useSessions'

const { currentWeekDays, getSessionsForDate } = useSessions()

// Sélectionner par défaut le jour d'aujourd'hui dans la semaine
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

// Formatage de la date en français pour l'en-tête (ex: "Mercredi 25 Octobre")
const formattedHeaderDate = computed(() => {
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
</script>

<template>
  <div class="flex flex-col w-full pb-10 select-none max-w-2xl mx-auto">
    <!-- En-tête de navigation de date -->
    <section class="flex flex-col gap-space-sm pt-space-xs pb-space-sm">
      <div class="flex items-center justify-between">
        <button
          type="button"
          aria-label="Jour précédent"
          class="w-10 h-10 rounded-full flex items-center justify-center text-tertiary hover:text-on-surface bg-surface-container-low transition-colors"
          @click="selectDay(selectedDayIndex - 1)"
        >
          <span class="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>

        <div class="flex flex-col items-center">
          <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
            {{ formattedHeaderDate }}
          </h2>
          <span class="font-label-sm text-label-sm text-tertiary mt-0.5">
            {{ daySessions.length }} session{{ daySessions.length > 1 ? 's' : '' }} réalisée{{ daySessions.length > 1 ? 's' : '' }} · {{ selectedDay?.totalTime || '0h 00' }} au total
          </span>
        </div>

        <button
          type="button"
          aria-label="Jour suivant"
          class="w-10 h-10 rounded-full flex items-center justify-center text-tertiary hover:text-on-surface bg-surface-container-low transition-colors"
          @click="selectDay(selectedDayIndex + 1)"
        >
          <span class="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>

      <!-- Bandeau semainier dynamique (du Lundi au Dimanche) -->
      <div class="grid grid-cols-7 gap-1 pt-space-xs px-space-2xs">
        <button
          v-for="day in currentWeekDays"
          :key="day.dateKey"
          type="button"
          class="flex flex-col items-center py-2 px-1 rounded-DEFAULT transition-all relative"
          :class="[
            selectedDayIndex === day.index
              ? 'bg-surface-container-lowest shadow-sm ring-1 ring-primary/20'
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

          <!-- Point rouge indicatif pour aujourd'hui -->
          <span
            v-if="day.isToday"
            class="w-1.5 h-1.5 rounded-full bg-primary mt-1"
          />
          <span
            v-else
            class="w-1.5 h-1.5 rounded-full bg-transparent mt-1"
          />

          <span class="font-body-sm text-[10px] mt-0.5 text-tertiary">
            {{ day.minutes > 0 ? day.totalTime : '0h 00' }}
          </span>
        </button>
      </div>
    </section>

    <!-- Axe Chronologique & Sessions réelles -->
    <section class="mt-4 flex flex-col gap-3">
      <div class="flex items-center justify-between px-1">
        <span class="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
          Déroulé chronologique
        </span>
        <div
          v-if="selectedDay?.isToday"
          class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Aujourd'hui
        </div>
      </div>

      <!-- Liste des sessions -->
      <div v-if="daySessions.length > 0" class="flex flex-col gap-2.5">
        <div
          v-for="s in daySessions"
          :key="s.id"
          class="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex items-start justify-between"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-1.5 h-10 rounded-full mt-0.5"
              :style="{ backgroundColor: s.categoryColor || '#ab2d2a' }"
            />
            <div>
              <div class="font-label-lg text-label-lg text-on-surface font-medium">
                Session {{ s.categoryName }}
              </div>
              <div class="font-body-sm text-body-sm text-tertiary mt-0.5">
                {{ s.startTime }} — {{ s.endTime }} • {{ s.durationMinutes }} min
              </div>
            </div>
          </div>

          <span class="material-symbols-outlined text-[20px] text-primary">
            check_circle
          </span>
        </div>
      </div>

      <!-- Message si aucune session pour cette journée -->
      <div
        v-else
        class="text-center py-12 rounded-3xl bg-surface-container-low/50 border border-surface-container flex flex-col items-center justify-center p-6"
      >
        <span class="material-symbols-outlined text-tertiary/60 text-[36px] mb-2">
          hourglass_disabled
        </span>
        <p class="font-headline-sm text-[16px] text-on-surface font-medium">
          Aucune session enregistrée
        </p>
        <p class="font-body-sm text-tertiary mt-1 text-[13px]">
          {{ selectedDay?.isToday ? 'Lancez votre première session depuis l’onglet Focus.' : 'Aucun temps de concentration n’a été enregistré pour ce jour.' }}
        </p>
      </div>
    </section>
  </div>
</template>
