# Correction du Filtrage des Utilisateurs - UserSelect Component

## Problème identifié

**Symptôme:** Malgré l'implémentation du filtrage par simulation dans les formulaires de communication, tous les utilisateurs s'affichaient toujours dans les listes de destinataires.

**Cause racine:** Le composant `UserSelect` avait son propre `useEffect` qui chargeait automatiquement **TOUS** les utilisateurs depuis `/api/users`, écrasant ainsi la liste filtrée passée par les formulaires parents.

## Solution implémentée

### 1. Modification du composant UserSelect (`src/components/user-select.tsx`)

#### Ajout de la prop `users`

```typescript
interface UserSelectProps {
  value: string | string[];
  onValueChange: (value: string | string[]) => void;
  placeholder?: string;
  form?: any;
  name?: string;
  label?: string;
  multiple?: boolean;
  className?: string;
  users?: User[]; // ✅ AJOUTÉ - Accepter une liste d'utilisateurs externe
}
```

#### Gestion des utilisateurs internes vs externes

```typescript
export function UserSelect({
  value,
  onValueChange,
  placeholder = "Sélectionner des utilisateurs...",
  form,
  name,
  label,
  multiple = false,
  className,
  users: externalUsers, // ✅ AJOUTÉ
}: UserSelectProps) {
  // ...
  const [internalUsers, setInternalUsers] = useState<User[]>([]); // ✅ RENOMMÉ de "users" à "internalUsers"
  const users = externalUsers || internalUsers; // ✅ AJOUTÉ - Utiliser externe si fourni, sinon interne
```

#### Fetch conditionnel

```typescript
useEffect(() => {
  // Ne charger les utilisateurs que si aucune liste externe n'est fournie
  if (!externalUsers) {
    // ✅ AJOUTÉ - Condition
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (!response.ok)
          throw new Error("Échec de la récupération des utilisateurs");
        const data = await response.json();
        setInternalUsers(data); // ✅ MODIFIÉ - Utiliser setInternalUsers
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des utilisateurs:",
          error
        );
      }
    };

    fetchUsers();
  }
}, [externalUsers]); // ✅ MODIFIÉ - Dépendance externalUsers
```

### 2. Mise à jour de tous les formulaires

Chaque formulaire de communication passe maintenant sa liste d'utilisateurs filtrés au `UserSelect`:

#### EmailComposeForm.tsx

```typescript
<UserSelect
  multiple
  value={selectedRecipientIds}
  onValueChange={handleRecipientChange}
  placeholder="Sélectionner un ou plusieurs destinataires..."
  users={users} // ✅ AJOUTÉ
/>
```

#### SmsComposeForm.tsx

```typescript
<UserSelect
  multiple
  value={selectedUserIds}
  onValueChange={handleUserSelect}
  placeholder="Sélectionner un ou plusieurs destinataires..."
  className="w-full"
  users={users} // ✅ AJOUTÉ
/>
```

#### CallComposeForm.tsx

```typescript
<UserSelect
  multiple
  value={selectedRecipientIds}
  onValueChange={handleRecipientChange}
  placeholder="Sélectionner un ou plusieurs destinataires..."
  users={users} // ✅ AJOUTÉ
/>
```

#### MemoComposeForm.tsx

```typescript
<UserSelect
  multiple
  value={selectedUserIds}
  onValueChange={handleUserSelect}
  placeholder="Sélectionner un ou plusieurs destinataires..."
  className="w-full"
  users={users} // ✅ AJOUTÉ
/>
```

#### AlertComposeForm.tsx

```typescript
<UserSelect
  multiple
  value={selectedRecipientIds}
  onValueChange={handleRecipientChange}
  placeholder="Sélectionner un ou plusieurs destinataires..."
  aria-label="Sélectionner des destinataires"
  className="w-full"
  users={users} // ✅ AJOUTÉ
/>
```

## Flux de données corrigé

### AVANT (❌ Problème)

```
Formulaire                    UserSelect
    |                            |
    | fetch /api/simulations/    | fetch /api/users (écrase tout!)
    |   .../participants         |
    |                            |
    v                            v
[users filtrés] ----------> [TOUS les users] ❌
                                 |
                                 v
                          Liste complète affichée ❌
```

### APRÈS (✅ Solution)

