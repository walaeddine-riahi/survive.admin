import { NextResponse } from 'next/server';
import { twilioService } from '@/lib/twilio-service';

export async function POST(request: Request) {
  try {
    const { to, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Les champs "to" et "message" sont requis' },
        { status: 400 }
      );
    }

    // Envoyer le SMS via Twilio
    const result = await twilioService.sendSms(to, message);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Échec de l\'envoi du SMS' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'SMS envoyé avec succès',
      data: { 
        sid: result.sid,
        to,
        message,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi du SMS:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { 
        error: 'Une erreur est survenue lors de l\'envoi du SMS',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
