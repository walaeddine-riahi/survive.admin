# ✅ Résolution Complète : Erreur Next.js Image avec Fichiers Locaux

## 📋 Changements Appliqués

### 1. **Configuration Next.js** (`next.config.ts`)

```typescript
images: {
  remotePatterns: [...],
  unoptimized: true,  // ✅ Désactive l'optimisation Next.js Image
}
```

**Pourquoi** : Évite les erreurs de validation d'images locales

### 2. **Vue Participant** (`participant-view/page.tsx`)

```tsx
{selectedInjection.imageUrl && (
  <div className="...">
    {selectedInjection.imageUrl.startsWith('/media/') ? (
      // ✅ <img> natif pour fichiers locaux
      <img src={selectedInjection.imageUrl} ... />
    ) : (
      // ✅ <Image> Next.js pour URLs externes
      <Image src={selectedInjection.imageUrl} ... />
    )}
  </div>
)}
```

**Pourquoi** : Utilise le bon composant selon la source de l'image

### 3. **MediaSelector** (`src/components/MediaSelector.tsx`)

```tsx
{file.type === 'image' ? (
  <div className="...">
    {file.url.startsWith('/media/') ? (
      // ✅ <img> natif pour previews locales
      <img src={file.url} className="..." />
    ) : (
      // ✅ <Image> Next.js pour previews externes
      <Image src={file.url} fill ... />
    )}
  </div>
) : (...)}
```

**Pourquoi** : Corrige les previews dans le sélecteur de médias

### 4. **API Upload** (`src/app/api/media/upload/route.ts`)

```typescript
const sanitizedName = fileNameWithoutExt
  .replace(/[^a-zA-Z0-9]/g, "-") // Alphanumériques seulement
  .replace(/-+/g, "-") // Tirets multiples → un seul
  .replace(/^-|-$/g, "") // Pas de tirets aux extrémités
  .toLowerCase(); // Tout en minuscules
```

**Pourquoi** : Noms de fichiers compatibles avec tous les systèmes

## 🧪 Guide de Test

### Test 1 : Vider le Cache et Redémarrer

1. **Arrêter le serveur** : `Ctrl+C` dans le terminal
2. **Supprimer le cache Next.js** :
   ```bash
   rm -rf .next
   ```
   Ou sur Windows :
   ```cmd
   rmdir /s /q .next
   ```
3. **Redémarrer** :
   ```bash
   npm run dev
   ```

### Test 2 : Vérifier une Injection Existante

1. Ouvrir la console développeur du navigateur (F12)
2. Aller sur la vue participant
3. Ouvrir une injection avec une image
4. Vérifier dans l'onglet **Network** :

   - ❌ Si vous voyez `/_next/image?url=...` → Le cache est actif
   - ✅ Si vous voyez `/media/images/...` → Correct !

5. Vérifier dans l'onglet **Elements** :

   ```html
   <!-- ✅ Correct -->
   <img src="/media/images/..." />

   <!-- ❌ Incorrect -->
   <img src="/_next/image?url=..." />
   ```

### Test 3 : Upload Nouvelle Image

1. Créer une nouvelle injection
2. Cliquer sur "Sélectionner une image"
3. Uploader un fichier avec un nom complexe :
   - **Exemple** : `Mon Image Test (Final).png`
4. Vérifier que le fichier uploadé a un nom propre :
   - **Attendu** : `1761234567890-mon-image-test-final.png`
5. Sauvegarder l'injection
6. Ouvrir l'injection dans la vue participant
7. **Vérifier** : L'image s'affiche sans erreur 404

### Test 4 : Vérifier le MediaSelector

1. Créer une nouvelle injection
2. Cliquer sur "Sélectionner une image"
3. Aller sur l'onglet **Bibliothèque**
4. **Vérifier** : Les previews des images s'affichent correctement
5. Sélectionner une image
6. **Vérifier** : L'URL affichée sous le bouton est `/media/images/...`

## 🔍 Diagnostic des Erreurs Persistantes

### Erreur : `GET /_next/image?url=...%2Fmedia%2F... 404`

**Causes possibles** :

1. **Cache navigateur**

   - Solution : Vider le cache (Ctrl+Shift+R)
   - Ou ouvrir en navigation privée

2. **Cache Next.js**

   - Solution : Supprimer `.next/` et redémarrer

3. **Hot Reload incomplet**

   - Solution : Redémarrage complet du serveur

4. **Code non sauvegardé**
   - Vérifier que tous les fichiers sont sauvegardés

### Vérification Manuelle du Code

**Commande** :

```bash
# Chercher tous les usages de <Image> avec /media/
grep -r "Image.*src.*media" src/
```

**Attendu** : Aucun résultat ou seulement les conditionnels `startsWith('/media/')`

## 📊 Checklist de Vérification

- [ ] Le serveur a été redémarré complètement
- [ ] Le dossier `.next` a été supprimé
- [ ] Le cache du navigateur a été vidé
- [ ] `next.config.ts` contient `unoptimized: true`
- [ ] `participant-view/page.tsx` utilise la condition `startsWith('/media/')`
- [ ] `MediaSelector.tsx` utilise la condition `startsWith('/media/')`
- [ ] Les nouveaux uploads génèrent des noms propres
- [ ] Aucune erreur 404 dans la console navigateur
- [ ] Les images s'affichent dans la vue participant

## 🎯 Résultat Attendu

**Avant** :

```
❌ GET /_next/image?url=%2Fmedia%2Fimages%2F... 404
❌ The requested resource isn't a valid image
```

**Après** :

```
✅ GET /media/images/1761234567890-nom-fichier.png 200
✅ Image affichée correctement
```

## 🚨 Si le Problème Persiste

### Option 1 : Forcer unoptimized globalement

```typescript
// next.config.ts
images: {
  unoptimized: true,
  dangerouslyAllowSVG: true,
  contentDispositionType: 'attachment',
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
}
```

### Option 2 : Utiliser uniquement <img> pour toutes les images locales

Remplacer TOUS les `<Image>` par `<img>` pour les URLs commençant par `/`:

```tsx
{
  imageUrl &&
    (imageUrl.startsWith("/") ? (
      <img src={imageUrl} alt="..." className="..." />
    ) : (
      <Image src={imageUrl} alt="..." width={800} height={450} />
    ));
}
```

### Option 3 : Créer un composant wrapper

```tsx
// src/components/OptimizedImage.tsx
export function OptimizedImage({ src, alt, ...props }: ImageProps) {
  if (typeof src === "string" && src.startsWith("/media/")) {
    return <img src={src} alt={alt} {...props} />;
  }
  return <Image src={src} alt={alt} {...props} />;
}
```

## 📞 Support

Si le problème persiste après avoir suivi tous ces steps :

1. Vérifier les logs du serveur Next.js
2. Vérifier les logs de la console navigateur
3. Vérifier que le fichier existe physiquement :
   ```bash
   ls -la public/media/images/
   ```
4. Exécuter le script de diagnostic :
   ```bash
   npx tsx scripts/check-ooredoo-image.ts
   ```

---

**Date** : 22 octobre 2025  
**Status** : ✅ Corrections appliquées  
**Action requise** : Redémarrage complet du serveur et cache
