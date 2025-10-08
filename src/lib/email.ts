import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config(); // Charge les variables depuis .env.local ou .env

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error('Les variables d\'environnement EMAIL_USER et EMAIL_PASS sont requises pour l\'envoi d\'emails');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true pour le port 465, false pour les autres ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // Ne pas échouer sur des certificats invalides
    rejectUnauthorized: false
  }
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
  simulationTitle: string,
  simulationId: string
) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue - ${simulationTitle}</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color: #f4f4f7;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f7; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);">
          <tr>
            <td align="center" style="background-color: #6366f1; padding: 30px;">
              <h1 style="margin: 0; font-size: 24px; color: #ffffff;">Bienvenue dans la simulation</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; color: #111827; font-size: 16px; line-height: 1.6;">
              <p>Bonjour <strong>${firstName}</strong>,</p>
              <p>Bienvenue dans l’expérience immersive <strong>"${simulationTitle}"</strong> !</p>
              <p>Votre identifiant de connexion est : <strong>${userEmail}</strong></p>
              <p>Au cours de cette simulation, vous pourrez :</p>
              <ul style="padding-left: 20px;">
                <li>Envoyer des mémos et messages confidentiels</li>
                <li>Publier des bulletins pour votre équipe</li>
                <li>Gérer des incidents et envoyer des alertes</li>
                <li>Créer des rapports et analyses</li>
              </ul>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://survive-clsb.vercel.app/simulation/${simulationId}/participant-view"
                   style="background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; display: inline-block; font-weight: bold;">
                  Accéder à la simulation
                </a>
              </div>
              <p>Pour toute question, notre équipe reste à votre disposition.</p>
              <p style="margin-top: 40px; font-style: italic; color: #6b7280;">Cordialement,<br>L’équipe de Simulation</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="background-color: #f9fafb; padding: 20px; font-size: 13px; color: #6b7280;">
              <p>Ce message a été généré automatiquement. Merci de ne pas y répondre.</p>
              <p>
                <a href="#" style="color: #6b7280; text-decoration: none;">Politique de confidentialité</a> |
                <a href="#" style="color: #6b7280; text-decoration: none;">Conditions d’utilisation</a>
              </p>
              <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} Votre Organisation. Tous droits réservés.</p>
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
        name: "Équipe de Simulation",
        address: process.env.EMAIL_USER || "prenetflix99@gmail.com",
      },
      to: email,
      subject: `Bienvenue dans la simulation "${simulationTitle}"`,
      html: welcomeEmailTemplate(
        firstName,
        email,
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
