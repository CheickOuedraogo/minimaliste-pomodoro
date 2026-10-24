<script setup>
import { computed } from 'vue'
import { useTimer } from '../../composables/useTimer'

const {
  formattedTime,
  needleRotation,
  svgWedgePath,
  horizonWindow,
  isRunning,
} = useTimer()

// Génération des 60 graduations horlogères
// Rayon externe : 100, rayon interne majeurs (tous les 5 min) : 90, rayon interne mineurs : 95
const ticks = computed(() => {
  const result = []
  const cx = 120
  const cy = 120
  const rOuter = 100

  for (let i = 0; i < 60; i++) {
    const isMajor = i % 5 === 0
    const rInner = isMajor ? 89 : 94
    const angleRad = (i * 6 - 90) * (Math.PI / 180)

    const x1 = cx + rOuter * Math.cos(angleRad)
    const y1 = cy + rOuter * Math.sin(angleRad)
    const x2 = cx + rInner * Math.cos(angleRad)
    const y2 = cy + rInner * Math.sin(angleRad)

    result.push({
      id: i,
      x1: x1.toFixed(1),
      y1: y1.toFixed(1),
      x2: x2.toFixed(1),
      y2: y2.toFixed(1),
      isMajor,
      isQuarter: i % 15 === 0,
    })
  }
  return result
})
</script>

<template>
  <section class="flex flex-col items-center justify-center my-1 select-none">
    <!-- Cadran analogique Braun-like -->
    <div class="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
      <svg class="absolute inset-0 w-full h-full" viewBox="0 0 240 240">
        <defs>
          <radialGradient id="dialSectorGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffdad6" stop-opacity="0.4" />
            <stop offset="70%" stop-color="#ff847d" stop-opacity="0.6" />
            <stop offset="100%" stop-color="#ab2d2a" stop-opacity="0.85" />
          </radialGradient>
        </defs>

        <!-- Fond céramique doux -->
        <circle cx="120" cy="120" r="110" fill="#f7f3f1" opacity="0.65" />

        <!-- Cercle repère fin -->
        <circle cx="120" cy="120" r="92" fill="none" stroke="#e6e2e0" stroke-width="1" />

        <!-- Secteur dynamique coloré représentant le temps restant -->
        <path
          v-if="svgWedgePath"
          :d="svgWedgePath"
          fill="url(#dialSectorGrad)"
          class="transition-all duration-300"
        />

        <!-- 60 graduations d'horlogerie -->
        <g id="dial-ticks">
          <line
            v-for="tick in ticks"
            :key="tick.id"
            :x1="tick.x1"
            :y1="tick.y1"
            :x2="tick.x2"
            :y2="tick.y2"
            :stroke="tick.isQuarter ? '#1c1b1a' : tick.isMajor ? '#59413f' : '#8c706e'"
            :stroke-width="tick.isQuarter ? '2.2' : tick.isMajor ? '1.8' : '1'"
            :stroke-linecap="tick.isMajor ? 'round' : 'butt'"
            :opacity="tick.isMajor ? '1' : '0.4'"
          />
        </g>
      </svg>

      <!-- Aiguille indicatrice pivotante -->
      <div
        class="absolute w-full h-full pointer-events-none transition-transform duration-300 ease-out"
        :style="{ transform: `rotate(${needleRotation}deg)` }"
      >
        <div
          class="absolute left-1/2 top-[34px] -translate-x-1/2 w-[3.5px] h-[86px] bg-primary rounded-full shadow-[0_2px_8px_rgba(171,45,42,0.35)]"
        />
      </div>

      <!-- Pivot central en porcelaine tactile -->
      <div class="relative w-11 h-11 rounded-full bg-surface-container-lowest shadow-[0_3px_10px_rgba(0,0,0,0.08)] flex items-center justify-center z-10">
        <div class="w-4 h-4 rounded-full bg-surface-container-high flex items-center justify-center">
          <div class="w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
      </div>
    </div>

    <!-- Affichage digital & Horizon d'accomplissement -->
    <div class="flex flex-col items-center mt-3 mb-4">
      <div class="font-display text-display text-on-surface tracking-tighter tabular-nums">
        {{ formattedTime }}
      </div>
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container mt-1.5">
        <span class="material-symbols-outlined text-[13px] text-tertiary">schedule</span>
        <span class="font-label-md text-label-md text-tertiary tracking-normal">
          {{ horizonWindow }}
        </span>
      </div>
    </div>
  </section>
</template>
