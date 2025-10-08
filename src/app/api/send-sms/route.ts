import { NextResponse } from 'next/server';
import twilio from 'twilio';

// Désactiver le cache pour cette route
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { to, message, fromName } = await request.json();
    
    if (!to || !message) {
      return NextResponse.json(
        { error: 'Les champs "to" et "message" sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que les variables d'environnement sont définies
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = '+15707554683'; // Votre numéro Twilio

    if (!accountSid || !authToken) {
      console.error('Les identifiants Twilio ne sont pas configurés');
      return NextResponse.json(
        { error: 'Configuration serveur incomplète' },
        { status: 500 }
      );
    }

    // Initialiser le client Twilio
    const client = twilio(accountSid, authToken);

    // Formater le message avec le nom complet du profil
    const cleanFromName = (fromName || 'Expéditeur inconnu').trim();
    const formattedMessage = `${cleanFromName}:\n${message}`;

    // Envoyer le SMS
    const result = await client.messages.create({
      body: formattedMessage,
      from: fromNumber,
      to: to
    });

    console.log('SMS envoyé avec succès:', {
      to,
      fromName: cleanFromName,
      messageLength: message.length,
      sid: result.sid
    });
    
    return NextResponse.json({
      success: true,
      sid: result.sid,
      status: result.status,
      dateCreated: result.dateCreated
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'envoi du SMS:', error);
    
    // Gérer les erreurs spécifiques à Twilio
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    const statusCode = errorMessage.includes('not a valid phone number') ? 400 : 500;
    
    return NextResponse.json(
      { 
        error: 'Échec de l\'envoi du SMS',
        details: errorMessage 
      },
      { status: statusCode }
    );
  }
}
