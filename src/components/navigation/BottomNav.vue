<script setup>
defineProps({
  activeTab: {
    type: String,
    default: 'focus',
  },
})

const emit = defineEmits(['update:activeTab'])

const navItems = [
  { id: 'focus', label: 'Focus', icon: 'timer' },
  { id: 'timeline', label: 'Timeline', icon: 'calendar_today' },
  { id: 'tasks', label: 'Tâches', icon: 'check_circle' },
  { id: 'bilan', label: 'Bilan', icon: 'bar_chart' },
]
</script>

<template>
  <nav class="fixed bottom-0 w-full z-40 pb-safe bg-surface/85 backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.03)] border-t border-surface-container/40">
    <div class="flex justify-around items-center h-16 px-gutter max-w-lg mx-auto">
      <button
        v-for="item in navItems"
        :key="item.id"
        type="button"
        class="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors"
        :class="activeTab === item.id ? 'text-primary font-medium' : 'text-tertiary hover:text-on-surface'"
        @click="emit('update:activeTab', item.id)"
      >
        <span
          class="material-symbols-outlined text-[22px]"
          :class="{ 'font-semibold': activeTab === item.id }"
        >
          {{ item.icon }}
        </span>
        <span class="font-label-sm text-label-sm mt-space-2xs">
          {{ item.label }}
        </span>
      </button>
    </div>
  </nav>
</template>
