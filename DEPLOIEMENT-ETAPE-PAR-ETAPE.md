# 🚀 Déploiement Azure - Guide Pas à Pas

**Temps estimé : 15 minutes**

---

## ✅ Étape 1 : Vérifier les Prérequis (2 minutes)

### 1.1 Vérifier Node.js et npm

```bash
node --version
npm --version
```

**✅ Attendu :**

- Node.js : v18.0.0 ou supérieur
- npm : v9.0.0 ou supérieur

---

### 1.2 Vérifier Git

```bash
git --version
```

**✅ Attendu :** `git version 2.x.x` ou supérieur

---

### 1.3 Tester le build local (OPTIONNEL)

```bash
npm run build
```

**✅ Attendu :** Build réussi sans erreurs

**❌ Si erreurs :** Relancez `npm install` puis réessayez

---

## 🗄️ Étape 2 : Créer la Base de Données MongoDB Atlas (5 minutes)

### 2.1 Créer un compte MongoDB Atlas

1. Allez sur **https://www.mongodb.com/cloud/atlas/register**
2. Inscrivez-vous avec votre email étudiant
3. Choisissez le plan **FREE** (M0)

---

### 2.2 Créer un Cluster Gratuit

1. Cliquez sur **"Build a Database"**
2. Sélectionnez **M0 FREE** (512 MB - Shared)
3. Choisissez la région **Europe (Ireland)** ou la plus proche
4. Nommez le cluster : `survive-cluster`
5. Cliquez sur **"Create"**

⏳ **Attendez 1-2 minutes** que le cluster soit créé...

---

### 2.3 Configurer l'Accès Réseau

1. Dans le menu latéral, allez à **"Network Access"**
2. Cliquez sur **"Add IP Address"**
3. Choisissez **"Allow Access from Anywhere"**
4. IP Address : `0.0.0.0/0`
5. Cliquez sur **"Confirm"**

**✅ Important :** Cette configuration permet à Azure d'accéder à votre base de données

---

### 2.4 Créer un Utilisateur Database

1. Dans le menu latéral, allez à **"Database Access"**
2. Cliquez sur **"Add New Database User"**
3. **Username** : `survive_admin`
4. **Password** : Générer un mot de passe fort OU entrez le vôtre
   - ⚠️ **NOTEZ CE MOT DE PASSE** - vous en aurez besoin !
5. **Database User Privileges** : "Read and write to any database"
6. Cliquez sur **"Add User"**

---

### 2.5 Récupérer la Connection String

1. Retournez à **"Database"** dans le menu
2. Cliquez sur **"Connect"** sur votre cluster
3. Choisissez **"Connect your application"**
4. Sélectionnez :
   - **Driver** : Node.js
   - **Version** : 5.5 or later
5. **Copiez la connection string** :

   ```
   mongodb+srv://survive_admin:<password>@survive-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. **IMPORTANT :** Remplacez `<password>` par votre mot de passe réel :
   ```
   mongodb+srv://survive_admin:VOTRE_MOT_DE_PASSE@survive-cluster.xxxxx.mongodb.net/survive?retryWrites=true&w=majority
   ```

**⚠️ Notez cette connection string complète - vous en aurez besoin !**

---

## 💻 Étape 3 : Installer Azure CLI (3 minutes)

### 3.1 Télécharger et Installer

**Windows :**

```powershell
# Ouvrir PowerShell EN TANT QU'ADMINISTRATEUR
winget install -e --id Microsoft.AzureCLI
```

**OU téléchargez depuis :**
https://aka.ms/installazurecliwindows

---

### 3.2 Fermer et Rouvrir le Terminal

⚠️ **IMPORTANT :** Fermez complètement votre terminal et rouvrez-le

---

### 3.3 Vérifier l'Installation

```bash
az --version
```

**✅ Attendu :**

```
azure-cli                         2.x.x
...
```

---

### 3.4 Se Connecter à Azure

```bash
az login
```

**Ce qui va se passer :**

1. Une fenêtre du navigateur va s'ouvrir
2. Connectez-vous avec votre compte étudiant Microsoft
3. Autorisez l'accès
4. Retournez au terminal

**✅ Attendu :** Liste de vos subscriptions Azure

---

## 📦 Étape 4 : Préparer le Projet GitHub (2 minutes)

### 4.1 Vérifier l'état Git

```bash
git status
```

**✅ Si vous voyez des fichiers modifiés, c'est normal**

---

### 4.2 Créer le Repository GitHub

**Option A : Via GitHub Website (RECOMMANDÉ)**

1. Allez sur **https://github.com/new**
2. **Repository name** : `survive-admin`
3. **Visibility** : Private (recommandé pour student pack)
4. **NE PAS** cocher "Initialize with README"
5. Cliquez sur **"Create repository"**
6. **Copiez l'URL** : `https://github.com/VOTRE-USERNAME/survive-admin.git`

---

### 4.3 Pousser le Code vers GitHub

