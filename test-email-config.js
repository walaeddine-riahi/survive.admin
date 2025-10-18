// Script de test pour vérifier la configuration email
// Exécuter avec : node test-email-config.js

/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config({ path: ".env.local" });

console.log("\n🔍 Vérification de la configuration Email SITREP\n");
console.log("=".repeat(60));

// Vérifier les variables d'environnement
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

console.log("\n📋 Variables d'environnement :");
console.log("--------------------------------");

if (!emailUser) {
  console.log("❌ EMAIL_USER : NON CONFIGURÉ");
} else {
  console.log(`✅ EMAIL_USER : ${emailUser}`);
}

if (!emailPass) {
  console.log("❌ EMAIL_PASS : NON CONFIGURÉ");
} else {
  // Masquer le mot de passe sauf les 4 premiers caractères
  const maskedPass =
    emailPass.substring(0, 4) + "*".repeat(emailPass.length - 4);
  console.log(`✅ EMAIL_PASS : ${maskedPass} (${emailPass.length} caractères)`);

  // Vérifier le format du mot de passe d'application Gmail (16 caractères)
  if (emailPass.length === 16 && /^[a-z]+$/.test(emailPass)) {
    console.log("   ✓ Format valide pour un mot de passe d'application Gmail");
  } else if (emailPass.length < 16) {
    console.log(
      "   ⚠️  Attention : un mot de passe d'application Gmail fait 16 caractères"
    );
    console.log("   ⚠️  Vérifiez que vous n'avez pas laissé d'espaces");
  }
}

console.log("\n📁 Fichier .env.local :");
console.log("--------------------------------");
const fs = require("fs");
const path = require("path");
const envPath = path.join(__dirname, ".env.local");

if (fs.existsSync(envPath)) {
  console.log(`✅ Fichier trouvé : ${envPath}`);
  const envContent = fs.readFileSync(envPath, "utf-8");
  const lines = envContent
    .split("\n")
    .filter((line) => line.trim() && !line.trim().startsWith("#"));
  console.log(`   Variables définies : ${lines.length}`);
} else {
  console.log(`❌ Fichier NON TROUVÉ : ${envPath}`);
  console.log("   Créez le fichier .env.local à la racine du projet");
}

console.log("\n🎯 Résultat :");
console.log("--------------------------------");

if (emailUser && emailPass) {
  console.log("✅ Configuration complète !");
  console.log("   Vous pouvez maintenant envoyer des emails SITREP");
  console.log("\n📝 Prochaines étapes :");
  console.log("   1. Redémarrez le serveur de développement");
  console.log("   2. Créez un SITREP dans l'application");
  console.log("   3. Vérifiez votre boîte email");
} else {
  console.log("❌ Configuration incomplète !");
  console.log("\n📝 Actions requises :");

  if (!emailUser) {
    console.log(
      "   1. Ajoutez EMAIL_USER=votre-email@gmail.com dans .env.local"
    );
  }

  if (!emailPass) {
    console.log("   2. Créez un mot de passe d'application Gmail :");
    console.log("      https://myaccount.google.com/security");
    console.log("   3. Ajoutez EMAIL_PASS=votre-mot-de-passe dans .env.local");
  }

  console.log(
    "\n   Consultez SITREP-EMAIL-TROUBLESHOOTING.md pour plus de détails"
  );
}

console.log("\n" + "=".repeat(60));
console.log("");
