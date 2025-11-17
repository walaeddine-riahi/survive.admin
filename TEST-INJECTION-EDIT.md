# Test de modification d'injection - Guide de vérification

## Modifications appliquées ✅

### 1. InjectionComposeForm.tsx
**Ajout d'un useEffect pour mettre à jour le formulaire quand initialData change**

```tsx
// Nouveau useEffect ajouté (lignes ~73-98)
useEffect(() => {
  if (initialData) {
    setFormData({
      title: initialData.title || "",
      content: initialData.content || "",
      scenarioName: initialData.scenarioName || "workshop",
      type: initialData.type || InjectionType.OTHER,
      imageUrl: initialData.imageUrl || "",
      videoUrl: initialData.videoUrl || "",
      isActive: initialData.isActive !== undefined ? initialData.isActive : false,
      attachments: initialData.attachments || [],
    });
  } else {
    // Réinitialiser le formulaire pour la création
    setFormData({
      title: "",
      content: "",
      scenarioName: "workshop",
      type: InjectionType.OTHER,
      imageUrl: "",
      videoUrl: "",
      isActive: false,
      attachments: [],
    });
  }
}, [initialData]);
```

**Pourquoi ?**
- Le `useState` initial ne se met à jour que lors du montage du composant
- Avec `useEffect`, le formulaire se recharge à chaque fois que `initialData` change
- Permet de réutiliser le même composant pour création ET modification

### 2. admin-injections/page.tsx
**Ajout explicite du scenarioName dans handleEditInjection**

```tsx
const handleEditInjection = (injection: Injection) => {
  setEditingInjection({
    ...injection,
    scenarioName: injection.scenarioName || "workshop", // ← Ajouté
    imageUrl: injection.imageUrl || undefined,
    videoUrl: injection.videoUrl || undefined,
    attachments: // ... mapping des attachments
  });
  setIsComposing(true);
};
```

**Pourquoi ?**
- Garantit que le `scenarioName` est toujours présent
- Fallback sur "workshop" si manquant

---

## Flux de modification

### Étape 1 : Clic sur "Modifier"
1. L'utilisateur clique sur le menu "..." d'une injection
2. Sélectionne "Modifier"
3. `handleEditInjection(injection)` est appelé

### Étape 2 : Préparation des données
```tsx
setEditingInjection({
  ...injection,
  scenarioName: injection.scenarioName || "workshop",
  imageUrl: injection.imageUrl || undefined,
  videoUrl: injection.videoUrl || undefined,
  attachments: /* mapped attachments */,
});
setIsComposing(true);
```

### Étape 3 : Affichage du formulaire
- `isComposing = true` → affiche le Card avec InjectionComposeForm
- `editingInjection` contient les données → passées comme `initialData`

```tsx
<InjectionComposeForm
  simulationId={simulationId}
  initialData={
    editingInjection
      ? {
          title: editingInjection.title,
          content: editingInjection.content,
          scenarioName: editingInjection.scenarioName,
          type: editingInjection.type,
          imageUrl: editingInjection.imageUrl || "",
          videoUrl: editingInjection.videoUrl || "",
          isActive: editingInjection.isActive,
          attachments: /* mapped */,
        }
      : undefined
  }
  onSubmit={handleInjectionSubmit}
  onCancel={/* reset states */}
/>
```

### Étape 4 : Le useEffect se déclenche
Dans `InjectionComposeForm` :
1. `initialData` reçoit les données de l'injection
2. Le `useEffect` détecte le changement
3. `setFormData` est appelé avec toutes les valeurs
4. **Le formulaire se remplit automatiquement**

### Étape 5 : Modification et soumission
1. L'utilisateur modifie les champs
2. Clique sur "Modifier Injection"
3. `onSubmit(formData)` est appelé
4. `handleInjectionSubmit` envoie un PUT request
5. Toast de succès
6. `setIsComposing(false)` et `setEditingInjection(null)`
7. Liste rechargée avec `fetchSimulationAndInjections()`

---

## Procédure de test manuelle

### Pré-requis
```bash
# Démarrer le serveur de développement
pnpm dev
```

### Test 1 : Modification d'une injection existante

1. **Naviguer vers la page d'administration des injections**
   ```
   http://localhost:3000/simulation/{simulationId}/admin-injections
   ```

2. **Sélectionner une injection à modifier**
   - Cliquer sur le menu "..." (MoreHorizontal)
   - Cliquer sur "Modifier"

3. **Vérifier le pré-remplissage**
   - ✅ Titre : doit afficher le titre existant
   - ✅ Scénario : doit être sélectionné (pas "Sélectionnez un scénario")
   - ✅ Type : doit correspondre au type existant (EMAIL, SMS, etc.)
   - ✅ Contenu : doit afficher le contenu existant
   - ✅ Image URL : doit afficher l'URL si elle existe
   - ✅ Vidéo URL : doit afficher l'URL si elle existe
   - ✅ Checkbox "Active" : doit être cochée/décochée selon l'état

4. **Modifier un champ**
   - Exemple : Changer le titre de "Alerte urgente" à "Alerte très urgente"
   - Modifier le contenu
   - Changer le statut actif/inactif

