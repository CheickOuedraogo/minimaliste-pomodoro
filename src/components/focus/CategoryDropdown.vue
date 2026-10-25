<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTimer } from '../../composables/useTimer'
import { useSettings } from '../../composables/useSettings'

const { selectedCategory, setCategory } = useTimer()
const { settings } = useSettings()

const isOpen = ref(false)
const dropdownRef = ref(null)

function toggleDropdown(e) {
  e.stopPropagation()
  isOpen.value = !isOpen.value
}

function handleSelect(cat) {
  setCategory(cat)
  isOpen.value = false
}

function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="relative inline-block mb-3">
    <button
      type="button"
      class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container shadow-sm hover:bg-surface-container-high transition-colors"
      @click="toggleDropdown"
    >
      <span
        class="w-2 h-2 rounded-full"
        :style="{ backgroundColor: selectedCategory?.color || '#ab2d2a' }"
      />
      <span class="font-label-md text-label-md text-on-surface">
        {{ selectedCategory?.name || 'Deep Work' }}
      </span>
      <span class="material-symbols-outlined text-[16px] text-tertiary transition-transform duration-200" :class="{ 'rotate-180': isOpen }">
        keyboard_arrow_down
      </span>
    </button>

    <!-- Menu déroulant dynamique -->
    <div
      v-if="isOpen"
      class="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 rounded-2xl bg-surface-container-lowest shadow-xl p-1.5 z-30 border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-150"
    >
      <button
        v-for="cat in settings.categories"
        :key="cat.id"
        type="button"
        class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-surface-container transition-colors"
        @click="handleSelect(cat)"
      >
        <div class="flex items-center gap-2.5">
          <span
            class="w-2 h-2 rounded-full"
            :style="{ backgroundColor: cat.color }"
          />
          <span class="font-body-md text-body-md text-on-surface">
            {{ cat.name }}
          </span>
        </div>
        <span
          v-if="selectedCategory?.id === cat.id"
          class="material-symbols-outlined text-[16px] text-primary"
        >
          check
        </span>
      </button>
    </div>
  </div>
</template>
