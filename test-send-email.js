// Script de test d'envoi d'email SITREP
// Exécuter avec : node test-send-email.js

/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config({ path: ".env.local" });
const nodemailer = require("nodemailer");

console.log("\n📧 Test d'envoi d'email SITREP\n");
console.log("=".repeat(60));

// Vérifier les variables
console.log("\n📋 Configuration :");
console.log("  EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "  EMAIL_PASS:",
  process.env.EMAIL_PASS ? "✅ Configuré" : "❌ Manquant"
);

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("\n❌ Variables d'environnement manquantes !");
  process.exit(1);
}

// Créer le transporteur
console.log("\n🔧 Création du transporteur email...");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Préparer l'email de test
const mailOptions = {
  from: {
    name: "Test SITREP System",
    address: process.env.EMAIL_USER,
  },
  to: "walaeddine1207@gmail.com",
  subject: "🧪 Test d'envoi SITREP - " + new Date().toLocaleString("fr-FR"),
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">🧪 Email de Test SITREP</h1>
      </div>
      <div style="padding: 20px; background: #f9fafb;">
        <p>Ceci est un email de test pour vérifier la configuration d'envoi des SITREPs.</p>
        <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
          <p><strong>Date :</strong> ${new Date().toLocaleString("fr-FR")}</p>
          <p><strong>Depuis :</strong> ${process.env.EMAIL_USER}</p>
          <p><strong>Status :</strong> ✅ Si vous recevez cet email, la configuration fonctionne !</p>
        </div>
        <p style="color: #6b7280; font-size: 12px;">
          Ce test a été effectué depuis le script test-send-email.js
        </p>
      </div>
    </div>
  `,
};

// Envoyer l'email
console.log("\n📤 Envoi de l'email de test...");
console.log("  Destinataire: walaeddine1207@gmail.com");

transporter
  .sendMail(mailOptions)
  .then((info) => {
    console.log("\n✅ Email envoyé avec succès !");
    console.log("  Message ID:", info.messageId);
    console.log("  Response:", info.response);
    console.log("\n📬 Vérifiez votre boîte email (et le dossier Spam)");
    console.log("=".repeat(60));
    console.log("");
  })
  .catch((error) => {
    console.error("\n❌ Erreur lors de l'envoi :");
    console.error("  Message:", error.message);
    if (error.code) {
      console.error("  Code:", error.code);
    }
    if (error.command) {
      console.error("  Commande:", error.command);
    }
    console.log("\n🔍 Solutions possibles :");
    console.log(
      "  1. Vérifiez que le mot de passe d'application est correct (sans espaces)"
    );
    console.log(
      "  2. Vérifiez que la validation en deux étapes est activée sur Gmail"
    );
    console.log(
      "  3. Vérifiez que le mot de passe d'application est toujours valide"
    );
    console.log(
      "  4. Essayez de régénérer un nouveau mot de passe d'application"
    );
    console.log("=".repeat(60));
    console.log("");
    process.exit(1);
  });
