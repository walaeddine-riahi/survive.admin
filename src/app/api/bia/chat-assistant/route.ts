import { NextRequest, NextResponse } from "next/server";
import { AzureOpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const openai = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o",
});

export async function POST(request: NextRequest) {
  try {
    const { messages, fieldContext } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages invalides" },
        { status: 400 }
      );
    }

    // Contexte système pour l'assistant
    const systemMessage: ChatCompletionMessageParam = {
      role: "system" as const,
      content: `Tu es un assistant IA expert en Business Impact Analysis (BIA) qui aide l'utilisateur à vérifier et compléter les données extraites d'un document.

CONTEXTE DU CHAMP ACTUEL:
- Nom du champ: ${fieldContext.label}
- Type: ${fieldContext.type}
- Valeur extraite par l'IA: ${JSON.stringify(fieldContext.extractedValue)}
- Valeur actuelle: ${JSON.stringify(fieldContext.currentValue)}

TES RÔLES:
1. Aider l'utilisateur à comprendre ce champ et son importance
2. Vérifier si la valeur extraite semble correcte
3. Suggérer des corrections si nécessaire
4. Répondre aux questions de l'utilisateur sur ce champ
5. Si l'utilisateur te demande de remplir/modifier la valeur, tu peux suggérer une nouvelle valeur

RÈGLES:
- Sois concis et précis
- Si tu suggères une nouvelle valeur, commence ta réponse par "SUGGESTION:" suivi de la valeur
- Utilise un langage professionnel mais accessible
- Si la valeur extraite semble incorrecte ou incomplète, signale-le
- Aide l'utilisateur à prendre la meilleure décision

Exemple de réponse avec suggestion:
"SUGGESTION:24
Ce champ représente le RTO (Recovery Time Objective) en heures. La valeur de 24 heures semble appropriée pour un processus critique."`,
    };

    // Appeler Azure OpenAI
    const completion = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o",
      messages: [
        systemMessage,
        ...messages.map(
          (msg: ChatMessage): ChatCompletionMessageParam => ({
            role: msg.role,
            content: msg.content,
          })
        ),
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = completion.choices[0]?.message?.content || "";

    // Extraire une suggestion de valeur si présente
    let suggestedValue = undefined;
    if (assistantMessage.startsWith("SUGGESTION:")) {
      const lines = assistantMessage.split("\n");
      const suggestionLine = lines[0].replace("SUGGESTION:", "").trim();

      // Parser selon le type de champ
      if (fieldContext.type === "number") {
        const num = parseFloat(suggestionLine);
        if (!isNaN(num)) {
          suggestedValue = num;
        }
      } else {
        suggestedValue = suggestionLine;
      }
    }

    return NextResponse.json({
      message: assistantMessage.replace(/^SUGGESTION:.*\n/, "").trim(),
      suggestedValue,
    });
  } catch (error) {
    console.error("❌ Erreur chat assistant:", error);
    return NextResponse.json(
      { error: "Erreur lors de la communication avec l'IA" },
      { status: 500 }
    );
  }
}
