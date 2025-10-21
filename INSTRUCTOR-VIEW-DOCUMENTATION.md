# Vue Instructeur - Documentation

## Vue d'ensemble

La page **Vue Instructeur** permet à l'instructeur de surveiller en temps réel tout ce qui se passe dans une simulation de crise. C'est un tableau de bord de monitoring complet qui offre une vision globale de l'activité des participants.

## Accès à la page

### URL directe

```
/simulation/[simulationId]/instructor-view
```

**Exemple:**

```
/simulation/cm52bexqn0000n1dscn7o6c4a/instructor-view
```

### Depuis la liste des simulations

1. Aller sur `/simulation`
2. Trouver la simulation à monitorer
3. Accéder à l'URL: `/simulation/[ID-DE-LA-SIMULATION]/instructor-view`

## Fonctionnalités principales

### 📊 Statistiques en temps réel

Quatre cartes affichent les métriques clés:

1. **Participants**
   - Nombre total d'utilisateurs assignés à la simulation
2. **Communications**

   - Total des messages envoyés par les participants
   - Tous types confondus (Email, SMS, Appel, etc.)

3. **Injections**
   - Nombre total d'injections envoyées
   - Nombre d'injections acquittées
4. **Taux d'acquittement**
   - Pourcentage d'injections acquittées par rapport au total
   - Indicateur de performance des participants

### 🔄 Rafraîchissement automatique

- **Auto-refresh activé par défaut** : Les données se mettent à jour automatiquement toutes les 10 secondes
- **Bouton toggle** : Permet d'activer/désactiver l'auto-refresh
- **Bouton manuel** : Permet de forcer une actualisation immédiate

### 📑 Onglets de navigation

#### 1. Timeline (Activité en temps réel)

Vue chronologique de toutes les activités:

- **Communications** (icône bleue)

  - Affiche qui a envoyé quoi et quand
  - Types: Email, SMS, Appel, Alerte, WhatsApp, Actualités, Journal, Réseaux sociaux
  - Informations: Expéditeur, sujet/contenu, heure

- **Injections** (icône ambre/jaune)
  - Affiche toutes les injections envoyées
  - Statut: Acquitté (badge vert) ou Non acquitté (badge rouge)
  - Informations: Titre, type, scénario, heure

**Tri:** Les activités les plus récentes apparaissent en haut

#### 2. Participants

Liste complète des participants avec:

- **Nom complet** de chaque participant
- **Email** de contact
- **Rôle** dans la simulation (participant, observateur, facilitateur)
- **Statut** (active, inactive)

Vue avec icône utilisateur pour chaque participant.

#### 3. Communications

Grille avec 8 cartes, une par type de communication:

1. **Email** 📧
2. **SMS** 💬
3. **Appel** 📞
4. **Alerte** ⚠️
5. **WhatsApp** 📱
6. **Actualités** 📻
7. **Journal** 📰
8. **Réseaux Sociaux** 🌐

**Pour chaque carte:**

- Badge avec le nombre total de communications
- Liste scrollable des dernières communications
- Affiche: Expéditeur, contenu/sujet, heure relative

**Si aucune communication:** Message "Aucune communication"

#### 4. Injections

Vue détaillée de toutes les injections:

**Informations affichées:**

- **Titre** de l'injection
- **Type** (badge)
- **Scénario** associé (badge)
- **Statut d'acquittement:**
  - ✅ Badge vert "Acquitté" si lu par le participant
  - ❌ Badge rouge "Non acquitté" si non lu
- **Contenu** complet de l'injection
- **Médias:** Badges indiquant présence d'image ou vidéo
- **Heure** relative (il y a X minutes/heures)

**Séparateurs visuels** entre chaque injection pour une meilleure lisibilité.

## Interface utilisateur

### En-tête

```
┌──────────────────────────────────────────────────────────┐
│  [Titre de la simulation]                   [Auto ON] [↻] │
│  Vue Instructeur - Monitoring en temps réel                │
└──────────────────────────────────────────────────────────┘
```

### Cartes statistiques

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│👥 25     │ │💬 142    │ │🔔 8      │ │📈 75%    │
│Particip. │ │Communic. │ │Injections│ │Acquittem.│
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

### Onglets

```
[Timeline] [Participants] [Communications] [Injections]
```

## Cas d'usage

### 🎯 Pour l'instructeur

1. **Monitoring actif pendant la simulation**

   - Suivre l'activité des participants en temps réel
   - Vérifier que les participants réagissent aux injections
   - Observer les patterns de communication

2. **Évaluation de performance**

   - Mesurer le taux d'acquittement des injections
   - Identifier les participants actifs/inactifs
   - Analyser le volume de communications

3. **Détection de problèmes**

   - Repérer les participants qui n'acquittent pas les injections
   - Identifier les manques de communication
   - Détecter les comportements inhabituels

