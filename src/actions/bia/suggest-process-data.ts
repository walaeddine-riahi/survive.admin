"use server";

import { AzureOpenAI } from "openai";

export async function suggestProcessData(currentData: any) {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";

  if (!apiKey || !endpoint) {
    return { success: false, error: "AI not configured" };
  }

  try {
    const client = new AzureOpenAI({
      apiKey,
      endpoint,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
      deployment,
    });

    const prompt = `Tu es un expert en BIA. En te basant sur le nom et la description du processus ci-dessous, propose des valeurs RÉALISTES pour les champs manquants.
    
    Nom: ${currentData.name || "Inconnu"}
    Description: ${currentData.description || "Aucune description"}
    Département: ${currentData.department || "À remplir"}
    
    Propose des valeurs pour:
    1. Département (si manquant)
    2. Emplacement (ex: Bâtiment principal, Étage 1, Site Production)
    3. Impact (Description textuelle des conséquences d'un arrêt)
    4. RTO (heures) - Recovery Time Objective
    5. MTPD (heures) - Maximum Tolerable Period of Disruption (doit être > RTO)
    6. RPO (heures) - Recovery Point Objective
    7. MBCO (Niveau de service minimum acceptable en %)
    8. Criticité (LOW, MEDIUM, HIGH, CRITICAL)

    Réponds UNIQUEMENT en JSON valide avec ces clés:
    {
      "department": string,
      "location": string,
      "impact": string,
      "rto": number,
      "mtpd": number,
      "rpo": number,
      "mbco": string,
      "criticality": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    }`;

    const completion = await client.chat.completions.create({
      model: deployment,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    let jsonText = responseText.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\s*/, "").replace(/```\s*$/, "");
    }
    
    const suggestions = JSON.parse(jsonText);
    return { success: true, suggestions };
  } catch (error) {
    console.error("Error suggesting data:", error);
    return { success: false, error: "Failed to get suggestions" };
  }
}
