import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AzureOpenAI } from "openai";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ simulationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";

    if (!apiKey || !endpoint) {
      console.error("Missing Azure OpenAI credentials in environment");
      return NextResponse.json(
        { error: "Configuration IA manquante" },
        { status: 500 }
      );
    }

    const client = new AzureOpenAI({
      apiKey,
      endpoint,
      apiVersion: "2024-02-15-preview",
      deployment,
    });

    await params;
    const body = await request.json();
    const { reportData } = body;

    if (!reportData) {
      return NextResponse.json(
        { error: "Données du rapport manquantes" },
        { status: 400 }
      );
    }

    // Préparer le prompt pour l'analyse
    const prompt = `En tant qu'expert en gestion de crise et continuité d'activité, analyse cette simulation de crise et fournis un rapport détaillé en JSON.

DONNÉES DE LA SIMULATION:
- Titre: ${reportData.simulation.title}
- Description: ${reportData.simulation.description}
- Durée: ${reportData.simulation.duration.toFixed(2)} heures
- Statut: ${reportData.simulation.status}
- Date de début: ${new Date(reportData.simulation.startDate).toLocaleString("fr-FR")}
- Date de fin: ${new Date(reportData.simulation.endDate).toLocaleString("fr-FR")}

PARTICIPANTS:
- Nombre total: ${reportData.participants.total}
- Utilisateurs: ${reportData.participants.users.map((u: { name: string }) => u.name).join(", ")}
- Équipes: ${reportData.participants.teams.map((t: { name: string }) => t.name).join(", ")}

STATISTIQUES CLÉS:
- Total d'injections: ${reportData.statistics.totalInjections}
- Total de communications: ${reportData.statistics.totalCommunications}
- Taux de réponse: ${reportData.statistics.responseRate}%
- Temps de réponse moyen: ${reportData.statistics.avgResponseTimeMinutes.toFixed(2)} minutes
- Taux d'acknowledgment: ${reportData.statistics.acknowledgmentRate}%
- Injections acquittées: ${reportData.statistics.acknowledgedInjections}/${reportData.statistics.totalInjections}

Format de réponse attendu (JSON uniquement):
{
  "score": <nombre entre 0 et 100>,
  "evaluation": "EXCELLENT|BON|MOYEN|INSUFFISANT",
  "resume": "résumé en 2-3 phrases",
  "pointsForts": ["point1", "point2", "point3"],
  "pointsAmeliorer": ["point1", "point2", "point3"],
  "analyseCommunications": {
    "description": "constat global",
    "tauxReponse": "analyse du taux",
    "tempsReponse": "analyse du temps"
  },
  "analyseInjections": {
    "description": "analyse de la gestion des injections",
    "couverture": "analyse de la couverture",
    "acknowledgment": "analyse des acquittements"
  },
  "gestionTemps": {
    "description": "analyse de la gestion temporelle",
    "efficacite": "évaluation",
    "recommandations": "conseils"
  },
  "recommandations": [
    {
      "priorite": "HAUTE|MOYENNE|BASSE",
      "titre": "titre",
      "description": "description",
      "actions": ["action1", "action2"]
    }
  ],
  "conclusion": "conclusion globale"
}`;

    // Appel à Azure OpenAI
    const completion = await client.chat.completions.create({
      model: deployment,
      messages: [
        { 
          role: "system", 
          content: "Tu es un expert en gestion de crise. Réponds exclusivement au format JSON." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("Réponse vide de l'IA");
    }

    const analysis = JSON.parse(content);

    return NextResponse.json({
      analysis,
      generatedAt: new Date().toISOString(),
      model: deployment
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

