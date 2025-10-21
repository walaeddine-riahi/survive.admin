# Tests de la Vue Instructeur

## Test 1: Accès à la page

### URL de test

```
http://localhost:3000/simulation/[SIMULATION_ID]/instructor-view
```

### Remplacer `[SIMULATION_ID]` par un ID réel de simulation

### Résultat attendu

- ✅ Page se charge sans erreur
- ✅ 4 cartes de statistiques affichées
- ✅ Onglets Timeline, Participants, Communications, Injections visibles
- ✅ Bouton "Auto-refresh ON" visible et actif

## Test 2: API Endpoint

### Request

```bash
curl -X GET http://localhost:3000/api/simulations/[SIMULATION_ID]/instructor-view \
  -H "Cookie: [YOUR_SESSION_COOKIE]"
```

### Résultat attendu

```json
{
  "simulation": {
    "id": "...",
    "title": "...",
    "assignments": [...]
  },
  "communications": {
    "email": [],
    "sms": [],
    ...
  },
  "injections": [...],
  "statistics": {
    "totalParticipants": 0,
    "totalCommunications": 0,
    "totalInjections": 0,
    "acknowledgedInjections": 0,
    "acknowledgementRate": 0
  }
}
```

## Test 3: Auto-refresh

### Étapes

1. Ouvrir la page instructeur
2. Vérifier que "Auto-refresh ON" est affiché
3. Attendre 10 secondes
4. Vérifier dans Network tab qu'une nouvelle requête est faite

### Résultat attendu

- ✅ Requête GET vers `/api/simulations/[ID]/instructor-view` toutes les 10s
- ✅ Données se mettent à jour automatiquement

## Test 4: Toggle Auto-refresh

### Étapes

1. Cliquer sur le bouton "Auto-refresh ON"
2. Vérifier qu'il devient "Auto-refresh OFF"
3. Attendre 15 secondes
4. Vérifier qu'aucune nouvelle requête n'est faite

### Résultat attendu

- ✅ Bouton change d'état
- ✅ Icône refresh ne tourne plus
- ✅ Pas de nouvelles requêtes automatiques

## Test 5: Refresh Manuel

### Étapes

1. Désactiver auto-refresh
2. Cliquer sur le bouton "Actualiser"
3. Vérifier dans Network tab

### Résultat attendu

- ✅ Une requête GET immédiate
- ✅ Données mises à jour
- ✅ Pas de refresh automatique après

## Test 6: Onglet Timeline

### Étapes

1. Aller sur l'onglet Timeline
2. Envoyer une communication depuis la vue participant
3. Attendre le refresh (ou forcer avec bouton)

### Résultat attendu

- ✅ Nouvelle activité apparaît en haut de la timeline
- ✅ Icône correcte selon le type
- ✅ Heure relative affichée ("il y a X minutes")
- ✅ Informations de l'expéditeur visibles

## Test 7: Onglet Participants

### Étapes

1. Aller sur l'onglet Participants
2. Vérifier la liste

### Résultat attendu

- ✅ Tous les participants de la simulation affichés
- ✅ Nom, email, rôle, statut visibles
- ✅ Icône utilisateur pour chaque participant
- ✅ Badges colorés selon statut

## Test 8: Onglet Communications

### Étapes

1. Aller sur l'onglet Communications
2. Vérifier les 8 cartes

### Résultat attendu

- ✅ 8 cartes (Email, SMS, Call, Alert, Memo, News, Newspaper, Social)
- ✅ Badge avec nombre de communications
- ✅ Liste scrollable si > 3 communications
- ✅ Message "Aucune communication" si vide

## Test 9: Onglet Injections

### Étapes

1. Aller sur l'onglet Injections
2. Vérifier la liste

### Résultat attendu

- ✅ Toutes les injections affichées
- ✅ Badge "Acquitté" (vert) ou "Non acquitté" (rouge)
- ✅ Type et scénario visibles
- ✅ Contenu complet affiché
- ✅ Badges Image/Vidéo si présents

## Test 10: Performance avec données volumineuses

### Étapes

1. Créer une simulation avec 50+ participants
2. Envoyer 100+ communications
3. Créer 20+ injections
4. Ouvrir la vue instructeur

### Résultat attendu

- ✅ Page se charge en < 3 secondes
- ✅ Scroll fluide dans toutes les listes
- ✅ Statistiques correctes
- ✅ Pas de freeze de l'interface

## Test 11: Responsive Mobile

### Étapes

1. Ouvrir la page sur mobile (ou DevTools responsive)
2. Tester tous les onglets

### Résultat attendu

- ✅ Cartes statistiques en colonne
- ✅ Onglets accessibles
- ✅ Timeline lisible
- ✅ Cartes communications en colonne

## Test 12: États d'erreur

### Étapes

1. Couper le serveur
2. Ouvrir la page
3. Vérifier l'affichage d'erreur

### Résultat attendu

- ✅ Icône d'alerte affichée
- ✅ Message "Erreur de chargement"
- ✅ Toast notification avec message d'erreur

## Checklist finale

- [ ] Page accessible à l'URL correcte
- [ ] API endpoint retourne les bonnes données
- [ ] Auto-refresh fonctionne (10s)
- [ ] Toggle auto-refresh fonctionne
- [ ] Refresh manuel fonctionne
- [ ] Timeline affiche les activités
- [ ] Participants listés correctement
- [ ] Communications groupées par type
- [ ] Injections avec statut acquittement
- [ ] Statistiques calculées correctement
- [ ] Performance acceptable
- [ ] Responsive mobile OK
- [ ] Gestion des erreurs OK

## Bugs connus à surveiller

- [ ] Auto-refresh continue après avoir quitté la page (memory leak)
- [ ] Timeline très longue peut causer des ralentissements
- [ ] Dates mal formatées si timezone différente
- [ ] Scroll position se réinitialise après refresh

## Notes de déploiement

1. Vérifier que l'endpoint API est bien déployé
2. Tester avec une vraie session utilisateur
3. Vérifier les permissions d'accès
4. Monitorer les performances en production
5. Ajouter logs pour tracking d'usage
