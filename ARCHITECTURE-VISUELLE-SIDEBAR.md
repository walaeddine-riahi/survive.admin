# 🎯 STRUCTURE VISUELLE DE LA SIDEBAR

## 📐 Architecture Complète de la Navigation

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ██████╗ ██╗   ██╗██████╗ ██╗   ██╗██╗██╗   ██╗│
│  ██╔════╝██║   ██║██╔══██╗██║   ██║██║██║   ██║│
│  ███████╗██║   ██║██████╔╝██║   ██║██║██║   ██║│
│  ╚════██║██║   ██║██╔══██╗╚██╗ ██╔╝██║╚██╗ ██╔╝│
│  ███████║╚██████╔╝██║  ██║ ╚████╔╝ ██║ ╚████╔╝ │
│  ╚══════╝ ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  ╚═╝  ╚═══╝  │
│                                                 │
│         SURVIVE.ADMIN - Navigation              │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  📊 Dashboard                                   │
│     └─ /dashboard                               │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  🎮 Simulation                              ▼   │
│     ├─ Liste des simulations                    │
│     ├─ Créer simulation                         │
│     ├─ Scénarios                                │
│     ├─ Injections                               │
│     ├─ Mode Participant                         │
│     └─ Participations                           │
│                                                 │
│  🎓 Instructeur                             ▼   │
│     ├─ Vue Instructeur                          │
│     ├─ Gestion d'équipes                        │
│     ├─ Liste des équipes                        │
│     ├─ Membres d'équipe                         │
│     ├─ Membre (ancien)                          │
│     ├─ Chat d'équipe                            │
│     ├─ Gestion des tâches                       │
│     ├─ Incidents                                │
│     ├─ Créer incident                           │
│     └─ Rapports                                 │
│                                                 │
│  📊 BIA - Analyse d'Impact                  ▼   │
│     ├─ Dashboard BIA                            │
│     ├─ Liste des processus                      │
│     ├─ Nouveau processus                        │
│     ├─ Éditer processus                         │
│     ├─ Usines / Factories                       │
│     ├─ Rapports BIA                             │
│     ├─ Conformité                               │
│     ├─ Conformité (alt)                         │
│     └─ Gestion des risques                      │
│                                                 │
│  📚 Workshop                                ▼   │
│     ├─ Formations                               │
│     ├─ Plans d'action                           │
│     ├─ Types de plans                           │
│     ├─ Événements                               │
│     └─ Notifications                            │
│                                                 │
│  👤 Profil & Compte                         ▼   │
│     ├─ Mon Profil                               │
│     └─ Paramètres                               │
│                                                 │
│  🛡️ Administration                          ▼   │
│     ├─ Panel Admin                              │
│     ├─ Utilisateurs                             │
│     └─ Super Admin                              │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  🚪 Déconnexion                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🎨 VUE CONDENSÉE

```
SURVIVE.ADMIN
│
├─ 📊 Dashboard (1)
│
├─ 🎮 Simulation (6)
│   ├─ Liste des simulations
│   ├─ Créer simulation
│   ├─ Scénarios
│   ├─ Injections
│   ├─ Mode Participant
│   └─ Participations
│
├─ 🎓 Instructeur (10)
│   ├─ Vue Instructeur
│   ├─ Gestion d'équipes
│   ├─ Liste des équipes
│   ├─ Membres d'équipe
│   ├─ Membre (ancien)
│   ├─ Chat d'équipe
│   ├─ Gestion des tâches
│   ├─ Incidents
│   ├─ Créer incident
│   └─ Rapports
│
├─ 📊 BIA - Analyse d'Impact (9)
│   ├─ Dashboard BIA
│   ├─ Liste des processus
│   ├─ Nouveau processus
│   ├─ Éditer processus
│   ├─ Usines / Factories
│   ├─ Rapports BIA
│   ├─ Conformité
│   ├─ Conformité (alt)
│   └─ Gestion des risques
│
├─ 📚 Workshop (5)
│   ├─ Formations
│   ├─ Plans d'action
│   ├─ Types de plans
│   ├─ Événements
│   └─ Notifications
│
├─ 👤 Profil & Compte (2)
│   ├─ Mon Profil
│   └─ Paramètres
│
├─ 🛡️ Administration (3)
│   ├─ Panel Admin
│   ├─ Utilisateurs
│   └─ Super Admin
│
└─ 🚪 Déconnexion
```

---

## 🗺️ CARTOGRAPHIE DES ROUTES

### Module SIMULATION

```
/simulation              → Liste des simulations
/simulation/create       → Créer une nouvelle simulation
/scenario               → Gestion des scénarios
/injections             → Gestion des injections
/participant-mode       → Mode vue participant
/participations         → Suivi des participations
```

### Module INSTRUCTEUR

```
/instructor-simulations  → Vue globale instructeur
/team                   → Gestion d'une équipe
/teams                  → Liste de toutes les équipes
/team-members           → Membres d'équipe (nouveau)
/team-member            → Membre d'équipe (ancien)
/team-chat              → Chat d'équipe en temps réel
/task                   → Gestion des tâches
/incident               → Liste des incidents
/incident/create        → Créer un nouvel incident
/report                 → Rapports et statistiques
```

### Module BIA (Business Impact Analysis)

