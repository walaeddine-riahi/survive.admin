# 🔷 Configuration Azure pour Azure Student Pack

Ce projet a été configuré pour utiliser les services Azure disponibles avec votre Azure for Students.

## 📋 Services Azure Configurés

### 1. **Azure OpenAI** (Remplace Google Gemini)

- Service IA pour l'analyse BIA et le chatbot
- Créé: `src/lib/azure-ai-service.ts`
- Variables requises dans `.env`:
  ```env
  AZURE_OPENAI_API_KEY=your-key
  AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
  AZURE_OPENAI_DEPLOYMENT=gpt-4
  AZURE_OPENAI_API_VERSION=2024-02-15-preview
  ```

### 2. **Azure Blob Storage** (Pour uploads de fichiers)

- Remplace le stockage local des fichiers
- Créé: `src/lib/azure-storage.ts`
- Variables requises:
  ```env
  AZURE_STORAGE_CONNECTION_STRING=your-connection-string
  AZURE_STORAGE_CONTAINER_NAME=uploads
  ```

### 3. **Azure Communication Services** (Remplace Twilio + Nodemailer)

- Emails et SMS unifiés
- Créé: `src/lib/azure-communication.ts`
- Variables requises:
  ```env
  AZURE_COMMUNICATION_CONNECTION_STRING=your-connection-string
  AZURE_COMMUNICATION_EMAIL_FROM=donotreply@yourdomain.com
  AZURE_COMMUNICATION_PHONE_NUMBER=+your-number
  ```

## 🚀 Prochaines Étapes

### 1. Créer les Ressources Azure

#### a) Azure OpenAI

```bash
# Via Azure CLI
az cognitiveservices account create \
  --name survive-openai \
  --resource-group survive-rg \
  --kind OpenAI \
  --sku S0 \
  --location eastus

# Déployer le modèle
az cognitiveservices account deployment create \
  --name survive-openai \
  --resource-group survive-rg \
  --deployment-name gpt-4 \
  --model-name gpt-4 \
  --model-version "0613" \
  --model-format OpenAI \
  --scale-settings-scale-type "Standard"
```

#### b) Azure Storage

```bash
az storage account create \
  --name surviveadminstorage \
  --resource-group survive-rg \
  --location eastus \
  --sku Standard_LRS

# Créer le conteneur
az storage container create \
  --name uploads \
  --account-name surviveadminstorage
```

#### c) Azure Communication Services

```bash
az communication create \
  --name survive-communication \
  --resource-group survive-rg \
  --location global \
  --data-location UnitedStates
```

### 2. Récupérer les Clés de Connexion

```bash
# OpenAI
az cognitiveservices account keys list \
  --name survive-openai \
  --resource-group survive-rg

# Storage
az storage account show-connection-string \
  --name surviveadminstorage \
  --resource-group survive-rg

# Communication Services
az communication list-key \
  --name survive-communication \
  --resource-group survive-rg
```

### 3. Mettre à Jour `.env`

Copiez les clés obtenues dans votre fichier `.env`.

### 4. Option: Utiliser Azure Cosmos DB

Pour remplacer MongoDB Atlas par Cosmos DB (API MongoDB):

```bash
az cosmosdb create \
  --name survive-cosmosdb \
  --resource-group survive-rg \
  --kind MongoDB \
  --server-version 4.2 \
  --default-consistency-level Session

# Récupérer la chaîne de connexion
az cosmosdb keys list \
  --name survive-cosmosdb \
  --resource-group survive-rg \
  --type connection-strings
```

Puis mettre à jour `DATABASE_URL` dans `.env`:

```env
DATABASE_URL="mongodb://survive-cosmosdb:KEY@survive-cosmosdb.mongo.cosmos.azure.com:10255/myapp?ssl=true&retrywrites=false"
```

## 📦 Packages Installés

- `@azure/storage-blob` - Stockage de fichiers
- `@azure/openai` - IA Azure OpenAI
- `@azure/communication-email` - Envoi d'emails
- `@azure/communication-sms` - Envoi de SMS

## 🔄 Migration des Anciennes APIs

Les anciens services restent fonctionnels pour la rétro-compatibilité:

- Twilio (SMS)
- Nodemailer (Email)
- Google Gemini (IA)

Pour une migration complète:

1. Configurez les services Azure
2. Testez les nouvelles APIs
3. Supprimez les anciennes clés de `.env`

## 💰 Crédits Azure for Students

Avec votre compte Azure for Students, vous avez:

- ✅ $100 de crédits gratuits
- ✅ Cosmos DB gratuit (400 RU/s)
- ✅ Azure Functions gratuit (1M exécutions/mois)
- ✅ App Service gratuit (10 apps)
- ✅ 5 GB de stockage blob
- ✅ Azure OpenAI (avec quota)

## 📝 Utilisation dans le Code

### Upload de Fichier

```typescript
import { azureStorage } from "@/lib/azure-storage";

const url = await azureStorage.uploadFile(file, "report.pdf", "bia-reports");
```

### IA

```typescript
import { aiService } from "@/lib/azure-ai-service";

const response = await aiService.chat("Analyse ce rapport BIA");
```

### Email

```typescript
import { azureCommunication } from "@/lib/azure-communication";

await azureCommunication.sendEmail({
  to: "user@example.com",
  subject: "Test",
  htmlContent: "<h1>Hello</h1>",
});
```

### SMS

```typescript
await azureCommunication.sendSms({
  to: "+33612345678",
  message: "Votre code: 1234",
});
```

## 🆘 Support

- Documentation Azure: https://docs.microsoft.com/azure
- Azure Portal: https://portal.azure.com
- Azure for Students: https://azure.microsoft.com/students
