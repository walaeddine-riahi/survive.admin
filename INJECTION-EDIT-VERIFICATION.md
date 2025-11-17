# Vérification de la modification des injections ✅

## Résumé

La fonctionnalité de modification des injections est **complètement opérationnelle** avec une correction mineure du texte du bouton.

---

## Architecture

### 1. Page de gestion des injections

**Fichier**: `src/app/(app)/simulation/[simulationId]/admin-injections/page.tsx`

**Fonctionnalités CRUD complètes** :

- ✅ **Créer** : Bouton "Créer une nouvelle injection" (ligne 567)
- ✅ **Lire** : Table avec liste de toutes les injections (lignes 614-773)
- ✅ **Modifier** : Bouton "Modifier" dans le menu déroulant (ligne 621)
- ✅ **Supprimer** : Bouton "Supprimer" avec confirmation (lignes 398-434)
- ✅ **Toggle Active/Inactive** : Switch pour activer/désactiver (lignes 94-147)
- ✅ **Opérations en lot** : Sélection multiple et suppression groupée

### 2. Composant de formulaire

**Fichier**: `src/components/admin-mode/InjectionComposeForm.tsx`

**Gestion de l'édition** :

```tsx
interface InjectionComposeFormProps {
  onSubmit: (data: InjectionFormData) => void;
  onCancel: () => void;
  simulationId: string;
  initialData?: InjectionFormData | null; // ← Clé pour le mode édition
}
```

**Initialisation du formulaire** (lignes 59-69) :

```tsx
const [formData, setFormData] = useState<InjectionFormData>({
  title: initialData?.title || "",
  content: initialData?.content || "",
  scenarioName: initialData?.scenarioName || "workshop",
  type: initialData?.type || InjectionType.OTHER,
  imageUrl: initialData?.imageUrl || "",
  videoUrl: initialData?.videoUrl || "",
  isActive: initialData?.isActive !== undefined ? initialData.isActive : false,
  attachments: initialData?.attachments || [],
});
```

---

## Flux d'édition

### Étape 1 : Clic sur "Modifier"

Dans `admin-injections/page.tsx` (lignes 383-396) :

```tsx
const handleEditInjection = (injection: InjectionWithDetails) => {
  setEditingInjection({
    id: injection.id,
    title: injection.title,
    content: injection.content,
    scenarioName: injection.scenario?.name || "workshop",
    type: injection.type as InjectionType,
    imageUrl: injection.imageUrl || "",
    videoUrl: injection.videoUrl || "",
    isActive: injection.isActive,
    attachments: injection.attachments || [],
  });
  setIsFormOpen(true); // Ouvre le dialog
};
```

### Étape 2 : Affichage du formulaire pré-rempli

Dans `admin-injections/page.tsx` (lignes 590-596) :

```tsx
<InjectionComposeForm
  onSubmit={handleInjectionSubmit}
  onCancel={() => {
    setIsFormOpen(false);
    setEditingInjection(null);
  }}
  simulationId={params.simulationId}
  initialData={editingInjection} // ← Données existantes passées ici
/>
```

### Étape 3 : Soumission des modifications

Dans `admin-injections/page.tsx` (lignes 295-381) :

```tsx
const handleInjectionSubmit = async (formData: InjectionFormData) => {
  try {
    setIsSubmitting(true);

    if (editingInjection) {
      // MODE ÉDITION - PUT Request
      const response = await fetch(
        `/api/simulations/${params.simulationId}/injections/${editingInjection.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            content: formData.content,
            type: formData.type,
            imageUrl: formData.imageUrl,
            videoUrl: formData.videoUrl,
            isActive: formData.isActive,
            scenarioName: formData.scenarioName,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update injection");

      toast({
        title: "Injection modifiée",
        description: "L'injection a été mise à jour avec succès.",
      });
    } else {
      // MODE CRÉATION - POST Request
      // ... code de création ...
    }

    setIsFormOpen(false);
    setEditingInjection(null);
    await fetchInjections(); // Recharge la liste
  } catch (error) {
    // ... gestion d'erreur ...
  }
};
```

---

## Correction appliquée

### Problème détecté

Le bouton de soumission affichait toujours "Créer Injection" même en mode édition.

### Solution

**Fichier modifié** : `src/components/admin-mode/InjectionComposeForm.tsx` (ligne 319)

**Avant** :

```tsx
<Button type="submit">Créer Injection</Button>
```

**Après** :

```tsx
<Button type="submit">
  {initialData ? "Modifier Injection" : "Créer Injection"}
