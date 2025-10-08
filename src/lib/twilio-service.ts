import twilio from 'twilio';
import { env } from '../config/env';

class TwilioService {
  private static instance: TwilioService;
  private client: twilio.Twilio;
  private readonly fromNumber = '+15707554683'; // Votre numéro Twilio

  private constructor() {
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
      throw new Error('Les identifiants Twilio ne sont pas configurés');
    }

    this.client = twilio(
      env.TWILIO_ACCOUNT_SID,
      env.TWILIO_AUTH_TOKEN
    );
  }

  public static getInstance(): TwilioService {
    if (!TwilioService.instance) {
      TwilioService.instance = new TwilioService();
    }
    return TwilioService.instance;
  }

  /**
   * Envoie un SMS via Twilio
   * @param to Numéro de téléphone du destinataire (format international: +33612345678)
   * @param message Contenu du message
   */
  public async sendSms(to: string, message: string): Promise<{
    success: boolean;
    sid?: string;
    error?: string;
  }> {
    try {
      // Nettoyer le numéro (supprimer les espaces et les caractères spéciaux)
      const cleanTo = to.replace(/[^\d+]/g, '');
      
      // Vérifier que le numéro est valide
      if (!this.isValidPhoneNumber(cleanTo)) {
        console.error('Numéro de téléphone invalide:', cleanTo);
        return { success: false, error: 'Numéro de téléphone invalide' };
      }

      // Envoyer le SMS
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: cleanTo,
      });

      console.log('SMS envoyé avec succès:', result.sid);
      return { success: true, sid: result.sid };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors de l\'envoi du SMS:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Valide un numéro de téléphone avec l'API Lookup de Twilio
   * @param phoneNumber Numéro de téléphone à valider
   */
  public async validatePhoneNumber(phoneNumber: string): Promise<{
    isValid: boolean;
    formattedNumber?: string;
    carrier?: {
      name: string;
      type: string;
    };
    countryCode?: string;
    error?: string;
  }> {
    try {
      // En mode développement, simuler une validation réussie
      if (process.env.NODE_ENV === 'development' && !env.TWILIO_ACCOUNT_SID) {
        console.warn('Mode développement - Validation de numéro simulée');
        return {
          isValid: true,
          formattedNumber: phoneNumber,
          carrier: { name: 'Développement', type: 'mobile' },
          countryCode: 'FR',
        };
      }

      const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
      
      const result = await this.client.lookups.v2.phoneNumbers(cleanNumber)
        .fetch({ fields: 'line_type_intelligence,carrier' });
      
      return {
        isValid: true,
        formattedNumber: result.phoneNumber,
        carrier: result.carrier ? {
          name: result.carrier.name || 'Inconnu',
          type: result.carrier.type || 'mobile',
        } : undefined,
        countryCode: result.countryCode,
      };
    } catch (error) {
      // Si le numéro n'est pas valide, Twilio renvoie une erreur 404
      if ((error as any).status === 404) {
        return { isValid: false, error: 'Numéro de téléphone invalide' };
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors de la validation du numéro:', error);
      return { isValid: false, error: errorMessage };
    }
  }

  /**
   * Vérifie si un numéro de téléphone est valide (format basique)
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Expression régulière pour les numéros internationaux
    // Accepte les numéros commençant par + suivi de 10 à 15 chiffres
    const phoneRegex = /^\+[1-9]\d{9,14}$/;
    return phoneRegex.test(phoneNumber);
  }
}

// Exporter une instance unique du service
export const twilioService = TwilioService.getInstance();
