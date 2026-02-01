# Script PowerShell de configuration automatique des ressources Azure
# Pour Azure for Students (Windows)
# Exécuter avec: .\setup-azure-resources.ps1

$ErrorActionPreference = "Stop"

Write-Host "🔷 Configuration des Ressources Azure pour S.U.R.V.I.V.E. Admin" -ForegroundColor Blue
Write-Host "================================================================" -ForegroundColor Blue
Write-Host ""

# Variables de configuration
$ResourceGroup = "survive-admin-rg"
$Location = "eastus"
$StorageAccount = "surviveadminstorage"
$CosmosDBAccount = "survive-cosmosdb"
$OpenAIAccount = "survive-openai"
$CommunicationService = "survive-communication"

Write-Host "📋 Configuration:" -ForegroundColor Blue
Write-Host "  Resource Group: $ResourceGroup"
Write-Host "  Location: $Location"
Write-Host "  Storage: $StorageAccount"
Write-Host ""

# Vérifier que Azure CLI est installé
try {
    az version | Out-Null
} catch {
    Write-Host "❌ Azure CLI n'est pas installé" -ForegroundColor Red
    Write-Host "Installez-le depuis: https://docs.microsoft.com/cli/azure/install-azure-cli" -ForegroundColor Yellow
    exit 1
}

# Connexion à Azure
Write-Host "🔐 Connexion à Azure..." -ForegroundColor Yellow
az login --use-device-code

# Sélectionner l'abonnement
Write-Host "📊 Sélection de l'abonnement..." -ForegroundColor Yellow
az account list --output table
Write-Host ""
$SubscriptionId = Read-Host "Entrez l'ID de votre abonnement Azure for Students"
az account set --subscription $SubscriptionId

Write-Host "✅ Abonnement configuré" -ForegroundColor Green
Write-Host ""

# Créer le Resource Group
Write-Host "📦 Création du Resource Group..." -ForegroundColor Yellow
$groupExists = az group exists --name $ResourceGroup
if ($groupExists -eq "true") {
    Write-Host "Resource Group existe déjà" -ForegroundColor Yellow
} else {
    az group create --name $ResourceGroup --location $Location
    Write-Host "✅ Resource Group créé" -ForegroundColor Green
}
Write-Host ""

# 1. Azure Storage Account
Write-Host "💾 Création du Storage Account..." -ForegroundColor Yellow
az storage account create `
    --name $StorageAccount `
    --resource-group $ResourceGroup `
    --location $Location `
    --sku Standard_LRS `
    --kind StorageV2

# Créer le conteneur
$StorageKey = (az storage account keys list `
    --account-name $StorageAccount `
    --resource-group $ResourceGroup `
    --query "[0].value" -o tsv)

az storage container create `
    --name "uploads" `
    --account-name $StorageAccount `
    --account-key $StorageKey `
    --public-access blob

