import { EmailClient } from "@azure/communication-email";
import * as dotenv from "dotenv";

dotenv.config();

async function testAzureEmail() {
  console.log("📧 Test Azure Communication Services - Email\n");

  const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
  const senderAddress = process.env.AZURE_COMMUNICATION_EMAIL_FROM;
  const recipientAddress = "walaeddine1207@gmail.com";

  console.log("📋 Configuration:");
  console.log(`   Expéditeur: ${senderAddress}`);
  console.log(`   Destinataire: ${recipientAddress}`);
  console.log(
    `   Connection: ${connectionString ? "✓ Présente" : "✗ Manquante"}\n`
  );

  if (!connectionString || !senderAddress) {
    console.error("❌ Variables d'environnement manquantes!");
    console.error(
      "   Vérifiez AZURE_COMMUNICATION_CONNECTION_STRING et AZURE_COMMUNICATION_EMAIL_FROM"
    );
    process.exit(1);
  }

  try {
    // Créer le client Email
    console.log("🔌 Connexion à Azure Communication Services...");
    const emailClient = new EmailClient(connectionString);
    console.log("   ✓ Client créé avec succès\n");

    // Préparer le message
    const emailMessage = {
      senderAddress: senderAddress,
      content: {
        subject: "🎉 Test Azure Communication Services - Survive Admin",
        plainText: `Bonjour,

Ceci est un email de test envoyé depuis votre application Survive Admin !

✅ Azure Communication Services fonctionne parfaitement.

Détails du test:
- Date: ${new Date().toLocaleString("fr-FR")}
- Service: Azure Communication Services
- Projet: Survive Admin
- From: ${senderAddress}
- To: ${recipientAddress}

Si vous recevez cet email, cela signifie que votre configuration Azure est complète et opérationnelle.

Cordialement,
Survive Admin System`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    h1 { margin: 0; font-size: 28px; }
    .emoji { font-size: 48px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">🎉</div>
      <h1>Test Azure Communication Services</h1>
      <p>Survive Admin</p>
    </div>
    <div class="content">
      <h2>Bonjour,</h2>
      <p>Ceci est un email de test envoyé depuis votre application <strong>Survive Admin</strong> !</p>
      
      <div class="success">
        <strong>✅ Azure Communication Services fonctionne parfaitement.</strong>
      </div>

      <div class="info-box">
        <h3>Détails du test :</h3>
        <ul>
          <li><strong>Date:</strong> ${new Date().toLocaleString("fr-FR")}</li>
          <li><strong>Service:</strong> Azure Communication Services</li>
          <li><strong>Projet:</strong> Survive Admin</li>
          <li><strong>From:</strong> ${senderAddress}</li>
          <li><strong>To:</strong> ${recipientAddress}</li>
        </ul>
      </div>

      <p>Si vous recevez cet email, cela signifie que votre configuration Azure est <strong>complète et opérationnelle</strong>.</p>

      <p>Votre application peut maintenant :</p>
      <ul>
        <li>📧 Envoyer des emails de notification</li>
        <li>📨 Envoyer des emails de bienvenue</li>
        <li>🔔 Envoyer des alertes SITREP</li>
        <li>✉️ Communiquer avec les utilisateurs</li>
      </ul>

      <div class="footer">
        <p>Cordialement,<br><strong>Survive Admin System</strong></p>
        <p style="margin-top: 20px;">Powered by Azure Communication Services</p>
      </div>
    </div>
  </div>
</body>
</html>`,
      },
      recipients: {
        to: [
          {
            address: recipientAddress,
            displayName: "Walaeddine Riahi",
          },
        ],
      },
    };

    console.log("📤 Envoi de l'email...");
    const poller = await emailClient.beginSend(emailMessage);

    console.log("   ⏳ Email en cours d'envoi...");
    console.log(`   📊 Message ID: ${poller.getOperationState().id}`);

    // Attendre que l'email soit envoyé
    const result = await poller.pollUntilDone();

    console.log("\n" + "=".repeat(70));
    console.log("✅ EMAIL ENVOYÉ AVEC SUCCÈS !");
    console.log("=".repeat(70));

    console.log("\n📊 Résultat:");
    console.log(`   Status: ${result.status}`);
    console.log(`   Message ID: ${result.id}`);

    console.log("\n📬 Destinataire:");
    console.log(`   Email: ${recipientAddress}`);
    console.log(`   Expéditeur: ${senderAddress}`);

    console.log("\n💡 Instructions:");
    console.log(
      "   1. Vérifiez votre boîte de réception: walaeddine1207@gmail.com"
    );
    console.log(
      "   2. Si l'email n'apparaît pas, vérifiez le dossier SPAM/COURRIER INDÉSIRABLE"
    );
    console.log("   3. L'email peut prendre quelques minutes pour arriver");

    console.log("\n✉️  Contenu de l'email:");
    console.log(
      "   Sujet: 🎉 Test Azure Communication Services - Survive Admin"
    );
    console.log("   Format: HTML + Texte brut");

    console.log(
      "\n🎉 Azure Communication Services est maintenant opérationnel!"
    );
  } catch (error) {
    console.error("\n❌ Erreur lors de l'envoi:", error.message);
    if (error.code) console.error(`   Code: ${error.code}`);
    if (error.statusCode) console.error(`   Status: ${error.statusCode}`);
    if (error.details) {
      console.error("   Détails:", JSON.stringify(error.details, null, 2));
    }

    console.log("\n💡 Vérifications:");
    console.log("   • La connection string est-elle correcte?");
    console.log("   • L'adresse email From est-elle valide?");
    console.log("   • Le domaine Azure Managed est-il vérifié?");
    console.log("   • Email Service est-il connecté à Communication Service?");

    process.exit(1);
  }
}

testAzureEmail();
