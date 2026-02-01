#!/bin/bash

# Script de configuration automatique des ressources Azure
# Pour Azure for Students
# Exécuter avec: bash setup-azure-resources.sh

set -e  # Arrêter en cas d'erreur

echo "🔷 Configuration des Ressources Azure pour S.U.R.V.I.V.E. Admin"
echo "================================================================"
echo ""

# Variables de configuration
RESOURCE_GROUP="survive-admin-rg"
LOCATION="eastus"
STORAGE_ACCOUNT="surviveadminstorage"
COSMOSDB_ACCOUNT="survive-cosmosdb"
OPENAI_ACCOUNT="survive-openai"
COMMUNICATION_SERVICE="survive-communication"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo "  Storage: $STORAGE_ACCOUNT"
echo ""

# Vérifier que Azure CLI est installé
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI n'est pas installé"
    echo "Installez-le depuis: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

# Connexion à Azure
echo -e "${YELLOW}🔐 Connexion à Azure...${NC}"
az login --use-device-code

# Sélectionner l'abonnement Azure for Students
echo -e "${YELLOW}📊 Sélection de l'abonnement...${NC}"
az account list --output table
echo ""
read -p "Entrez l'ID de votre abonnement Azure for Students: " SUBSCRIPTION_ID
az account set --subscription "$SUBSCRIPTION_ID"

echo -e "${GREEN}✅ Abonnement configuré${NC}"
echo ""

# Créer le Resource Group
echo -e "${YELLOW}📦 Création du Resource Group...${NC}"
if az group exists --name "$RESOURCE_GROUP" | grep -q "true"; then
    echo "Resource Group existe déjà"
else
    az group create \
        --name "$RESOURCE_GROUP" \
        --location "$LOCATION"
    echo -e "${GREEN}✅ Resource Group créé${NC}"
fi
echo ""

# 1. Azure Storage Account
echo -e "${YELLOW}💾 Création du Storage Account...${NC}"
az storage account create \
    --name "$STORAGE_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --sku Standard_LRS \
    --kind StorageV2

