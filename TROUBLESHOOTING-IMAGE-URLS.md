# 🔧 Guide de Résolution : Erreur "Invalid URL" pour les Images

## ❌ Problème Rencontré

```
Invalid url ⨯ The requested resource isn't a valid image for
/media/images/1761083793071_Ooredoo_Upgrade_Your_World_Logo_Lockup_Red_on_Transparent_Bg_RGB.png
received null
```

## 🔍 Cause du Problème

Next.js Image component a des restrictions strictes sur les noms de fichiers :

- ❌ **Caractères spéciaux** (espaces, underscores multiples, majuscules)
- ❌ **Noms de fichiers trop longs**
- ❌ **Encodage URL complexe**

## ✅ Solutions Implémentées

### 1. **Sanitization Stricte des Noms de Fichiers** (API Upload)

Le fichier `src/app/api/media/upload/route.ts` nettoie automatiquement les noms :

```typescript
const sanitizedName = fileNameWithoutExt
  .replace(/[^a-zA-Z0-9]/g, "-") // Remplace tout sauf alphanumériques par "-"
  .replace(/-+/g, "-") // Remplace les tirets multiples par un seul
  .replace(/^-|-$/g, "") // Enlève les tirets au début/fin
  .toLowerCase(); // Tout en minuscules

const fileName = `${timestamp}_${sanitizedName}${ext}`;
```

**Exemple** :

- ❌ Avant : `Ooredoo_Upgrade_Your_World_Logo_Lockup_Red_on_Transparent_Bg_RGB.png`
- ✅ Après : `1761083793071-ooredoo-upgrade-your-world-logo-lockup-red-on-transparent-bg-rgb.png`

### 2. **Affichage Hybride** (Vue Participant)

Le code d'affichage utilise maintenant deux approches :

```tsx
{
  selectedInjection.imageUrl && (
    <div className="mb-6 rounded-xl overflow-hidden">
      {selectedInjection.imageUrl.startsWith("/media/") ? (
        // ✅ <img> natif pour images locales
        <img
          src={selectedInjection.imageUrl}
          alt={selectedInjection.title ?? "Image"}
          className="w-full h-auto object-cover"
        />
      ) : (
        // ✅ Next.js Image pour URLs externes
        <Image
          src={selectedInjection.imageUrl}
          alt={selectedInjection.title ?? "Image"}
          width={800}
          height={450}
          className="w-full h-auto object-cover"
        />
      )}
    </div>
  );
}
```

**Avantages** :

- ✅ Images locales (`/media/`) : Pas de contraintes de nommage
- ✅ Images externes : Optimisation Next.js

### 3. **Script de Nettoyage** (Maintenance)

Script disponible : `scripts/clean-media-filenames.ts`

```bash
npx tsx scripts/clean-media-filenames.ts
```

Ce script :

- ✅ Parcourt récursivement `/public/media/`
- ✅ Renomme tous les fichiers avec caractères spéciaux
- ✅ Évite les conflits de noms
- ✅ Ajoute des timestamps si nécessaire

## 📋 Bonnes Pratiques

### ✅ À FAIRE

1. **Utiliser le MediaSelector** pour uploader les fichiers

   - Sanitization automatique
   - Gestion des conflits
   - URLs correctes générées

2. **Nommer les fichiers simplement**

   ```
   ✅ logo-ooredoo.png
   ✅ rapport-incident.pdf
   ✅ video-alerte.mp4
   ```

3. **Utiliser des URLs externes propres**
   ```
   ✅ https://images.unsplash.com/photo-123
   ✅ https://www.youtube.com/watch?v=VIDEO_ID
   ```

### ❌ À ÉVITER

1. **Caractères spéciaux dans les noms**

   ```
   ❌ Logo Ooredoo (Final) v2.png
   ❌ Rapport_Incident_2025.pdf
   ❌ Vidéo Alerte #1.mp4
   ```

2. **Upload manuel dans `/public/media/`**

   - Pas de sanitization
   - Risque d'erreurs
   - URLs non trackées

3. **Noms trop longs**
   ```
   ❌ Ooredoo_Upgrade_Your_World_Logo_Lockup_Red_on_Transparent_Background_RGB_Version_Final.png
   ```

## 🛠️ Commandes Utiles

### Lister les médias dans la DB

```bash
npx tsx scripts/list-media-urls.ts
```

### Nettoyer les noms de fichiers

```bash
npx tsx scripts/clean-media-filenames.ts
```

### Corriger les URLs dans la DB

```bash
npx tsx scripts/fix-media-urls.ts
```

## 🔄 Workflow Recommandé

### Pour l'Animateur

1. **Créer une injection**
2. **Cliquer sur "Sélectionner une image"**
3. **Onglet Bibliothèque** :
   - Upload nouveau fichier (sanitization auto)
   - OU sélectionner fichier existant
4. **Onglet URL** :
   - Coller URL externe (YouTube, Google Drive, etc.)
5. **Le système gère le reste** ✅

### Pour l'Admin

1. **Vérifier régulièrement** les fichiers uploadés :

   ```bash
   ls public/media/images/
   ```

2. **Nettoyer si nécessaire** :

   ```bash
   npx tsx scripts/clean-media-filenames.ts
   ```

3. **Monitorer les erreurs** dans les logs Next.js

## 🎯 Résultat Final

✅ **Plus d'erreurs "Invalid URL"**
✅ **Fichiers correctement nommés**
✅ **Affichage optimal des médias**
✅ **Support des URLs externes**
✅ **Maintenance simplifiée**

## 📞 En Cas de Problème

### Symptôme : Image ne s'affiche pas

**Vérifier** :

1. Le fichier existe dans `/public/media/` ?
2. Le nom du fichier contient des espaces/caractères spéciaux ?
3. L'URL dans la DB correspond au fichier physique ?

**Solution** :

```bash
# 1. Lister les fichiers
ls public/media/images/

# 2. Lister les URLs DB
npx tsx scripts/list-media-urls.ts

# 3. Nettoyer si besoin
npx tsx scripts/clean-media-filenames.ts

# 4. Redémarrer le serveur
npm run dev
```

### Symptôme : "Invalid URL" dans les logs

**Cause** : Nom de fichier avec caractères spéciaux

**Solution immédiate** :

```bash
# Renommer manuellement le fichier
mv "public/media/images/Nom Avec Espaces.png" \
   "public/media/images/nom-sans-espaces.png"

# Mettre à jour l'URL dans la DB via l'interface admin
```

## 🎓 Leçon Apprise

> **Next.js Image est strict sur les noms de fichiers.**
> Toujours utiliser le MediaSelector pour les uploads,
> il gère automatiquement la sanitization !

---

**Date de création** : 22 octobre 2025  
**Dernière mise à jour** : 22 octobre 2025  
**Status** : ✅ Résolu et Documenté
