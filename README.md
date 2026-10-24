# ⏱️ Focus — Chronométrie Sereine & Productivité Cognitive

Application mobile-first de concentration et de travail profond inspirée par les principes d'horlogerie minimale de Dieter Rams / Braun et le design system **Serene Focus**.

Ce projet privilégie la **quiétude cognitive** : aucune boucle de dopamine artificielle, pas de gamification agressive ni de bannières intrusives, mais une expérience fluide, tactile et apaisante.

---

## ✨ Fonctionnalités Clés

- **Cadran Analogique Minuté (Braun Inspired)** :
  - Cadran SVG haute précision à 60 graduations horlogères.
  - Secteur d'avancement dynamique avec dégradé radial vermillon doux.
  - Aiguille indicatrice pivotante et affichage numérique haute lisibilité (`tabular-nums`).
  - Calcul automatique de la fenêtre d'horizon temporel (ex: `14:20 → 14:45`).
- **Moteur d'Ambiances Sonores Multi-Sources (`useAudioAmbience`)** :
  - **Synthèse locale Web Audio API** : Générateur autonome de bruit blanc, pluie douce et café feutré (zéro consommation réseau, ultra sobre en batterie).
  - **Support des flux YouTube** : Intégration fluide de flux musicaux d'ambiance / lo-fi en arrière-plan via l'API IFrame.
  - **Playlists Personnalisées** : Création, gestion et écoute de playlists sur-mesure avec sauvegarde locale `localStorage`.
  - **Import de Musiques Locales** : Possibilité d'importer ses propres fichiers audio (MP3, WAV, FLAC, AAC) directement depuis l'appareil.
  - **Fondu Sonore Intelligent (Fade-Out)** : Atténuation progressive du volume 2 minutes avant la fin de la séance.
- **Gestionnaire de Tâches Organique** :
  - Ajout rapide avec pré-calibrage de durée (25m, 50m, Libre).
  - Filtrage segmenté (*À faire*, *En cours*, *Accomplies*).
  - Lancement immédiat d'une session de focus liée à une tâche.
- **Timeline Quotidienne Chronologique** :
  - Calendrier hebdomadaire 7 jours avec indicateur ponctuel Braun.
  - Suivi des blocs de concentration réalisés au fil de la journée.
- **Bilan Factuel & Analytique** :
  - Métriques sobres (temps total concentré, taux de complétion, travail sans interruption).
  - Répartition par catégories d'attention (Deep Work, Écriture, Recherche, Admin).
  - Histogramme hebdomadaire d'activité.

---

## 🛠️ Stack Technique & Choix d'Architecture

- **Framework** : [Vue 3](https://vuejs.org/) (Composition API avec `<script setup>`).
- **Build Tool** : [Vite 8](https://vitejs.dev/) pour un rechargement à chaud ultra rapide et des builds optimisés.
- **Styling** : [Tailwind CSS v4](https://tailwindcss.com/) avec configuration moderne via `@theme` et design tokens Serene Focus.
- **Gestion d'État** : Composables réactifs modulaires (`useTimer.js`, `useAudioAmbience.js`) selon le patron Singleton réactif.
- **Typographie & Icônes** : Google Fonts *Inter* et *Material Symbols Outlined*.
- **Compatibilité Mobile & Natif** : Pensé mobile-first (safe-area insets, support PWA / Capacitor pour déploiement iOS & Android).

---

## 🚀 Installation & Démarrage

```bash
# Cloner le dépôt
git clone <url-du-repo>
cd minimaliste-pomodoro

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Compiler pour la production
npm run build
```

---

## 📂 Organisation du Projet

```
src/
├── assets/             # Ressources statiques
├── components/
│   ├── audio/          # Bottom sheet d'ambiances, mixeur & flux YouTube
│   ├── bilan/          # Bilan factuel et métriques analytiques
│   ├── focus/          # Cadran analogique, presets et intention
│   ├── navigation/     # Header bar et bottom navigation
│   ├── tasks/          # Gestionnaire de tâches et filtres
│   └── timeline/       # Calendrier 7 jours et axe chronologique
├── composables/
│   ├── useAudioAmbience.js  # Moteur Web Audio, YouTube & playlists
│   └── useTimer.js          # Horloge exacte, calculs trigonométriques SVG
├── App.vue             # Orchestration principale
├── main.js             # Point d'entrée de l'application
└── style.css           # Thème Serene Focus & utilitaires CSS
```

---

*Développé avec soin et exigence pour le portfolio.*