# Créer le conteneur uploads
STORAGE_KEY=$(az storage account keys list \
    --account-name "$STORAGE_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --query "[0].value" -o tsv)

az storage container create \
    --name "uploads" \
    --account-name "$STORAGE_ACCOUNT" \
    --account-key "$STORAGE_KEY" \
    --public-access blob

STORAGE_CONNECTION_STRING=$(az storage account show-connection-string \
    --name "$STORAGE_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --query "connectionString" -o tsv)

echo -e "${GREEN}✅ Storage Account créé${NC}"
echo ""

# 2. Azure Cosmos DB (MongoDB API)
echo -e "${YELLOW}🗄️  Création de Cosmos DB (MongoDB)...${NC}"
az cosmosdb create \
    --name "$COSMOSDB_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --kind MongoDB \
    --server-version "4.2" \
    --default-consistency-level Session \
    --locations regionName="$LOCATION" failoverPriority=0 isZoneRedundant=False \
    --enable-free-tier true

# Récupérer la connection string
COSMOSDB_CONNECTION_STRING=$(az cosmosdb keys list \
    --name "$COSMOSDB_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --type connection-strings \
    --query "connectionStrings[0].connectionString" -o tsv)

echo -e "${GREEN}✅ Cosmos DB créé${NC}"
echo ""

# 3. Azure OpenAI
echo -e "${YELLOW}🤖 Création d'Azure OpenAI...${NC}"
echo "⚠️  Note: Azure OpenAI nécessite une demande d'accès"
echo "Visitez: https://aka.ms/oai/access"
echo ""

read -p "Avez-vous accès à Azure OpenAI? (y/n): " has_openai

if [ "$has_openai" = "y" ]; then
    az cognitiveservices account create \
        --name "$OPENAI_ACCOUNT" \
        --resource-group "$RESOURCE_GROUP" \
        --kind OpenAI \
        --sku S0 \
        --location "$LOCATION" \
        --yes

    # Déployer GPT-4
    az cognitiveservices account deployment create \
        --name "$OPENAI_ACCOUNT" \
        --resource-group "$RESOURCE_GROUP" \
        --deployment-name gpt-4 \
        --model-name gpt-4 \
        --model-version "0613" \
        --model-format OpenAI \
        --sku-capacity 10 \
        --sku-name "Standard"

    OPENAI_KEY=$(az cognitiveservices account keys list \
        --name "$OPENAI_ACCOUNT" \
        --resource-group "$RESOURCE_GROUP" \
        --query "key1" -o tsv)

    OPENAI_ENDPOINT=$(az cognitiveservices account show \
        --name "$OPENAI_ACCOUNT" \
        --resource-group "$RESOURCE_GROUP" \
        --query "properties.endpoint" -o tsv)

    echo -e "${GREEN}✅ Azure OpenAI créé${NC}"
else
    echo -e "${YELLOW}⚠️  Azure OpenAI ignoré${NC}"
    OPENAI_KEY="your-azure-openai-key"
    OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"
fi
echo ""

# 4. Azure Communication Services
echo -e "${YELLOW}📧 Création d'Azure Communication Services...${NC}"
az communication create \
    --name "$COMMUNICATION_SERVICE" \
    --resource-group "$RESOURCE_GROUP" \
    --location "global" \
    --data-location "UnitedStates"

COMMUNICATION_CONNECTION_STRING=$(az communication list-key \
    --name "$COMMUNICATION_SERVICE" \
    --resource-group "$RESOURCE_GROUP" \
    --query "primaryConnectionString" -o tsv)

echo -e "${GREEN}✅ Communication Services créé${NC}"
echo ""

# Créer le fichier .env.azure avec toutes les clés
echo -e "${YELLOW}📝 Création du fichier .env.azure...${NC}"

cat > .env.azure << EOF
# Configuration Azure générée automatiquement
# Date: $(date)

# Azure Cosmos DB (MongoDB)
DATABASE_URL="${COSMOSDB_CONNECTION_STRING}myapp?retryWrites=true&w=majority"

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING="${STORAGE_CONNECTION_STRING}"
AZURE_STORAGE_CONTAINER_NAME="uploads"

# Azure OpenAI
AZURE_OPENAI_API_KEY="${OPENAI_KEY}"
AZURE_OPENAI_ENDPOINT="${OPENAI_ENDPOINT}"
AZURE_OPENAI_DEPLOYMENT="gpt-4"
AZURE_OPENAI_API_VERSION="2024-02-15-preview"

# Azure Communication Services
AZURE_COMMUNICATION_CONNECTION_STRING="${COMMUNICATION_CONNECTION_STRING}"
AZURE_COMMUNICATION_EMAIL_FROM="donotreply@yourdomain.com"

# Autres configurations à conserver de .env
NEXTAUTH_SECRET="votre-secret-jwt"
NEXTAUTH_URL="http://localhost:3002"
NEXT_PUBLIC_APP_URL="http://localhost:3002"
EOF

echo ""
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}✅ Configuration Azure terminée !${NC}"
echo -e "${GREEN}================================================================${NC}"
echo ""
echo -e "${BLUE}📋 Résumé des ressources créées:${NC}"
echo "  ✅ Resource Group: $RESOURCE_GROUP"
echo "  ✅ Storage Account: $STORAGE_ACCOUNT"
echo "  ✅ Cosmos DB: $COSMOSDB_ACCOUNT"
if [ "$has_openai" = "y" ]; then
    echo "  ✅ Azure OpenAI: $OPENAI_ACCOUNT"
else
    echo "  ⚠️  Azure OpenAI: Non configuré (demande d'accès requise)"
fi
echo "  ✅ Communication Services: $COMMUNICATION_SERVICE"
echo ""
echo -e "${BLUE}📄 Les clés ont été enregistrées dans: .env.azure${NC}"
echo ""
echo -e "${YELLOW}🔧 Prochaines étapes:${NC}"
echo "  1. Copiez le contenu de .env.azure dans votre fichier .env"
echo "  2. Configurez NEXTAUTH_SECRET avec une valeur aléatoire"
echo "  3. Pour Azure OpenAI, demandez l'accès: https://aka.ms/oai/access"
echo "  4. Pour les emails, configurez un domaine vérifié dans Communication Services"
echo ""
echo -e "${GREEN}🎉 Votre projet est prêt à utiliser Azure !${NC}"
