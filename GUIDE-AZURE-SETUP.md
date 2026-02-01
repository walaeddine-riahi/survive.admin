# 🚀 Guide Complet de Configuration Azure

## 📋 Prérequis

1. **Compte Azure for Students**

   - Créez un compte sur: https://azure.microsoft.com/students
   - $100 de crédits gratuits

2. **Azure CLI installé**

   - Windows: `winget install -e --id Microsoft.AzureCLI`
   - Mac: `brew install azure-cli`
   - Linux: https://docs.microsoft.com/cli/azure/install-azure-cli-linux

3. **PowerShell 7+ (Windows uniquement)**
   - `winget install --id Microsoft.PowerShell --source winget`

## 🎯 Option 1: Configuration Automatique (Recommandé)

### Sur Windows (PowerShell):

```powershell
cd c:\Users\Raouf\Desktop\survive.admin
.\scripts\setup-azure-resources.ps1
```

### Sur Mac/Linux (Bash):

```bash
cd /path/to/survive.admin
chmod +x scripts/setup-azure-resources.sh
./scripts/setup-azure-resources.sh
```

Le script va:

- ✅ Créer toutes les ressources Azure
- ✅ Générer un fichier `.env.azure` avec toutes les clés
- ✅ Configurer les services automatiquement

**Après l'exécution:**

1. Copiez le contenu de `.env.azure` dans votre `.env`
2. Redémarrez votre serveur: `pnpm dev`

---

## 🔧 Option 2: Configuration Manuelle

### 1. Connexion à Azure

```bash
az login
```

### 2. Créer un Resource Group

```bash
az group create \
  --name survive-admin-rg \
  --location eastus
```

### 3. Azure Storage (Pour uploads de fichiers)

```bash
# Créer le Storage Account
az storage account create \
  --name surviveadminstorage \
  --resource-group survive-admin-rg \
  --location eastus \
  --sku Standard_LRS

# Créer le conteneur
az storage container create \
  --name uploads \
  --account-name surviveadminstorage

# Récupérer la connection string
az storage account show-connection-string \
  --name surviveadminstorage \
  --resource-group survive-admin-rg
```

Ajoutez dans `.env`:

```env
AZURE_STORAGE_CONNECTION_STRING="<votre-connection-string>"
AZURE_STORAGE_CONTAINER_NAME="uploads"
```

### 4. Azure Cosmos DB (Base de données MongoDB)

```bash
# Créer Cosmos DB
az cosmosdb create \
  --name survive-cosmosdb \
  --resource-group survive-admin-rg \
  --kind MongoDB \
  --server-version "4.2" \
  --enable-free-tier true

# Récupérer la connection string
az cosmosdb keys list \
  --name survive-cosmosdb \
  --resource-group survive-admin-rg \
  --type connection-strings
```

Ajoutez dans `.env`:

```env
DATABASE_URL="<cosmos-connection-string>/myapp?retryWrites=true&w=majority"
```

### 5. Azure OpenAI (IA)

⚠️ **Important**: Azure OpenAI nécessite une demande d'accès

1. Visitez: https://aka.ms/oai/access
2. Remplissez le formulaire
3. Attendez l'approbation (généralement 1-2 jours)

**Après approbation:**

```bash
# Créer la ressource
az cognitiveservices account create \
  --name survive-openai \
  --resource-group survive-admin-rg \
  --kind OpenAI \
  --sku S0 \
  --location eastus

# Déployer GPT-4
az cognitiveservices account deployment create \
  --name survive-openai \
  --resource-group survive-admin-rg \
  --deployment-name gpt-4 \
  --model-name gpt-4 \
  --model-version "0613" \
  --model-format OpenAI

# Récupérer les clés
az cognitiveservices account keys list \
  --name survive-openai \
  --resource-group survive-admin-rg

# Récupérer l'endpoint
az cognitiveservices account show \
  --name survive-openai \
  --resource-group survive-admin-rg \
  --query "properties.endpoint"
```

Ajoutez dans `.env`:

```env
AZURE_OPENAI_API_KEY="<votre-clé>"
AZURE_OPENAI_ENDPOINT="https://survive-openai.openai.azure.com/"
AZURE_OPENAI_DEPLOYMENT="gpt-4"
AZURE_OPENAI_API_VERSION="2024-02-15-preview"
```

### 6. Azure Communication Services (Email & SMS)

