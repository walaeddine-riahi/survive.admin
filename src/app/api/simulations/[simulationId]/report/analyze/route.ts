import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const GEMINI_API_KEY = "AIzaSyB1LRhsvFGjlJbvtUJ7SxEgFZ1qAS0epI4";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ simulationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    await params; // Await params même si on ne l'utilise pas pour éviter l'erreur
    const body = await request.json();
    const { reportData } = body;

    if (!reportData) {
      return NextResponse.json(
        { error: "Données du rapport manquantes" },
        { status: 400 }
      );
    }

    // Préparer le prompt pour Gemini
    const prompt = `En tant qu'expert en gestion de crise et continuité d'activité, analyse cette simulation de crise et fournis un rapport détaillé.

DONNÉES DE LA SIMULATION:
- Titre: ${reportData.simulation.title}
- Description: ${reportData.simulation.description}
- Durée: ${reportData.simulation.duration.toFixed(2)} heures
- Statut: ${reportData.simulation.status}
- Date de début: ${new Date(reportData.simulation.startDate).toLocaleString(
      "fr-FR"
    )}
- Date de fin: ${new Date(reportData.simulation.endDate).toLocaleString(
      "fr-FR"
    )}

PARTICIPANTS:
- Nombre total: ${reportData.participants.total}
- Utilisateurs: ${reportData.participants.users
      .map((u: { name: string }) => u.name)
      .join(", ")}
- Équipes: ${reportData.participants.teams
      .map((t: { name: string }) => t.name)
      .join(", ")}

STATISTIQUES CLÉS:
- Total d'injections: ${reportData.statistics.totalInjections}
- Total de communications: ${reportData.statistics.totalCommunications}
- Taux de réponse: ${reportData.statistics.responseRate}%
- Temps de réponse moyen: ${reportData.statistics.avgResponseTimeMinutes.toFixed(
      2
    )} minutes
- Taux d'acknowledgment: ${reportData.statistics.acknowledgmentRate}%
- Injections acquittées: ${reportData.statistics.acknowledgedInjections}/${
      reportData.statistics.totalInjections
    }

RÉPARTITION DES COMMUNICATIONS PAR TYPE:
${Object.entries(reportData.communicationsByType)
  .map(
    ([type, comms]) =>
      `- ${type}: ${(comms as unknown[]).length} communications`
  )
  .join("\n")}

RÉPARTITION DES INJECTIONS PAR TYPE:
${Object.entries(reportData.injectionsByType)
  .map(([type, injs]) => `- ${type}: ${(injs as unknown[]).length} injections`)
  .join("\n")}

Fournis une analyse structurée en JSON avec le format suivant:
{
  "score": <nombre entre 0 et 100 représentant la performance globale>,
  "evaluation": "<EXCELLENT|BON|MOYEN|INSUFFISANT>",
  "resume": "<résumé en 2-3 phrases>",
  "pointsForts": [
    "<point fort 1>",
    "<point fort 2>",
    "<point fort 3>"
  ],
  "pointsAmeliorer": [
    "<point à améliorer 1>",
    "<point à améliorer 2>",
    "<point à améliorer 3>"
  ],
  "analyseCommunications": {
    "description": "<analyse des communications et leur efficacité>",
    "tauxReponse": "<interprétation du taux de réponse>",
    "tempsReponse": "<interprétation du temps de réponse moyen>"
  },
  "analyseInjections": {
    "description": "<analyse de la gestion des injections>",
    "couverture": "<évaluation de la couverture par type>",
    "acknowledgment": "<évaluation du taux d'acknowledgment>"
  },
  "gestionTemps": {
    "description": "<analyse de la gestion du temps>",
    "efficacite": "<évaluation de l'efficacité temporelle>",
    "recommandations": "<recommandations pour améliorer la gestion du temps>"
  },
  "recommandations": [
    {
      "priorite": "<HAUTE|MOYENNE|BASSE>",
      "titre": "<titre court>",
      "description": "<description détaillée>",
      "actions": [
        "<action concrète 1>",
        "<action concrète 2>"
      ]
    }
  ],
  "conclusion": "<conclusion globale et perspectives>"
}

Assure-toi que la réponse soit uniquement du JSON valide, sans texte avant ou après.`;

    // Appeler l'API Gemini
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = (await response.json()) as GeminiResponse;

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response from Gemini API");
    }

    const geminiResponse = data.candidates[0].content.parts[0].text;

    // Extraire le JSON de la réponse (au cas où il y aurait du texte autour)
    const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
    const jsonResponse = jsonMatch ? jsonMatch[0] : geminiResponse;

    // Parser le JSON
    let analysis;
    try {
      analysis = JSON.parse(jsonResponse);
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      console.log("Raw response:", geminiResponse);
      throw new Error("Invalid JSON response from Gemini");
    }

    return NextResponse.json({
      analysis,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error analyzing simulation report:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'analyse du rapport",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
