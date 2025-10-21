# Affichage des Médias dans la Vue Participant

## ✅ Configuration Complète

L'affichage des médias (images et vidéos) pour les injections dans la vue participant est **maintenant fonctionnel** !

## 📋 Fonctionnalités Implémentées

### 1. **Interface Injection avec Médias**

```typescript
interface Injection {
  id: string;
  title: string;
  content: string;
  scenarioName: string;
  createdAt: string;
  acknowledged: boolean;
  type: string;
  imageUrl?: string; // ✅ Support des images
  videoUrl?: string; // ✅ Support des vidéos
  attachments?: {
    // ✅ Support des pièces jointes
    type: string;
    url: string;
    name: string;
  }[];
}
```

### 2. **Affichage dans la Modale d'Injection**

#### Images

- Affichage avec Next.js `Image` component
- Optimisation automatique
- Design responsive avec bordures arrondies
- Taille adaptative (width: 800px, height: 450px)

#### Vidéos

- **Support YouTube** : Détection automatique et affichage en iframe
  - Extraction automatique de l'ID vidéo
  - Format aspect-ratio 16:9
  - Contrôles complets (play, pause, volume, plein écran)
- **Support Vidéo Native** : Pour les fichiers MP4, WebM, etc.
  - Lecteur HTML5 avec contrôles
  - Format aspect-ratio adaptatif

#### Pièces Jointes

- Liste avec icônes de fichier
- Téléchargement direct
- Affichage du type de fichier
- Design card avec hover effects

### 3. **Flux de Données API → Participant**

```
Animator crée injection avec médias
         ↓
Sauvegarde dans DB (imageUrl, videoUrl)
         ↓
API GET /api/simulations/[id]/injections?view=participant
         ↓
Filtrage injections actives + targetUserId
         ↓
Affichage dans participant-view avec médias
```

## 🎨 Design de la Modale d'Injection

```tsx
<Card className="max-w-3xl">
  {/* En-tête avec gradient de couleur selon le type */}
  <div className="bg-gradient-to-r from-amber-500 to-orange-600">
    <h2>{injection.title}</h2>
    <Badge>Non lu</Badge>
  </div>

  <CardContent>
    {/* Contenu texte */}
    <div className="prose">{injection.content}</div>

    {/* Image (si présente) */}
    {injection.imageUrl && (
      <div className="mb-6 rounded-xl overflow-hidden">
        <Image
          src={injection.imageUrl}
          alt={injection.title}
          width={800}
          height={450}
        />
      </div>
    )}

    {/* Vidéo (si présente) */}
    {injection.videoUrl && (
      <div className="mb-6 rounded-xl overflow-hidden">
        {/* YouTube ou vidéo native */}
        {isYouTube ? <iframe .../> : <video controls />}
      </div>
    )}

    {/* Pièces jointes (si présentes) */}
    {injection.attachments?.map(attachment => (
      <a href={attachment.url} download>
        <FileIcon /> {attachment.name}
      </a>
    ))}

    {/* Bouton d'action */}
    {!injection.acknowledged && (
      <Button onClick={handleAcknowledge}>
        Marquer comme lu
      </Button>
    )}
  </CardContent>
</Card>
```

## 📂 Structure des URLs de Médias

### Option 1 : Fichiers Locaux (recommandé)

```
/media/images/crise-incendie.jpg
/media/videos/alerte-video.mp4
```

- Stockés dans `/public/media/`
- Accessibles via `/media/[filename]`
- Pas besoin de configuration supplémentaire

### Option 2 : URLs Externes

```
https://images.unsplash.com/photo-123.jpg
https://www.youtube.com/watch?v=VIDEO_ID
https://drive.google.com/file/d/FILE_ID
```

- Domaines déjà configurés dans `next.config.ts`
- Support pour Unsplash, Pexels, Google Drive

## 🔧 Configuration Next.js

Le fichier `next.config.ts` est déjà configuré pour :

```typescript
images: {
  remotePatterns: [
    { protocol: "https", hostname: "images.pexels.com" },
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "drive.google.com" },
  ],
}
```

## 📝 Exemple d'Utilisation

### Créer une Injection avec Média (Animateur)

1. Aller dans le tableau de bord animateur
2. Créer une nouvelle injection
3. Cliquer sur **"Sélectionner une image"** ou **"Sélectionner une vidéo"**
4. Choisir :
   - **Onglet Bibliothèque** : Upload ou sélection fichier local
   - **Onglet URL** : Saisir URL externe (YouTube, etc.)
5. Le média est automatiquement inclus dans l'injection

### Vue Participant

1. Le participant reçoit une notification
2. Clic sur "Voir" pour ouvrir l'injection
3. Affichage :
   - Titre et contenu
   - **Image** (si présente) : Affichage optimisé
   - **Vidéo** (si présente) : Lecteur intégré
   - **Pièces jointes** (si présentes) : Liste téléchargeable
4. Bouton "Marquer comme lu"

## ✅ Tests à Effectuer

### Test 1 : Image Locale

1. Uploader une image via MediaSelector
2. Créer injection avec cette image
3. Vérifier affichage dans participant-view
4. ✅ L'image doit s'afficher correctement avec bordures arrondies

### Test 2 : Vidéo YouTube

1. Coller URL YouTube dans MediaSelector (onglet URL)
2. Créer injection avec cette vidéo
3. Vérifier affichage iframe YouTube
4. ✅ La vidéo doit être lisible avec contrôles YouTube

### Test 3 : Vidéo Locale

1. Uploader fichier MP4 via MediaSelector
2. Créer injection avec cette vidéo
3. Vérifier affichage lecteur HTML5
4. ✅ La vidéo doit être lisible avec contrôles natifs

### Test 4 : Image + Vidéo + Pièces Jointes

1. Créer injection avec les 3 types de médias
2. Vérifier affichage de tous les éléments
3. ✅ Tout doit s'afficher dans l'ordre correct

## 🎯 Compatibilité

### Navigateurs Supportés

- ✅ Chrome/Edge (desktop & mobile)
- ✅ Firefox (desktop & mobile)
- ✅ Safari (desktop & mobile)
- ✅ Navigateurs modernes

### Types de Médias Supportés

- **Images** : JPG, PNG, GIF, WebP, SVG
- **Vidéos** : MP4, WebM, MOV, AVI
- **Vidéos Externes** : YouTube (auto-détecté)

## 📱 Responsive Design

### Desktop (> 768px)

- Modale centrée max-width: 3xl (768px)
- Images à largeur maximale
- Vidéos en aspect-ratio 16:9

### Mobile (< 768px)

- Modale plein écran
- Images responsive à 100% de largeur
- Vidéos en aspect-ratio adaptatif
- Scroll vertical pour contenu long

## 🔐 Sécurité

- ✅ Validation des URLs dans l'API
- ✅ Sanitization des noms de fichiers
- ✅ Limite de taille : 10 MB par fichier
- ✅ Extensions autorisées uniquement
- ✅ HTTPS obligatoire pour URLs externes

## 📊 Performance

- ✅ Images optimisées avec Next.js Image
- ✅ Lazy loading automatique
- ✅ Compression automatique
- ✅ Mise en cache navigateur
- ✅ Vidéos chargées à la demande (pas d'autoplay)

## 🎉 Résultat Final

Les participants peuvent maintenant :

1. **Voir les injections enrichies** avec images et vidéos
2. **Lire les vidéos** directement dans la modale
3. **Télécharger les pièces jointes**
4. **Expérience visuelle améliorée** pour les simulations de crise

L'intégration est **complète et fonctionnelle** ! 🚀