```bash
# Créer le service
az communication create \
  --name survive-communication \
  --resource-group survive-admin-rg \
  --location global \
  --data-location UnitedStates

# Récupérer la connection string
az communication list-key \
  --name survive-communication \
  --resource-group survive-admin-rg
```

Ajoutez dans `.env`:

```env
AZURE_COMMUNICATION_CONNECTION_STRING="<votre-connection-string>"
AZURE_COMMUNICATION_EMAIL_FROM="donotreply@yourdomain.com"
```

**Configuration des emails:**

1. Allez sur: https://portal.azure.com
2. Trouvez votre Communication Service
3. Allez dans "Domains" → "Add domain"
4. Vérifiez votre domaine avec les DNS records

---

## 🧪 Tester la Configuration

### Test Azure Storage:

```typescript
import { azureStorage } from "@/lib/azure-storage";

// Dans une API route ou action
const file = request.formData().get("file");
const url = await azureStorage.uploadFile(file, "test.pdf", "test-folder");
console.log("File uploaded:", url);
```

### Test Azure OpenAI:

```typescript
import { aiService } from "@/lib/azure-ai-service";

const response = await aiService.chat("Bonjour, comment ça va?");
console.log("AI Response:", response);
```

### Test Azure Communication (Email):

```typescript
import { azureCommunication } from "@/lib/azure-communication";

await azureCommunication.sendEmail({
  to: "test@example.com",
  subject: "Test Email",
  htmlContent: "<h1>Test</h1>",
});
```

---

## 💰 Gestion des Coûts

Avec Azure for Students ($100 gratuits):

### Services Gratuits (Tier gratuit):

- ✅ Cosmos DB: 400 RU/s gratuits
- ✅ Azure Functions: 1M exécutions/mois
- ✅ App Service: 10 apps gratuites
- ✅ Storage: 5 GB gratuits

### Services Payants:

- 💰 Azure OpenAI: ~$0.03 par 1K tokens
- 💰 Communication Services Email: $0.00025 par email
- 💰 Communication Services SMS: Variable selon destination

### Surveiller vos coûts:

```bash
# Voir la consommation actuelle
az consumption usage list --output table

# Créer une alerte budget
az consumption budget create \
  --budget-name survive-budget \
  --amount 50 \
  --time-grain Monthly \
  --time-period-start 2026-01-01 \
  --time-period-end 2026-12-31
```

---

## 🔍 Vérification de la Configuration

Après configuration, vérifiez que tout fonctionne:

```bash
# Depuis le dossier du projet
cd c:\Users\Raouf\Desktop\survive.admin

# Installer les dépendances si nécessaire
pnpm install

# Vérifier les variables d'environnement
node -e "require('dotenv').config(); console.log('✅ Env loaded:', Object.keys(process.env).filter(k => k.includes('AZURE')))"

# Démarrer le serveur
pnpm dev
```

---

## ❓ Dépannage

### Erreur: "Subscription not found"

```bash
az account list
az account set --subscription <votre-subscription-id>
```

### Erreur: "Location not available"

```bash
az account list-locations --output table
# Utilisez une location disponible
```

### Azure OpenAI non disponible

- Vérifiez votre demande d'accès
- Alternative temporaire: gardez Google Gemini dans `.env`

### Communication Services - Email ne fonctionne pas

- Vérifiez que votre domaine est vérifié
- Les emails peuvent prendre quelques minutes au début

---

## 📚 Ressources Utiles

- [Azure Portal](https://portal.azure.com)
- [Azure for Students](https://azure.microsoft.com/students)
- [Documentation Azure OpenAI](https://learn.microsoft.com/azure/ai-services/openai/)
- [Documentation Azure Storage](https://learn.microsoft.com/azure/storage/)
- [Documentation Communication Services](https://learn.microsoft.com/azure/communication-services/)

---

## 🎓 Pour Aller Plus Loin

### Déploiement sur Azure:

1. **Azure Static Web Apps** (Recommandé pour Next.js):

   ```bash
   npm install -g @azure/static-web-apps-cli
   swa init
   swa deploy
   ```

2. **Azure App Service**:
   ```bash
   az webapp create \
     --name survive-admin \
     --resource-group survive-admin-rg \
     --runtime "NODE:18-lts"
   ```

---

Besoin d'aide? Consultez le fichier [AZURE-SETUP-GUIDE.md](AZURE-SETUP-GUIDE.md) pour plus de détails!
