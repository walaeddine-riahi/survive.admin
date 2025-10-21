import fs from "fs";
import path from "path";

// Simuler le template email
const welcomeEmailTemplate = (
  firstName: string,
  userEmail: string,
  password: string,
  simulationTitle: string,
  simulationId: string
) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation à la Simulation - ${simulationTitle}</title>
</head>
<body style="margin:0; padding:0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          <!-- Header Ooredoo -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #E2001A 0%, #C40016 100%); padding: 40px 30px;">
              <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 600; letter-spacing: 0.5px;">Bienvenue chez Ooredoo</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; color: #ffffff; opacity: 0.95;">Invitation à la Simulation de Gestion de Crise</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; color: #333333; font-size: 16px; line-height: 1.7;">
              <p style="margin: 0 0 20px 0;">Bonjour <strong style="color: #E2001A;">${firstName}</strong>,</p>
              
              <p style="margin: 0 0 25px 0;">Vous êtes invité(e) à participer à la simulation <strong>"${simulationTitle}"</strong>. Cette simulation vous permettra de développer vos compétences en gestion de crise dans un environnement sécurisé et réaliste.</p>
              
              <!-- Credentials Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #FFF5F5 0%, #FFE8EA 100%); border-left: 4px solid #E2001A; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #E2001A; font-weight: 600;">🔐 Vos identifiants de connexion</h2>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <strong style="color: #666666; font-size: 14px;">Adresse e-mail :</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 15px; background-color: #ffffff; border-radius: 6px; font-family: 'Courier New', monospace; color: #E2001A; font-weight: bold; font-size: 15px;">
                          ${userEmail}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 15px 0 8px 0;">
                          <strong style="color: #666666; font-size: 14px;">Mot de passe :</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 15px; background-color: #ffffff; border-radius: 6px; font-family: 'Courier New', monospace; color: #E2001A; font-weight: bold; font-size: 15px;">
                          ${password}
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 15px 0 0 0; font-size: 13px; color: #999999; font-style: italic;">⚠️ Veuillez conserver ces informations en lieu sûr</p>
                  </td>
                </tr>
              </table>
              
              <!-- Features -->
              <h3 style="margin: 30px 0 15px 0; font-size: 18px; color: #333333; font-weight: 600;">Au cours de cette simulation, vous pourrez :</h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #E2001A; font-weight: bold;">✓</span> Envoyer des mémos et messages confidentiels
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #E2001A; font-weight: bold;">✓</span> Publier des bulletins pour votre équipe
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #E2001A; font-weight: bold;">✓</span> Gérer des incidents et envoyer des alertes
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #E2001A; font-weight: bold;">✓</span> Créer des rapports et analyses en temps réel
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://survive-tau.vercel.app/simulation/${simulationId}/participant-view"
                   style="background: linear-gradient(135deg, #E2001A 0%, #C40016 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(226, 0, 26, 0.3);">
                  🚀 Accéder à la Simulation
                </a>
              </div>
              
              <p style="margin: 30px 0 0 0; font-size: 15px; color: #666666;">Pour toute question ou assistance technique, n'hésitez pas à contacter notre équipe support.</p>
              
              <p style="margin-top: 30px; padding-top: 25px; border-top: 1px solid #eeeeee; font-size: 15px; color: #666666;">
                Cordialement,<br>
                <strong style="color: #E2001A;">L'équipe Ooredoo - Gestion de Crise</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f9f9f9; padding: 25px 30px; border-top: 1px solid #eeeeee;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 15px;">
                    <span style="font-size: 24px; font-weight: bold; color: #E2001A;">Ooredoo</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size: 13px; color: #999999; line-height: 1.6;">
                    <p style="margin: 5px 0;">Ce message a été généré automatiquement. Merci de ne pas y répondre.</p>
                    <p style="margin: 15px 0 5px 0;">
                      <a href="#" style="color: #E2001A; text-decoration: none; margin: 0 10px;">Politique de confidentialité</a> |
                      <a href="#" style="color: #E2001A; text-decoration: none; margin: 0 10px;">Conditions d'utilisation</a> |
                      <a href="#" style="color: #E2001A; text-decoration: none; margin: 0 10px;">Support</a>
                    </p>
                    <p style="margin: 15px 0 0 0; color: #cccccc;">&copy; ${new Date().getFullYear()} Ooredoo Tunisie. Tous droits réservés.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>

`;

// Données de test
const testData = {
  firstName: "Ahmed Ben Ali",
  userEmail: "ahmed.benali@ooredoo.tn",
  password: "ooredoo123",
  simulationTitle: "Simulation de Cyberattaque 2025",
  simulationId: "sim_abc123xyz",
};

console.log("🎨 Génération du template email Ooredoo...\n");
console.log("📋 Données de test:");
console.log("   - Nom:", testData.firstName);
console.log("   - Email:", testData.userEmail);
console.log("   - Password:", testData.password);
console.log("   - Simulation:", testData.simulationTitle);
console.log("   - ID:", testData.simulationId);
console.log("");

// Générer le HTML
const html = welcomeEmailTemplate(
  testData.firstName,
  testData.userEmail,
  testData.password,
  testData.simulationTitle,
  testData.simulationId
);

// Sauvegarder dans un fichier
const outputPath = path.join(__dirname, "../public/email-preview.html");
fs.writeFileSync(outputPath, html);

console.log("✅ Template généré avec succès!");
console.log("📁 Fichier créé:", outputPath);
console.log("");
console.log("🌐 Pour visualiser le template:");
console.log("   1. Ouvrez le fichier: public/email-preview.html");
console.log("   2. Ou démarrez le serveur et allez sur:");
console.log("      http://localhost:3000/email-preview.html");
console.log("");
console.log("✨ Vous pouvez maintenant voir le design Ooredoo!");
