# 📋 Script d'Assignation Ooredoo - Guide d'Utilisation

## 🎯 Objectif

Assigner 36 participants Ooredoo à la simulation de gestion de crise avec leurs rôles et équipes (CC/CMT).

## 📊 Participants

### Crisis Committee (CC) - 14 membres

- Niveau décisionnel stratégique
- Postes: CEO, CFO, CMO, CTIO, CHRAO, etc.

### Crisis Management Team (CMT) - 22 membres

- Niveau opérationnel
- Postes: Directeurs, Managers, Assistant Directors

## 🔧 Ce que fait le script

1. **Crée/Récupère les équipes** :

   - `Crisis Committee (CC)` - Comité de Crise
   - `Crisis Management Team (CMT)` - Équipe de Gestion de Crise

2. **Assigne chaque participant** :

   - Recherche l'utilisateur par email
   - Crée ou met à jour l'assignation
   - Attribue le rôle spécifique
   - Assigne à l'équipe (CC ou CMT)
   - Met le statut à "accepted"

3. **Affiche un résumé** :
   - Nouvelles assignations
   - Mises à jour
   - Échecs
   - Utilisateurs non trouvés

## 📝 Configuration

```typescript
const SIMULATION_ID = "68f201a97db961e8fec16672";
```

## ⚠️ Prérequis

1. Les utilisateurs doivent exister dans la base de données
2. Exécuter d'abord `scripts/create-user.ts` si ce n'est pas déjà fait
3. La simulation doit exister avec l'ID spécifié

## 🚀 Exécution

```bash
# Depuis la racine du projet
npx tsx scripts/assign-ooredoo-to-simulation.ts
```

## 📋 Structure des données

Chaque participant a :

- `firstName` : Prénom
- `lastName` : Nom de famille
- `email` : Adresse email (@ooredoo.tn)
- `role` : Poste/Fonction
- `team` : 'CC' ou 'CMT'

## 🔍 Exemple de participant

```typescript
{
  firstName: 'Wafa',
  lastName: 'HABABOU',
  email: 'wafa.hababou@ooredoo.tn',
  role: 'ERM Director',
  team: 'CC'
}
```

## ✅ Résultat attendu

```
🚀 ===== DÉBUT DES ASSIGNATIONS OOREDOO =====

📋 Simulation ID: 68f201a97db961e8fec16672
👥 Nombre de participants: 36

🔍 Recherche de l'équipe: Crisis Committee (CC)
✅ Équipe créée/existante: Crisis Committee (CC)

🔍 Recherche de l'équipe: Crisis Management Team (CMT)
✅ Équipe créée/existante: Crisis Management Team (CMT)

============================================================
ASSIGNATION DES PARTICIPANTS
============================================================

🔍 Traitement de: Wafa HABABOU (wafa.hababou@ooredoo.tn)
   ✅ Assignation créée: ERM Director - Équipe: CC

... [34 autres participants]

============================================================
📊 RÉSUMÉ DES ASSIGNATIONS
============================================================
✅ Nouvelles assignations: 36
🔄 Mises à jour: 0
❌ Échecs: 0
⚠️ Utilisateurs non trouvés: 0
📈 Total traité: 36
============================================================

🏁 Script terminé.
```

## ⚠️ Gestion des erreurs

### Utilisateur non trouvé

```
❌ Utilisateur non trouvé: user@email.com
```

**Solution** : Exécutez `scripts/create-user.ts` pour créer les utilisateurs

### Simulation non trouvée

```
❌ Simulation non trouvée: 68f201a97db961e8fec16672
```

**Solution** : Vérifiez l'ID de la simulation dans la base de données

### Déjà assigné

```
⚠️ Déjà assigné - Mise à jour: user@email.com
✅ Assignation mise à jour: Role - Équipe: CC
```

Le script met automatiquement à jour l'assignation existante

## 🗂️ Structure de la base de données

### Table: `simulation_assignments`

```typescript
{
  id: string,
  role: string,           // Ex: "ERM Director"
  status: string,         // "accepted"
  userId: string,         // ID de l'utilisateur
  simulationId: string,   // ID de la simulation
  teamId: string,         // ID de l'équipe (CC ou CMT)
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Table: `teams`

```typescript
{
  id: string,
  name: string,           // "Crisis Committee (CC)" ou "Crisis Management Team (CMT)"
  description: string,    // Description de l'équipe
  createdAt: DateTime,
  updatedAt: DateTime
}
```

## 🔄 Mise à jour

Si vous devez réexécuter le script :

- Les assignations existantes seront **mises à jour**
- Les rôles et équipes seront **actualisés**
- Aucune duplication ne sera créée

## 📞 Support

En cas de problème :

1. Vérifiez que les utilisateurs existent
2. Vérifiez l'ID de la simulation
3. Consultez les logs pour plus de détails
4. Vérifiez la connexion à la base de données

---

**Créé le** : 21 octobre 2025  
**Script** : `scripts/assign-ooredoo-to-simulation.ts`  
**Participants** : 36 (14 CC + 22 CMT)  
**Simulation** : 68f201a97db961e8fec16672
