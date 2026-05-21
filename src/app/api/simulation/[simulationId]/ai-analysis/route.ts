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
    const [simulation, injections, communications, assignments, crisisPlan, debrief, participantScores, simSession] =
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
        // Récupérer la session avec les notes de l'instructeur
        prisma.simSession.findFirst({
          where: { simulationId },
          select: { 
            instructorNotes: true,
            id: true,
            title: true,
            status: true,
            startedAt: true,
            endedAt: true,
          },
          orderBy: { createdAt: "desc" },
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

    // Notes de l'instructeur (observations en temps réel)
    const instructorNotesText = simSession?.instructorNotes
      ? `\n\n━━━ NOTES DE L'INSTRUCTEUR (Observations en temps réel) ━━━\n${simSession.instructorNotes}\n\nCes notes ont été prises par l'instructeur pendant la simulation. Elles contiennent des observations critiques, des décisions importantes et des points d'amélioration identifiés en direct. UTILISE CES NOTES COMME SOURCE PRIORITAIRE pour ton analyse car elles reflètent la réalité terrain observée.`
      : "";

    const sessionInfoText = simSession
      ? `\n\n━━━ INFORMATIONS SESSION ━━━\nSession: ${simSession.title}\nStatut: ${simSession.status}\nDébut: ${simSession.startedAt ? new Date(simSession.startedAt).toLocaleString("fr-FR") : "N/A"}\nFin: ${simSession.endedAt ? new Date(simSession.endedAt).toLocaleString("fr-FR") : "En cours"}`
      : "";

    // 4. Build AI prompt
    const resourceContext = hasResources
      ? `\n\n━━━ DOCUMENTS DE RÉFÉRENCE DE L'ORGANISATION (Extraits) ━━━\n\n### PCA SBC (Plan de Continuité d'Activité) – extrait:\n${pcaText.substring(0, 30000)}\n\n### PGUI SBC (Plan de Gestion des Urgences et Incidents) – extrait:\n${pguiText.substring(0, 25000)}`
      : "\n\n[Aucun document de référence chargé]";

    const systemPrompt = `Tu es un expert senior en gestion de crise, exercices BCM (ISO 22301, BCI GPG) et continuité d'activité industrielle.
Tu disposes du Plan de Continuité d'Activité (PCA) et du Plan de Gestion des Urgences et Incidents (PGUI) réels de l'organisation SBC.
Tu as également accès aux NOTES DE L'INSTRUCTEUR prises en temps réel pendant la simulation - ces notes sont CRITIQUES et doivent être intégrées dans ton analyse.

Ta mission est de produire une analyse EXHAUSTIVE, DÉTAILLÉE et ULTRA-FIABLE de la simulation d'exercice de crise.

RÈGLES ABSOLUES :
1. Les NOTES DE L'INSTRUCTEUR sont ta source d'information PRIORITAIRE - elles reflètent les observations terrain réelles
2. Compare TOUJOURS les actions observées aux procédures du PCA/PGUI fournis
3. Intègre SYSTÉMATIQUEMENT les observations de l'instructeur dans chaque section de ton analyse
4. Ne jamais inventer de données. Cite les sections du PCA/PGUI et les notes instructeur si pertinent
5. Identifie les écarts entre ce qui a été fait et ce que les plans prescrivent
6. Réponds UNIQUEMENT en JSON valide, sans markdown
7. Sois ultra-précis, analytique, détaillé et professionnel
8. Ton analyse doit être 2x plus détaillée et approfondie qu'une analyse standard
9. Chaque point critique doit référencer soit le PCA/PGUI, soit les notes instructeur, soit les deux`;

    const userPrompt = `Analyse complète de la simulation de gestion de crise avec référence aux documents officiels SBC et aux observations de l'instructeur.

━━━ SIMULATION ━━━
Titre: ${simulation.title}
Statut: ${simulation.status}
Description: ${simulation.description || "N/A"}
${sessionInfoText}

━━━ INJECTS DÉPLOYÉS (${injections.length}) ━━━
${injectionsText || "Aucun inject"}

━━━ COMMUNICATIONS ÉCHANGÉES (${communications.length}) ━━━
${commsText || "Aucune communication"}

━━━ PARTICIPANTS (${assignments.length}) ━━━
${participantsText || "Aucun participant"}

━━━ DEBRIEF EXISTANT ━━━
${debriefText}
${instructorNotesText}

━━━ PLAN DE CRISE SIMULATION ━━━
${crisisPlan ? `Fichier: ${crisisPlan.fileName}\nRésumé IA: ${crisisPlan.aiSummary || "N/A"}` : "Aucun plan attaché à la simulation"}
${resourceContext}

━━━ INSTRUCTIONS POUR UNE ANALYSE DÉTAILLÉE ━━━
Produis une analyse EXHAUSTIVE et APPROFONDIE au format JSON EXACT suivant.
IMPORTANT: Intègre les observations de l'instructeur dans CHAQUE section pertinente de ton analyse.

{
  "scoreGlobal": <0-100>,
  "niveauMaturite": "EXCELLENT|BIEN|ACCEPTABLE|INSUFFISANT|CRITIQUE",
  "syntheseExecutive": "Synthèse détaillée en 6-8 phrases pour CODIR, faisant référence aux procédures PCA/PGUI ET aux observations instructeur",
  
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
  
  "conclusionInstructeur": "Conclusion narrative COMPLÈTE et DÉTAILLÉE de 8-10 phrases pour l'instructeur, incluant le niveau global de préparation de l'organisation vs standards PCA/PGUI SBC, les observations terrain critiques, et les axes d'amélioration prioritaires identifiés pendant la simulation"
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
        communicationCrise: { score: 50, chaineDActivationRespectee: false, communicationExterneConforme: false, analyse: "Analyse indisponible" },
        pointsCritiques: [],
        recommandations: [],
        prochainExercice: { focusPrioritaire: [], scenariosRecommandes: [], competencesADeveLopper: [] },
        conclusionInstructeur: "Analyse indisponible. Les notes de l'instructeur n'ont pas pu être intégrées. Veuillez relancer l'analyse.",
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
          hasInstructorNotes: !!simSession?.instructorNotes,
          instructorNotesLength: simSession?.instructorNotes?.length || 0,
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