```
/bia/dashboard          → Dashboard principal BIA
/bia                    → Liste des processus métier
/bia/processes/new      → Créer un nouveau processus
/bia/processes/edit     → Éditer un processus existant
/bia/factories          → Gestion des usines
/bia/reports            → Rapports d'analyse
/compliance             → Conformité réglementaire
/conformity             → Conformité alternative
/risk                   → Gestion des risques
```

### Module WORKSHOP

```
/training               → Formations et ateliers
/plan                   → Plans d'action
/plan-type              → Types de plans
/participations         → Événements et participations
/notifications          → Centre de notifications
```

### PROFIL & COMPTE

```
/profile                → Mon profil utilisateur
/settings               → Paramètres du compte
```

### ADMINISTRATION

```
/admin                  → Panel administrateur
/users                  → Gestion des utilisateurs
/super-admin            → Panel super admin
```

---

## 📊 DIAGRAMME DE FLUX

```
┌──────────────┐
│   Landing    │
│    Page      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Login     │
│   /signin    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────┐
│           Dashboard Principal            │
│              /dashboard                  │
└──────┬───────────────────────────────────┘
       │
       ├───► 🎮 Simulation ────────┬──► /simulation
       │                           ├──► /scenario
       │                           ├──► /injections
       │                           ├──► /participant-mode
       │                           └──► /participations
       │
       ├───► 🎓 Instructeur ───────┬──► /instructor-simulations
       │                           ├──► /team
       │                           ├──► /teams
       │                           ├──► /team-members
       │                           ├──► /team-chat
       │                           ├──► /task
       │                           ├──► /incident
       │                           └──► /report
       │
       ├───► 📊 BIA ──────────────┬──► /bia/dashboard
       │                           ├──► /bia
       │                           ├──► /bia/processes/*
       │                           ├──► /bia/factories
       │                           ├──► /compliance
       │                           ├──► /conformity
       │                           └──► /risk
       │
       ├───► 📚 Workshop ─────────┬──► /training
       │                           ├──► /plan
       │                           ├──► /plan-type
       │                           └──► /notifications
       │
       ├───► 👤 Profil ───────────┬──► /profile
       │                           └──► /settings
       │
       └───► 🛡️ Admin ────────────┬──► /admin
                                   ├──► /users
                                   └──► /super-admin
```

---

## 🎯 NAVIGATION PAR RÔLE

### 👤 UTILISATEUR (USER)

```
✅ Dashboard
✅ Simulation (lecture seule ou participation)
✅ Instructeur (si assigné comme instructeur)
✅ BIA (consultation)
✅ Workshop (formations)
✅ Profil & Compte
❌ Administration (accès refusé)
```

### 🛡️ ADMINISTRATEUR (ADMIN)

```
✅ Dashboard
✅ Simulation (création, modification, suppression)
✅ Instructeur (gestion complète)
✅ BIA (analyse complète)
✅ Workshop (gestion complète)
✅ Profil & Compte
✅ Administration (gestion utilisateurs, config)
```

---

## 🔄 INTERACTIONS

### Expand/Collapse

- Cliquer sur le titre d'un module pour expand/collapse
- L'icône `ChevronDown` tourne pour indiquer l'état
- Un seul module peut être ouvert à la fois (accordion behavior)

### Highlight actif

- La page actuellement affichée est mise en surbrillance
- Utilise `pathname === route.href` pour la détection
- Classe CSS: `bg-accent text-accent-foreground`

### Mobile Responsive

- Sur mobile, la sidebar devient un drawer
- Bouton hamburger pour ouvrir/fermer
- Fermeture automatique après navigation

---

## 🚀 PERFORMANCE

### Lazy Loading

- Les modules sont chargés à la demande
- Pas de charge initiale excessive
- Transition fluide entre les pages

### State Management

- `useState` pour l'état expand/collapse
- `usePathname()` pour détecter la route active
- Re-render optimisé (seulement si pathname change)

---

## 📱 RESPONSIVE DESIGN

### Desktop (> 768px)

```
┌────────────┬──────────────────────────┐
│            │                          │
│  SIDEBAR   │     MAIN CONTENT         │
│  (250px)   │                          │
│            │                          │
│  Fixed     │     Scrollable           │
│  Position  │                          │
│            │                          │
└────────────┴──────────────────────────┘
```

### Mobile (< 768px)

```
┌──────────────────────────┐
│  [☰]  HEADER             │
├──────────────────────────┤
│                          │
│    MAIN CONTENT          │
│    (Full Width)          │
│                          │
│                          │
└──────────────────────────┘

[☰] Clicked:
┌──────────────────────────┐
│  SIDEBAR (Drawer)        │
│  Slides from left        │
│  Overlay background      │
│                          │
│  [X] Close               │
└──────────────────────────┘
```

---

## 🎨 DESIGN TOKENS

### Couleurs

```css
bg-background      : Fond de la sidebar
text-foreground    : Texte principal
text-muted-foreground : Texte secondaire
bg-accent          : Fond de l'élément actif
text-accent-foreground : Texte de l'élément actif
border             : Bordures et séparateurs
```

### Spacing

```css
p-4   : Padding du header
p-3   : Padding des boutons
gap-2 : Espacement entre items
```

### Typography

```css
text-xl font-bold  : Header "SURVIVE.ADMIN"
text-sm           : Items de navigation
```

---

**🎉 Navigation complète avec 36 pages accessibles !**