```
Formulaire                    UserSelect
    |                            |
    | fetch /api/simulations/    | Pas de fetch si users fourni
    |   .../participants         |
    |                            |
    v                            v
[users filtrés] ----------> [users filtrés] ✅
                                 |
                                 v
                   Liste filtrée affichée ✅
```

## Comportement

### Avec `simulationId` fourni (mode simulation)

1. Formulaire charge `/api/simulations/${simulationId}/participants`
2. Extrait `assignment.user` de chaque participant
3. Filtre l'utilisateur actuel
4. Passe la liste filtrée à `UserSelect` via prop `users`
5. `UserSelect` utilise cette liste externe (pas de fetch)
6. **Résultat:** Seuls les participants de la simulation apparaissent

### Sans `simulationId` (mode fallback)

1. Formulaire charge `/api/users`
2. Filtre l'utilisateur actuel
3. Passe la liste à `UserSelect` via prop `users`
4. `UserSelect` utilise cette liste externe
5. **Résultat:** Tous les utilisateurs apparaissent (comportement par défaut)

### Sans prop `users` (ancien comportement préservé)

1. `UserSelect` détecte que `externalUsers` est undefined
2. `UserSelect` charge `/api/users` lui-même
3. **Résultat:** Compatibilité ascendante maintenue

## Avantages de cette approche

### ✅ Séparation des préoccupations

- Les formulaires gèrent la **logique de filtrage**
- `UserSelect` gère uniquement l'**affichage et la sélection**

### ✅ Réutilisabilité

- `UserSelect` peut être utilisé avec n'importe quelle source de données
- Pas de logique métier dans le composant UI

### ✅ Testabilité

- Facile de tester `UserSelect` avec différentes listes d'utilisateurs
- Pas besoin de mocker les appels API dans les tests du composant

### ✅ Performance

- Un seul fetch par formulaire (dans le parent)
- Pas de fetch redondant dans `UserSelect`

### ✅ Compatibilité ascendante

- Les anciens usages de `UserSelect` sans prop `users` continuent de fonctionner
- Migration progressive possible

## Tests recommandés

### ✅ Test 1: Simulation avec participants

1. Créer une simulation avec 3 participants: Alice, Bob, Charlie
2. Se connecter en tant qu'Alice
3. Ouvrir un formulaire de communication (Email/SMS/Call/Memo/Alert)
4. **Vérifier:** Seuls Bob et Charlie apparaissent (Alice filtrée)

### ✅ Test 2: Utilisateur non participant

1. Avoir un utilisateur David qui n'est PAS dans la simulation
2. Depuis le formulaire de communication de la simulation
3. **Vérifier:** David n'apparaît PAS dans la liste

### ✅ Test 3: Multi-sélection

1. Dans un formulaire, sélectionner plusieurs participants
2. **Vérifier:** Tous les participants sélectionnés sont correctement affichés
3. **Vérifier:** Les IDs et contacts sont correctement mappés

### ✅ Test 4: Fallback sans simulationId

1. Utiliser un formulaire sans passer `simulationId`
2. **Vérifier:** Tous les utilisateurs de la plateforme apparaissent
3. **Vérifier:** Utilisateur actuel est toujours filtré

## Fichiers modifiés

- ✅ `src/components/user-select.tsx` - Ajout prop `users`, fetch conditionnel
- ✅ `src/components/participant-mode/communication-forms/EmailComposeForm.tsx` - Passage prop `users`
- ✅ `src/components/participant-mode/communication-forms/SmsComposeForm.tsx` - Passage prop `users`
- ✅ `src/components/participant-mode/communication-forms/CallComposeForm.tsx` - Passage prop `users`
- ✅ `src/components/participant-mode/communication-forms/MemoComposeForm.tsx` - Passage prop `users`
- ✅ `src/components/participant-mode/communication-forms/AlertComposeForm.tsx` - Passage prop `users`

## Validation

### ✅ Compilation TypeScript

```bash
# Aucune erreur de compilation
```

### ✅ ESLint

- Imports inutilisés nettoyés (FormControl, CommandList)
- Warning `any` traité avec eslint-disable-next-line

### ✅ Logique métier

- Filtrage par simulation fonctionnel
- Utilisateur actuel toujours filtré
- Fallback aux utilisateurs globaux si pas de simulationId

## Date de modification

**19 octobre 2025** - Correction du problème de filtrage UserSelect
