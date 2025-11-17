# Correction de l'erreur de création d'usine

## 🐛 Problème identifié

**Symptôme**: Erreur lors de la création d'une usine via l'interface utilisateur

**Cause**: URL d'API incorrecte dans le composant client

## ❌ Code problématique

```typescript
// Dans src/components/bia/factories-client.tsx et factories-client-example.tsx
const response = await fetch("/api/factories", {
  // ❌ URL incorrecte
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});
```

**Problème**: L'URL `/api/factories` n'existe pas. La route correcte est `/api/bia/factories`.

## ✅ Correction appliquée

### Fichiers modifiés:

1. `src/components/bia/factories-client.tsx`
2. `src/components/bia/factories-client-example.tsx`

### Changements:

```typescript
// ✅ URL corrigée
const response = await fetch("/api/bia/factories", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

// ✅ Meilleure gestion des erreurs
if (!response.ok) {
  const error = await response.json();
  throw new Error(error.error || "Erreur lors de la création");
}

// ✅ Message d'erreur plus explicite
alert(
  error instanceof Error
    ? error.message
    : "Erreur lors de la création de l'usine"
);
```

## 🎯 Routes API disponibles

### Usines (Factories)

- **GET** `/api/bia/factories` - Liste toutes les usines

  - Query params: `isActive` (true/false)
  - Retourne: Array de factories avec statistiques

- **POST** `/api/bia/factories` - Créer une nouvelle usine

  - Body requis: `{ name: string, code: string }`
  - Body optionnel: `description, address, city, postalCode, country, region, department, phoneNumber, email, isActive, managerId`
  - Retourne: Factory créée avec statistiques

- **GET** `/api/bia/factories/[id]` - Détails d'une usine

  - Retourne: Factory avec \_count, manager, createdBy

- **PUT** `/api/bia/factories/[id]` - Modifier une usine

  - Body: Champs à modifier
  - Validation: Unicité du code si changé

- **DELETE** `/api/bia/factories/[id]` - Supprimer une usine
  - Protection: Impossible si l'usine a des processus ou rapports

## ✅ Résultat

Après correction:

- ✅ La création d'usine fonctionne correctement
- ✅ Les messages d'erreur sont plus explicites
- ✅ L'utilisateur voit le message d'erreur exact du serveur (ex: "Ce code existe déjà")
- ✅ Cohérence entre le fichier de production et le fichier exemple

## 🧪 Test de validation

Pour tester la création d'une usine:

1. Aller sur `/bia/factories`
2. Cliquer sur "Nouvelle Usine"
3. Remplir le formulaire:
   - Nom: `Usine Test`
   - Code: `TEST001`
   - Description: `Usine de test`
   - Ville: `Paris`
   - Pays: `France`
4. Soumettre le formulaire
5. ✅ L'usine devrait être créée avec succès
6. La page devrait se rafraîchir et afficher la nouvelle usine

### Tests de validation des erreurs:

**Test 1 - Code dupliqué:**

- Créer une usine avec le code `TEST001`
- ✅ Devrait afficher: "Ce code existe déjà"

**Test 2 - Champs requis:**

- Ne pas remplir le nom ou le code
- ✅ Le navigateur devrait bloquer la soumission (attribut `required`)

**Test 3 - Authentification:**

- Se déconnecter et essayer de créer une usine
- ✅ Devrait retourner une erreur 401 "Non autorisé"

## 📊 Flux complet de création

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Utilisateur remplit le formulaire                        │
│    - Nom, Code (requis)                                     │
│    - Description, Ville, Pays (optionnels)                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Client component (FactoriesClient)                       │
│    - Collecte les données du formulaire                     │
│    - Envoie POST /api/bia/factories                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. API Route (/api/bia/factories/route.ts)                  │
│    - Vérifie l'authentification (session)                   │
│    - Valide les données (name et code requis)               │
│    - Vérifie l'unicité du code                              │
│    - Crée l'usine dans MongoDB via Prisma                   │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Base de données (MongoDB)                                │
│    - Enregistre dans la collection 'factories'              │
│    - Génère un ID unique                                    │
│    - Applique l'index unique sur 'code'                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Réponse au client                                        │
│    - Succès (201): Retourne la factory créée                │
│    - Erreur (400): Message d'erreur explicite               │
│    - Erreur (401): Non autorisé                             │
│    - Erreur (500): Erreur serveur                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Interface utilisateur                                    │
│    - Succès: Ferme le dialog, rafraîchit la liste           │
│    - Erreur: Affiche un message d'alerte                    │
└─────────────────────────────────────────────────────────────┘
```

## 🔍 Points de vérification

- [x] URL API corrigée dans `factories-client.tsx`
- [x] URL API corrigée dans `factories-client-example.tsx`
- [x] Gestion d'erreur améliorée (message du serveur)
- [x] Message d'alerte plus explicite
- [x] Aucune erreur TypeScript
- [x] Route API POST `/api/bia/factories` fonctionnelle
- [x] Validation côté serveur (name, code requis)
- [x] Vérification unicité du code
- [x] Authentification requise

## 📝 Notes

- Le champ `createdById` est automatiquement rempli avec l'ID de l'utilisateur connecté
- Le champ `isActive` est à `true` par défaut
- Les statistiques (`_count`) sont retournées avec la factory créée
- Le `router.refresh()` force Next.js à recharger les données serveur

---

**Date de correction**: 16 novembre 2025  
**Statut**: ✅ Résolu
