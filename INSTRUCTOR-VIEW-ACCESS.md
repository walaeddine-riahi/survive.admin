# Accès à la Vue Instructeur depuis le Dashboard

## 🎯 Mise à jour du 19 octobre 2025

### Nouvelle fonctionnalité : Bouton "Vue Instructeur"

Un bouton **"Vue Instructeur"** a été ajouté dans le tableau de bord des simulations pour accéder facilement à la vue de monitoring.

## 📍 Localisation

Le bouton se trouve dans le **menu déroulant** (trois points verticaux) de chaque simulation, dans tous les onglets:

- ✅ **Toutes les simulations** (onglet "Toutes")
- ✅ **Simulations en cours** (onglet "En cours")
- ✅ **Simulations planifiées** (onglet "Planifiées")
- ✅ **Simulations terminées** (onglet "Terminées")

## 🔍 Comment accéder

### Méthode visuelle

```
1. Allez sur /simulation
2. Trouvez votre simulation dans la liste
3. Cliquez sur le bouton ⋮ (trois points)
4. Sélectionnez "👁️ Vue Instructeur"
5. Vous êtes redirigé vers la vue instructeur
```

### Interface

```
┌────────────────────────────────────────────────────┐
│ ID    │ Nom              │ Statut    │ Dates  │ ⋮ │
├────────────────────────────────────────────────────┤
│ cm5.. │ Formation Crise  │ En cours  │ ...    │ ⋮ │
│                                              ┌──────┐
│                                              │ 👁️   │
│                                              │ Vue  │
│                                              │ Inst.│
│                                              ├──────┤
│                                              │ ✏️   │
│                                              │ Mod. │
│                                              ├──────┤
│                                              │ 🗑️   │
│                                              │ Sup. │
│                                              └──────┘
└────────────────────────────────────────────────────┘
```

## 📋 Options du menu

Pour chaque simulation, le menu déroulant contient maintenant:

### 1. 👁️ Vue Instructeur (NOUVEAU)

- **Icône:** Œil (Eye)
- **Action:** Ouvre la vue instructeur dans un nouvel onglet
- **URL:** `/simulation/[ID]/instructor-view`
- **Accès:** Lecture seule, monitoring en temps réel

### 2. ✏️ Modifier

- **Icône:** Crayon (Edit)
- **Action:** Ouvre le formulaire de modification de la simulation
- **Accès:** Permet de changer titre, dates, participants, etc.

### 3. 🗑️ Supprimer

- **Icône:** Corbeille (Trash)
- **Action:** Supprime la simulation (avec confirmation)
- **Style:** Texte rouge pour indiquer danger

## 💡 Cas d'usage

### Scénario 1: Monitoring pendant une simulation en cours

```
1. Aller sur /simulation
2. Cliquer sur l'onglet "En cours"
3. Trouver la simulation active
4. Cliquer sur ⋮ → "Vue Instructeur"
5. Activer l'auto-refresh
6. Observer l'activité en temps réel
```

### Scénario 2: Analyser une simulation terminée

```
1. Aller sur /simulation
2. Cliquer sur l'onglet "Terminées"
3. Trouver la simulation à analyser
4. Cliquer sur ⋮ → "Vue Instructeur"
5. Désactiver l'auto-refresh (données statiques)
6. Consulter timeline et communications
7. Préparer le debriefing
```

### Scénario 3: Préparation avant une simulation

```
1. Aller sur /simulation
2. Cliquer sur l'onglet "Planifiées"
3. Trouver la simulation à venir
4. Cliquer sur ⋮ → "Vue Instructeur"
5. Vérifier la liste des participants
6. S'assurer que tout est prêt
```

## 🎨 Design

### Icône

- **Nom:** Eye (Œil)
- **Taille:** 16x16px (h-4 w-4)
- **Position:** À gauche du texte "Vue Instructeur"

### Ordre des éléments

```
┌────────────────────┐
│ 👁️ Vue Instructeur │ ← NOUVEAU (en premier)
├────────────────────┤
│ ✏️ Modifier        │
├────────────────────┤
│ 🗑️ Supprimer       │ ← Danger (en dernier)
└────────────────────┘
```

### Comportement

- **Clic:** Redirige immédiatement vers la vue instructeur
- **stopPropagation:** Empêche la sélection de la ligne du tableau
- **Navigation:** Utilise Next.js router.push pour une transition fluide

## 🔧 Technique

### Implémentation

```tsx
<DropdownMenuItem
  onClick={(e) => {
    e.stopPropagation();
    router.push(`/simulation/${simulation.id}/instructor-view`);
  }}
>
  <Eye className="mr-2 h-4 w-4" />
  Vue Instructeur
</DropdownMenuItem>
```

### Navigation

