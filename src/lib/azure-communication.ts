// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EmailClient = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SmsClient = any;

// Note: Installez les packages Azure si vous souhaitez activer ces fonctionnalités:
// npm install @azure/communication-email @azure/communication-sms --legacy-peer-deps
// import { EmailClient } from "@azure/communication-email";
// import { SmsClient } from "@azure/communication-sms";

/**
 * Service pour gérer les communications (emails et SMS) via Azure Communication Services
 */
class AzureCommunicationService {
  private emailClient: EmailClient | null = null;
  private smsClient: SmsClient | null = null;
  private fromEmail: string;

  constructor() {
    this.fromEmail =
      process.env.AZURE_COMMUNICATION_EMAIL_FROM || "donotreply@yourdomain.com";
    this.initialize();
  }

  private initialize() {
    const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;

    if (!connectionString) {
      console.warn(
        "⚠️ AZURE_COMMUNICATION_CONNECTION_STRING non configuré, les services de communication sont désactivés"
      );
      return;
    }

    try {
      // Note: Décommentez ces lignes après avoir installé les packages Azure
      // this.emailClient = new EmailClient(connectionString);
      // this.smsClient = new SmsClient(connectionString);

      console.log(
        "⚠️ Azure Communication Services non disponibles (packages non installés)"
      );
    } catch (error) {
      console.error(
        "❌ Erreur lors de l'initialisation d'Azure Communication:",
        error
      );
    }
  }

  /**
   * Vérifie si le service email est disponible
   */
  isEmailAvailable(): boolean {
    return this.emailClient !== null;
  }

  /**
   * Vérifie si le service SMS est disponible
   */
  isSmsAvailable(): boolean {
    return this.smsClient !== null;
  }

  /**
   * Envoie un email via Azure Communication Services
   */
  async sendEmail(options: {
    to: string | string[];
    subject: string;
    htmlContent?: string;
    textContent?: string;
    cc?: string[];
    bcc?: string[];
    attachments?: Array<{
      name: string;
      contentType: string;
      content: string; // Base64 encoded
    }>;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.emailClient) {
      return {
        success: false,
        error: "Service email non configuré",
      };
    }

    try {
      const recipients = Array.isArray(options.to)
        ? options.to.map((email) => ({ address: email }))
        : [{ address: options.to }];

      const message = {
        senderAddress: this.fromEmail,
        content: {
          subject: options.subject,
          plainText: options.textContent || "",
          html: options.htmlContent,
        },
        recipients: {
          to: recipients,
          cc: options.cc?.map((email) => ({ address: email })),
          bcc: options.bcc?.map((email) => ({ address: email })),
        },
        attachments: options.attachments?.map((att) => ({
          name: att.name,
          contentType: att.contentType,
          contentInBase64: att.content,
        })),
      };

      const poller = await this.emailClient.beginSend(message);
      const result = await poller.pollUntilDone();

      console.log(`✅ Email envoyé avec succès - ID: ${result.id}`);

      return {
        success: true,
        messageId: result.id,
      };
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi d'email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      };
    }
  }

  /**
   * Envoie un email simple (compatibilité avec l'ancien système Nodemailer)
   */
  async sendSimpleEmail(
    to: string,
    subject: string,
    html: string
  ): Promise<boolean> {
    const result = await this.sendEmail({
      to,
      subject,
      htmlContent: html,
    });
    return result.success;
  }

  /**
   * Envoie un SMS via Azure Communication Services
   */
  async sendSms(options: {
    to: string;
    message: string;
    from?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.smsClient) {
      return {
        success: false,
        error: "Service SMS non configuré",
      };
    }

    try {
      // Le numéro "from" doit être un numéro acheté via Azure Communication Services
      const fromNumber =
        options.from || process.env.AZURE_COMMUNICATION_PHONE_NUMBER;

      if (!fromNumber) {
        return {
          success: false,
          error:
            "Numéro d'expéditeur non configuré (AZURE_COMMUNICATION_PHONE_NUMBER)",
        };
      }

      const sendResults = await this.smsClient.send({
        from: fromNumber,
        to: [options.to],
        message: options.message,
      });

      const result = sendResults[0];

      if (result.successful) {
        console.log(`✅ SMS envoyé avec succès - ID: ${result.messageId}`);
        return {
          success: true,
          messageId: result.messageId,
        };
      } else {
        console.error(`❌ Échec de l'envoi du SMS: ${result.errorMessage}`);
        return {
          success: false,
          error: result.errorMessage,
        };
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi de SMS:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      };
    }
  }

  /**
   * Envoie un email de SITREP (rapport de situation)
   */
  async sendSitrepEmail(options: {
    to: string;
    simulationName: string;
    sitrepContent: string;
    participantName: string;
  }): Promise<boolean> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0078d4; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f5f5f5; }
          .footer { padding: 10px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 SITREP - ${options.simulationName}</h1>
          </div>
          <div class="content">
            <p><strong>De:</strong> ${options.participantName}</p>
            <p><strong>Simulation:</strong> ${options.simulationName}</p>
            <hr>
            <h3>Contenu du rapport:</h3>
            <div style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 5px;">
              ${options.sitrepContent}
            </div>
          </div>
          <div class="footer">
            <p>S.U.R.V.I.V.E. Resilience Platform</p>
            <p>When the going gets tough, the tough get going</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await this.sendEmail({
      to: options.to,
      subject: `SITREP - ${options.simulationName}`,
      htmlContent,
    });

    return result.success;
  }

  /**
   * Envoie un email de bienvenue à un nouvel utilisateur
   */
  async sendWelcomeEmail(
    to: string,
    firstName: string,
    tempPassword?: string
  ): Promise<boolean> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0078d4; color: white; padding: 20px; text-center; }
          .content { padding: 20px; }
          .button { display: inline-block; padding: 10px 20px; background-color: #0078d4; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue sur S.U.R.V.I.V.E. Resilience</h1>
          </div>
          <div class="content">
            <p>Bonjour ${firstName},</p>
            <p>Bienvenue sur la plateforme S.U.R.V.I.V.E. Resilience !</p>
            <p>Notre plateforme vous aide à gérer la continuité d'activité et à simuler des situations de crise.</p>
            ${
              tempPassword
                ? `<p><strong>Votre mot de passe temporaire:</strong> ${tempPassword}</p>
                   <p><em>Veuillez le changer lors de votre première connexion.</em></p>`
                : ""
            }
            <p><a href="${
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002"
            }" class="button">Accéder à la plateforme</a></p>
            <p>Si vous avez des questions, n'hésitez pas à contacter notre équipe de support.</p>
            <p>Cordialement,<br>L'équipe S.U.R.V.I.V.E. Resilience</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await this.sendEmail({
      to,
      subject: "Bienvenue sur S.U.R.V.I.V.E. Resilience",
      htmlContent,
    });

    return result.success;
  }
}

// Export d'une instance singleton
export const azureCommunication = new AzureCommunicationService();

// Export pour compatibilité avec l'ancien code
export const sendEmail = (to: string, subject: string, html: string) =>
  azureCommunication.sendSimpleEmail(to, subject, html);

export const sendSms = (to: string, message: string) =>
  azureCommunication.sendSms({ to, message });
