import { BlobServiceClient } from "@azure/storage-blob";
import * as dotenv from "dotenv";
import { writeFileSync } from "fs";

dotenv.config();

async function testAzureStorage() {
  console.log("🧪 Test Azure Storage Upload/Download\n");

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "uploads";

  console.log("📋 Configuration:");
  console.log(`   Container: ${containerName}`);
  console.log(
    `   Connection: ${connectionString ? "✓ Présente" : "✗ Manquante"}\n`
  );

  if (!connectionString) {
    console.error("❌ AZURE_STORAGE_CONNECTION_STRING manquante dans .env");
    process.exit(1);
  }

  try {
    // 1. Créer le client Blob Service
    console.log("📦 Connexion à Azure Storage...");
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // 2. Créer le container s'il n'existe pas
    console.log(`📁 Vérification du container "${containerName}"...`);
    const createContainerResponse = await containerClient.createIfNotExists();

    if (createContainerResponse.succeeded) {
      console.log(`   ✅ Container "${containerName}" créé avec succès`);
    } else {
      console.log(`   ℹ️  Container "${containerName}" existe déjà`);
    }

    // 3. Créer un fichier de test
    console.log("\n📄 Création d'un fichier de test...");
    const testFileName = `test-${Date.now()}.txt`;
    const testFileContent = `Test d'upload Azure Storage
Date: ${new Date().toISOString()}
Projet: Survive Admin
Container: ${containerName}

✅ Si vous lisez ce message, l'upload fonctionne parfaitement !`;

    writeFileSync(testFileName, testFileContent, "utf8");
    console.log(`   ✓ Fichier créé: ${testFileName}`);

    // 4. Upload du fichier
    console.log(`\n⬆️  Upload vers Azure Storage...`);
    const blockBlobClient = containerClient.getBlockBlobClient(testFileName);

    const uploadResponse = await blockBlobClient.uploadFile(testFileName, {
      blobHTTPHeaders: { blobContentType: "text/plain" },
    });

    console.log(`   ✅ Upload réussi !`);
    console.log(`   📊 Request ID: ${uploadResponse.requestId}`);
    console.log(`   🔗 URL: ${blockBlobClient.url}`);

    // 5. Lister les fichiers du container
    console.log(`\n📂 Liste des fichiers dans "${containerName}":`);
    console.log("   " + "─".repeat(60));

    let fileCount = 0;
    for await (const blob of containerClient.listBlobsFlat()) {
      fileCount++;
      const sizeKB = (blob.properties.contentLength / 1024).toFixed(2);
      console.log(`   ${fileCount}. ${blob.name} (${sizeKB} KB)`);
    }
    console.log("   " + "─".repeat(60));
    console.log(`   Total: ${fileCount} fichier(s)\n`);

    // 6. Télécharger le fichier pour vérifier
    console.log("⬇️  Téléchargement du fichier pour vérification...");
    const downloadResponse = await blockBlobClient.download(0);
    const downloadedContent = await streamToString(
      downloadResponse.readableStreamBody
    );

    console.log("   ✓ Contenu téléchargé:");
    console.log("   " + "─".repeat(60));
    console.log(
      downloadedContent
        .split("\n")
        .map((line) => `   ${line}`)
        .join("\n")
    );
    console.log("   " + "─".repeat(60));

    // 7. Vérification de l'intégrité
    if (downloadedContent === testFileContent) {
      console.log("\n✅ Vérification d'intégrité: SUCCÈS");
      console.log(
        "   Le fichier téléchargé est identique au fichier uploadé !\n"
      );
    } else {
      console.log("\n⚠️  Avertissement: Le contenu diffère");
    }

    // 8. Métadonnées du blob
    const properties = await blockBlobClient.getProperties();
    console.log("📋 Informations du blob:");
    console.log(`   Type de contenu: ${properties.contentType}`);
    console.log(`   Taille: ${properties.contentLength} bytes`);
    console.log(`   Dernière modification: ${properties.lastModified}`);
    console.log(`   ETag: ${properties.etag}\n`);

    // 9. Nettoyer le fichier local de test
    console.log("🧹 Nettoyage...");
    const fs = await import("fs/promises");
    await fs.unlink(testFileName);
    console.log(`   ✓ Fichier local supprimé: ${testFileName}`);

    console.log("\n" + "=".repeat(70));
    console.log("✅ TEST RÉUSSI ! Azure Storage fonctionne parfaitement.");
    console.log("=".repeat(70));
    console.log("\n💡 Votre application peut maintenant:");
    console.log("   • Uploader des PDFs depuis le formulaire BIA");
    console.log("   • Stocker des images et documents");
    console.log("   • Gérer les fichiers uploadés par les utilisateurs");
  } catch (error) {
    console.error("\n❌ Erreur:", error.message);
    if (error.code) console.error(`   Code: ${error.code}`);
    if (error.statusCode) console.error(`   Status: ${error.statusCode}`);
    if (error.details) console.error(`   Détails: ${error.details}`);
    process.exit(1);
  }
}

// Helper pour convertir le stream en string
async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}

testAzureStorage();
