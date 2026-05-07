import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { generateMagicToken } from "./magic-token";

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

const welcomeEmailTemplate = ({
  firstName,
  userEmail,
  password,
  simulationTitle,
  simulationId,
  baseUrl,
  magicToken
}: {
  firstName: string;
  userEmail: string;
  password?: string;
  simulationTitle: string;
  simulationId: string;
  baseUrl: string;
  magicToken?: string;
}) => {
  const ctaUrl = magicToken 
    ? `${baseUrl}/magic-login?token=${magicToken}&simulationId=${simulationId}`
    : `${baseUrl}/simulation/${simulationId}/participant-view`;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation à l'exercice de gestion de crise - S.U.R.V.I.V.E.</title>
</head>
<body style="margin:0; padding:0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #12100E; color: #F5F4F0; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #12100E; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #1A1715; border-radius: 16px; overflow: hidden; border: 1px solid #2B2623; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);">
          <!-- Top Cyber Neon Orange Accent Line -->
          <tr>
            <td height="6" style="background: linear-gradient(90deg, #F97316 0%, #FF8A3D 50%, #D97706 100%);"></td>
          </tr>
          
          <!-- Logo & Header Section -->
          <tr>
            <td align="center" style="padding: 45px 30px 20px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="font-size: 28px; font-weight: 900; letter-spacing: 4px; color: #F5F4F0; text-transform: uppercase; font-family: sans-serif;">
                      S.U.R.V.I.V.E.
                    </div>
                    <div style="font-size: 11px; font-weight: 700; color: #F97316; letter-spacing: 4px; text-transform: uppercase; margin-top: 6px;">
                      Resilience Simulation Network
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Welcome Banner Section -->
          <tr>
            <td align="center" style="padding: 10px 40px 35px 40px; border-bottom: 1px solid #26211E;">
              <div style="display: inline-block; background-color: rgba(249, 115, 22, 0.08); border: 1px solid rgba(249, 115, 22, 0.25); border-radius: 4px; padding: 5px 12px; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #F97316; letter-spacing: 1px; margin-bottom: 20px;">
                🚨 EXERCICE TACTIQUE ACTIF
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #F5F4F0; text-align: center; line-height: 1.4; letter-spacing: -0.5px;">
                Alerte d'incubation opérationnelle
              </h1>
              <p style="margin: 10px 0 0 0; font-size: 15px; color: #A89F99;">
                Vous avez été désigné(e) pour intégrer la cellule de réponse.
              </p>
              <div style="display: inline-block; background-color: rgba(249, 115, 22, 0.08); border: 1px solid rgba(249, 115, 22, 0.25); border-radius: 6px; padding: 8px 18px; margin-top: 15px;">
                <span style="font-size: 13px; font-weight: 700; color: #F97316; vertical-align: middle;">
                  ● Opérationnel : ${simulationTitle}
                </span>
              </div>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 45px 30px 45px; color: #D8D2CB; font-size: 15px; line-height: 1.7;">
              <p style="margin: 0 0 18px 0; font-size: 16px; color: #F5F4F0;">Bonjour <strong>${firstName}</strong>,</p>
              
              <p style="margin: 0 0 24px 0;">Dans le cadre des protocoles de continuité d'activité opérationnelle de notre réseau, vous êtes affecté(e) comme participant officiel à l'exercice de crise majeure de cybersécurité sur la plateforme d'exercice <strong>SURVIVE</strong>.</p>
              
              <!-- Credentials Container -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #211D1B; border: 1px solid #332B27; border-radius: 12px; margin: 30px 0; box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);">
                <tr>
                  <td style="padding: 28px;">
                    <div style="font-size: 13px; font-weight: 800; color: #F97316; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">
                      🔐 Vos Identifiants de Connexion Sécurisés
                    </div>
                    
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 6px;">
                          <span style="color: #9E938A; font-size: 13px; font-weight: 600;">Identifiant de connexion / E-mail</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; background-color: #12100E; border: 1px solid #2B2623; border-radius: 8px; font-family: monospace; color: #FAF9F5; font-size: 15px; font-weight: bold; letter-spacing: 0.5px;">
                          ${userEmail}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 18px 0 6px 0;">
                          <span style="color: #9E938A; font-size: 13px; font-weight: 600;">Mot de passe de sécurité</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; background-color: #12100E; border: 1px solid #2B2623; border-radius: 8px; font-family: monospace; color: #F97316; font-size: 15px; font-weight: bold; letter-spacing: 0.5px;">
                          ${password || "survive"}
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 15px 0 0 0; font-size: 12px; color: #8F8278; font-style: italic; display: flex; align-items: center;">
                      ⚠️ Ce mot de passe temporaire doit être conservé de manière confidentielle.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Platform actions preview -->
              <div style="margin-top: 35px; margin-bottom: 30px; background-color: rgba(255,255,255,0.01); border: 1px solid #26211E; padding: 20px; border-radius: 8px;">
                <h3 style="font-size: 14px; font-weight: 800; color: #F5F4F0; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">
                  Vos prérequis opérationnels :
                </h3>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #A89F99;">
                      <span style="color: #F97316; font-weight: bold; margin-right: 10px;">✦</span> Réagir en temps réel aux injections réglementaires et techniques d'incident
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #A89F99;">
                      <span style="color: #F97316; font-weight: bold; margin-right: 10px;">✦</span> Participer aux communications inter-cellules via mémos et rapports Sitreps
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #A89F99;">
                      <span style="color: #F97316; font-weight: bold; margin-right: 10px;">✦</span> Suivre l'évolution chronologique et piloter la cellule de crise
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Main CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 40px 0 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}" target="_blank"
                       style="background: linear-gradient(135deg, #F97316 0%, #D97706 100%); color: #12100E; text-decoration: none; padding: 16px 42px; border-radius: 8px; display: inline-block; font-weight: 800; font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase; box-shadow: 0 8px 24px rgba(249, 115, 22, 0.35); border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.2s;">
                      Accéder à la Simulation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; font-size: 13px; color: #6E6660; text-align: center;">
                Lien direct : <a href="${ctaUrl}" style="color: #F97316; text-decoration: none;">${ctaUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer Block -->
          <tr>
            <td style="background-color: #12100E; padding: 35px 45px; border-top: 1px solid #26211E; text-align: center; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;">
              <p style="margin: 0; font-size: 12px; color: #5C5550; line-height: 1.6;">
                Ceci est une notification automatique sécurisée générée par S.U.R.V.I.V.E. - Plateforme de Simulation de Crise.<br>
                Merci de ne pas y répondre directement.
              </p>
              <p style="margin: 18px 0 0 0; font-size: 12px; color: #736B65; font-weight: 600;">
                © ${new Date().getFullYear()} S.U.R.V.I.V.E. Resilience Network. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

export interface WelcomeEmailParams {
  email: string;
  firstName: string;
  password?: string;
  simulationTitle: string;
  simulationId: string;
}

export const sendWelcomeEmail = async (
  optionsOrEmail: WelcomeEmailParams | string,
  firstName?: string,
  password?: string,
  simulationTitle?: string,
  simulationId?: string
) => {
  try {
    let emailVal: string;
    let firstNameVal: string;
    let passwordVal: string;
    let simulationTitleVal: string;
    let simulationIdVal: string;

    if (typeof optionsOrEmail === "object" && optionsOrEmail !== null) {
      emailVal = optionsOrEmail.email;
      firstNameVal = optionsOrEmail.firstName;
      passwordVal = optionsOrEmail.password || "survive";
      simulationTitleVal = optionsOrEmail.simulationTitle;
      simulationIdVal = optionsOrEmail.simulationId;
    } else {
      emailVal = optionsOrEmail;
      firstNameVal = firstName || "";
      passwordVal = password || "survive";
      simulationTitleVal = simulationTitle || "";
      simulationIdVal = simulationId || "";
    }

    let finalPassword = passwordVal;
    if (finalPassword && /^\$2[ayb]\$.{56}$/.test(finalPassword)) {
      // Si c'est un hash bcrypt, on ne peut pas afficher le mot de passe en clair.
      // On utilise la valeur par défaut "survive" pour les comptes configurés via script.
      finalPassword = "survive";
    }

    const magicToken = generateMagicToken(emailVal);

    const baseUrl = process.env.NEXTAUTH_URL || "https://survivetn.vercel.app";

    const mailOptions = {
      from: {
        name: "SURVIVE - Équipe de Simulation",
        address: process.env.EMAIL_USER || "prenetflix99@gmail.com",
      },
      to: emailVal,
      subject: `S.U.R.V.I.V.E. - Invitation à la simulation de crise "${simulationTitleVal}"`,
      html: welcomeEmailTemplate({
        firstName: firstNameVal,
        userEmail: emailVal,
        password: finalPassword,
        simulationTitle: simulationTitleVal,
        simulationId: simulationIdVal,
        baseUrl,
        magicToken
      }),
    };

    console.log("Options de l'email :", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    const info = await transporter.sendMail(mailOptions);
    console.log("Email envoyé avec succès :", info);
    return info;
  } catch (error) {
    console.error("Erreur détaillée lors de l'envoi de l'email :", error);
    throw error;
  }
};
