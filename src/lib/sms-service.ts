import { toast } from "sonner";
import { twilioService } from "./twilio-service";
import { env } from "@/config/env";

interface SendSmsOptions {
  to: string;
  message: string;
  country?: string;
}

/**
 * Envoie un SMS à un numéro de téléphone
 * @param options Les options d'envoi du SMS
 * @returns Une promesse résolue avec un booléen indiquant si l'envoi a réussi
 */
export async function sendSms({ to, message }: SendSmsOptions): Promise<boolean> {
  console.log(`Tentative d'envoi de SMS à ${to}`, { message });
  
  try {
    const result = await twilioService.sendSms(to, message);
    
    if (!result.success) {
      throw new Error(result.error || 'Échec de l\'envoi du SMS');
    }

    toast.success('SMS envoyé avec succès');
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur lors de l\'envoi du SMS:', error);
    toast.error(`Erreur d'envoi de SMS: ${errorMessage}`);
    return false;
  }
}

/**
 * Valide un numéro de téléphone
 * @param phoneNumber Le numéro de téléphone à valider
 * @param country Le code pays (optionnel, utilisé comme fallback)
 * @returns Un objet avec les informations de validation
 */
export async function validatePhoneNumber(
  phoneNumber: string, 
  country: string = 'FR'
): Promise<{
  isValid: boolean;
  internationalFormat: string;
  localFormat: string;
  countryCode: string;
  countryName: string;
  carrier: string;
}> {
  try {
    const result = await twilioService.validatePhoneNumber(phoneNumber);
    
    return {
      isValid: result.isValid,
      internationalFormat: result.formattedNumber || phoneNumber,
      localFormat: result.formattedNumber || phoneNumber,
      countryCode: result.countryCode || country,
      countryName: result.countryCode || country, // Twilio ne fournit pas le nom du pays
      carrier: result.carrier?.name || 'Inconnu',
    };
  } catch (error) {
    console.error('Erreur lors de la validation du numéro de téléphone:', error);
    // En cas d'erreur, on considère que le numéro est valide pour ne pas bloquer l'envoi
    return {
      isValid: true,
      internationalFormat: phoneNumber,
      localFormat: phoneNumber,
      countryCode: country,
      countryName: country,
      carrier: 'Inconnu',
    };
  }
}

/**
 * Vérifie si un numéro de téléphone est valide
 * @param phoneNumber Le numéro de téléphone à vérifier
 * @returns Un booléen indiquant si le numéro est valide
 */
export async function isPhoneNumberValid(phoneNumber: string, country: string = 'FR'): Promise<boolean> {
  const { isValid } = await validatePhoneNumber(phoneNumber, country);
  return isValid;
}
