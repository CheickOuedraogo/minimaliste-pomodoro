<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTimer } from '../../composables/useTimer'

const {
  formattedTime,
  horizonWindow,
  currentDegrees,
  isFullCircle,
} = useTimer()

// Angle animé de manière continue et soyeuse (Lerp via requestAnimationFrame)
const animatedDegrees = ref(currentDegrees.value)
let animFrameId = null

function stepAnimation() {
  const target = currentDegrees.value
  const diff = target - animatedDegrees.value

  if (Math.abs(diff) > 0.08) {
    // Amorti doux (easing 0.16)
    animatedDegrees.value += diff * 0.16
    animFrameId = requestAnimationFrame(stepAnimation)
  } else {
    animatedDegrees.value = target
    animFrameId = null
  }
}

watch(currentDegrees, () => {
  if (!animFrameId) {
    animFrameId = requestAnimationFrame(stepAnimation)
  }
})

onMounted(() => {
  animatedDegrees.value = currentDegrees.value
})

onUnmounted(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId)
})

// Détermine si le disque rouge est plein
const isVisuallyFull = computed(() => {
  return animatedDegrees.value >= 359.5 || isFullCircle.value
})

// Calcul trigonométrique du secteur rouge animé
const animatedWedgePath = computed(() => {
  const deg = animatedDegrees.value
  if (deg <= 0.1 || isVisuallyFull.value) return ''

  const radians = (deg - 90) * (Math.PI / 180)
  const endX = 120 + 92 * Math.cos(radians)
  const endY = 120 + 92 * Math.sin(radians)
  const largeArc = deg > 180 ? 1 : 0

  return `M 120 120 L 120 28 A 92 92 0 ${largeArc} 1 ${endX.toFixed(2)} ${endY.toFixed(2)} Z`
})

// 60 graduations horlogères Dieter Rams / Braun
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
    <!-- Cadran analogique Braun agrandi et sublime sur mobile & PC -->
    <div class="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 flex items-center justify-center">
      <svg class="absolute inset-0 w-full h-full" viewBox="0 0 240 240">
        <defs>
          <radialGradient id="dialSectorGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffdad6" stop-opacity="0.45" />
            <stop offset="70%" stop-color="#ff847d" stop-opacity="0.65" />
            <stop offset="100%" stop-color="#ab2d2a" stop-opacity="0.9" />
          </radialGradient>
        </defs>

        <!-- Fond céramique doux -->
        <circle cx="120" cy="120" r="110" fill="#f7f3f1" opacity="0.65" />

        <!-- Cercle repère fin -->
        <circle cx="120" cy="120" r="92" fill="none" stroke="#e6e2e0" stroke-width="1" />

        <!-- Cercle plein pour 60 minutes (garantit que le rouge est 100% visible sans bug) -->
        <circle
          v-if="isVisuallyFull"
          cx="120"
          cy="120"
          r="92"
          fill="url(#dialSectorGrad)"
        />

        <!-- Secteur dynamique coloré pour les durées intermédiaires -->
        <path
          v-else-if="animatedWedgePath"
          :d="animatedWedgePath"
          fill="url(#dialSectorGrad)"
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

      <!-- Aiguille indicatrice pivotante animée avec fluidité mécanique -->
      <div
        class="absolute w-full h-full pointer-events-none"
        :style="{ transform: `rotate(${animatedDegrees}deg)` }"
      >
        <div
          class="absolute left-1/2 top-[34px] -translate-x-1/2 w-[3.5px] h-[86px] bg-primary rounded-full shadow-[0_2px_8px_rgba(171,45,42,0.35)]"
        />
      </div>

      <!-- Pivot central en porcelaine tactile -->
      <div class="relative w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-surface-container-lowest shadow-[0_3px_10px_rgba(0,0,0,0.08)] flex items-center justify-center z-10">
        <div class="w-4 h-4 rounded-full bg-surface-container-high flex items-center justify-center">
          <div class="w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
      </div>
    </div>

    <!-- Affichage digital & Horizon d'accomplissement -->
    <div class="flex flex-col items-center mt-3 mb-4">
      <div class="font-display text-display lg:text-[46px] text-on-surface tracking-tighter tabular-nums">
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
