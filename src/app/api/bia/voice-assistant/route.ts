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
    const { transcript, fieldContext } = await request.json();

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Transcript invalide" },
        { status: 400 }
      );
    }

    // Appeler Azure OpenAI pour interpréter la commande vocale
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Tu es un assistant vocal intelligent pour un système de validation de données BIA.

CONTEXTE DU CHAMP ACTUEL:
- Label: ${fieldContext.label}
- Type: ${fieldContext.type}
- Valeur extraite par l'IA: ${JSON.stringify(fieldContext.extractedValue)}
- Valeur actuelle dans le formulaire: ${JSON.stringify(
            fieldContext.currentValue
          )}

L'utilisateur a dit: "${transcript}"

TON RÔLE:
Analyser ce que l'utilisateur veut faire et retourner un JSON avec:
{
  "action": "confirm" | "reject" | "modify" | "navigate_next" | "navigate_previous" | "repeat" | "stop" | "help",
  "newValue": "valeur si modification demandée (null sinon)",
  "response": "Réponse vocale à dire à l'utilisateur",
  "confidence": 0.0 à 1.0
}

ACTIONS POSSIBLES:
- "confirm": L'utilisateur confirme la valeur actuelle (ex: "oui", "c'est bon", "valide", "confirme", "ok", "correct", "suivant", "passe")
- "reject": L'utilisateur rejette/ignore ce champ (ex: "non", "ignore", "passe sans valeur", "laisse vide")
- "modify": L'utilisateur veut modifier la valeur (ex: "change en X", "mets Y", "non c'est Z", "plutôt X")
- "navigate_next": Passer au champ suivant explicitement
- "navigate_previous": Revenir au champ précédent (ex: "retour", "précédent", "arrière")
- "repeat": Répéter la question (ex: "répète", "encore", "quoi")
- "stop": Arrêter le mode vocal (ex: "stop", "arrête", "termine")
- "help": Demande d'aide sur ce champ

RÈGLES:
1. Si l'utilisateur donne une nouvelle valeur (nombre, texte), utilise "modify" avec la newValue extraite
2. Pour un champ number, extrais les chiffres de ce qu'il dit
3. Pour un champ date, essaie de parser la date dite
4. Sois flexible sur les formulations (ex: "ouais" = "oui", "nan" = "non")
5. Si l'utilisateur dit "non" puis une valeur, c'est une modification, pas un rejet
6. Si ambiguë, demande confirmation avec confidence < 0.7

Retourne UNIQUEMENT le JSON, rien d'autre.`,
        },
        {
          role: "user",
          content: transcript,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
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

    // Validation du résultat
    const validActions = [
      "confirm",
      "reject",
      "modify",
      "navigate_next",
      "navigate_previous",
      "repeat",
      "stop",
      "help",
    ];

    if (!validActions.includes(parsedResult.action)) {
      parsedResult.action = "help";
      parsedResult.response =
        "Je n'ai pas bien compris. Pouvez-vous reformuler ?";
      parsedResult.confidence = 0.3;
    }

    return NextResponse.json(parsedResult);
  } catch (error) {
    console.error("Erreur voice-assistant API:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse de la commande vocale" },
      { status: 500 }
    );
  }
}
