"use server";

import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { BCMSection } from "@/lib/bcm/docx-formatter";

// Helper to initialize OpenAI client
function getOpenAIClient() {
  let endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  let apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4";

  if (endpoint) endpoint = endpoint.replace(/^["']|["']$/g, "");
  if (apiKey) apiKey = apiKey.replace(/^["']|["']$/g, "");

  if (!endpoint || !apiKey) {
    throw new Error("Azure OpenAI API credentials are not configured.");
  }

  const cleanEndpoint = endpoint.replace(/\/$/, "");
  return new OpenAI({
    apiKey: apiKey,
    baseURL: `${cleanEndpoint}/openai/deployments/${deploymentName}`,
    defaultQuery: {
      "api-version": process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
    },
    defaultHeaders: { "api-key": apiKey },
  });
}

// Interfaces
export interface GenerateDocParams {
  docType: "POLICY" | "PCA" | "PGC" | "PRI";
  organizationInfo: {
    name: string;
    industry?: string;
    description?: string;
  };
}

export async function generateBcmDocumentContent(
  params: GenerateDocParams
): Promise<{ success: boolean; data?: BCMSection[]; error?: string }> {
  try {
    // 1. Fetch relevant data from the database to enrich the prompt
    // Fetching BIA Process data
    const processes = await prisma.bIAProcess.findMany({
      include: {
        dependencies: true,
        resources: true,
      },
    });

    const processContext = processes.map((p) => ({
      name: p.name,
      criticality: p.criticalityLevel,
      rto: p.rto,
      rpo: p.rpo,
      resources: p.resources.map((r) => r.type),
    }));

    // 2. Prepare context for OpenAI
    const contextStr = JSON.stringify({
      organization: params.organizationInfo,
      criticalProcesses: processContext,
    });

    const client = getOpenAIClient();

    let systemPrompt = "";
    if (params.docType === "POLICY") {
      systemPrompt = `Tu es un expert en continuité d'activité (ISO 22301, BCI GPG).
Génère la Politique de Continuité d'Activité (BCM Policy) pour l'organisation fournie.
Retourne UNIQUEMENT un objet JSON avec la structure suivante, sans aucun markdown autour:
{
  "sections": [
    {
      "title": "Titre de la section",
      "content": ["Paragraphe 1", "Paragraphe 2"],
      "listItems": ["Puce 1", "Puce 2"]
    }
  ]
}
Inclus les sections: Objectif & Périmètre, Gouvernance et Cadre, Exigences de Continuité, Budget & Ressources, Maintenance & Exercices.`;
    } else if (params.docType === "PCA") {
      systemPrompt = `Tu es un expert en continuité d'activité (ISO 22301, BCI GPG).
Génère le Plan de Continuité d'Activité (PCA) pour l'organisation fournie, en te basant sur les processus critiques fournis.
Retourne UNIQUEMENT un objet JSON avec la structure suivante, sans aucun markdown autour:
{
  "sections": [
    {
      "title": "Titre de la section",
      "content": ["Paragraphe 1", "Paragraphe 2"],
      "listItems": ["Puce 1", "Puce 2"]
    }
  ]
}
Inclus les sections: Contexte et Déclencheurs, Processus Critiques, Stratégies de Continuité, Ressources Nécessaires, Dépendances, Retour à la Normale.`;
    } else if (params.docType === "PGC") {
      systemPrompt = `Tu es un expert en gestion de crise.
Génère le Plan de Gestion de Crise (PGC) pour l'organisation fournie.
Retourne UNIQUEMENT un objet JSON avec la structure suivante, sans aucun markdown autour:
{
  "sections": [
    {
      "title": "Titre de la section",
      "content": ["Paragraphe 1", "Paragraphe 2"],
      "listItems": ["Puce 1", "Puce 2"]
    }
  ]
}
Inclus les sections: Activation & Niveaux de Sévérité, Annuaire de Crise, Composition de la Cellule, Logistique, Stratégie de Communication, Main Courante.`;
    } else if (params.docType === "PRI") {
      systemPrompt = `Tu es un expert en résilience informatique (Disaster Recovery).
Génère le Plan de Reprise Informatique (PRI) pour l'organisation fournie.
Retourne UNIQUEMENT un objet JSON avec la structure suivante, sans aucun markdown autour:
{
  "sections": [
    {
      "title": "Titre de la section",
      "content": ["Paragraphe 1", "Paragraphe 2"],
      "listItems": ["Puce 1", "Puce 2"]
    }
  ]
}
Inclus les sections: Périmètre Technique, Scénarios de Sinistre, Cellule de Crise IT, Procédures de Basculement, Procédures de Retour, Plan de Test.`;
    }

    const response = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Voici les données de l'organisation : ${contextStr}` },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No content generated");

    const parsed = JSON.parse(content);
    return { success: true, data: parsed.sections as BCMSection[] };
  } catch (error: any) {
    console.error("Error generating BCM document:", error);
    return { success: false, error: error.message };
  }
}