- **Framework:** Next.js 15 (App Router)
- **Hook:** `useRouter` from `next/navigation`
- **Méthode:** `router.push()` pour navigation programmatique
- **Événement:** `e.stopPropagation()` pour éviter conflits avec la sélection de ligne

### Imports nécessaires

```tsx
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
```

## 📱 Responsive

Le bouton fonctionne sur:

- ✅ Desktop (optimisé)
- ✅ Tablette (menu dropdown adapté)
- ✅ Mobile (tactile friendly)

## 🎯 Avantages

### Pour l'instructeur

1. **Accès rapide** - Un seul clic depuis le dashboard
2. **Contexte préservé** - Reste sur la même page après consultation
3. **Multi-onglets** - Peut ouvrir plusieurs simulations simultanément
4. **Intuitive** - Icône œil universellement comprise

### Pour l'UX

1. **Cohérent** - Même pattern que "Modifier" et "Supprimer"
2. **Découvrable** - Visible dans le menu existant
3. **Non-intrusif** - N'encombre pas l'interface
4. **Accessible** - Fonctionne au clavier et à la souris

## 📊 Emplacement dans tous les onglets

| Onglet         | Description         | Accès Vue Instructeur |
| -------------- | ------------------- | --------------------- |
| **Toutes**     | Liste complète      | ✅ Disponible         |
| **En cours**   | Simulations actives | ✅ Disponible         |
| **Planifiées** | À venir             | ✅ Disponible         |
| **Terminées**  | Archivées           | ✅ Disponible         |
| **Plan**       | Vue planning        | ❌ Non applicable     |

## 🔮 Améliorations futures possibles

### Court terme

- [ ] Badge indiquant si une simulation est active (blink)
- [ ] Tooltip au survol: "Ouvrir la vue de monitoring"
- [ ] Compteur d'activité récente (dernières 5 min)

### Moyen terme

- [ ] Raccourci clavier (ex: Ctrl+I pour Instructeur)
- [ ] Ouverture dans un nouvel onglet (Ctrl+Clic)
- [ ] Aperçu rapide au survol (preview)

### Long terme

- [ ] Bouton dédié en dehors du menu (si très utilisé)
- [ ] Vue en split-screen (dashboard + instructeur)
- [ ] Favoris pour accès encore plus rapide

## 🐛 Dépannage

### Le bouton ne s'affiche pas

**Cause:** Peut-être que votre navigateur cache l'ancienne version

**Solution:**

1. Rafraîchir la page (F5)
2. Vider le cache (Ctrl+Shift+R)
3. Fermer et rouvrir le navigateur

### Clic sans effet

**Cause:** Conflit avec la sélection de ligne

**Solution:**

- Le bouton utilise `stopPropagation()` pour éviter ce problème
- Si le problème persiste, cliquez directement sur le texte "Vue Instructeur"

### Erreur 404

**Cause:** L'ID de la simulation est incorrect ou la simulation n'existe plus

**Solution:**

1. Vérifier que la simulation existe toujours
2. Actualiser la liste des simulations
3. Vérifier l'URL générée

## 📚 Documentation liée

- `INSTRUCTOR-VIEW-QUICKSTART.md` - Guide rapide de la vue instructeur
- `INSTRUCTOR-VIEW-DOCUMENTATION.md` - Documentation complète
- `INSTRUCTOR-VIEW-RECIPIENTS.md` - Affichage des destinataires
- `INSTRUCTOR-VIEW-TESTS.md` - Tests de validation

## 🎓 Formation

### Pour les nouveaux instructeurs

**Étape 1:** Découverte

```
"Bonjour! Pour suivre votre simulation, cliquez sur les 3 points
à droite de la simulation, puis sur 'Vue Instructeur'"
```

**Étape 2:** Pratique

```
"Essayez maintenant avec une simulation de test.
Vous verrez toutes les activités en temps réel."
```

**Étape 3:** Utilisation avancée

```
"Pendant une vraie simulation, gardez cette vue ouverte
sur un écran séparé pour un monitoring efficace."
```

## ✅ Checklist d'utilisation

Avant chaque simulation:

- [ ] Vérifier que le bouton "Vue Instructeur" est accessible
- [ ] Tester l'ouverture de la vue
- [ ] Vérifier que l'auto-refresh fonctionne
- [ ] S'assurer que tous les participants sont listés

Pendant la simulation:

- [ ] Garder la vue instructeur ouverte
- [ ] Monitorer la timeline
- [ ] Vérifier les acquittements des injections
- [ ] Noter les points d'intérêt pour le debriefing

Après la simulation:

- [ ] Consulter les statistiques finales
- [ ] Analyser les communications
- [ ] Préparer le rapport de debriefing

---

**Date de mise à jour:** 19 octobre 2025
**Version:** 1.0.0 - Ajout du bouton Vue Instructeur dans le dashboard