```bash
# Initialiser git si ce n'est pas déjà fait
git init

# Ajouter tous les fichiers
git add .

# Créer le commit
git commit -m "Initial commit - SURVIVE BCM Platform"

# Renommer la branche en main
git branch -M main

# Ajouter le remote (REMPLACEZ VOTRE-USERNAME)
git remote add origin https://github.com/VOTRE-USERNAME/survive-admin.git

# Pousser vers GitHub
git push -u origin main
```

**✅ Attendu :** Code poussé avec succès vers GitHub

**❌ Si erreur d'authentification :**

- Utilisez un Personal Access Token au lieu du mot de passe
- Créez-le sur : https://github.com/settings/tokens

---

## ☁️ Étape 5 : Déployer sur Azure Static Web Apps (3 minutes)

### 5.1 Créer le Groupe de Ressources

```bash
az group create --name survive-rg --location westeurope
```

**✅ Attendu :**

```json
{
  "location": "westeurope",
  "name": "survive-rg",
  ...
}
```

---

### 5.2 Créer la Static Web App

⚠️ **REMPLACEZ `VOTRE-USERNAME` par votre vrai nom d'utilisateur GitHub !**

```bash
az staticwebapp create \
  --name survive-admin \
  --resource-group survive-rg \
  --source https://github.com/VOTRE-USERNAME/survive-admin \
  --location "westeurope" \
  --branch main \
  --app-location "/" \
  --output-location ".next" \
  --login-with-github
```

**Ce qui va se passer :**

1. Une fenêtre du navigateur va s'ouvrir
2. GitHub va demander votre autorisation
3. Cliquez sur **"Authorize Azure-App-Service-Static-Web-Apps"**
4. Retournez au terminal

⏳ **Attendez 1-2 minutes** que la création se termine...

**✅ Attendu :**

```json
{
  "defaultHostname": "survive-admin-xxxx.azurestaticapps.net",
  "name": "survive-admin",
  ...
}
```

**📝 NOTEZ votre URL :** `https://survive-admin-xxxx.azurestaticapps.net`

---

## 🔐 Étape 6 : Configurer les Variables d'Environnement (2 minutes)

### 6.1 Générer NEXTAUTH_SECRET

**Windows PowerShell :**

```powershell
$NEXTAUTH_SECRET = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
echo $NEXTAUTH_SECRET
```

**OU utilisez :** (notez ce secret quelque part)

```
VotreSecretSuperSecurise123456789ABC
```

**📝 NOTEZ ce secret !**

---

### 6.2 Préparer les Variables

**Vous aurez besoin de :**

