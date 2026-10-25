<script setup>
import { ref } from 'vue'
import { useSettings } from '../../composables/useSettings'
import { useSessions } from '../../composables/useSessions'

const { settings, addCategory, updateCategory, deleteCategory, resetToDefaults } = useSettings()
const { clearHistory } = useSessions()

// Formulaire nouvelle catégorie
const newCatName = ref('')
const newCatColor = ref('#ab2d2a')

const availableColors = [
  '#ab2d2a', // Vermillon Braun
  '#a13d39', // Brique
  '#b25e29', // Ambre terreux
  '#438e65', // Vert sauge
  '#3a75a4', // Bleu ardoise
  '#6b5282', // Violet feutré
  '#7e7271', // Taupe
  '#8c706e', // Charbon
]

function handleAddCategory() {
  if (!newCatName.value.trim()) return
  addCategory(newCatName.value, newCatColor.value)
  newCatName.value = ''
}

const showHistoryConfirm = ref(false)

function handleClearHistory() {
  clearHistory()
  showHistoryConfirm.value = false
}
</script>

<template>
  <div class="flex flex-col w-full gap-space-lg select-none pb-12 max-w-2xl mx-auto">
    <!-- En-tête -->
    <header class="flex flex-col">
      <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">
        Paramètres
      </h1>
      <p class="font-body-md text-body-md text-tertiary mt-space-2xs">
        Personnalisez votre rythme Pomodoro et vos catégories de concentration.
      </p>
    </header>

    <!-- SECTION 1 : CONFIGURATION DES CYCLES POMODORO & TEMPS DE PAUSE -->
    <section class="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container shadow-sm flex flex-col gap-5">
      <div class="flex items-center gap-2.5">
        <span class="material-symbols-outlined text-primary text-[22px]">timer</span>
        <div>
          <h2 class="font-headline-sm text-[17px] text-on-surface font-semibold tracking-tight">
            Chronométrie Pomodoro
          </h2>
          <p class="font-body-sm text-tertiary text-[12px]">
            Ajustez les durées de concentration et de récupération
          </p>
        </div>
      </div>

      <!-- Durée Focus -->
      <div class="flex flex-col gap-2 p-3.5 rounded-2xl bg-surface-container-low/70 border border-surface-container">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-primary" />
            <span class="font-label-md text-label-md text-on-surface font-medium">Session de Focus</span>
          </div>
          <span class="font-label-md text-primary font-semibold tabular-nums">
            {{ settings.focusDuration }} min
          </span>
        </div>
        <input
          v-model.number="settings.focusDuration"
          type="range"
          min="5"
          max="60"
          step="5"
          class="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div class="flex justify-between text-[11px] text-tertiary">
          <span>5 min</span>
          <span>25 min (standard)</span>
          <span>60 min</span>
        </div>
      </div>

      <!-- Durée Pause Courte -->
      <div class="flex flex-col gap-2 p-3.5 rounded-2xl bg-surface-container-low/70 border border-surface-container">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#438e65]" />
            <span class="font-label-md text-label-md text-on-surface font-medium">Pause Courte</span>
          </div>
          <span class="font-label-md text-[#438e65] font-semibold tabular-nums">
            {{ settings.shortBreakDuration }} min
          </span>
        </div>
        <input
          v-model.number="settings.shortBreakDuration"
          type="range"
          min="1"
          max="20"
          step="1"
          class="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-[#438e65]"
        />
        <div class="flex justify-between text-[11px] text-tertiary">
          <span>1 min</span>
          <span>5 min (recommandé)</span>
          <span>20 min</span>
        </div>
      </div>

      <!-- Durée Pause Longue -->
      <div class="flex flex-col gap-2 p-3.5 rounded-2xl bg-surface-container-low/70 border border-surface-container">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#3a75a4]" />
            <span class="font-label-md text-label-md text-on-surface font-medium">Pause Longue</span>
          </div>
          <span class="font-label-md text-[#3a75a4] font-semibold tabular-nums">
            {{ settings.longBreakDuration }} min
          </span>
        </div>
        <input
          v-model.number="settings.longBreakDuration"
          type="range"
          min="5"
          max="45"
          step="5"
          class="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-[#3a75a4]"
        />
        <div class="flex justify-between text-[11px] text-tertiary">
          <span>5 min</span>
          <span>15 min (recommandé)</span>
          <span>45 min</span>
        </div>
      </div>

      <!-- Intervalle Pause Longue -->
      <div class="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low/50 border border-surface-container">
        <div>
          <div class="font-label-md text-label-md text-on-surface font-medium">Fréquence de pause longue</div>
          <div class="font-body-sm text-tertiary text-[12px]">Après combien de sessions de focus</div>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-for="count in [3, 4, 5]"
            :key="count"
            type="button"
            class="w-8 h-8 rounded-full font-label-md text-label-md transition-all flex items-center justify-center"
            :class="settings.longBreakInterval === count ? 'bg-primary text-on-primary font-semibold shadow-sm' : 'bg-surface-container text-tertiary hover:text-on-surface'"
            @click="settings.longBreakInterval = count"
          >
            {{ count }}
          </button>
        </div>
      </div>
    </section>

    <!-- SECTION 2 : CONFIGURATION DES CATÉGORIES DE CONCENTRATION -->
    <section class="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container shadow-sm flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <span class="material-symbols-outlined text-primary text-[22px]">category</span>
          <div>
            <h2 class="font-headline-sm text-[17px] text-on-surface font-semibold tracking-tight">
              Catégories de Focus
            </h2>
            <p class="font-body-sm text-tertiary text-[12px]">
              Personnalisez les types de travail et leurs codes chromatiques
            </p>
          </div>
        </div>
      </div>

      <!-- Liste des catégories existantes -->
      <div class="flex flex-col gap-2">
        <div
          v-for="cat in settings.categories"
          :key="cat.id"
          class="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low border border-surface-container"
        >
          <div class="flex items-center gap-3 flex-1 mr-2">
            <!-- Palette de couleur rapide -->
            <div class="relative group">
              <span
                class="w-5 h-5 rounded-full inline-block shadow-sm cursor-pointer border border-surface-container-high"
                :style="{ backgroundColor: cat.color }"
              />
            </div>
            <input
              v-model="cat.name"
              type="text"
              class="bg-transparent font-body-md text-body-md text-on-surface font-medium outline-none flex-1 border-b border-transparent focus:border-outline-variant"
            />
          </div>

          <!-- Choix de couleur direct & Suppression -->
          <div class="flex items-center gap-1.5">
            <button
              v-for="col in availableColors.slice(0, 4)"
              :key="col"
              type="button"
              class="w-4 h-4 rounded-full transition-transform"
              :class="cat.color === col ? 'scale-125 ring-2 ring-primary/40' : 'opacity-60 hover:opacity-100'"
              :style="{ backgroundColor: col }"
              @click="updateCategory(cat.id, cat.name, col)"
            />

            <button
              v-if="settings.categories.length > 1"
              type="button"
              title="Supprimer la catégorie"
              class="w-7 h-7 rounded-full hover:bg-error/15 text-tertiary hover:text-error flex items-center justify-center transition-colors ml-1"
              @click="deleteCategory(cat.id)"
            >
              <span class="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Formulaire d'ajout rapide de catégorie -->
      <div class="p-3.5 rounded-2xl bg-surface-container-low/60 border border-dashed border-outline-variant/70 flex flex-col gap-3 mt-1">
        <span class="font-label-sm text-tertiary uppercase tracking-wider text-[11px]">
          Ajouter une nouvelle catégorie
        </span>
        <div class="flex items-center gap-2">
          <input
            v-model="newCatName"
            type="text"
            placeholder="Nom (ex: Lecture, Conception, Langues...)"
            class="flex-1 px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-surface-container text-body-md text-on-surface outline-none"
            @keydown.enter="handleAddCategory"
          />
          <button
            type="button"
            class="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shrink-0"
            @click="handleAddCategory"
          >
            Ajouter
          </button>
        </div>

        <div class="flex items-center gap-2 pt-1">
          <span class="font-label-sm text-tertiary text-[11px]">Couleur :</span>
          <div class="flex items-center gap-1.5">
            <button
              v-for="col in availableColors"
              :key="col"
              type="button"
              class="w-5 h-5 rounded-full transition-all"
              :class="newCatColor === col ? 'scale-125 ring-2 ring-primary shadow-sm' : 'opacity-70 hover:opacity-100'"
              :style="{ backgroundColor: col }"
              @click="newCatColor = col"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 3 : GESTION DES DONNÉES & RÉINITIALISATION -->
    <section class="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container shadow-sm flex flex-col gap-3">
      <h3 class="font-label-md text-label-md text-tertiary uppercase tracking-wider text-[11px]">
        Options avancées
      </h3>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <button
          type="button"
          class="px-4 py-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 transition-colors"
          @click="resetToDefaults"
        >
          <span class="material-symbols-outlined text-[18px]">restart_alt</span>
          Rétablir les durées par défaut
        </button>

        <button
          type="button"
          class="px-4 py-2.5 rounded-2xl bg-error/10 hover:bg-error/20 text-error font-label-md text-label-md flex items-center justify-center gap-2 transition-colors"
          @click="showHistoryConfirm = true"
        >
          <span class="material-symbols-outlined text-[18px]">delete_sweep</span>
          Effacer l'historique local
        </button>
      </div>

      <!-- Confirmation effacement historique -->
      <div
        v-if="showHistoryConfirm"
        class="mt-2 p-3.5 rounded-2xl bg-error/10 border border-error/20 flex flex-col sm:flex-row items-center justify-between gap-2.5"
      >
        <span class="font-body-sm text-error text-[13px] text-center sm:text-left">
          Confirmer la suppression de toutes vos sessions enregistrées ?
        </span>
        <div class="flex items-center gap-2 shrink-0">
          <button
            type="button"
            class="px-3 py-1 rounded-xl bg-surface-container text-on-surface font-label-sm text-label-sm"
            @click="showHistoryConfirm = false"
          >
            Annuler
          </button>
          <button
            type="button"
            class="px-3 py-1 rounded-xl bg-error text-on-error font-label-sm text-label-sm font-semibold"
            @click="handleClearHistory"
          >
            Oui, effacer
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
