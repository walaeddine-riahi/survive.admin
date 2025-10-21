# Vue Instructeur - Guide Rapide 🎯

## Accès rapide

Pour accéder à la vue instructeur d'une simulation:

```
/simulation/[ID-SIMULATION]/instructor-view
```

**Exemple:** Si votre simulation a l'ID `cm52bexqn0000n1dscn7o6c4a`, accédez à:

```
/simulation/cm52bexqn0000n1dscn7o6c4a/instructor-view
```

## Comment trouver l'ID de votre simulation?

1. Allez sur la page `/simulation`
2. Trouvez votre simulation dans la liste
3. L'ID est affiché dans la première colonne du tableau
4. Copiez cet ID et construisez l'URL ci-dessus

## Que peut faire l'instructeur?

### ✅ CE QUI EST POSSIBLE

- 👀 **Observer** toute l'activité en temps réel
- 📊 **Voir les statistiques** (participants, communications, injections)
- ⏱️ **Suivre la timeline** des événements
- 👥 **Lister les participants** et leurs statuts
- 💬 **Consulter toutes les communications** par type
- 🔔 **Voir les injections** et leur statut d'acquittement
- 🔄 **Auto-refresh** toutes les 10 secondes
- ↻ **Actualiser manuellement** les données
- ✨ **Générer un rapport avec IA** en un clic

### ❌ CE QUI N'EST PAS POSSIBLE

- ✏️ Modifier les injections (utiliser la vue Animateur pour ça)
- 💬 Envoyer des communications
- 🗑️ Supprimer des données
- ⚙️ Configurer la simulation

## Interface

### En-tête

```
┌─────────────────────────────────────────────────────────────────┐
│ [Nom de la simulation]   [Auto ON] [↻] [✨ Rapport avec IA]     │
│ Vue Instructeur - Monitoring en temps réel                       │
└─────────────────────────────────────────────────────────────────┘
```

### Statistiques (4 cartes)

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 👥 25    │ │ 💬 142   │ │ 🔔 8     │ │ 📈 75%   │
│ Particip.│ │ Communic.│ │ Injection│ │ Acquittem│
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

### Onglets principaux

#### 📍 Timeline

- Affiche TOUTES les activités (communications + injections)
- Tri chronologique (plus récent en haut)
- Icônes différentes par type d'activité
- Heure relative ("il y a 5 minutes")
- **Expéditeur affiché** : "Par [Nom Prénom]"
- **Destinataire affiché** : "→ À [Nom Prénom]" (en bleu)

#### 👥 Participants

- Liste de tous les participants
- Nom, email, rôle, statut
- Icône utilisateur pour chacun

#### 💬 Communications

- 8 cartes (un par type de communication)
- Email, SMS, Appel, Alerte, WhatsApp, Actualités, Journal, Réseaux sociaux
- Liste des dernières communications dans chaque carte
- Badge avec le nombre total
- **Expéditeur affiché** : "De: [Nom Prénom]"
- **Destinataire affiché** : "À: [Nom Prénom]" (en bleu)

#### 🔔 Injections

- Liste de toutes les injections envoyées
- Statut: ✅ Acquitté (vert) ou ❌ Non acquitté (rouge)
- Type, scénario, contenu complet
- Indicateurs si image/vidéo présents

## Utilisation typique pendant une simulation

### 1. Avant le début

```
✓ Ouvrir la vue instructeur
✓ Vérifier que tous les participants sont présents (onglet Participants)
✓ Activer l'auto-refresh
```

### 2. Pendant la simulation

```
✓ Surveiller la Timeline pour voir l'activité
✓ Vérifier que les participants acquittent les injections (onglet Injections)
✓ Observer les patterns de communication (onglet Communications)
✓ Identifier les participants inactifs
```

### 3. Après la simulation

```
✓ Désactiver l'auto-refresh
✓ Cliquer sur "Rapport avec IA" (bouton violet/bleu avec ✨)
✓ Générer l'analyse IA dans le rapport
✓ Consulter les recommandations pour le debriefing
✓ Exporter le rapport si nécessaire
```

## Générer un rapport avec IA

### Bouton "Rapport avec IA"

- **Emplacement** : En haut à droite, à côté du bouton "Actualiser"
- **Apparence** : Dégradé violet-bleu avec icône ✨
- **Action** : Ouvre le rapport complet dans un nouvel onglet

### Étapes