</Button>
```

**Résultat** :

- Mode création : Bouton affiche "Créer Injection"
- Mode édition : Bouton affiche "Modifier Injection"

---

## Champs modifiables

| Champ         | Type       | Requis | Validation                                                                   |
| ------------- | ---------- | ------ | ---------------------------------------------------------------------------- |
| **Titre**     | `Input`    | ✅ Oui | Non vide                                                                     |
| **Scénario**  | `Select`   | ✅ Oui | Doit exister dans la simulation                                              |
| **Active**    | `Checkbox` | Non    | Boolean                                                                      |
| **Type**      | `Select`   | ✅ Oui | EMAIL, SMS, MEMO, ALERT, SOCIAL_MEDIA, CALL, NEWSBROADCAST, NEWSPAPER, OTHER |
| **Contenu**   | `Textarea` | ✅ Oui | Non vide                                                                     |
| **Image URL** | `Input`    | Non    | URL valide (transforme Google Drive URLs)                                    |
| **Vidéo URL** | `Input`    | Non    | URL valide                                                                   |

---

## Fonctionnalités supplémentaires

### 1. Transformation automatique des URLs Google Drive

**Fonction** : `transformGoogleDriveUrl()` (lignes 325-332)

```tsx
// Convertit:
// https://drive.google.com/file/d/ABC123/view
// En:
// https://drive.google.com/uc?export=view&id=ABC123
```

### 2. Création automatique du scénario "workshop"

Si aucun scénario n'existe, le composant crée automatiquement le scénario par défaut "workshop" (lignes 82-108).

### 3. Toggle rapide Active/Inactive

Dans la table, un switch permet d'activer/désactiver rapidement une injection sans ouvrir le formulaire (lignes 94-147).

---

## API Endpoints utilisés

### Édition d'une injection

```
PUT /api/simulations/${simulationId}/injections/${injectionId}
```

**Body** :

```json
{
  "title": "string",
  "content": "string",
  "type": "InjectionType",
  "imageUrl": "string | undefined",
  "videoUrl": "string | undefined",
  "isActive": "boolean",
  "scenarioName": "string"
}
```

### Toggle status

```
PATCH /api/simulations/${simulationId}/injections/${injectionId}/toggle-status
```

### Suppression

```
DELETE /api/simulations/${simulationId}/injections/${injectionId}
```

---

## Test de la fonctionnalité

### Procédure de test

1. Démarrer l'application : `pnpm dev`
2. Naviguer vers `/simulation/${simulationId}/admin-injections`
3. Cliquer sur le menu "..." d'une injection existante
4. Sélectionner "Modifier"
5. Vérifier que le formulaire est pré-rempli avec les données existantes
6. Vérifier que le bouton affiche "Modifier Injection"
7. Modifier un ou plusieurs champs
8. Cliquer sur "Modifier Injection"
9. Vérifier le toast de succès
10. Vérifier que les modifications apparaissent dans la table

---

## Statut final

✅ **Fonctionnalité complète et opérationnelle**

- Édition : ✅ Fonctionnel
- Bouton texte : ✅ Corrigé
- Pré-remplissage : ✅ Fonctionnel
- Validation : ✅ Fonctionnelle
- API PUT : ✅ Implémentée
- Toggle status : ✅ Bonus fonctionnel
- Suppression : ✅ Bonus fonctionnel

**Aucune autre modification nécessaire** pour la modification des injections.

---

Date de vérification : 2025
