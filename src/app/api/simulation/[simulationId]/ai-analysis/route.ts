import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadRessource(filename: string): string {
  try {
    const filePath = path.join(process.cwd(), "ressources", filename);
    if (!fs.existsSync(filePath)) return "";
    const content = fs.readFileSync(filePath, "utf-8");
    // Return first 60 000 chars to fit in context window
    return content.substring(0, 60000);
  } catch {
    return "";
  }
}

async function callAzureAI(systemPrompt: string, userPrompt: string): Promise<string> {
  let endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  let apiKey   = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
  const apiVersion  = process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";

  if (endpoint) endpoint = endpoint.replace(/^[\"']|[\"']$/g, "");
  if (apiKey)   apiKey   = apiKey.replace(/^[\"']|[\"']$/g, "");

  if (!endpoint || !apiKey) throw new Error("Azure OpenAI not configured");

  const baseEndpoint = endpoint.replace(/\/$/, "");
  const client = new OpenAI({
    apiKey,
    baseURL: `${baseEndpoint}/openai/deployments/${deployment}`,
    defaultQuery: { "api-version": apiVersion },
    defaultHeaders: { "api-key": apiKey },
    timeout: 60000,
  });

  const response = await client.chat.completions.create({
    model: deployment,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt },
    ],
    max_tokens: 4000,
    temperature: 0.3,
  });

  return response.choices?.[0]?.message?.content || "";
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ simulationId: string }> }
) {
  try {
    const { simulationId } = await params;

    // 1. Load simulation data
    const [simulation, injections, communications, assignments, crisisPlan, debrief, participantScores] =
      await Promise.all([
        prisma.simulation.findUnique({
          where: { id: simulationId },
          select: { id: true, title: true, description: true, status: true, startDate: true, endDate: true },
        }),
        prisma.injection.findMany({
          where: { simulationId },
          orderBy: { createdAt: "asc" },
          select: { id: true, title: true, type: true, content: true, isActive: true, acknowledged: true, createdAt: true },
        }),
        prisma.communication.findMany({
          where: { simulationId },
          orderBy: { createdAt: "asc" },
          include: {
            sender:    { select: { firstName: true, lastName: true } },
            recipient: { select: { firstName: true, lastName: true } },
          },
          take: 200,
        }),
        prisma.simulationAssignment.findMany({
          where: { simulationId },
          include: { user: { select: { firstName: true, lastName: true } } },
        }),
        prisma.simulationCrisisPlan.findUnique({
          where: { simulationId },
          select: { fileName: true, aiSummary: true },
        }),
        prisma.simulationDebrief.findUnique({ where: { simulationId } }),
        prisma.participantScore.findMany({
          where: { simulationId },
          include: { assignment: { include: { user: { select: { firstName: true, lastName: true } } } } },
        }),
      ]);

    if (!simulation) {
      return NextResponse.json({ success: false, error: "Simulation introuvable" }, { status: 404 });
    }

    // 2. Load reference documents from ressources/
    const pcaText  = loadRessource("extracted_pca.txt");
    const pguiText = loadRessource("extracted_pgui.txt");

    const hasResources = pcaText.length > 0 || pguiText.length > 0;

    // 3. Build context strings
    const injectionsText = injections
      .map((i, idx) =>
        `[INJECT ${idx + 1}] "${i.title}" (${i.type}) | Actif: ${i.isActive} | Acknowledged: ${i.acknowledged}\n  Contenu: ${(i.content || "").substring(0, 300)}`
      )
      .join("\n");

    const commsText = communications
      .map((c) => {
        const sender = `${c.sender.firstName} ${c.sender.lastName}`;
        const recip  = c.recipient ? `→ ${c.recipient.firstName} ${c.recipient.lastName}` : "";
        const delay  = Math.round((new Date(c.createdAt).getTime() - new Date(simulation.startDate || c.createdAt).getTime()) / 60000);
        return `[T+${delay}min] ${sender} ${recip}: ${c.content.substring(0, 200)}`;
      })
      .join("\n");

    const participantsText = assignments
      .map((a) => {
        const score = participantScores.find((s) => s.assignmentId === a.id);
        const scoreStr = score
          ? `Score global: ${score.scoreGlobal}/100 | Conformité: ${score.scoreConformity} | Décision: ${score.scoreDecision} | Communication: ${score.scoreCommunication} | Réactivité: ${score.scoreTimeliness}`
          : "Non encore évalué";
        return `- ${a.user.firstName} ${a.user.lastName} (${a.role}): ${scoreStr}`;
      })
      .join("\n");

    const debriefText = debrief
      ? `Score équipe global: ${debrief.teamScoreGlobal}/100\nConformité plan: ${debrief.teamScoreConformity}/100\nInjects conformes: ${debrief.conformantInjects}/${debrief.totalInjects}\nDélai moyen réaction: ${debrief.avgReactionDelayMin ?? "N/A"} min\nSynthèse exécutive: ${debrief.executiveSummary || "N/A"}`
      : "Aucun debrief généré";

    // 4. Build AI prompt
    const resourceContext = hasResources
      ? `\n\n━━━ DOCUMENTS DE RÉFÉRENCE DE L'ORGANISATION (Extraits) ━━━\n\n### PCA SBC (Plan de Continuité d'Activité) – extrait:\n${pcaText.substring(0, 30000)}\n\n### PGUI SBC (Plan de Gestion des Urgences et Incidents) – extrait:\n${pguiText.substring(0, 25000)}`
      : "\n\n[Aucun document de référence chargé]";

    const systemPrompt = `Tu es un expert senior en gestion de crise, exercices BCM (ISO 22301, BCI GPG) et continuité d'activité industrielle.
Tu disposes du Plan de Continuité d'Activité (PCA) et du Plan de Gestion des Urgences et Incidents (PGUI) réels de l'organisation SBC.
Ta mission est de produire une analyse FIABLE et PRÉCISE de la simulation d'exercice de crise, en te basant STRICTEMENT sur les données réelles fournies et les procédures des documents officiels.

RÈGLES ABSOLUES :
1. Compare TOUJOURS les actions observées aux procédures du PCA/PGUI fournis.
2. Ne jamais inventer de données. Cite les sections du PCA/PGUI si pertinent.
3. Identifie les écarts entre ce qui a été fait et ce que les plans prescrivent.
4. Réponds UNIQUEMENT en JSON valide, sans markdown.
5. Sois ultra-précis, analytique et professionnel.`;

    const userPrompt = `Analyse complète de la simulation de gestion de crise avec référence aux documents officiels SBC.

━━━ SIMULATION ━━━
Titre: ${simulation.title}
Statut: ${simulation.status}
Description: ${simulation.description || "N/A"}

━━━ INJECTS DÉPLOYÉS (${injections.length}) ━━━
${injectionsText || "Aucun inject"}

━━━ COMMUNICATIONS ÉCHANGÉES (${communications.length}) ━━━
${commsText || "Aucune communication"}

━━━ PARTICIPANTS (${assignments.length}) ━━━
${participantsText || "Aucun participant"}

━━━ DEBRIEF EXISTANT ━━━
${debriefText}

━━━ PLAN DE CRISE SIMULATION ━━━
${crisisPlan ? `Fichier: ${crisisPlan.fileName}\nRésumé IA: ${crisisPlan.aiSummary || "N/A"}` : "Aucun plan attaché à la simulation"}
${resourceContext}

━━━ INSTRUCTIONS ━━━
Produis une analyse exhaustive au format JSON EXACT suivant :
{
  "scoreGlobal": <0-100>,
  "niveauMaturite": "EXCELLENT|BIEN|ACCEPTABLE|INSUFFISANT|CRITIQUE",
  "syntheseExecutive": "Synthèse en 4-5 phrases pour CODIR, faisant référence aux procédures PCA/PGUI",
  
  "conformitePCA": {
    "score": <0-100>,
    "proceduresRespectees": ["procédure respectée 1", "..."],
    "proceduresNonRespectees": ["procédure violée avec référence section PCA/PGUI", "..."],
    "ecartsIdentifies": ["écart précis vs PCA/PGUI", "..."]
  },
  
  "analyseInjects": [
    {
      "titre": "titre inject",
      "type": "type",
      "reponseEquipe": "description de la réponse observée",
      "conformitePlan": <0-100>,
      "proceduреApplicable": "référence à la procédure PCA/PGUI applicable",
      "ecart": "écart vs procédure ou null"
    }
  ],
  
  "analyseParticipants": [
    {
      "nom": "Prénom Nom",
      "role": "rôle",
      "scoreGlobal": <0-100>,
      "pointsForts": ["..."],
      "pointsAmeliorer": ["..."],
      "conformiteRole": "analyse vs rôles définis dans PCA/PGUI"
    }
  ],
  
  "gestionTemps": {
    "delaiMoyenReaction": <minutes ou null>,
    "respectRTO": <true|false>,
    "analyse": "analyse des délais vs RTO du PCA"
  },
  
  "communicationCrise": {
    "score": <0-100>,
    "chaineDActivationRespectee": <true|false>,
    "communicationExterneConforme": <true|false>,
    "analyse": "analyse vs procédures communication du PCA section 1.5"
  },
  
  "pointsCritiques": [
    {
      "titre": "titre du point critique",
      "description": "description détaillée",
      "reference": "référence PCA/PGUI",
      "priorite": "HAUTE|MOYENNE|BASSE",
      "recommandation": "action corrective concrète"
    }
  ],
  
  "recommandations": [
    {
      "domaine": "domaine (ex: Formation, Procédures, Communication)",
      "action": "action recommandée précise",
      "echeance": "IMMEDIAT|1_MOIS|3_MOIS|6_MOIS",
      "referencePCA": "section PCA/PGUI concernée"
    }
  ],
  
  "prochainExercice": {
    "focusPrioritaire": ["focus 1", "focus 2"],
    "scenariosRecommandes": ["scénario recommandé 1", "..."],
    "competencesADeveLopper": ["compétence 1", "..."]
  },
  
  "conclusionInstructeur": "Conclusion narrative complète de 5-6 phrases pour l'instructeur, incluant le niveau global de préparation de l'organisation vs standards PCA/PGUI SBC"
}`;

    // 5. Call AI
    const aiResponse = await callAzureAI(systemPrompt, userPrompt);

    let analysis: Record<string, unknown>;
    try {
      const clean = aiResponse.replace(/```json|```/g, "").trim();
      analysis = JSON.parse(clean);
    } catch {
      // Fallback structure
      analysis = {
        scoreGlobal: 50,
        niveauMaturite: "ACCEPTABLE",
        syntheseExecutive: "L'analyse IA n'a pas pu être parsée correctement. Veuillez réessayer.",
        conformitePCA: { score: 50, proceduresRespectees: [], proceduresNonRespectees: [], ecartsIdentifies: [] },
        analyseInjects: [],
        analyseParticipants: [],
        gestionTemps: { delaiMoyenReaction: null, respectRTO: false, analyse: "Données insuffisantes" },
        communicationCrise: { score: 50, chaineDActivationRespectee: false, communicationExterneConforme: false, analyse: "" },
        pointsCritiques: [],
        recommandations: [],
        prochainExercice: { focusPrioritaire: [], scenariosRecommandes: [], competencesADeveLopper: [] },
        conclusionInstructeur: "Analyse indisponible. Veuillez relancer l'analyse.",
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        ...analysis,
        meta: {
          simulationId,
          simulationTitle: simulation.title,
          totalInjects: injections.length,
          totalCommunications: communications.length,
          totalParticipants: assignments.length,
          resourcesUsed: hasResources
            ? [`PCA SBC (${(pcaText.length / 1000).toFixed(0)}K chars)`, `PGUI SBC (${(pguiText.length / 1000).toFixed(0)}K chars)`]
            : [],
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Erreur lors de l'analyse IA" },
      { status: 500 }
    );
  }
}
