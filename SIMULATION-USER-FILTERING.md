# Filtrage des Utilisateurs par Simulation - Documentation

## Vue d'ensemble

Cette fonctionnalité garantit que dans tous les outils de communication de la vue participant, seuls les utilisateurs affectés à la simulation en cours peuvent être sélectionnés comme destinataires.

## Objectif

**Demande utilisateur:** "pour destinateurs dans tous les outils de communication je veux qu'il peux selecter que les utilisateurs qui ont affecter a cette simulation"

**Bénéfices:**
- 🔒 **Sécurité:** Empêche l'envoi de communications à des utilisateurs non concernés
- 👥 **Expérience utilisateur:** Liste de destinataires plus courte et pertinente
- ✅ **Cohérence:** Garantit que seuls les participants actifs reçoivent les communications

## Composants modifiés

### 1. EmailComposeForm.tsx
- **Ajout:** Prop `simulationId?: string`
- **Modification:** Fetch conditionnel `/api/simulations/${simulationId}/participants` au lieu de `/api/users`
- **Extraction:** Mapping de `assignment.user` pour récupérer les données utilisateur
- **Lignes:** 19-56

### 2. SmsComposeForm.tsx
- **Ajout:** Prop `simulationId?: string`
- **Modification:** Même pattern que EmailComposeForm
- **Lignes:** 19-54

### 3. CallComposeForm.tsx
- **Ajout:** Prop `simulationId?: string`
- **Modification:** Même pattern que EmailComposeForm
- **Lignes:** 21-67

### 4. MemoComposeForm.tsx
- **Ajout:** Prop `simulationId?: string`
- **Modification:** Même pattern que EmailComposeForm
- **Lignes:** 20-57

### 5. AlertComposeForm.tsx
- **Ajout:** Prop `simulationId?: string`
- **Modification:** Même pattern que EmailComposeForm
- **Lignes:** 21-71

### 6. participant-view/page.tsx
- **Modification:** Passage du prop `simulationId` à tous les formulaires de communication
- **Variable utilisée:** `simulationId` (ligne 300) depuis `params.simulationId`
- **Composants mis à jour:** 
  - EmailComposeForm (ligne ~2256)
  - SmsComposeForm (ligne ~2261)
  - CallComposeForm (ligne ~2266)
  - AlertComposeForm (ligne ~2272)
  - MemoComposeForm (ligne ~2278)

## Structure de données

### Endpoint API: `/api/simulations/[simulationId]/participants`

**Réponse:**
```typescript
Array<{
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
  };
  role: string;
  status: string;
  teamId: string;
}>
```

### Extraction des utilisateurs

```typescript
const allUsers = simulationId
  ? data.map((assignment: { user: User }) => assignment.user)
  : data;
```

## Pattern d'implémentation

Chaque formulaire suit le même pattern:

```typescript
export default function FormComponent({
  onSubmit,
  onCancel,
  simulationId, // ✅ Ajouté
}: {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  simulationId?: string; // ✅ Ajouté
}) {
  // ... autres états

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // ✅ Endpoint conditionnel
        const endpoint = simulationId
          ? `/api/simulations/${simulationId}/participants`
          : "/api/users";
        
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          
          // ✅ Extraction conditionnelle
          const allUsers = simulationId
            ? data.map((assignment: { user: User }) => assignment.user)
            : data;
          
          // Filtrer l'utilisateur actuel
          const otherUsers = allUsers.filter(
            (u: User) => u.id !== session?.user?.id
          );
          setUsers(otherUsers);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs:", error);
      }
    };

    if (session?.user?.id) fetchUsers();
  }, [session, simulationId]); // ✅ simulationId dans les dépendances
}
```

## Formulaires NON modifiés

Les formulaires suivants n'ont **PAS** besoin de modification car ils n'utilisent pas de sélection d'utilisateur:

- ✅ **NewsBroadcastComposeForm** - Diffusion générale
- ✅ **NewspaperComposeForm** - Publication type journal
- ✅ **SocialComposeForm** - Publication réseaux sociaux

## Tests recommandés

### ✅ Tests à effectuer:

1. **Test basique:**
   - Créer une simulation avec plusieurs participants
   - Ouvrir vue participant
   - Ouvrir formulaire Email/SMS/Call/Memo/Alert
   - Vérifier que seuls les participants de la simulation apparaissent

2. **Test filtrage:**
   - Vérifier que l'utilisateur actuel n'apparaît pas dans la liste
   - Vérifier que les utilisateurs d'autres simulations n'apparaissent pas

3. **Test sélection multiple:**
   - Sélectionner plusieurs destinataires
   - Vérifier que les IDs et contacts sont correctement mappés

4. **Test simulation sans participants:**
   - Tester avec une simulation ayant un seul participant (l'utilisateur actuel)
   - Vérifier que la liste est vide (utilisateur actuel filtré)

5. **Test fallback:**
   - Si simulationId n'est pas fourni, vérifier que `/api/users` est appelé (fallback)

## Validation

### ✅ Compilation:
```bash
# Aucune erreur TypeScript détectée
```

### ✅ Vérifications:
- [x] Tous les formulaires de communication modifiés
- [x] Props simulationId ajoutées
- [x] Parent page updated avec simulationId
- [x] Structure API validée
- [x] Aucune erreur de compilation

## Notes techniques

### Backward compatibility
- La prop `simulationId` est **optionnelle** (`simulationId?: string`)
- Si non fournie, comportement par défaut: fetch `/api/users` (tous les utilisateurs)
- Garantit compatibilité avec d'autres vues qui pourraient utiliser ces composants

### Performance
- Même nombre de requêtes réseau (1 par ouverture de formulaire)
- Endpoint participants déjà optimisé avec `select` Prisma
- Pas d'impact sur performance

### Sécurité
- Filtrage côté client ET côté serveur (endpoint participants vérifie les assignments)
- Utilisateur actuel toujours filtré (ne peut pas s'envoyer à lui-même)

## Date de modification
**2024** - Implémentation complète du filtrage par simulation
