# 🗺️ Architecture Visuelle - Navigation en 4 Modules

## 📐 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SURVIVE.ADMIN - Dashboard                        │
│                     Plateforme de Résilience                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                ┌─────────────────┴──────────────────┐
                │                                    │
         ┌──────▼───────┐                    ┌──────▼───────┐
         │   SIDEBAR    │                    │  MAIN AREA   │
         │  Navigation  │                    │   Content    │
         └──────────────┘                    └──────────────┘
```

---

## 🎯 Structure Détaillée de la Navigation

```
┌──────────────────────────────────────────────────────────────────┐
│  SURVIVE.ADMIN                                          [Theme]   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  🏠  Dashboard                                                    │
│      └─ Vue d'ensemble, métriques, graphiques                    │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│  MODULE 1 : SIMULATION                                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  🎮  Simulation                                                   │
│      ├─ 📋 Liste des simulations                                 │
│      ├─ ➕ Créer simulation                                       │
│      ├─ 🎯 Scénarios                                             │
│      ├─ ⚙️  Injections (EMAIL, SMS, CALL, etc.)                  │
│      ├─ 👤 Mode Participant                                      │
│      └─ 👥 Participations                                        │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│  MODULE 2 : INSTRUCTEUR                                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  🎓  Instructeur                                                  │
│      ├─ 🎯 Vue Instructeur                                       │
│      │   └─ Tableau de bord animateur                            │
│      ├─ 👥 Gestion d'équipes                                     │
│      │   └─ Créer, modifier, supprimer équipes                   │
│      ├─ 👤 Membres d'équipe                                      │
│      │   └─ Assigner rôles (LEADER/MEMBER)                       │
│      ├─ 💬 Chat d'équipe                                         │
│      │   └─ Communication temps réel                             │
│      ├─ 📋 Gestion des tâches                                    │
│      │   └─ Créer, assigner, suivre tâches                       │
│      ├─ ⚠️  Incidents                                             │
│      │   └─ Gérer incidents pendant simulation                   │
│      └─ 📄 Rapports                                              │
│          └─ Générer rapports de session                          │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│  MODULE 3 : BIA (Business Impact Analysis)                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📊  BIA - Analyse d'Impact                                       │
│      ├─ 📈 Dashboard BIA                                         │
│      │   └─ Vue d'ensemble analyses                              │
│      ├─ 📋 Liste des processus                                   │
│      │   └─ Tous les processus métier                            │
│      ├─ ➕ Nouveau processus                                      │
│      │   └─ Formulaire BIA complet                               │
│      │       ├─ RTO, RPO, MTPD                                   │
│      │       ├─ Impacts (financier, opérationnel)                │
│      │       ├─ Dépendances IT                                   │
│      │       ├─ Infrastructure                                   │
│      │       └─ Personnel & Équipement                           │
│      ├─ 🏭 Usines / Factories                                    │
│      │   └─ Analyse consolidée par site                          │
│      ├─ 📄 Rapports BIA                                          │
│      │   └─ Génération PDF, DOCX, JSON, HTML                     │
│      ├─ 🛡️  Conformité                                           │
│      │   └─ Suivi réglementaire                                  │
│      └─ ⚠️  Gestion des risques                                   │
│          └─ Analyse & mitigation                                 │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│  MODULE 4 : WORKSHOP                                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📚  Workshop                                                     │
│      ├─ 📖 Formations                                            │
│      │   └─ Modules de formation continue                        │
│      ├─ 📋 Plans d'action                                        │
│      │   └─ Plans de continuité d'activité                       │
│      ├─ ⚙️  Types de plans                                       │
│      │   └─ Catégorisation des plans                             │
│      ├─ 👥 Événements                                            │
│      │   └─ Webinaires, sessions, workshops                      │
│      └─ ✉️  Notifications                                         │
│          └─ Centre de notifications                              │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│  SECTIONS COMPLÉMENTAIRES                                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  👤  Profil & Compte                                             │
│      ├─ 👤 Mon Profil                                            │
│      ├─ ⚙️  Paramètres                                            │
│      └─ 💳 Plans & Abonnements                                   │
│                                                                   │
│  🛡️  Administration (ADMIN uniquement)                           │
│      ├─ 🛡️  Panel Admin                                          │
│      ├─ 👥 Utilisateurs                                          │
│      ├─ 🔐 Super Admin                                           │
│      └─ ✉️  Email Diagnostics                                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux Utilisateur par Rôle

### 👨‍💼 Responsable BIA

```
┌─────────┐
│  Login  │
└────┬────┘
     │
     ▼
┌────────────┐
│ Dashboard  │
└────┬───────┘
     │
     ▼
┌────────────────────┐
│  📊 BIA Module     │
└────┬───────────────┘
     │
     ├─► Dashboard BIA ─────► Vue d'ensemble
     │
     ├─► Nouveau processus ─► Formulaire BIA
     │                         │
     │                         ├─ Définir RTO/RPO
     │                         ├─ Impacts métier
     │                         └─ Analyse IA (Gemini)
     │
     ├─► Usines ───────────► Analyse consolidée
     │
     └─► Rapports BIA ──────► Générer PDF/DOCX
```

### 👨‍🏫 Instructeur/Formateur

```
┌─────────┐
│  Login  │
└────┬────┘
     │
     ▼
┌────────────┐
│ Dashboard  │
└────┬───────┘
     │
     ▼
┌──────────────────────┐
│  🎓 Instructeur      │
└────┬─────────────────┘
     │
     ├─► Vue Instructeur ────► Tableau de bord
     │                          │
     │                          ├─ Simulations actives
     │                          ├─ Équipes en ligne
     │                          └─ Incidents en cours
     │
     ├─► Gestion d'équipes ──► Créer/Modifier équipes
     │                          │
     │                          └─► Assigner membres
     │
     ├─► Gestion des tâches ─► Créer tâches
     │                          │
     │                          └─► Assigner à équipe
     │
     ├─► Incidents ──────────► Suivre incidents
     │
     └─► Rapports ───────────► Générer rapport session
```

