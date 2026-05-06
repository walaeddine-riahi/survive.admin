import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AzureOpenAI } from "openai";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";

    if (!apiKey || !endpoint) {
      return NextResponse.json({ error: "Config IA manquante" }, { status: 500 });
    }

    const { type, context, simulationInfo } = await request.json();

    const client = new AzureOpenAI({
      apiKey,
      endpoint,
      apiVersion: "2024-02-15-preview",
      deployment,
    });

    const prompt = `En tant qu'expert en gestion de crise et communication, génère le contenu d'une "injection" (un événement simulé) pour une simulation de crise.

TYPE D'INJECTION: ${type}
CONTEXTE SOUHAITÉ: ${context}
SIMULATION: ${simulationInfo?.title || "Non spécifié"} - ${simulationInfo?.description || ""}

CONSIGNES:
1. Le contenu doit être extrêmement réaliste et immersif.
2. Si c'est un EMAIL, inclus un objet percutant.
3. Si c'est un SMS, sois concis et alarmant.
4. Si c'est un RÉSEAU SOCIAL, utilise un ton provocateur ou paniqué (type Twitter).
5. Si c'est un SITREP ou ARTICLE DE PRESSE, utilise un ton journalistique factuel.

Format de réponse attendu (JSON uniquement):
{
  "title": "Titre court de l'événement",
  "content": "Contenu détaillé de l'injection",
  "recommendedAction": "Action suggérée pour le participant (optionnel)"
}`;

    const completion = await client.chat.completions.create({
      model: deployment,
      messages: [
        { role: "system", content: "Tu es un assistant expert en scénarisation de crise." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Erreur lors de la génération IA" }, { status: 500 });
  }
}