4. **Documentation en direct**
   - Timeline complète de tous les événements
   - Traçabilité de toutes les actions
   - Données pour le debriefing post-simulation

### 🔍 Scénarios d'utilisation

**Scénario 1: Début de simulation**

```
1. Ouvrir la vue instructeur
2. Activer l'auto-refresh
3. Vérifier que tous les participants sont présents
4. Observer les premières réactions aux injections
```

**Scénario 2: Pendant la simulation**

```
1. Surveiller la timeline pour voir l'activité
2. Vérifier les taux d'acquittement
3. Consulter les communications par type
4. Identifier si intervention nécessaire
```

**Scénario 3: Fin de simulation**

```
1. Désactiver l'auto-refresh
2. Consulter l'onglet Injections pour voir le bilan
3. Examiner l'onglet Communications pour analyser les échanges
4. Préparer le debriefing avec les données observées
```

## Architecture technique

### Frontend

- **Framework:** React avec Next.js 15
- **UI Components:** shadcn/ui (Card, Tabs, Badge, ScrollArea, etc.)
- **Icons:** lucide-react
- **Date formatting:** date-fns avec locale française
- **Refresh:** useEffect avec interval de 10 secondes

### Backend (API Endpoint)

- **Route:** `/api/simulations/[simulationId]/instructor-view`
- **Méthode:** GET
- **Authentification:** Session required

**Données retournées:**

```typescript
{
  simulation: {
    id, title, description, status, startDate, endDate,
    assignments: [{ userId, role, status, teamId, user }]
  },
  communications: {
    email: Communication[],
    sms: Communication[],
    call: Communication[],
    alert: Communication[],
    memo: Communication[],
    newsBroadcast: Communication[],
    newspaper: Communication[],
    social: Communication[]
  },
  injections: Injection[],
  statistics: {
    totalParticipants: number,
    totalCommunications: number,
    totalInjections: number,
    acknowledgedInjections: number,
    acknowledgementRate: number
  }
}
```

### Base de données (Prisma)

```prisma
// Relations utilisées
simulation {
  assignments (users)
  communications
  injections
}
```

## Différences avec d'autres vues

| Vue                              | Public cible          | Objectif                | Interactions                         |
| -------------------------------- | --------------------- | ----------------------- | ------------------------------------ |
| **Vue Instructeur**              | Instructeur/Formateur | **Monitoring passif**   | Lecture seule, observation           |
| Vue Participant                  | Participants          | Répondre aux injections | Envoi communications, acquittement   |
| Vue Animateur (admin-injections) | Animateur             | Gérer injections        | Créer/modifier/déclencher injections |

### Avantages de la vue instructeur

✅ **Vue d'ensemble complète** sans possibilité de modifier
✅ **Monitoring temps réel** avec auto-refresh
✅ **Interface épurée** focalisée sur l'observation
✅ **Statistiques synthétiques** en un coup d'œil
✅ **Timeline chronologique** facile à suivre

## États de chargement

### Loading

```
┌────────────────────┐
│    [Animation ↻]   │
│   Chargement...    │
└────────────────────┘
```

### Erreur

```
┌────────────────────┐
│    [⚠️ Icon]       │
│ Erreur de chargement│
└────────────────────┘
```

### Données chargées

Interface complète avec toutes les données

## Améliorations futures possibles

### Court terme

- [ ] Filtres par type de communication
- [ ] Export des données en CSV/PDF
- [ ] Recherche dans la timeline
- [ ] Notifications sonores pour nouvelles activités

### Moyen terme

- [ ] Graphiques de statistiques (charts)
- [ ] Vue en temps réel avec WebSocket
- [ ] Filtres par participant
- [ ] Comparaison entre participants

### Long terme

- [ ] Enregistrement vidéo de la session
- [ ] Replay de la simulation
- [ ] Annotations sur la timeline
- [ ] Rapports automatiques générés par IA

## Permissions et sécurité

### Contrôle d'accès

- ✅ Authentification requise (session)
- ✅ Vérification côté serveur
- ⚠️ TODO: Vérifier que l'utilisateur est instructeur/admin de la simulation

### Données sensibles

- Les communications entre participants sont visibles
- Les emails et informations personnelles sont affichés
- Considérer l'ajout de logs d'audit pour tracer les accès

## Support et maintenance

### Logs

- Console logs en cas d'erreur de fetch
- Erreurs affichées via toast notifications

### Performance

- Refresh toutes les 10 secondes (configurable)
- ScrollArea pour grandes listes
- Pas de pagination (à considérer si >1000 items)

### Compatibilité

- Desktop: Interface optimale
- Mobile: Responsive (tabs collapse, cards stack)
- Navigateurs: Tous navigateurs modernes

## Date de création

**19 octobre 2025** - Création initiale de la vue instructeur
