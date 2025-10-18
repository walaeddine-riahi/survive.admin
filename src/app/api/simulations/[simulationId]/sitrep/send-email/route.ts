import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import puppeteer from "puppeteer";

// Créer le transporteur email
const createTransporter = () => {
  console.log("🔍 Vérification des variables d'environnement:");
  console.log(
    "  EMAIL_USER:",
    process.env.EMAIL_USER ? "✅ Configuré" : "❌ Manquant"
  );
  console.log(
    "  EMAIL_PASS:",
    process.env.EMAIL_PASS ? "✅ Configuré" : "❌ Manquant"
  );

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    const error = `Variables d'environnement manquantes: EMAIL_USER=${
      !process.env.EMAIL_USER ? "MANQUANT" : "OK"
    }, EMAIL_PASS=${!process.env.EMAIL_PASS ? "MANQUANT" : "OK"}`;
    console.error("❌", error);
    throw new Error(error);
  }

  console.log("✅ Configuration email valide, création du transporteur...");
  return nodemailer.createTransport({
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
};

// Générer le HTML du SITREP pour le PDF
const generateSitrepHTML = (title: string, content: string) => {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
      background-color: #fff;
      padding: 40px;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 24pt;
      margin-bottom: 10px;
      font-weight: bold;
    }
    
    .header .meta {
      font-size: 10pt;
      opacity: 0.9;
    }
    
    .content {
      background: #f9fafb;
      padding: 30px;
      border-radius: 0 0 8px 8px;
      border: 1px solid #e5e7eb;
    }
    
    .content pre {
      font-family: 'Courier New', monospace;
      white-space: pre-wrap;
      word-wrap: break-word;
      line-height: 1.8;
      font-size: 10pt;
    }
    
    .section {
      margin-bottom: 20px;
      padding: 15px;
      background: white;
      border-left: 4px solid #667eea;
      border-radius: 4px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      font-size: 9pt;
      color: #6b7280;
    }
    
    .watermark {
      position: fixed;
      bottom: 20px;
      right: 20px;
      opacity: 0.1;
      font-size: 48pt;
      color: #667eea;
      transform: rotate(-45deg);
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div class="watermark">SITREP</div>
  
  <div class="header">
    <h1>📋 ${title}</h1>
    <div class="meta">
      Généré le ${new Date().toLocaleString("fr-FR", {
        dateStyle: "full",
        timeStyle: "short",
      })}
    </div>
  </div>
  
  <div class="content">
    <div class="section">
      <pre>${content}</pre>
    </div>
  </div>
  
  <div class="footer">
    <p><strong>Document confidentiel</strong></p>
    <p>Ce rapport SITREP a été généré automatiquement par le système de gestion de crise</p>
    <p>&copy; ${new Date().getFullYear()} - Tous droits réservés</p>
  </div>
</body>
</html>
  `;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, recipientEmail } = body;

    if (!title || !content || !recipientEmail) {
      return NextResponse.json(
        { error: "Données manquantes (title, content, recipientEmail)" },
        { status: 400 }
      );
    }

    console.log("📄 Génération du PDF SITREP...");
    const startTime = Date.now();

    // Générer le PDF avec Puppeteer (optimisé pour la vitesse)
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
      timeout: 60000, // 60 secondes de timeout
    });

    const page = await browser.newPage();

    // Désactiver les ressources inutiles pour accélérer
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (["image", "stylesheet", "font"].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    const html = generateSitrepHTML(title, content);

    // Utiliser domcontentloaded au lieu de networkidle0 (plus rapide)
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
      timeout: 30000,
    });

    await browser.close();

    const generationTime = Date.now() - startTime;
    console.log(
      `✅ PDF généré avec succès en ${generationTime}ms, taille: ${pdfBuffer.length} bytes`
    );

    // Envoyer l'email avec le PDF en pièce jointe
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: "Système de Gestion de Crise",
        address: process.env.EMAIL_USER || "prenetflix99@gmail.com",
      },
      to: recipientEmail,
      subject: `📋 ${title}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color: #f4f4f7;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f7; padding: 40px 0;">
            <tr>
              <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);">
                  <tr>
                    <td align="center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px;">
                      <h1 style="margin: 0; font-size: 24px; color: #ffffff;">📋 Nouveau SITREP</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px; color: #111827; font-size: 16px; line-height: 1.6;">
                      <p>Bonjour,</p>
                      <p>Un nouveau rapport SITREP a été généré :</p>
                      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Titre :</strong> ${title}</p>
                        <p style="margin: 10px 0 0 0;"><strong>Date :</strong> ${new Date().toLocaleString(
                          "fr-FR"
                        )}</p>
                      </div>
                      <p>Le rapport complet est disponible en pièce jointe au format PDF.</p>
                      <p style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                        ⚠️ <strong>Important :</strong> Ce document contient des informations confidentielles. Merci de le traiter avec la plus grande attention.
                      </p>
                      <p style="margin-top: 40px; font-style: italic; color: #6b7280;">Cordialement,<br>Système de Gestion de Crise</p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="background-color: #f9fafb; padding: 20px; font-size: 13px; color: #6b7280;">
                      <p>Ce message a été généré automatiquement. Merci de ne pas y répondre.</p>
                      <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} Système de Gestion de Crise. Tous droits réservés.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `SITREP_${title.replace(
            /[^a-zA-Z0-9]/g,
            "_"
          )}_${Date.now()}.pdf`,
          content: Buffer.from(pdfBuffer),
          contentType: "application/pdf",
        },
      ],
    };

    console.log("Envoi de l'email à:", recipientEmail);
    const info = await transporter.sendMail(mailOptions);
    console.log(
      "Email envoyé avec succès:",
      info?.messageId || "ID non disponible"
    );

    return NextResponse.json({
      success: true,
      message: "SITREP envoyé par email avec succès",
      messageId: info?.messageId || "N/A",
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi du SITREP par email:", error);

    let errorMessage = "Erreur inconnue";
    if (error instanceof Error) {
      errorMessage = error.message;
      if (
        error.message.includes("timeout") ||
        error.message.includes("Navigation")
      ) {
        errorMessage =
          "Timeout lors de la génération du PDF. Le serveur met trop de temps à répondre.";
      }
    }

    return NextResponse.json(
      {
        error: "Erreur lors de l'envoi du SITREP par email",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
