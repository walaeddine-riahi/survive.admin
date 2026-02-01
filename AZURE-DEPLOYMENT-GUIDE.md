# Guide de Déploiement Azure - SURVIVE BCM Platform

## 🎓 Azure Student Pack - Ressources Disponibles

Avec votre Azure Student Pack, vous avez accès à :

- **$100 de crédit Azure** (renouvelable annuellement)
- **Azure App Service** - Hébergement web gratuit
- **Azure Static Web Apps** - Hébergement gratuit pour applications web modernes
- **Azure Functions** - 1 million d'exécutions gratuites/mois
- **Azure Database for MongoDB** - Tier gratuit disponible
- **Azure Storage** - 5 GB gratuit
- **Pas de carte de crédit requise**

---

## 📋 Prérequis

### 1. Activer votre Azure Student Pack

1. Allez sur [azure.microsoft.com/free/students](https://azure.microsoft.com/free/students)
2. Connectez-vous avec votre email étudiant (@edu ou domaine universitaire)
3. Vérifiez votre statut étudiant
4. Accédez au portail Azure : [portal.azure.com](https://portal.azure.com)

### 2. Installer Azure CLI

**Windows :**

```bash
# Télécharger et installer depuis
# https://aka.ms/installazurecliwindows

# Ou avec winget
winget install -e --id Microsoft.AzureCLI
```

**Vérifier l'installation :**

```bash
az --version
az login
```

### 3. Installer les extensions nécessaires

```bash
# Extension Static Web Apps
az extension add --name staticwebapp

# Extension App Service
az extension add --name webapp
```

---

## 🚀 Option 1 : Déploiement avec Azure Static Web Apps (RECOMMANDÉ)

### ✅ Avantages

- **100% Gratuit** avec Student Pack
- Déploiement automatique depuis GitHub
- CDN global intégré
- HTTPS automatique
- Serverless API avec Azure Functions
- Idéal pour Next.js

### Étapes de déploiement

#### 1. Préparer votre repository GitHub

```bash
# Créer un repo GitHub si ce n'est pas déjà fait
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/survive-admin.git
git push -u origin main
```

#### 2. Configurer la base de données MongoDB

**Option A : MongoDB Atlas (GRATUIT - RECOMMANDÉ)**

1. Allez sur [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un compte gratuit
3. Créez un cluster gratuit (M0 - 512MB)
4. Configurez l'accès réseau : **Allow Access from Anywhere** (0.0.0.0/0)
5. Créez un utilisateur database
6. Récupérez la connection string :
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/survive?retryWrites=true&w=majority
   ```

**Option B : Azure Cosmos DB (MongoDB API)**

```bash
# Créer un groupe de ressources
az group create --name survive-rg --location westeurope

# Créer Cosmos DB avec API MongoDB (Free Tier)
az cosmosdb create \
  --name survive-cosmosdb \
  --resource-group survive-rg \
  --kind MongoDB \
  --server-version 4.2 \
  --enable-free-tier true

# Récupérer la connection string
az cosmosdb keys list \
  --name survive-cosmosdb \
  --resource-group survive-rg \
  --type connection-strings
```

#### 3. Créer le fichier de configuration Azure

Créez `staticwebapp.config.json` à la racine :

```json
{
  "platform": {
    "apiRuntime": "node:18"
  },
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/api/*", "/_next/*", "/images/*"]
  },
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["authenticated", "anonymous"]
    }
  ],
  "responseOverrides": {
    "404": {
      "rewrite": "/404.html"
    }
  }
}
```

#### 4. Modifier next.config.ts pour Static Export

Créez `next.config.azure.ts` :

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    MONGODB_URI: process.env.MONGODB_URI,
  },
};

export default nextConfig;
```

#### 5. Déployer sur Azure Static Web Apps

```bash
# Se connecter à Azure
az login

# Créer Static Web App
az staticwebapp create \
  --name survive-admin \
  --resource-group survive-rg \
  --source https://github.com/VOTRE-USERNAME/survive-admin \
  --location "westeurope" \
  --branch main \
  --app-location "/" \
  --api-location "api" \
  --output-location ".next" \
  --login-with-github
```

#### 6. Configurer les variables d'environnement

```bash
# Via Azure CLI
az staticwebapp appsettings set \
  --name survive-admin \
  --resource-group survive-rg \
  --setting-names \
    MONGODB_URI="mongodb+srv://..." \
    NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
    NEXTAUTH_URL="https://survive-admin.azurestaticapps.net"
```

**Ou via le portail Azure :**

1. Allez sur [portal.azure.com](https://portal.azure.com)
2. Recherchez votre Static Web App `survive-admin`
3. Allez dans **Configuration** → **Application settings**
4. Ajoutez les variables d'environnement :
   - `MONGODB_URI` : votre connection string MongoDB
   - `NEXTAUTH_SECRET` : générer avec `openssl rand -base64 32`
   - `NEXTAUTH_URL` : URL de votre app
   - `AZURE_COMMUNICATION_CONNECTION_STRING` : (optionnel)

#### 7. Initialiser la base de données

```bash
# Sur votre machine locale avec .env configuré
npm run db:push
npm run db:seed
```

---

## 🚀 Option 2 : Déploiement avec Azure App Service

### ✅ Avantages

- Gratuit avec App Service Plan F1 (Student Pack)
- Support complet Node.js/Next.js
- Logs et monitoring intégrés
- Scaling facile

### Étapes de déploiement

#### 1. Créer le App Service

```bash
# Créer un groupe de ressources
az group create --name survive-rg --location westeurope

# Créer un App Service Plan (FREE Tier)
az appservice plan create \
  --name survive-plan \
  --resource-group survive-rg \
  --sku F1 \
  --is-linux

# Créer la Web App
az webapp create \
  --name survive-admin-app \
  --resource-group survive-rg \
  --plan survive-plan \
  --runtime "NODE|18-lts"
```

#### 2. Configurer les variables d'environnement

```bash
az webapp config appsettings set \
  --name survive-admin-app \
  --resource-group survive-rg \
  --settings \
    MONGODB_URI="mongodb+srv://..." \
    NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
    NEXTAUTH_URL="https://survive-admin-app.azurewebsites.net" \
    NODE_ENV="production"
```

#### 3. Configurer le déploiement depuis GitHub

```bash
# Configurer GitHub Actions
az webapp deployment source config \
  --name survive-admin-app \
  --resource-group survive-rg \
  --repo-url https://github.com/VOTRE-USERNAME/survive-admin \
  --branch main \
  --manual-integration
```

#### 4. Créer le workflow GitHub Actions

Créez `.github/workflows/azure-deploy.yml` :

```yaml
name: Deploy to Azure App Service

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build Next.js app
        run: npm run build
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: "survive-admin-app"
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: .
```

#### 5. Récupérer le profil de publication

```bash
# Télécharger le profil de publication
az webapp deployment list-publishing-profiles \
  --name survive-admin-app \
  --resource-group survive-rg \
  --xml
```

Copiez le contenu et ajoutez-le dans GitHub :

1. Allez dans **Settings** → **Secrets and variables** → **Actions**
2. Créez `AZURE_WEBAPP_PUBLISH_PROFILE` avec le contenu XML
3. Ajoutez aussi `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

#### 6. Configurer le startup command

```bash
az webapp config set \
  --name survive-admin-app \
  --resource-group survive-rg \
  --startup-file "npm start"
```

---

## 🚀 Option 3 : Azure Container Apps (Pour plus de contrôle)

### Étapes de déploiement

#### 1. Créer un Dockerfile

Créez `Dockerfile` à la racine :

```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npx prisma generate
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### 2. Modifier next.config.ts

```typescript
const nextConfig: NextConfig = {
  output: "standalone",
  // ... reste de la config
};
```

#### 3. Créer Container Registry et déployer

```bash
# Créer Azure Container Registry
az acr create \
  --name surviveacr \
  --resource-group survive-rg \
  --sku Basic

# Login au registry
az acr login --name surviveacr

# Build et push l'image
az acr build \
  --registry surviveacr \
  --image survive-admin:latest \
  --file Dockerfile .

# Créer Container Apps Environment
az containerapp env create \
  --name survive-env \
  --resource-group survive-rg \
  --location westeurope

# Déployer Container App
az containerapp create \
  --name survive-admin \
  --resource-group survive-rg \
  --environment survive-env \
  --image surviveacr.azurecr.io/survive-admin:latest \
  --target-port 3000 \
  --ingress external \
  --env-vars \
    MONGODB_URI=secretref:mongodb-uri \
    NEXTAUTH_SECRET=secretref:nextauth-secret \
    NEXTAUTH_URL="https://survive-admin.azurecontainerapps.io"

# Ajouter les secrets
az containerapp secret set \
  --name survive-admin \
  --resource-group survive-rg \
  --secrets \
    mongodb-uri="mongodb+srv://..." \
    nextauth-secret="$(openssl rand -base64 32)"
```

---

## 🔐 Configuration de la Sécurité

### 1. Configurer NextAuth.js pour Azure

Modifiez `.env.production` :

```env
NEXTAUTH_URL=https://VOTRE-APP.azurestaticapps.net
NEXTAUTH_SECRET=<généré avec openssl rand -base64 32>
MONGODB_URI=mongodb+srv://...
```

### 2. Configurer les CORS

Dans vos API routes, ajoutez :

```typescript
// src/app/api/middleware.ts
export function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
```

### 3. Configurer Azure AD Authentication (Optionnel)

```bash
# Créer une app registration Azure AD
az ad app create \
  --display-name "Survive Admin" \
  --sign-in-audience AzureADMyOrg
```

---

## 📊 Monitoring et Logs

### Activer Application Insights (GRATUIT avec Student Pack)

```bash
# Créer Application Insights
az monitor app-insights component create \
  --app survive-insights \
  --location westeurope \
  --resource-group survive-rg \
  --application-type web

# Lier à votre app
az monitor app-insights component connect-webapp \
  --app survive-insights \
  --resource-group survive-rg \
  --web-app survive-admin-app
```

### Voir les logs en temps réel

```bash
# Static Web Apps
az staticwebapp logs --name survive-admin --resource-group survive-rg

# App Service
az webapp log tail --name survive-admin-app --resource-group survive-rg
```

---

## 🔄 CI/CD avec GitHub Actions (Setup Complet)

Créez `.github/workflows/azure-static-web-apps.yml` :

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
          lfs: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: ".next"
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

---

## 💰 Optimisation des Coûts (Student Pack)

### Services GRATUITS recommandés :

1. **Static Web Apps** : 100% gratuit

   - 100 GB bandwidth/mois
   - Custom domains gratuit
   - SSL automatique

2. **App Service F1** : Gratuit

   - 1 GB RAM
   - 1 GB stockage
   - 60 minutes CPU/jour
   - Idéal pour développement/démo

3. **MongoDB Atlas M0** : Gratuit

   - 512 MB stockage
   - Shared cluster
   - Suffisant pour 1000+ utilisateurs

4. **Application Insights** : Gratuit
   - 5 GB data/mois inclus

### Éviter les coûts :

```bash
# Toujours utiliser les tiers gratuits
--sku F1  # App Service
--sku Basic  # Container Registry
--enable-free-tier true  # Cosmos DB

# Supprimer les ressources inutilisées
az group delete --name survive-rg --yes
```

---

## 🧪 Tester le Déploiement

### 1. Vérifier l'application

```bash
# Ouvrir dans le navigateur
az staticwebapp show \
  --name survive-admin \
  --resource-group survive-rg \
  --query "defaultHostname" -o tsv | xargs -I {} open https://{}
```

### 2. Tester les API routes

```bash
curl https://survive-admin.azurestaticapps.net/api/health
```

### 3. Vérifier la base de données

```bash
# Se connecter à MongoDB Atlas
mongosh "mongodb+srv://cluster0.xxxxx.mongodb.net/survive" --username <user>

# Vérifier les collections
show collections
db.users.count()
```

---

## 🐛 Résolution de Problèmes

### Problème : Build échoue

```bash
# Vérifier les logs
az staticwebapp logs --name survive-admin --resource-group survive-rg --follow

# Vérifier les variables d'environnement
az staticwebapp appsettings list \
  --name survive-admin \
  --resource-group survive-rg
```

### Problème : Erreur de connexion MongoDB

1. Vérifiez le Network Access dans MongoDB Atlas : `0.0.0.0/0`
2. Vérifiez la connection string (URL encoded password)
3. Testez localement : `mongosh "mongodb+srv://..."`

### Problème : NextAuth erreur

```bash
# Vérifier NEXTAUTH_URL
az staticwebapp appsettings list --name survive-admin --resource-group survive-rg

# Régénérer NEXTAUTH_SECRET
openssl rand -base64 32 | az staticwebapp appsettings set --name survive-admin --resource-group survive-rg --setting-names NEXTAUTH_SECRET=$(cat)
```

---

## 📚 Ressources Supplémentaires

- [Azure Student Pack](https://azure.microsoft.com/free/students)
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps)
- [Next.js on Azure](https://nextjs.org/docs/deployment#azure)
- [MongoDB Atlas Free Tier](https://www.mongodb.com/cloud/atlas/register)
- [Azure Portal](https://portal.azure.com)

---

## 📞 Support

- Azure Support Student : [azure.microsoft.com/support](https://azure.microsoft.com/support)
- Azure Community : [tech.microsoft.com/community](https://techcommunity.microsoft.com)
- MongoDB Community : [mongodb.com/community](https://www.mongodb.com/community)

---

## ✅ Checklist de Déploiement

- [ ] Azure Student Pack activé
- [ ] Azure CLI installé et connecté (`az login`)
- [ ] Repository GitHub créé et pushé
- [ ] MongoDB Atlas cluster créé (M0 Free Tier)
- [ ] Connection string MongoDB récupérée
- [ ] Static Web App ou App Service créé
- [ ] Variables d'environnement configurées
- [ ] GitHub Actions configuré
- [ ] Premier déploiement réussi
- [ ] Base de données initialisée (`npm run db:seed`)
- [ ] Application testée et fonctionnelle
- [ ] Monitoring configuré (Application Insights)
- [ ] Custom domain configuré (optionnel)

---

**🎉 Votre plateforme SURVIVE est maintenant déployée sur Azure !**