### 👨‍💻 Participant

```
┌─────────┐
│  Login  │
└────┬────┘
     │
     ▼
┌────────────┐
│ Dashboard  │
└────┬───────┘
     │
     ▼
┌──────────────────────┐
│  🎮 Simulation       │
└────┬─────────────────┘
     │
     └─► Mode Participant ──► Interface participant
                              │
                              ├─► Voir injections
                              │   (Emails, SMS, Alerts)
                              │
                              ├─► Voir tâches assignées
                              │
                              ├─► Chat équipe
                              │
                              └─► Soumettre réponses
```

### 🛡️ Administrateur

```
┌─────────┐
│  Login  │
└────┬────┘
     │
     ▼
┌────────────┐
│ Dashboard  │
└────┬───────┘
     │
     ├─► 🛡️ Administration ──► Panel Admin
     │                         │
     │                         ├─► Utilisateurs
     │                         │   └─► CRUD users
     │                         │
     │                         ├─► Super Admin
     │                         │   └─► Config système
     │                         │
     │                         └─► Email Diagnostics
     │                             └─► Test envois
     │
     ├─► 🎮 Simulation
     ├─► 🎓 Instructeur
     ├─► 📊 BIA
     └─► 📚 Workshop
         (Accès complet)
```

---

## 🎨 Hiérarchie Visuelle

```
NIVEAU 0 (ROOT)
    │
    └─── Dashboard ──────────────────── [Page principale]
         │
         │
NIVEAU 1 (MODULES PRINCIPAUX)
         │
         ├─── 🎮 Simulation
         ├─── 🎓 Instructeur
         ├─── 📊 BIA
         ├─── 📚 Workshop
         ├─── 👤 Profil & Compte
         └─── 🛡️ Administration
              │
              │
NIVEAU 2 (SOUS-PAGES)
              │
              ├─── Liste
              ├─── Créer
              ├─── Détails
              ├─── Paramètres
              └─── Rapports
                   │
                   │
NIVEAU 3 (DÉTAILS)
                   │
                   ├─── [id] (dynamique)
                   ├─── Édition
                   └─── Actions
```

---

## 📊 Matrice de Navigation

| Module             | Pages | Rôle Min | Actions Clés                     |
| ------------------ | ----- | -------- | -------------------------------- |
| **🎮 Simulation**  | 6     | USER     | Créer, Participer, Consulter     |
| **🎓 Instructeur** | 7     | USER     | Animer, Gérer, Suivre            |
| **📊 BIA**         | 7     | USER     | Analyser, Rapporter, Consolider  |
| **📚 Workshop**    | 5     | USER     | Former, Planifier, Notifier      |
| **👤 Profil**      | 3     | USER     | Consulter, Modifier              |
| **🛡️ Admin**       | 4     | ADMIN    | Gérer, Configurer, Diagnostiquer |

---

## 🔗 Interconnexions

```
    🎮 SIMULATION ←──────────→ 🎓 INSTRUCTEUR
         │                           │
         │                           │
         ↓                           ↓
    Participants ←─────────→ Tâches & Équipes
         │                           │
         │                           │
         ↓                           ↓
    📊 BIA ←────────────────→ 📚 WORKSHOP
         │                           │
         │                           │
         ↓                           ↓
    Processus Critiques ←───→ Plans de Formation
```

### Exemples de Liens Croisés

1. **Simulation → BIA**

   - Scénario basé sur processus critique (BIA)
   - Impact simulation testé sur RTO/RPO

2. **Instructeur → Workshop**

   - Session de formation enregistrée
   - Plan d'action post-simulation

3. **BIA → Workshop**
   - Formation sur processus critiques
   - Plan de continuité (PCA/PRA)

---

## 🎯 Points d'Entrée Recommandés

```
┌──────────────────┐
│  NOUVEAU USER    │
└────────┬─────────┘
         │
         └──► Dashboard → 🎮 Simulation → Mode Participant
                          (Découverte guidée)

┌──────────────────┐
│  INSTRUCTEUR     │
└────────┬─────────┘
         │
         └──► Dashboard → 🎓 Instructeur → Vue Instructeur
                          (Tableau de bord opérationnel)

┌──────────────────┐
│  RESPONSABLE BIA │
└────────┬─────────┘
         │
         └──► Dashboard → 📊 BIA → Dashboard BIA
                          (Métriques et analyses)

┌──────────────────┐
│  ADMIN           │
└────────┬─────────┘
         │
         └──► Dashboard → 🛡️ Administration → Panel Admin
                          (Gestion centrale)
```

---

## 📱 Responsive Behavior

```
DESKTOP (>1024px)
┌─────────────────────────────────────┐
│  SIDEBAR (fixe)  │  MAIN CONTENT    │
│                  │                  │
│  🏠 Dashboard    │  [Contenu page]  │
│  🎮 Simulation   │                  │
│    └─ Liste      │                  │
│    └─ Créer      │                  │
│  🎓 Instructeur  │                  │
│  📊 BIA          │                  │
│  📚 Workshop     │                  │
└─────────────────────────────────────┘

MOBILE (<768px)
┌──────────────────────┐
│  [☰ Menu]  LOGO      │
├──────────────────────┤
│                      │
│  [Contenu page]      │
│                      │
│                      │
└──────────────────────┘

[Sidebar = Sheet overlay]
```

---

**Version :** 1.0  
**Date :** 14 Novembre 2025
