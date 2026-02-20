import { NextRequest, NextResponse } from "next/server";
import { AzureOpenAI } from "openai";

const openai = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o",
});

export async function POST(request: NextRequest) {
  try {
    const { fieldContext } = await request.json();

    if (!fieldContext) {
      return NextResponse.json(
        { error: "Contexte du champ manquant" },
        { status: 400 }
      );
    }

    // Appeler Azure OpenAI pour générer une question intelligente
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Tu es un assistant vocal expert en Business Impact Analysis (BIA) qui pose des questions de validation de manière naturelle et professionnelle.

CONTEXTE DU CHAMP:
- Label: ${fieldContext.label}
- Type: ${fieldContext.type}
- Description: ${fieldContext.description || "Non fournie"}
- Valeur extraite par l'IA: ${JSON.stringify(fieldContext.extractedValue)}
- Valeur actuelle: ${JSON.stringify(fieldContext.currentValue)}

TON RÔLE:
Générer une question vocale naturelle et engageante pour valider ce champ.

RÈGLES POUR LA QUESTION:
1. Commence par le nom du champ de manière claire
2. Mentionne la valeur trouvée par l'IA (ou "aucune valeur" si vide/null)
3. Demande confirmation de manière naturelle et conversationnelle
4. Si la valeur semble inhabituelle, mentionne-le subtilement
5. Pour les champs importants (RTO, RPO, criticité), ajoute un petit contexte
6. Garde la question concise (2-3 phrases max)
7. Utilise un ton professionnel mais accessible
8. Suggère les options possibles (confirmer, modifier, ignorer)

EXEMPLES DE BONNES QUESTIONS:

Pour un champ "Nom du processus" avec valeur "Gestion des stocks":
"Nom du processus. L'intelligence artificielle a identifié 'Gestion des stocks'. Est-ce que cela vous semble correct ? Vous pouvez confirmer, proposer une correction, ou ignorer ce champ."

Pour un RTO avec valeur "24":
"RTO, le temps de reprise objectif. L'IA a trouvé 24 heures. C'est le délai maximal acceptable pour rétablir ce processus. Cette valeur vous convient-elle ?"

Pour un champ vide:
"Propriétaire du processus. L'IA n'a trouvé aucune information. Souhaitez-vous indiquer un nom, ou passer ce champ pour l'instant ?"

Pour un champ "Criticité" avec valeur "Élevée":
"Niveau de criticité. L'IA estime que c'est 'Élevée'. Êtes-vous d'accord avec cette évaluation ?"

Retourne un JSON avec:
{
  "question": "La question à poser vocalement",
  "tone": "friendly" | "formal" | "urgent" (selon l'importance du champ),
  "suggestions": ["option1", "option2", "option3"] (suggestions de réponses possibles)
}

Retourne UNIQUEMENT le JSON, rien d'autre.`,
        },
        {
          role: "user",
          content: `Génère une question pour le champ "${fieldContext.label}" de type ${fieldContext.type} avec la valeur "${fieldContext.extractedValue}".`,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      return NextResponse.json(
        { error: "Pas de réponse de l'IA" },
        { status: 500 }
      );
    }

    const parsedResult = JSON.parse(result);

    // Validation
    if (!parsedResult.question || typeof parsedResult.question !== "string") {
      return NextResponse.json(
        { question: `${fieldContext.label}. Est-ce correct ?` },
        { status: 200 }
      );
    }

    return NextResponse.json(parsedResult);
  } catch (error) {
    console.error("Erreur voice-assistant/question API:", error);

    // Fallback en cas d'erreur
    return NextResponse.json(
      {
        question: "Ce champ est-il correct ?",
        tone: "friendly",
        suggestions: ["confirmer", "modifier", "ignorer"],
      },
      { status: 200 }
    );
  }
}
