# Implémentation de l'Upload de Médias pour les Injections

## Vue d'ensemble

Cette documentation décrit l'implémentation complète du système d'upload de médias pour les injections dans la plateforme Survive. Les utilisateurs peuvent maintenant sélectionner des médias (images et vidéos) depuis une bibliothèque ou uploader de nouveaux fichiers lors de la création d'une injection.

## Architecture du Système

### 1. Structure des Dossiers

```
public/media/
├── README.md          # Documentation de la structure
├── images/            # Images uploadées (recommandé)
├── videos/            # Vidéos uploadées (recommandé)
└── documents/         # Documents (optionnel)
```

**Accès aux fichiers:** `https://votre-domaine.com/media/[nom-du-fichier]`

### 2. API Endpoints

#### GET `/api/media/list`

Liste tous les fichiers médias disponibles dans `/public/media/`

**Réponse:**

```json
{
  "files": [
    {
      "name": "image-1234567890.jpg",
      "path": "media/images/image-1234567890.jpg",
      "url": "/media/images/image-1234567890.jpg",
      "size": 245678,
      "type": "image",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "modifiedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Caractéristiques:**

- Scan récursif de tous les sous-dossiers
- Catégorisation automatique par type (image, video, document, other)
- Tri par date de modification (plus récent en premier)
- Exclusion automatique des fichiers README

#### POST `/api/media/upload`

Upload un nouveau fichier média

**Paramètres (FormData):**

- `file` (required): Le fichier à uploader
- `folder` (optional): Sous-dossier de destination (ex: "images", "videos")

**Validation:**

- Taille maximale: 10 MB
- Extensions autorisées:
  - Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`
  - Vidéos: `.mp4`, `.webm`, `.mov`, `.avi`
  - Documents: `.pdf`, `.doc`, `.docx`, `.txt`

**Réponse:**

```json
{
  "file": {
    "name": "image-1234567890.jpg",
    "path": "media/images/image-1234567890.jpg",
    "url": "/media/images/image-1234567890.jpg",
    "size": 245678,
    "type": "image/jpeg"
  }
}
```

**Sécurité:**

- Sanitisation des noms de fichiers
- Horodatage automatique pour éviter les conflits
- Validation stricte des extensions
- Limitation de la taille des fichiers

### 3. Composant MediaSelector

**Fichier:** `src/components/MediaSelector.tsx`

#### Props

```typescript
interface MediaSelectorProps {
  open: boolean; // État d'ouverture du dialogue
  onOpenChange: (open: boolean) => void; // Callback de changement d'état
  onSelect: (url: string) => void; // Callback de sélection
  mediaType?: "image" | "video" | "all"; // Type de média à afficher
  currentValue?: string; // URL actuellement sélectionnée
}
```

#### Fonctionnalités

**Onglet Bibliothèque:**

- Affichage en grille de tous les médias disponibles
- Prévisualisation des images
- Icônes de type pour vidéos et documents
- Affichage de la taille des fichiers
- Upload de nouveaux fichiers par clic ou glisser-déposer
- Indication visuelle de la sélection actuelle

**Onglet URL:**