$StorageConnectionString = (az storage account show-connection-string `
    --name $StorageAccount `
    --resource-group $ResourceGroup `
    --query "connectionString" -o tsv)

Write-Host "✅ Storage Account créé" -ForegroundColor Green
Write-Host ""

# 2. Azure Cosmos DB
Write-Host "🗄️  Création de Cosmos DB (MongoDB)..." -ForegroundColor Yellow
az cosmosdb create `
    --name $CosmosDBAccount `
    --resource-group $ResourceGroup `
    --kind MongoDB `
    --server-version "4.2" `
    --default-consistency-level Session `
    --locations regionName=$Location failoverPriority=0 isZoneRedundant=False `
    --enable-free-tier true

$CosmosDBConnectionString = (az cosmosdb keys list `
    --name $CosmosDBAccount `
    --resource-group $ResourceGroup `
    --type connection-strings `
    --query "connectionStrings[0].connectionString" -o tsv)

Write-Host "✅ Cosmos DB créé" -ForegroundColor Green
Write-Host ""

# 3. Azure OpenAI
Write-Host "🤖 Création d'Azure OpenAI..." -ForegroundColor Yellow
Write-Host "⚠️  Note: Azure OpenAI nécessite une demande d'accès" -ForegroundColor Yellow
Write-Host "Visitez: https://aka.ms/oai/access" -ForegroundColor Yellow
Write-Host ""

$hasOpenAI = Read-Host "Avez-vous accès à Azure OpenAI? (y/n)"

if ($hasOpenAI -eq "y") {
    az cognitiveservices account create `
        --name $OpenAIAccount `
        --resource-group $ResourceGroup `
        --kind OpenAI `
        --sku S0 `
        --location $Location `
        --yes

    az cognitiveservices account deployment create `
        --name $OpenAIAccount `
        --resource-group $ResourceGroup `
        --deployment-name gpt-4 `
        --model-name gpt-4 `
        --model-version "0613" `
        --model-format OpenAI `
        --sku-capacity 10 `
        --sku-name "Standard"

    $OpenAIKey = (az cognitiveservices account keys list `
        --name $OpenAIAccount `
        --resource-group $ResourceGroup `
        --query "key1" -o tsv)

    $OpenAIEndpoint = (az cognitiveservices account show `
        --name $OpenAIAccount `
        --resource-group $ResourceGroup `
        --query "properties.endpoint" -o tsv)

    Write-Host "✅ Azure OpenAI créé" -ForegroundColor Green
} else {
    Write-Host "⚠️  Azure OpenAI ignoré" -ForegroundColor Yellow
    $OpenAIKey = "your-azure-openai-key"
    $OpenAIEndpoint = "https://your-resource.openai.azure.com/"
}
Write-Host ""

# 4. Azure Communication Services
Write-Host "📧 Création d'Azure Communication Services..." -ForegroundColor Yellow
az communication create `
    --name $CommunicationService `
    --resource-group $ResourceGroup `
    --location "global" `
    --data-location "UnitedStates"

$CommunicationConnectionString = (az communication list-key `
    --name $CommunicationService `
    --resource-group $ResourceGroup `
    --query "primaryConnectionString" -o tsv)

Write-Host "✅ Communication Services créé" -ForegroundColor Green
Write-Host ""

# Créer le fichier .env.azure
Write-Host "📝 Création du fichier .env.azure..." -ForegroundColor Yellow

$envContent = @"
# Configuration Azure générée automatiquement
# Date: $(Get-Date)

# Azure Cosmos DB (MongoDB)
DATABASE_URL="${CosmosDBConnectionString}myapp?retryWrites=true&w=majority"

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING="$StorageConnectionString"
AZURE_STORAGE_CONTAINER_NAME="uploads"

# Azure OpenAI
AZURE_OPENAI_API_KEY="$OpenAIKey"
AZURE_OPENAI_ENDPOINT="$OpenAIEndpoint"
AZURE_OPENAI_DEPLOYMENT="gpt-4"
AZURE_OPENAI_API_VERSION="2024-02-15-preview"

# Azure Communication Services
AZURE_COMMUNICATION_CONNECTION_STRING="$CommunicationConnectionString"
AZURE_COMMUNICATION_EMAIL_FROM="donotreply@yourdomain.com"

# Autres configurations à conserver de .env
NEXTAUTH_SECRET="votre-secret-jwt"
NEXTAUTH_URL="http://localhost:3002"
NEXT_PUBLIC_APP_URL="http://localhost:3002"
"@

$envContent | Out-File -FilePath ".env.azure" -Encoding UTF8

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "✅ Configuration Azure terminée !" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Résumé des ressources créées:" -ForegroundColor Blue
Write-Host "  ✅ Resource Group: $ResourceGroup"
Write-Host "  ✅ Storage Account: $StorageAccount"
Write-Host "  ✅ Cosmos DB: $CosmosDBAccount"
if ($hasOpenAI -eq "y") {
    Write-Host "  ✅ Azure OpenAI: $OpenAIAccount"
} else {
    Write-Host "  ⚠️  Azure OpenAI: Non configuré (demande d'accès requise)"
}
Write-Host "  ✅ Communication Services: $CommunicationService"
Write-Host ""
Write-Host "📄 Les clés ont été enregistrées dans: .env.azure" -ForegroundColor Blue
Write-Host ""
Write-Host "🔧 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "  1. Copiez le contenu de .env.azure dans votre fichier .env"
Write-Host "  2. Configurez NEXTAUTH_SECRET avec une valeur aléatoire"
Write-Host "  3. Pour Azure OpenAI, demandez l'accès: https://aka.ms/oai/access"
Write-Host "  4. Pour les emails, configurez un domaine vérifié dans Communication Services"
Write-Host ""
Write-Host "🎉 Votre projet est prêt à utiliser Azure !" -ForegroundColor Green