1. ✅ MONGODB_URI (de l'étape 2.5)
2. ✅ NEXTAUTH_SECRET (de l'étape 6.1)
3. ✅ NEXTAUTH_URL (de l'étape 5.2)

---

### 6.3 Configurer sur Azure

⚠️ **REMPLACEZ les valeurs ci-dessous par VOS valeurs réelles !**

```bash
az staticwebapp appsettings set ^
  --name survive-admin ^
  --resource-group survive-rg ^
  --setting-names ^
    MONGODB_URI="mongodb+srv://survive_admin:VOTRE_PASSWORD@survive-cluster.xxxxx.mongodb.net/survive?retryWrites=true&w=majority" ^
    NEXTAUTH_SECRET="VotreSecretDe32Caracteres" ^
    NEXTAUTH_URL="https://survive-admin-xxxx.azurestaticapps.net" ^
    NODE_ENV="production"
```

**✅ Attendu :**

```json
{
  "properties": {
    "MONGODB_URI": "mongodb+srv://...",
    "NEXTAUTH_SECRET": "...",
    ...
  }
}
```

---

## 🗄️ Étape 7 : Initialiser la Base de Données (2 minutes)

### 7.1 Créer le fichier .env.local

Créez le fichier `.env.local` à la racine du projet :

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://survive_admin:VOTRE_PASSWORD@survive-cluster.xxxxx.mongodb.net/survive?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=VotreSecretDe32Caracteres

# Environment
NODE_ENV=development
```

**⚠️ REMPLACEZ les valeurs par VOS valeurs réelles !**

---

### 7.2 Pousser le Schéma Prisma vers MongoDB

```bash
npx prisma db push
```

**✅ Attendu :**

```
Your database is now in sync with your Prisma schema.
```

**❌ Si erreur de connexion :**

- Vérifiez votre MONGODB_URI
- Vérifiez que `0.0.0.0/0` est autorisé dans Network Access
- Vérifiez que le mot de passe ne contient pas de caractères spéciaux non encodés

---

### 7.3 Initialiser les Données de Test

```bash
npm run db:seed
```

**✅ Attendu :**

```
✅ Database seeded successfully!

📊 Summary:
- Users: 10 created
- Factories: 3 created
- Processes: 15 created
...
```

**📝 NOTEZ les comptes créés :**

```
Admin: admin@survive.com / admin123
Instructor: instructor@survive.com / instructor123
User: user@survive.com / user123
```

---

## 🚀 Étape 8 : Déclencher le Premier Déploiement (2 minutes)

### 8.1 Vérifier le Workflow GitHub Actions

1. Allez sur **https://github.com/VOTRE-USERNAME/survive-admin/actions**
2. Vous devriez voir un workflow en cours : **"Azure Static Web Apps CI/CD"**

⏳ **Attendez 3-5 minutes** que le déploiement se termine...

**✅ Le workflow devrait passer au vert** ✓

---

### 8.2 Forcer un Nouveau Build (si nécessaire)

Si aucun workflow n'apparaît, forcez un redéploiement :

```bash
# Créer un commit vide
git commit --allow-empty -m "Trigger Azure deployment"

# Pousser vers GitHub
git push origin main
```

---

## 🎉 Étape 9 : Tester l'Application (2 minutes)

### 9.1 Ouvrir l'Application

```bash
# Récupérer l'URL et l'ouvrir
az staticwebapp show ^
  --name survive-admin ^
  --resource-group survive-rg ^
  --query "defaultHostname" -o tsv
```

**OU ouvrez directement :**

```
https://survive-admin-xxxx.azurestaticapps.net
```

---

### 9.2 Se Connecter

1. Sur la page de connexion, utilisez :

   ```
   Email: admin@survive.com
   Mot de passe: admin123
   ```

2. ✅ **Vous devriez accéder au dashboard !**

---

### 9.3 Tester la Création d'une Usine

1. Allez dans **BIA** → **Usines**
2. Cliquez sur **"Créer une usine"**
3. Remplissez :
   - Nom : Test Usine Azure
   - Description : Test de déploiement
4. Cliquez sur **"Créer"**
5. ✅ **L'usine devrait être créée !**

---

## ✅ DÉPLOIEMENT RÉUSSI ! 🎉

### Votre application est maintenant en ligne sur :

```
https://survive-admin-xxxx.azurestaticapps.net
```

---

## 📊 Résumé des Ressources Créées

| Ressource            | Type            | Coût           |
| -------------------- | --------------- | -------------- |
| MongoDB Atlas M0     | Base de données | **GRATUIT** ✅ |
| Azure Static Web App | Hébergement     | **GRATUIT** ✅ |
| Azure Resource Group | Container       | **GRATUIT** ✅ |
| GitHub Actions       | CI/CD           | **GRATUIT** ✅ |

**Total : $0.00 / mois** 💰

---

## 🔄 Prochaines Étapes

### Mettre à jour l'application

```bash
# Faire vos modifications
git add .
git commit -m "Mes améliorations"
git push origin main

# ✅ Déploiement automatique en 2-3 minutes !
```

---

### Voir les logs

```bash
# Logs de l'application
az staticwebapp logs show ^
  --name survive-admin ^
  --resource-group survive-rg ^
  --follow
```

---

### Ajouter un domaine personnalisé

```bash
# Si vous avez un domaine (ex: survive-bcm.com)
az staticwebapp hostname set ^
  --name survive-admin ^
  --resource-group survive-rg ^
  --hostname www.survive-bcm.com
```

---

## 🆘 Aide et Dépannage

### Problème : Build échoue

**Vérifier les logs :**

```bash
az staticwebapp logs show --name survive-admin --resource-group survive-rg
```

**OU sur GitHub Actions :**

- https://github.com/VOTRE-USERNAME/survive-admin/actions

---

### Problème : Erreur de connexion MongoDB

**Vérifier :**

1. Network Access → `0.0.0.0/0` autorisé
2. Database User créé avec le bon mot de passe
3. Connection string correcte (sans `<password>`)

**Tester la connexion :**

```bash
# Installer MongoDB Shell
mongosh "mongodb+srv://survive_admin:PASSWORD@survive-cluster.xxxxx.mongodb.net/survive"
```

---

### Problème : Page 404 ou erreur NextAuth

**Vérifier les variables d'environnement :**

```bash
az staticwebapp appsettings list ^
  --name survive-admin ^
  --resource-group survive-rg
```

**Mettre à jour si nécessaire :**

```bash
az staticwebapp appsettings set ^
  --name survive-admin ^
  --resource-group survive-rg ^
  --setting-names NEXTAUTH_URL="https://survive-admin-xxxx.azurestaticapps.net"
```

---

## 🎓 Ressources Utiles

- **Portail Azure :** https://portal.azure.com
- **MongoDB Atlas :** https://cloud.mongodb.com
- **GitHub Actions :** https://github.com/VOTRE-USERNAME/survive-admin/actions
- **Documentation Azure Static Web Apps :** https://docs.microsoft.com/azure/static-web-apps

---

## 🎉 Félicitations !

Votre plateforme **SURVIVE BCM** est maintenant déployée sur Azure avec :

- ✅ Base de données MongoDB Atlas (gratuite)
- ✅ Hébergement Azure Static Web Apps (gratuit)
- ✅ CI/CD automatique via GitHub Actions
- ✅ HTTPS et CDN global
- ✅ $0 de coût mensuel

**Bon développement ! 🚀**