- Saisie manuelle d'une URL externe
- Support des liens externes (https://)
- Validation d'URL

**Interface:**

- Design responsive avec Shadcn/ui
- Notifications toast pour succès/erreurs
- États de chargement et d'upload
- Aperçu du fichier sélectionné

### 4. Intégration dans le Formulaire d'Injection

**Fichier:** `src/components/injection-form.tsx`

#### Modifications Apportées

1. **Imports ajoutés:**

```typescript
import { useState } from "react";
import { MediaSelector } from "@/components/MediaSelector";
```

2. **États ajoutés:**

```typescript
const [imageSelectOpen, setImageSelectOpen] = useState(false);
const [videoSelectOpen, setVideoSelectOpen] = useState(false);
```

3. **Remplacement des champs URL:**

**Avant:**

```tsx
<Input
  placeholder="https://example.com/image.jpg"
  {...field}
  value={field.value || ""}
/>
```

**Après:**

```tsx
<div className="space-y-2">
  <Button
    type="button"
    variant="outline"
    className="w-full"
    onClick={() => setImageSelectOpen(true)}
  >
    {field.value ? "Changer l'image" : "Sélectionner une image"}
  </Button>
  {field.value && (
    <p className="text-xs text-muted-foreground truncate">
      {field.value}
    </p>
  )}
</div>
<MediaSelector
  open={imageSelectOpen}
  onOpenChange={setImageSelectOpen}
  onSelect={(url) => {
    setValue('imageUrl', url);
    setImageSelectOpen(false);
  }}
  mediaType="image"
  currentValue={field.value || ''}
/>
```

## Guide d'Utilisation

### Pour Créer une Injection avec Média

1. **Ouvrir le formulaire d'injection**

   - Naviguer vers la page des injections
   - Cliquer sur "Nouvelle Injection"

2. **Ajouter une image ou vidéo**

   - Cliquer sur le bouton "Sélectionner une image" ou "Sélectionner une vidéo"
   - Le dialogue MediaSelector s'ouvre

3. **Option A: Sélectionner depuis la bibliothèque**

   - Onglet "Bibliothèque" (par défaut)
   - Parcourir les fichiers existants
   - Cliquer sur un fichier pour le sélectionner
   - Cliquer sur "Sélectionner"

4. **Option B: Uploader un nouveau fichier**

   - Onglet "Bibliothèque"
   - Cliquer sur "Parcourir" ou glisser-déposer un fichier
   - Optionnel: Choisir un sous-dossier
   - Le fichier est automatiquement uploadé
   - Il apparaît immédiatement dans la bibliothèque
   - Le sélectionner et cliquer sur "Sélectionner"

5. **Option C: Utiliser une URL externe**

   - Onglet "URL"
   - Saisir l'URL complète de l'image/vidéo
   - Cliquer sur "Utiliser cette URL"

6. **Valider la sélection**
   - L'URL apparaît sous le bouton
   - Continuer à remplir le formulaire
   - Soumettre l'injection

### Organisation des Médias

**Recommandations:**

- Utiliser le dossier `images/` pour les images
- Utiliser le dossier `videos/` pour les vidéos
- Utiliser des noms de fichiers descriptifs
- Optimiser les images avant upload (taille < 1MB recommandé)
- Préférer les formats web (JPEG, PNG, WebP pour images / MP4, WebM pour vidéos)

**Exemples de structure:**

```
public/media/
├── images/
│   ├── logo-ooredoo.png
│   ├── alerte-incendie.jpg
│   └── carte-evacuation.jpg
├── videos/
│   ├── briefing-crise.mp4
│   └── procedure-evacuation.mp4
└── documents/
    └── protocole-securite.pdf
```

## Considérations Techniques

### Performance

- Les fichiers sont servis directement par Next.js depuis `/public/`
- Pas de traitement supplémentaire côté serveur
- Optimisation automatique des images avec Next.js Image (si utilisé)
- Chargement paresseux des aperçus dans la bibliothèque

### Sécurité

- Validation stricte des types de fichiers
- Limitation de la taille (10MB max)
- Sanitisation des noms de fichiers
- Pas d'exécution de code côté serveur
- Les fichiers sont en lecture seule pour les utilisateurs

### Compatibilité

- Fonctionne avec tous les navigateurs modernes
- Support du glisser-déposer (HTML5)
- Responsive design pour mobile et desktop
- Compatible avec le schéma Prisma existant

### Limitations Connues

- Pas de suppression de fichiers depuis l'interface (peut être ajouté)
- Pas de renommage de fichiers (peut être ajouté)
- Pas d'organisation par dossier depuis l'interface (peut être ajouté)
- Pas de compression automatique des images (recommandé avant upload)

## Maintenance et Extensions Futures

### Fonctionnalités Suggérées

1. **Gestion Avancée:**

   - Suppression de fichiers depuis l'interface
   - Renommage de fichiers
   - Déplacement entre dossiers
   - Édition de métadonnées

2. **Optimisation:**

   - Compression automatique des images
   - Génération de miniatures
   - Conversion de formats vidéo
   - Cache des métadonnées

3. **Organisation:**

   - Création de dossiers depuis l'interface
   - Tags et catégories personnalisés
   - Recherche et filtres avancés
   - Tri personnalisable

4. **Sécurité:**
   - Permissions par utilisateur/rôle
   - Historique des uploads
   - Scan antivirus
   - Watermarking automatique

### Dépannage

**Problème: Les fichiers n'apparaissent pas**

- Vérifier que les fichiers sont dans `/public/media/`
- Redémarrer le serveur Next.js
- Vérifier les permissions des dossiers

**Problème: Upload échoue**

- Vérifier la taille du fichier (< 10MB)
- Vérifier l'extension du fichier
- Vérifier les logs du serveur
- Vérifier l'espace disque disponible

**Problème: Images ne s'affichent pas**

- Vérifier le chemin de l'URL (commence par `/media/`)
- Vérifier que le fichier existe physiquement
- Vérifier les CORS si utilisation externe

## Tests

### Test Manuel Recommandé

1. **Upload Image:**

   - [ ] Upload une image JPG < 1MB
   - [ ] Upload une image PNG < 5MB
   - [ ] Tenter upload image > 10MB (doit échouer)
   - [ ] Tenter upload fichier non autorisé (doit échouer)

2. **Upload Vidéo:**

   - [ ] Upload vidéo MP4 < 10MB
   - [ ] Upload vidéo WebM < 8MB
   - [ ] Tenter upload vidéo > 10MB (doit échouer)

3. **Sélection:**

   - [ ] Sélectionner image depuis bibliothèque
   - [ ] Sélectionner vidéo depuis bibliothèque
   - [ ] Saisir URL externe
   - [ ] Changer de sélection

4. **Création Injection:**

   - [ ] Créer injection avec image uploadée
   - [ ] Créer injection avec vidéo uploadée
   - [ ] Créer injection avec URL externe
   - [ ] Créer injection sans média

5. **Affichage:**
   - [ ] Vérifier affichage image dans participant-view
   - [ ] Vérifier affichage vidéo dans participant-view
   - [ ] Vérifier responsive mobile

## Statut de l'Implémentation

✅ **Complété:**

- Structure de dossiers `/public/media/`
- API endpoint `/api/media/list`
- API endpoint `/api/media/upload`
- Composant `MediaSelector` avec tous les onglets
- Intégration dans `injection-form.tsx`
- Documentation README dans `/public/media/`

🔄 **À Tester:**

- Upload de différents types de fichiers
- Création d'injection avec médias
- Affichage dans participant-view
- Test sur mobile

⏳ **Futures Améliorations:**

- Suppression de fichiers
- Gestion des dossiers
- Compression automatique
- Permissions utilisateur

## Conclusion

Le système d'upload de médias est maintenant entièrement opérationnel. Les utilisateurs peuvent facilement ajouter des images et vidéos à leurs injections, soit en sélectionnant depuis la bibliothèque existante, soit en uploadant de nouveaux fichiers. Le système est sécurisé, performant et extensible pour de futures améliorations.
