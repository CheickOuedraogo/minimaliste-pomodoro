<script setup>
import { ref } from 'vue'

const currentPeriod = ref('today') // 'today' | 'week' | 'month'

const categoriesBreakdown = [
  { name: 'Deep Work', percent: 55, color: '#ab2d2a', time: '1h 55' },
  { name: 'Écriture', percent: 25, color: '#a13d39', time: '0h 50' },
  { name: 'Recherche', percent: 20, color: '#7e7271', time: '0h 40' },
]

const weekBars = [
  { day: 'Lun', height: '65%', time: '2h45' },
  { day: 'Mar', height: '80%', time: '3h10' },
  { day: 'Mer', height: '50%', time: '1h55', isToday: true },
  { day: 'Jeu', height: '20%', time: '0h45' },
  { day: 'Ven', height: '0%', time: '0h00' },
  { day: 'Sam', height: '0%', time: '0h00' },
  { day: 'Dim', height: '0%', time: '0h00' },
]
</script>

<template>
  <div class="flex flex-col w-full gap-space-lg select-none pb-12">
    <!-- Intro & Sélecteur temporel -->
    <div class="flex flex-col gap-space-sm">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
            Bilan & Analyse
          </h1>
          <p class="font-body-sm text-body-sm text-tertiary">
            Chronométrie factuelle & sérénité cognitive
          </p>
        </div>
        <div class="flex items-center gap-space-2xs bg-surface-container-high px-space-xs py-space-2xs rounded-full">
          <span class="w-2 h-2 rounded-full bg-primary inline-block" />
          <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            Sync OK
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

    <!-- 3 Cartes de métriques sobres (sans gamification intrusive) -->
    <div class="grid grid-cols-3 gap-2">
      <div class="flex flex-col bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container">
        <div class="flex items-center gap-1 text-tertiary mb-1">
          <span class="material-symbols-outlined text-[15px]">schedule</span>
          <span class="font-label-sm text-[10px] uppercase tracking-wide truncate">Concentré</span>
        </div>
        <div class="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
          3h 25
        </div>
        <div class="font-body-sm text-[11px] text-outline mt-1">sur 4h00 prévu</div>
      </div>

      <div class="flex flex-col bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container">
        <div class="flex items-center gap-1 text-tertiary mb-1">
          <span class="material-symbols-outlined text-[15px]">hourglass_bottom</span>
          <span class="font-label-sm text-[10px] uppercase tracking-wide truncate">Sessions</span>
        </div>
        <div class="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
          5
        </div>
        <div class="font-body-sm text-[11px] text-outline mt-1">100% complétées</div>
      </div>

      <div class="flex flex-col bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container">
        <div class="flex items-center gap-1 text-tertiary mb-1">
          <span class="material-symbols-outlined text-[15px]">task_alt</span>
          <span class="font-label-sm text-[10px] uppercase tracking-wide truncate">Tâches</span>
        </div>
        <div class="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
          4
        </div>
        <div class="font-body-sm text-[11px] text-outline mt-1">sans interruption</div>
      </div>
    </div>

    <!-- Répartition par catégorie -->
    <section class="bg-surface-container-lowest p-4 rounded-3xl border border-surface-container shadow-sm flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <span class="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
          Répartition de l'attention
        </span>
        <span class="font-label-sm text-label-sm text-primary font-medium">3 catégories</span>
      </div>

      <!-- Barre de proportion multicouleur -->
      <div class="w-full h-3 rounded-full bg-surface-container overflow-hidden flex">
        <div
          v-for="cat in categoriesBreakdown"
          :key="cat.name"
          :style="{ width: `${cat.percent}%`, backgroundColor: cat.color }"
          class="h-full first:rounded-l-full last:rounded-r-full"
        />
      </div>

      <!-- Légende -->
      <div class="flex flex-col gap-2 pt-1">
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
    </section>

    <!-- Graphique hebdomadaire sobre -->
    <section class="bg-surface-container-lowest p-4 rounded-3xl border border-surface-container shadow-sm flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <span class="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
          Activité de la semaine
        </span>
        <span class="font-label-sm text-label-sm text-tertiary">Moyenne: 2h 15/j</span>
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
              :class="bar.isToday ? 'bg-primary' : 'bg-surface-variant hover:bg-outline-variant'"
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
