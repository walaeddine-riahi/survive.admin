import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";

/**
 * Service pour gérer les uploads de fichiers vers Azure Blob Storage
 */
class AzureStorageService {
  private blobServiceClient: BlobServiceClient | null = null;
  private containerClient: ContainerClient | null = null;
  private containerName: string;

  constructor() {
    this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "uploads";
    this.initialize();
  }

  private initialize() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!connectionString) {
      console.warn(
        "⚠️ AZURE_STORAGE_CONNECTION_STRING non configuré, le stockage Azure est désactivé"
      );
      return;
    }

    try {
      this.blobServiceClient =
        BlobServiceClient.fromConnectionString(connectionString);
      this.containerClient = this.blobServiceClient.getContainerClient(
        this.containerName
      );
      console.log("✅ Service Azure Storage initialisé");
    } catch (error) {
      console.error(
        "❌ Erreur lors de l'initialisation d'Azure Storage:",
        error
      );
    }
  }

  /**
   * Vérifie si le service est disponible
   */
  isAvailable(): boolean {
    return this.containerClient !== null;
  }

  /**
   * Crée le conteneur s'il n'existe pas
   */
  async ensureContainerExists(): Promise<void> {
    if (!this.containerClient) {
      throw new Error("Azure Storage n'est pas configuré");
    }

    try {
      // Créer le conteneur sans spécifier l'accès public
      // (Le compte de stockage a AllowBlobPublicAccess désactivé)
      await this.containerClient.createIfNotExists();
    } catch (error) {
      console.error("Erreur lors de la création du conteneur:", error);
      throw error;
    }
  }

  /**
   * Upload un fichier vers Azure Blob Storage
   * @param file - Le fichier à uploader (File ou Buffer)
   * @param fileName - Nom du fichier (optionnel, généré automatiquement si non fourni)
   * @param folder - Dossier dans le conteneur (optionnel)
   */
  async uploadFile(
    file: File | Buffer,
    fileName?: string,
    folder?: string
  ): Promise<string> {
    if (!this.containerClient) {
      throw new Error("Azure Storage n'est pas configuré");
    }

    await this.ensureContainerExists();

    // Générer un nom de fichier unique si non fourni
    const timestamp = Date.now();
    const finalFileName = fileName || `file-${timestamp}`;
    const blobName = folder ? `${folder}/${finalFileName}` : finalFileName;

    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

    try {
      // Upload du fichier
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        await blockBlobClient.uploadData(arrayBuffer, {
          blobHTTPHeaders: {
            blobContentType: file.type,
          },
        });
      } else {
        // Buffer
        await blockBlobClient.uploadData(file);
      }

      console.log(`✅ Fichier uploadé: ${blobName}`);
      return blockBlobClient.url;
    } catch (error) {
      console.error("❌ Erreur lors de l'upload:", error);
      throw error;
    }
  }

  /**
   * Upload un fichier depuis un FormData
   * @param formData - FormData contenant le fichier
   * @param fieldName - Nom du champ contenant le fichier
   * @param folder - Dossier dans le conteneur (optionnel)
   */
  async uploadFromFormData(
    formData: FormData,
    fieldName: string = "file",
    folder?: string
  ): Promise<string> {
    const file = formData.get(fieldName) as File;

    if (!file) {
      throw new Error(`Aucun fichier trouvé dans le champ "${fieldName}"`);
    }

    return this.uploadFile(file, file.name, folder);
  }

  /**
   * Supprime un fichier d'Azure Blob Storage
   * @param blobUrl - URL complète du blob à supprimer
   */
  async deleteFile(blobUrl: string): Promise<void> {
    if (!this.containerClient) {
      throw new Error("Azure Storage n'est pas configuré");
    }

    try {
      // Extraire le nom du blob depuis l'URL
      const url = new URL(blobUrl);
      const pathParts = url.pathname.split("/");
      const blobName = pathParts.slice(2).join("/"); // Ignorer le premier segment (conteneur)

      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.deleteIfExists();

      console.log(`✅ Fichier supprimé: ${blobName}`);
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error);
      throw error;
    }
  }

  /**
   * Liste tous les fichiers d'un dossier
   * @param folder - Dossier à lister (optionnel)
   */
  async listFiles(folder?: string): Promise<string[]> {
    if (!this.containerClient) {
      throw new Error("Azure Storage n'est pas configuré");
    }

    const files: string[] = [];
    const prefix = folder ? `${folder}/` : undefined;

    try {
      for await (const blob of this.containerClient.listBlobsFlat({ prefix })) {
        files.push(blob.name);
      }
      return files;
    } catch (error) {
      console.error("❌ Erreur lors de la liste des fichiers:", error);
      throw error;
    }
  }

  /**
   * Retourne le client du conteneur
   */
  getContainerClient(): ContainerClient | null {
    return this.containerClient;
  }

  /**
   * Génère une URL signée temporaire pour accéder à un fichier privé
   * @param blobName - Nom du blob
   * @param _expiresInMinutes - Durée de validité en minutes (par défaut: 60) - Non implémenté actuellement
   */
  async generateSasUrl(blobName: string): Promise<string> {
    if (!this.containerClient) {
      throw new Error("Azure Storage n'est pas configuré");
    }

    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

    // Pour générer une URL SAS, vous aurez besoin d'une clé de compte
    // Cette fonctionnalité nécessite une configuration supplémentaire
    // Pour l'instant, on retourne l'URL publique
    return blockBlobClient.url;
  }
}

// Export d'une instance singleton
export const azureStorage = new AzureStorageService();

// Export des types pour usage externe
export type { ContainerClient, BlobServiceClient };
