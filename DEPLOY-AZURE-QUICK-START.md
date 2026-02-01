# 🚀 Déploiement Azure Static Web Apps - Guide Rapide (10 minutes)

## ✅ Pourquoi Azure Static Web Apps ?

**C'est le MEILLEUR choix pour votre projet SURVIVE BCM Platform :**

- ✅ **100% GRATUIT** avec Student Pack (pas de limites CPU comme App Service F1)
- ✅ **Le plus SIMPLE** - déploiement automatique depuis GitHub
- ✅ **Le plus RAPIDE** - CDN global intégré pour performance mondiale
- ✅ **PARFAIT pour Next.js** - support natif, pas d'ajustements
- ✅ **CI/CD automatique** - chaque push = déploiement automatique
- ✅ **HTTPS + Custom Domain** - gratuit et automatique
- ✅ **Monitoring inclus** - logs et analytics intégrés

---

## 🎯 Déploiement en 10 minutes

### Étape 1 : Préparer MongoDB (2 minutes)

1. Allez sur **[mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register)**
2. Créez un compte avec votre email étudiant
3. Créez un **cluster gratuit M0** (512MB - suffisant pour des milliers d'utilisateurs)
4. Configurez :
   - **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`)
   - **Database Access** → Add User → Créez un utilisateur avec mot de passe
5. Récupérez la **Connection String** :
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/survive?retryWrites=true&w=majority
   ```

### Étape 2 : Préparer GitHub (1 minute)

```bash
# Si pas encore fait, créer le repo GitHub
git init
git add .
git commit -m "Initial commit - SURVIVE BCM Platform"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/survive-admin.git
git push -u origin main
```

### Étape 3 : Installer Azure CLI (1 minute)

**Windows :**

```bash
# Ouvrir PowerShell en tant qu'administrateur
winget install -e --id Microsoft.AzureCLI
```

Fermer et rouvrir le terminal, puis :

```bash
# Vérifier l'installation
az --version

# Se connecter avec votre compte étudiant
az login
```

### Étape 4 : Créer la Static Web App (2 minutes)

```bash
# Créer le groupe de ressources
az group create --name survive-rg --location westeurope

# Créer la Static Web App avec GitHub
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

**Note :** Une fenêtre du navigateur s'ouvrira pour autoriser GitHub. Acceptez !

### Étape 5 : Configurer les Variables d'Environnement (2 minutes)

```bash
# Générer NEXTAUTH_SECRET
$NEXTAUTH_SECRET = openssl rand -base64 32

# Configurer les variables
az staticwebapp appsettings set `
  --name survive-admin `
  --resource-group survive-rg `
  --setting-names `
    MONGODB_URI="votre-connection-string-mongodb" `
    NEXTAUTH_SECRET="$NEXTAUTH_SECRET" `
    NEXTAUTH_URL="https://survive-admin.azurestaticapps.net" `
    NODE_ENV="production"
```

**Remplacez :**

- `votre-connection-string-mongodb` par votre string MongoDB Atlas
- `VOTRE-USERNAME` par votre nom d'utilisateur GitHub

### Étape 6 : Initialiser la Base de Données (2 minutes)

```bash
# Sur votre machine locale, créer .env.production
echo "MONGODB_URI=votre-connection-string
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
NEXTAUTH_URL=https://survive-admin.azurestaticapps.net" > .env.production

# Pousser le schéma Prisma vers MongoDB
npm run db:push

# Créer les données initiales (utilisateurs, etc.)
npm run db:seed
```

---

## 🎉 C'est Déployé !

Votre application est maintenant en ligne sur :

```
https://survive-admin.azurestaticapps.net
```

### Vérifier le déploiement

```bash
# Ouvrir l'application dans le navigateur
az staticwebapp show \
  --name survive-admin \
  --resource-group survive-rg \
  --query "defaultHostname" -o tsv
```

---

## 🔧 Configuration Automatique GitHub Actions

Azure a automatiquement créé `.github/workflows/azure-static-web-apps-xxx.yml` dans votre repo !

**Chaque fois que vous faites `git push` :**

1. GitHub Actions build automatiquement
2. Tests exécutés
3. Déploiement automatique sur Azure
4. ✅ Application mise à jour en 2-3 minutes

---

## 📊 Voir les Logs et Monitoring

### Option 1 : Via Azure CLI

```bash
# Voir les logs en temps réel
az staticwebapp logs show \
  --name survive-admin \
  --resource-group survive-rg \
  --follow
```

### Option 2 : Via le Portail Azure

1. Allez sur [portal.azure.com](https://portal.azure.com)
2. Recherchez "survive-admin"
3. **Monitoring** → Logs, Metrics, Application Insights

---

## 🌐 Ajouter un Nom de Domaine Personnalisé (OPTIONNEL)

Si vous avez un domaine (ex: `survive-bcm.com`) :

```bash
# Ajouter le custom domain
az staticwebapp hostname set \
  --name survive-admin \
  --resource-group survive-rg \
  --hostname www.survive-bcm.com
```

Azure configure automatiquement :

- ✅ HTTPS/SSL
- ✅ Certificat gratuit
- ✅ Redirection HTTP → HTTPS

---

## 🔐 Connexion à l'Application

### Compte par défaut (créé par seed.ts) :

**Administrateur :**

```
Email: admin@survive.com
Mot de passe: admin123
```

**Instructeur :**

```
Email: instructor@survive.com
Mot de passe: instructor123
```

**Utilisateur :**

```
Email: user@survive.com
Mot de passe: user123
```

⚠️ **IMPORTANT :** Changez ces mots de passe immédiatement après le premier login !

---

## 🔄 Mettre à Jour l'Application

```bash
# Faire vos modifications
git add .
git commit -m "Amélioration des fonctionnalités BIA"
git push

# ✅ Déploiement automatique en 2-3 minutes !
```

---

## 📱 Tester l'Application

### 1. Vérifier la santé de l'API

```bash
curl https://survive-admin.azurestaticapps.net/api/health
```

### 2. Se connecter à l'interface

1. Ouvrir `https://survive-admin.azurestaticapps.net`
2. Se connecter avec un compte de test
3. Tester la création d'une usine BIA
4. Tester la génération de rapports

### 3. Vérifier MongoDB

```bash
# Se connecter à MongoDB
mongosh "mongodb+srv://cluster0.xxxxx.mongodb.net/survive" --username <votre-user>

# Vérifier les données
use survive
show collections
db.users.count()
db.factories.count()
```

---

## 💰 Coûts et Limites (Student Pack)

### ✅ Inclus GRATUITEMENT :

| Service              | Gratuit | Limite                |
| -------------------- | ------- | --------------------- |
| **Static Web Apps**  | ✅ 100% | 100 GB bandwidth/mois |
| **MongoDB Atlas M0** | ✅ 100% | 512 MB stockage       |
| **GitHub Actions**   | ✅ 100% | 2000 minutes/mois     |
| **Custom Domain**    | ✅ 100% | Illimité              |
| **HTTPS/SSL**        | ✅ 100% | Automatique           |
| **CDN Global**       | ✅ 100% | Inclus                |

**Total : $0/mois** 🎉

---

## 🐛 Résolution de Problèmes

### Problème 1 : Build échoue

```bash
# Voir les logs du dernier build
az staticwebapp logs show --name survive-admin --resource-group survive-rg

# Vérifier le workflow GitHub Actions
# Aller sur https://github.com/VOTRE-USERNAME/survive-admin/actions
```

**Solution :** Vérifiez que les variables d'environnement sont bien configurées

### Problème 2 : Erreur de connexion MongoDB

```bash
# Vérifier la connection string
az staticwebapp appsettings list --name survive-admin --resource-group survive-rg

# Tester la connexion depuis votre machine
mongosh "votre-connection-string"
```

**Solution :**

1. Vérifiez que l'IP `0.0.0.0/0` est autorisée dans MongoDB Atlas
2. Vérifiez que le mot de passe ne contient pas de caractères spéciaux non encodés

### Problème 3 : 404 sur les pages

**Solution :** Next.js nécessite parfois une configuration spéciale. Créez `staticwebapp.config.json` :

```json
{
  "navigationFallback": {
    "rewrite": "/index.html"
  },
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    }
  ]
}
```

Puis redéployez :

```bash
git add staticwebapp.config.json
git commit -m "Add staticwebapp config"
git push
```

### Problème 4 : NextAuth erreur

```bash
# Vérifier que NEXTAUTH_URL est correct
az staticwebapp appsettings list --name survive-admin --resource-group survive-rg | grep NEXTAUTH

# Régénérer le secret si nécessaire
az staticwebapp appsettings set \
  --name survive-admin \
  --resource-group survive-rg \
  --setting-names NEXTAUTH_SECRET="$(openssl rand -base64 32)"
```

---

## 📚 Ressources Utiles

### Documentation

- [Azure Static Web Apps](https://docs.microsoft.com/azure/static-web-apps)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas](https://docs.mongodb.com/atlas)
- [Azure Student Pack](https://azure.microsoft.com/free/students)

### Support

- **Azure Support Étudiant** : [Portal Support](https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade)
- **MongoDB Support** : [Community Forums](https://www.mongodb.com/community/forums)
- **GitHub Actions** : [Workflow Logs](https://github.com/VOTRE-USERNAME/survive-admin/actions)

---

## 🎓 Conseils pour Optimiser

### 1. Activer Application Insights (Monitoring Avancé - GRATUIT)

```bash
# Créer Application Insights
az monitor app-insights component create \
  --app survive-insights \
  --location westeurope \
  --resource-group survive-rg \
  --application-type web

# Récupérer la clé d'instrumentation
az monitor app-insights component show \
  --app survive-insights \
  --resource-group survive-rg \
  --query instrumentationKey -o tsv

# L'ajouter aux settings
az staticwebapp appsettings set \
  --name survive-admin \
  --resource-group survive-rg \
  --setting-names APPINSIGHTS_INSTRUMENTATIONKEY="la-clé-obtenue"
```

### 2. Configurer des Environnements (Staging + Production)

```bash
# Créer un environnement de staging
az staticwebapp environment create \
  --name survive-admin \
  --resource-group survive-rg \
  --environment-name staging \
  --source https://github.com/VOTRE-USERNAME/survive-admin \
  --branch develop
```

### 3. Ajouter des Alertes

Dans le portail Azure → survive-admin → Monitoring → Alerts :

- Alerte si downtime > 5 minutes
- Alerte si erreurs > 10/heure
- Alerte si bandwidth > 90 GB/mois

---

## ✅ Checklist Finale

- [x] Azure Student Pack activé
- [x] MongoDB Atlas cluster M0 créé
- [x] GitHub repository créé et pushé
- [x] Azure CLI installé et connecté
- [x] Static Web App créée
- [x] Variables d'environnement configurées
- [x] Base de données initialisée (db:push + db:seed)
- [x] Premier déploiement réussi
- [x] Application accessible via HTTPS
- [x] Connexion avec les comptes de test réussie
- [x] GitHub Actions workflow fonctionnel

---

## 🎉 Félicitations !

Votre plateforme **SURVIVE BCM** est maintenant déployée sur Azure avec :

- ✅ **Performance mondiale** (CDN global)
- ✅ **Sécurité maximale** (HTTPS automatique)
- ✅ **Déploiement continu** (Git push = mise à jour auto)
- ✅ **Coût ZÉRO** (100% gratuit avec Student Pack)
- ✅ **Scalabilité automatique** (supporte des milliers d'utilisateurs)

**URL de votre application :**

```
https://survive-admin.azurestaticapps.net
```

---

## 📞 Besoin d'Aide ?

Si vous rencontrez un problème :

1. **Vérifiez les logs** : `az staticwebapp logs show --name survive-admin --resource-group survive-rg`
2. **Consultez GitHub Actions** : https://github.com/VOTRE-USERNAME/survive-admin/actions
3. **Portail Azure** : https://portal.azure.com
4. **MongoDB Atlas** : https://cloud.mongodb.com

**Bon déploiement ! 🚀**
