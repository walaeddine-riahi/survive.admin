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

    const { injections, communications, simulationTitle } = await request.json();

    const client = new AzureOpenAI({
      apiKey,
      endpoint,
      apiVersion: "2024-02-15-preview",
      deployment,
    });

    const prompt = `En tant qu'expert en gestion de crise, rédige un Rapport de Situation (SITREP) concis et professionnel basé sur les événements récents de la simulation "${simulationTitle}".

ÉVÉNEMENTS RÉCENTS (Injections):
${injections?.map((i: any) => `- ${i.title}: ${i.content}`).join("\n") || "Aucun"}

COMMUNICATIONS ÉCHANGÉES:
${communications?.map((c: any) => `- ${c.type}: ${c.content}`).join("\n") || "Aucun"}

CONSIGNES:
1. Analyse la gravité de la situation.
2. Identifie les points critiques.
3. Propose des prochaines étapes immédiates.
4. Le ton doit être formel, factuel et opérationnel.
5. Inclus un titre pertinent.

Format de réponse attendu (JSON uniquement):
{
  "title": "SITREP #X - [État de la situation]",
  "content": "Contenu structuré avec: \n1. Résumé des faits\n2. Actions entreprises\n3. Points de vigilance\n4. Besoins immédiats"
}`;

    const completion = await client.chat.completions.create({
      model: deployment,
      messages: [
        { role: "system", content: "Tu es un assistant de gestion de crise." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI SitRep Error:", error);
    return NextResponse.json({ error: "Erreur lors de la génération du SitRep" }, { status: 500 });
  }
}