1. Cliquer sur **"✨ Rapport avec IA"**
2. Un nouvel onglet s'ouvre avec le rapport
3. Dans le rapport, cliquer sur **"Analyser avec l'IA"**
4. L'analyse IA est générée automatiquement

### Ce que contient le rapport

- 📊 Statistiques complètes
- 📈 Graphiques et tendances
- 💬 Détail des communications
- 🔔 Liste des injections
- ⏱️ Timeline complète
- 🤖 Analyse IA avec recommandations

## Auto-refresh

### Activé (par défaut)

- Les données se rafraîchissent automatiquement **toutes les 10 secondes**
- L'icône tourne pour indiquer l'activité
- Bouton affiche "Auto-refresh ON"

### Désactivé

- Pas de rafraîchissement automatique
- Économise de la bande passante
- Utile pour examiner les données sans qu'elles bougent
- Bouton affiche "Auto-refresh OFF"

**Toggle:** Cliquez sur le bouton "Auto-refresh ON/OFF" pour changer

## Icônes des types de communication

| Type            | Icône | Onglet Communications |
| --------------- | ----- | --------------------- |
| Email           | 📧    | Carte Email           |
| SMS             | 💬    | Carte SMS             |
| Appel           | 📞    | Carte Appel           |
| Alerte          | ⚠️    | Carte Alerte          |
| WhatsApp        | 📱    | Carte WhatsApp        |
| Actualités      | 📻    | Carte Actualités      |
| Journal         | 📰    | Carte Journal         |
| Réseaux Sociaux | 🌐    | Carte Réseaux Sociaux |

## Badges de statut

### Injections

- 🟢 **Acquitté** = L'injection a été lue par le participant
- 🔴 **Non acquitté** = L'injection n'a pas encore été lue

### Participants

- **active** = Participant actif dans la simulation
- **inactive** = Participant désactivé

### Rôles

- **participant** = Participant standard
- **observer** = Observateur (ne participe pas activement)
- **facilitator** = Facilitateur (aide les participants)

## Dépannage

### ❌ "Erreur de chargement"

**Causes possibles:**

- Mauvais ID de simulation
- Simulation supprimée
- Problème de connexion réseau
- Session expirée

**Solutions:**

1. Vérifier l'URL (ID correct?)
2. Actualiser la page (F5)
3. Se reconnecter si nécessaire
4. Vérifier que la simulation existe dans `/simulation`

### ⏳ "Chargement..." qui ne finit pas

**Solutions:**

1. Vérifier votre connexion internet
2. Ouvrir la console navigateur (F12) pour voir les erreurs
3. Essayer un autre navigateur
4. Contacter l'administrateur

### 🔄 Auto-refresh ne fonctionne pas

**Solutions:**

1. Vérifier que le bouton est sur "Auto-refresh ON"
2. Désactiver puis réactiver l'auto-refresh
3. Actualiser la page
4. Vérifier dans Network tab (F12) si les requêtes sont envoyées

### 📊 Statistiques à 0 alors qu'il y a des données

**Causes:**

- Les données ne sont pas encore chargées (attendre le refresh)
- Problème avec l'API backend

**Solutions:**

1. Cliquer sur "Actualiser" manuellement
2. Vérifier l'onglet correspondant pour voir les données détaillées
3. Actualiser la page complète (F5)

## Astuces pro 💡

1. **Gardez la vue instructeur ouverte sur un écran séparé** pendant que vous animez sur un autre écran

2. **Utilisez l'auto-refresh pendant les phases actives**, désactivez-le quand vous voulez analyser en détail

3. **La Timeline est votre meilleur ami** pour suivre l'activité en temps réel

4. **Filtrez mentalement par participant** en notant les noms qui reviennent souvent

5. **Utilisez l'onglet Injections** pour vérifier rapidement qui a acquitté quoi

6. **Les cartes Communications** vous donnent une vue d'ensemble des canaux les plus utilisés

## Prochaines améliorations prévues

- 🔍 Filtres par participant/type
- 📊 Graphiques de statistiques
- 🔔 Notifications sonores pour nouvelles activités
- 📥 Export des données en CSV/PDF
- 🎥 Replay de la simulation
- 🤖 Analyse IA des comportements

## Support

Pour toute question ou problème:

1. Consultez la documentation complète: `INSTRUCTOR-VIEW-DOCUMENTATION.md`
2. Consultez les tests: `INSTRUCTOR-VIEW-TESTS.md`
3. Contactez l'administrateur système

---

**Date de création:** 19 octobre 2025
**Version:** 1.0.0
