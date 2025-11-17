import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config(); // Charge les variables depuis .env.local ou .env

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error(
    "Les variables d'environnement EMAIL_USER et EMAIL_PASS sont requises pour l'envoi d'emails"
  );
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true pour le port 465, false pour les autres ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // Ne pas échouer sur des certificats invalides
    rejectUnauthorized: false,
  },
});

// Vérifier la configuration du transporteur
transporter.verify(function (error) {
  if (error) {
    console.error("Erreur de configuration du transporteur email:", error);
  } else {
    console.log("Le serveur est prêt à envoyer des emails");
  }
});

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
  <title>Invitation à la Simulation </title>
</head>
<body style="margin:0; padding:0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          <!-- Header Survive / Ooredoo -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #E2001A 0%, #C40016 100%); padding: 40px 30px;">
              <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 600; letter-spacing: 0.5px;">Bienvenue sur Survive</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; color: #ffffff; opacity: 0.95;">Plateforme de Simulation de Gestion de Crise - Ooredoo</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; color: #333333; font-size: 16px; line-height: 1.7;">
              <p style="margin: 0 0 20px 0;">Bonjour <strong style="color: #E2001A;">${firstName}</strong>,</p>
              
              <p style="margin: 0 0 25px 0;">Vous êtes invité(e) à participer à la simulation . Cette simulation vous permettra de développer vos compétences en gestion de crise dans un environnement sécurisé et réaliste.</p>
              
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
                          ooredoo
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
                <a href="https://survive-ooredoo.vercel.app/simulation/${simulationId}/participant-view"
                   style="background: linear-gradient(135deg, #E2001A 0%, #C40016 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(226, 0, 26, 0.3); transition: all 0.3s;">
                  🚀 Accéder à la Simulation
                </a>
              </div>
              
              <p style="margin: 30px 0 0 0; font-size: 15px; color: #666666;">Pour toute question ou assistance technique, n'hésitez pas à contacter notre équipe support.</p>
              
              <p style="margin-top: 30px; padding-top: 25px; border-top: 1px solid #eeeeee; font-size: 15px; color: #666666;">
                Cordialement,<br>
                <strong style="color: #E2001A;">L'équipe Survive - Gestion de Crise</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f9f9f9; padding: 25px 30px; border-top: 1px solid #eeeeee;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 15px;">
                    <span style="font-size: 24px; font-weight: bold; color: #E2001A;">Survive</span>
                    <span style="font-size: 16px; color: #999999; margin: 0 8px;">×</span>
                    <span style="font-size: 20px; font-weight: bold; color: #E2001A;">Ooredoo</span>
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
                    <p style="margin: 15px 0 0 0; color: #cccccc;">&copy; ${new Date().getFullYear()} Survive - Plateforme Ooredoo de Gestion de Crise. Tous droits réservés.</p>
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

export const sendWelcomeEmail = async (
  email: string,
  firstName: string,
  password: string,
  simulationTitle: string,
  simulationId: string
) => {
  try {
    console.log("Tentative d'envoi d'email à:", email);
    console.log("Prénom:", firstName);
    console.log("Titre de la simulation:", simulationTitle);
    console.log("ID de la simulation:", simulationId);

    const mailOptions = {
      from: {
        name: "Ooredoo - Équipe de Simulation",
        address: process.env.EMAIL_USER || "prenetflix99@gmail.com",
      },
      to: email,
      subject: `Invitation à la simulation "${simulationTitle}" - Ooredoo`,
      html: welcomeEmailTemplate(
        firstName,
        email,
        password,
        simulationTitle,
        simulationId
      ),
    };

    console.log("Options de l'email:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    const info = await transporter.sendMail(mailOptions);
    console.log("Email envoyé avec succès:", info);
    return info;
  } catch (error) {
    console.error("Erreur détaillée lors de l'envoi de l'email:", error);
    throw error;
  }
};
