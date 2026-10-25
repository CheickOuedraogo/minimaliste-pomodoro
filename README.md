# ⏱️ Focus — Chronométrie Sereine & Productivité Cognitive

Application mobile-first & desktop de concentration et de travail profond inspirée par les principes d'horlogerie minimale de Dieter Rams / Braun et le design system **Serene Focus**.

Ce projet privilégie la **quiétude cognitive** : aucune boucle de dopamine artificielle, pas de gamification agressive ni de bannières intrusives, mais une expérience fluide, tactile et apaisante.

---

## ✨ Fonctionnalités Clés

- **Cycle Pomodoro Complet & Intuitif** :
  - **3 modes de rythme** : *Focus*, *Pause courte* (5 min) et *Pause longue* (15 min).
  - Bascule manuelle instantanée ou enchaînement guidé avec notification et gong apaisant (528 Hz / 432 Hz).
  - Habillage chromatique adapté (vermillon concentré en focus, vert sauge reposant en pause).
- **Cadran Analogique Interactif (Braun Inspired)** :
  - Cadran SVG haute précision à 60 graduations horlogères.
  - **Réglage interactif au clic** : cliquez directement sur le cadran ou le temps digital pour ajuster la durée (curseur fin 1-60m ou pastilles rapides).
  - Animation mécanique soyeuse par interpolation (Lerp à 60/120 fps via `requestAnimationFrame`).
  - **Pop-up de confirmation d'arrêt** : pour éviter toute fausse manipulation lors de l'interruption d'une session.
- **Section Paramètres Dédiée** :
  - Configuration sur-mesure des durées de Focus, Pause courte et Pause longue.
  - Gestion dynamique des **Catégories de concentration** (ajout, modification de nom, palette de couleurs personnalisée).
- **Vue Activité & Bilan (Timeline + Statistiques unifiées)** :
  - Métriques réelles (temps concentré, nombre de sessions, tâches accomplies).
  - Semainier dynamique 7 jours (Lundi à Dimanche réels) avec déroulé chronologique des sessions.
  - Répartition factuelle de l'attention par catégorie.
  - Graphique hebdomadaire avec moyenne quotidienne.
- **Moteur d'Ambiances Sonores Multi-Sources (`useAudioAmbience`)** :
  - **Synthèse locale Web Audio API** : Générateur autonome de bruit blanc, pluie douce et café feutré (zéro streaming, faible consommation).
  - **Flux YouTube & Playlists** : Intégration en arrière-plan et création de collections personnalisées.
  - **Import Audio Local** : Lecture de fichiers MP3/WAV/FLAC de l'utilisateur.
  - **Fondu Sonore Intelligent (Fade-Out)** : 2 minutes avant la fin de session.
- **Gestionnaire de Tâches Organique** :
  - Ajout et coche au vol avant ou pendant la session.

---

## 🛠️ Stack Technique

- **Framework** : [Vue 3](https://vuejs.org/) (Composition API avec `<script setup>`).
- **Build Tool** : [Vite 8](https://vitejs.dev/).
- **Styling** : [Tailwind CSS v4](https://tailwindcss.com/) avec `@theme` Serene Focus.
- **Architecture Réactive** : Stores composables singletons (`useTimer`, `useSessions`, `useSettings`, `useTasks`, `useAudioAmbience`).
- **Web APIs** : Web Audio API, Fullscreen API, `localStorage`.
- **Responsive** : Split-screen 2 colonnes sur PC / Desktop (`lg:`), mobile-first avec safe-area insets sur mobile.

---

## 🚀 Démarrage

```bash
# Lancer le serveur de développement
npm run dev

# Compiler pour la production
npm run build
```

---

*Développé avec exigence et finesse pour le portfolio.*
