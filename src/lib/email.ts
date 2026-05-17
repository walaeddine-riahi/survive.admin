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
  magicToken,
  sessionId,
  participantId
}: {
  firstName: string;
  userEmail: string;
  password?: string;
  simulationTitle: string;
  simulationId: string;
  baseUrl: string;
  magicToken?: string;
  sessionId?: string;
  participantId?: string;
}) => {
  const ctaUrl = (sessionId && participantId)
    ? `${baseUrl}/simulation/${simulationId}/live?sessionId=${sessionId}&participantId=${participantId}`
    : magicToken 
      ? `${baseUrl}/magic-login?token=${magicToken}&simulationId=${simulationId}`
      : `${baseUrl}/simulation/${simulationId}/participant-view`;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation à l'exercice de gestion de crise - S.U.R.V.I.V.E.</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
    body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #0A0A0A; color: #E5E5E5; -webkit-font-smoothing: antialiased; }
    .container { width: 100%; padding: 40px 10px; background-color: #0A0A0A; }
    .card { max-width: 600px; margin: 0 auto; background-color: #121212; border-radius: 12px; overflow: hidden; border: 1px solid #262626; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8); }
    .accent-line { height: 4px; background: linear-gradient(90deg, #F97316 0%, #EA580C 50%, #C2410C 100%); }
    .header { padding: 40px 30px 20px; text-align: center; }
    .logo { font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #FFFFFF; text-transform: uppercase; }
    .subtitle { font-size: 11px; font-weight: 800; color: #EA580C; letter-spacing: 5px; text-transform: uppercase; margin-top: 8px; }
    .banner { padding: 10px 40px 30px; text-align: center; border-bottom: 1px solid #1F1F1F; }
    .badge { display: inline-block; background-color: rgba(234, 88, 12, 0.1); border: 1px solid rgba(234, 88, 12, 0.2); border-radius: 4px; padding: 6px 14px; font-size: 11px; font-weight: 800; color: #EA580C; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 20px; }
    .title { margin: 0; font-size: 26px; font-weight: 800; color: #FFFFFF; line-height: 1.3; letter-spacing: -0.5px; }
    .desc { margin: 12px 0 0; font-size: 15px; color: #A3A3A3; }
    .sim-tag { display: inline-block; background-color: #171717; border: 1px solid #262626; border-radius: 6px; padding: 10px 20px; margin-top: 20px; }
    .sim-tag-text { font-size: 14px; font-weight: 600; color: #D4D4D4; }
    .content { padding: 40px 45px; color: #D4D4D4; font-size: 15px; line-height: 1.7; }
    .greeting { margin: 0 0 20px; font-size: 17px; color: #FFFFFF; font-weight: 600; }
    .creds-box { background-color: #0F0F0F; border: 1px solid #262626; border-radius: 12px; margin: 35px 0; padding: 30px; }
    .creds-title { font-size: 12px; font-weight: 800; color: #A3A3A3; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 24px; display: flex; align-items: center; }
    .creds-label { color: #737373; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px; }
    .creds-val { padding: 14px 18px; background-color: #171717; border: 1px solid #262626; border-radius: 8px; font-family: monospace; color: #FFFFFF; font-size: 16px; font-weight: 700; letter-spacing: 1px; margin-bottom: 20px; }
    .creds-val.pwd { color: #EA580C; }
    .creds-warn { margin: 0; font-size: 12px; color: #737373; font-style: italic; }
    .req-box { margin: 35px 0; padding: 25px; background: linear-gradient(180deg, rgba(234,88,12,0.03) 0%, rgba(234,88,12,0) 100%); border: 1px solid #262626; border-radius: 12px; }
    .req-title { font-size: 13px; font-weight: 800; color: #FFFFFF; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px; }
    .req-list { list-style: none; padding: 0; margin: 0; }
    .req-item { font-size: 14px; color: #A3A3A3; margin-bottom: 12px; padding-left: 20px; position: relative; }
    .req-item:before { content: "→"; position: absolute; left: 0; color: #EA580C; font-weight: bold; }
    .cta-container { text-align: center; margin: 45px 0 30px; }
    .cta-btn { display: inline-block; background: #EA580C; background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); color: #FFFFFF; text-decoration: none; padding: 18px 48px; border-radius: 8px; font-weight: 800; font-size: 15px; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 10px 25px -5px rgba(234, 88, 12, 0.4); border: 1px solid rgba(255, 255, 255, 0.2); transition: transform 0.2s, box-shadow 0.2s; }
    .cta-link { margin: 20px 0 0; font-size: 12px; color: #525252; text-align: center; }
    .cta-link a { color: #EA580C; text-decoration: underline; }
    .footer { background-color: #0A0A0A; padding: 35px 45px; border-top: 1px solid #1F1F1F; text-align: center; }
    .footer p { margin: 0; font-size: 12px; color: #525252; line-height: 1.6; }
    .footer .copy { margin-top: 16px; font-weight: 600; color: #737373; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="accent-line"></div>
      
      <div class="header">
        <div class="logo">S.U.R.V.I.V.E.</div>
        <div class="subtitle">Resilience Simulation Network</div>
      </div>

      <div class="banner">
        <div class="badge">🚨 Déploiement Tactique</div>
        <h1 class="title">Alerte d'incubation opérationnelle</h1>
        <p class="desc">Vous avez été désigné(e) pour intégrer la cellule de réponse aux incidents.</p>
        <div class="sim-tag">
          <span class="sim-tag-text">Opérationnel : ${simulationTitle}</span>
        </div>
      </div>
      
      <div class="content">
        <p class="greeting">Bonjour ${firstName},</p>
        <p>Dans le cadre des protocoles de continuité d'activité de notre réseau, vous êtes affecté(e) en tant que participant officiel à l'exercice de crise sur la plateforme de simulation avancée <strong>SURVIVE</strong>.</p>
        
        <div class="creds-box">
          <div class="creds-title">🔐 Vos Accès Sécurisés</div>
          
          <span class="creds-label">Identifiant (E-mail)</span>
          <div class="creds-val">${userEmail}</div>
          
          <span class="creds-label">Mot de passe temporaire</span>
          <div class="creds-val pwd" style="margin-bottom: 15px;">${password || "survive"}</div>
          
          <p class="creds-warn">⚠️ Ce mot de passe est strictement personnel. Ne le partagez avec personne.</p>
        </div>

        <div class="req-box">
          <h3 class="req-title">Vos objectifs d'intervention :</h3>
          <ul class="req-list">
            <li class="req-item">Traiter et réagir en temps réel aux injections (emails, sms, appels)</li>
            <li class="req-item">Coordonner la réponse via la messagerie inter-cellules</li>
            <li class="req-item">Consulter les documents de crise mis à disposition</li>
          </ul>
        </div>

        <div class="cta-container">
          <a href="${ctaUrl}" class="cta-btn" target="_blank">Rejoindre la simulation</a>
        </div>

        <p class="cta-link">
          Si le bouton ne fonctionne pas, copiez ce lien : <br>
          <a href="${ctaUrl}">${ctaUrl}</a>
        </p>
      </div>

      <div class="footer">
        <p>Notification système sécurisée générée par S.U.R.V.I.V.E.<br>Merci de ne pas répondre à cet e-mail.</p>
        <p class="copy">© ${new Date().getFullYear()} S.U.R.V.I.V.E. Resilience Network. Tous droits réservés.</p>
      </div>
    </div>
  </div>
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
  sessionId?: string;
  participantId?: string;
}

export const sendWelcomeEmail = async (
  optionsOrEmail: WelcomeEmailParams | string,
  firstName?: string,
  password?: string,
  simulationTitle?: string,
  simulationId?: string,
  sessionId?: string,
  participantId?: string
) => {
  try {
    let emailVal: string;
    let firstNameVal: string;
    let passwordVal: string;
    let simulationTitleVal: string;
    let simulationIdVal: string;
    let sessionIdVal: string | undefined;
    let participantIdVal: string | undefined;

    if (typeof optionsOrEmail === "object" && optionsOrEmail !== null) {
      emailVal = optionsOrEmail.email;
      firstNameVal = optionsOrEmail.firstName;
      passwordVal = optionsOrEmail.password || "survive";
      simulationTitleVal = optionsOrEmail.simulationTitle;
      simulationIdVal = optionsOrEmail.simulationId;
      sessionIdVal = optionsOrEmail.sessionId;
      participantIdVal = optionsOrEmail.participantId;
    } else {
      emailVal = optionsOrEmail;
      firstNameVal = firstName || "";
      passwordVal = password || "survive";
      simulationTitleVal = simulationTitle || "";
      simulationIdVal = simulationId || "";
      sessionIdVal = sessionId;
      participantIdVal = participantId;
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
        magicToken,
        sessionId: sessionIdVal,
        participantId: participantIdVal
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