5. **Sauvegarder**
   - Cliquer sur "Modifier Injection"
   - ✅ Toast de succès : "Injection mise à jour avec succès"
   - ✅ Formulaire se ferme
   - ✅ Liste se recharge
   - ✅ Modifications visibles dans la table

### Test 2 : Création d'une nouvelle injection

1. **Cliquer sur "Créer une nouvelle injection"**

2. **Vérifier le formulaire vide**
   - ✅ Titre : vide
   - ✅ Scénario : "workshop" par défaut
   - ✅ Type : "Autre" par défaut
   - ✅ Contenu : vide
   - ✅ URLs : vides
   - ✅ Checkbox "Active" : décochée par défaut

3. **Remplir et créer**
   - Remplir tous les champs requis
   - Cliquer sur "Créer Injection"
   - ✅ Toast de succès : "Injection ajoutée avec succès"

### Test 3 : Passage création → modification → création

1. **Ouvrir le formulaire de création**
   - Cliquer sur "Créer une nouvelle injection"
   - Formulaire vide ✅

2. **Annuler et ouvrir une modification**
   - Cliquer sur "Annuler"
   - Cliquer sur "Modifier" d'une injection existante
   - Formulaire pré-rempli avec les données de l'injection ✅

3. **Annuler et recréer**
   - Cliquer sur "Annuler"
   - Cliquer sur "Créer une nouvelle injection"
   - Formulaire vide à nouveau ✅ (pas de données résiduelles)

### Test 4 : Modification de différents types

Tester la modification pour chaque type d'injection :
- ✅ EMAIL
- ✅ SMS
- ✅ MEMO (WhatsApp)
- ✅ ALERT
- ✅ SOCIAL_MEDIA
- ✅ CALL
- ✅ NEWSBROADCAST
- ✅ NEWSPAPER
- ✅ OTHER

Vérifier que le type sélectionné correspond bien à l'injection.

---

## Points de vérification détaillés

### Champs texte
```
✅ Titre : value={formData.title}
✅ Contenu : value={formData.content}
✅ Image URL : value={formData.imageUrl || ""}
✅ Vidéo URL : value={formData.videoUrl || ""}
```

### Champs select
```
✅ Scénario : value={formData.scenarioName}
✅ Type : value={formData.type}
```

### Checkbox
```
✅ Active : checked={formData.isActive}
```

### Bouton de soumission
```
✅ Mode création : "Créer Injection"
✅ Mode édition : "Modifier Injection"
```

---

## Cas limites à tester

### 1. Injection sans image/vidéo
- Modifier une injection sans URL
- ✅ Les champs doivent être vides (pas "undefined" ou "null")

### 2. Injection inactive
- Modifier une injection avec `isActive: false`
- ✅ La checkbox doit être décochée

### 3. Scénario inexistant
- Si le scénario n'existe plus
- ✅ Fallback sur "workshop" (créé automatiquement si nécessaire)

### 4. Attachments
- Modifier une injection avec des pièces jointes
- ✅ Les attachments doivent être mappés correctement
- ✅ Affichage et édition fonctionnels

### 5. Annulation
- Ouvrir modification, changer des valeurs, puis annuler
- Réouvrir la même injection
- ✅ Les valeurs originales doivent être affichées (pas les modifications annulées)

---

## Résultats attendus

### ✅ Succès
- Le formulaire se remplit avec les anciennes informations
- Tous les champs correspondent aux données existantes
- La modification sauvegarde correctement
- Le passage création ↔ modification fonctionne sans problème
- Pas de données résiduelles entre les modes

### ❌ Échec (à corriger)
- Formulaire vide en mode édition
- Certains champs ne se remplissent pas
- Valeurs incorrectes (undefined, null affichés)
- Données d'une injection restent dans le formulaire après annulation

---

## Debugging

### Si le formulaire ne se remplit pas

1. **Vérifier dans la console navigateur**
   ```javascript
   // Ajouter dans InjectionComposeForm
   useEffect(() => {
     console.log("initialData changed:", initialData);
   }, [initialData]);
   ```

2. **Vérifier les données passées**
   ```javascript
   // Dans admin-injections/page.tsx
   console.log("editingInjection:", editingInjection);
   ```

3. **Vérifier le formData**
   ```javascript
   // Dans InjectionComposeForm
   useEffect(() => {
     console.log("formData updated:", formData);
   }, [formData]);
   ```

### Logs à surveiller
```
🔍 Logs attendus lors de la modification :
1. "editingInjection:" → objet complet avec toutes les données
2. "initialData changed:" → objet avec les données formatées
3. "formData updated:" → state du formulaire mis à jour
```

---

## Statut final

✅ **Modifications appliquées**
- useEffect pour réagir aux changements d'initialData
- scenarioName explicitement ajouté dans handleEditInjection
- Bouton conditionnel (Créer/Modifier)

✅ **Zero erreurs TypeScript/ESLint**

🧪 **Tests manuels requis**
- Suivre la procédure ci-dessus pour valider le fonctionnement
- Tester tous les types d'injection
- Vérifier les cas limites

---

Date : 22 octobre 2025  
Fichiers modifiés :
- `src/components/admin-mode/InjectionComposeForm.tsx`
- `src/app/(app)/simulation/[simulationId]/admin-injections/page.tsx`
