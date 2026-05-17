"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ConformityStatus } from "@prisma/client";
import OpenAI from "openai";
import type { ParsedCrisisPlan, CrisisProcedure, ProcedureStep } from "@/lib/simulation/crisis-plan-types";

// ─── Types ────────────────────────────────────────────────────────────────────

import {
  type CommunicationAnalysis,
  type InjectAnalysis,
} from "@/lib/simulation/analysis-types";

// ─── Azure OpenAI call ────────────────────────────────────────────────────────

async function callAzureAI(systemPrompt: string, userPrompt: string): Promise<string> {
  let endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  let apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";

  if (endpoint) endpoint = endpoint.replace(/^["']|["']$/g, "");
  if (apiKey) apiKey = apiKey.replace(/^["']|["']$/g, "");

  if (!endpoint || !apiKey) throw new Error("Azure OpenAI not configured");

  const baseEndpoint = endpoint.replace(/\/$/, "");
  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: `${baseEndpoint}/openai/deployments/${deployment}`,
    defaultQuery: { "api-version": apiVersion },
    defaultHeaders: { "api-key": apiKey },
    timeout: 30000,
  });

  const response = await client.chat.completions.create({
    model: deployment,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 2000,
    temperature: 0.3,
  });

  return response.choices?.[0]?.message?.content || "";
}

// ─── Parse Crisis Plan with AI ────────────────────────────────────────────────

export async function parseCrisisPlanWithAI(simulationId: string, rawText: string): Promise<{
  success: boolean;
  data?: ParsedCrisisPlan;
  summary?: string;
  error?: string;
}> {
  try {
    const systemPrompt = `Tu es un expert en gestion de crise et continuité d'activité (ISO 22301, BCI GPG).
Analyse ce plan de gestion de crise et extrais sa structure de manière extrêmement précise, en prêtant une attention particulière aux fiches-actions concrètes (par exemple: FA-003 Incendie, FA-013 Panique, FA-018 Accident, FA-026 Fuite de fuel/gasoil, etc.).
Réponds uniquement en JSON valide, sans markdown, sans explication.`;

    const userPrompt = `Analyse ce plan de gestion de crise et retourne un JSON avec cette structure exacte. 
IMPORTANT: Parcours l'intégralité du plan fourni. Extrais en priorité les fiches-actions industrielles et d'urgence opérationnelle réelles découlant des fiches FA-xxx (comme les incendies, fuites de carburant, accidents graves du travail ou crises de panique), avec leurs étapes pas-à-pas, durées, rôles opérationnels associés et numéros de contact d'urgence réels s'ils sont présents.

Structure JSON attendue:
{
  "procedures": [
    {
      "id": "proc_1",
      "type_incident": "Type d'incident couvert (ex: Incendie, Fuite fuel, Accident grave du travail, Crise de panique)",
      "titre": "Titre de la procédure / Fiche-action",
      "declencheurs": ["Condition déclencheur 1", "..."],
      "etapes": [
        {
          "ordre": 1,
          "action": "Action précise à réaliser",
          "responsable": "Rôle/Fonction responsable",
          "delai_max_min": 10,
          "obligatoire": true
        }
      ],
      "escalade": ["Niveau d'escalade 1", "..."],
      "communication_externe": ["Communication externe requise", "..."]
    }
  ],
  "roles": [
    {
      "role": "Rôle ou Fonction (ex: Responsable HSE, Responsable Maintenance, Référent RH, Responsable Utilités)",
      "responsabilites": ["Responsabilité 1", "..."]
    }
  ],
  "seuils_activation": ["Seuil d'activation / Critère d'escalade 1", "..."],
  "communication_externe": ["Procédure de communication externe", "..."],
  "keywords": ["mot-clé1", "mot-clé2"]
}

PLAN DE GESTION DE CRISE À ANALYSER:
${rawText.substring(0, 40000)}`;

    const aiResponse = await callAzureAI(systemPrompt, userPrompt);

    let parsed: ParsedCrisisPlan;
    try {
      const clean = aiResponse.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      // Fallback structure if parsing fails
      parsed = {
        procedures: [],
        roles: [],
        seuils_activation: [],
        communication_externe: [],
        keywords: [],
      };
    }

    // Generate summary
    const summaryPrompt = `Rédige un résumé professionnel, précis et concret de ce plan de gestion de crise en 3-4 phrases pour un instructeur d'exercice de simulation.
IMPORTANT: Ne génère pas de généralités standard ou de clichés flous sur la cybersécurité ou les catastrophes naturelles si elles ne figurent pas explicitement dans ce plan. Fais référence de manière ultra-concrète aux fiches d'urgence réelles présentes dans ce document (par ex: incendie/départ de feu FA-003, crise de panique collective FA-013, accident du travail grave FA-018, fuite sur citerne fuel/gasoil FA-026, etc.). Mentionne les rôles opérationnels clés actifs (HSE, Maintenance, Qualité, RH, Utilités) et les priorités de réponse immédiate.

PLAN À RÉSUMER:
${rawText.substring(0, 40000)}`;

    const summary = await callAzureAI(
      "Tu es un expert de la continuité d'activité (BCM) et de la gestion des urgences industrielles. Réponds en français, de manière concise, directe et ultra-réaliste.",
      summaryPrompt
    );

    return { success: true, data: parsed, summary };
  } catch (error) {
    console.error("parseCrisisPlanWithAI error:", error);
    return { success: false, error: "Erreur lors de l'analyse IA du plan" };
  }
}

// ─── Analyze communications for one inject ────────────────────────────────────

export async function analyzeInjectWithAI(params: {
  simulationId: string;
  injectionId: string;
  injectionTitle: string;
  injectionContent: string;
  injectionType: string;
  injectedAt: Date;
  communications: Array<{
    id: string;
    content: string;
    type: string;
    createdAt: Date;
    sender: { firstName: string; lastName: string; role?: string };
  }>;
  crisisPlan?: ParsedCrisisPlan | null;
}): Promise<{ success: boolean; data?: InjectAnalysis; error?: string }> {
  try {
    const { injectionTitle, injectionContent, injectionType, injectedAt, communications, crisisPlan } = params;

    // Find relevant procedure from crisis plan
    let relevantProcedure: CrisisProcedure | null = null;
    if (crisisPlan?.procedures) {
      const injectionKeywords = `${injectionTitle} ${injectionContent}`.toLowerCase();
      relevantProcedure = crisisPlan.procedures.find((p: CrisisProcedure) =>
        p.declencheurs.some((d: string) => injectionKeywords.includes(d.toLowerCase())) ||
        injectionKeywords.includes(p.type_incident.toLowerCase())
      ) || null;
    }

    const commsText = communications
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map(c => {
        const delayMin = Math.round((new Date(c.createdAt).getTime() - new Date(injectedAt).getTime()) / 60000);
        return `[T+${delayMin}min] ${c.sender.firstName} ${c.sender.lastName}: ${c.content}`;
      })
      .join("\n");

    const planContext = relevantProcedure
      ? `\nPROCÉDURE DU PLAN APPLICABLE:\nTitre: ${relevantProcedure.titre}\nÉtapes:\n${
          relevantProcedure.etapes.map((e: ProcedureStep) => `- ${e.ordre}. ${e.action} (${e.responsable}, délai max: ${e.delai_max_min || "?"} min, obligatoire: ${e.obligatoire})`).join("\n")
        }`
      : "\nAucune procédure spécifique identifiée dans le plan pour cet inject.";

    const systemPrompt = `Tu es un évaluateur expert en gestion de crise et exercices BCM (ISO 22301, BCI GPG).
Analyse la réponse de l'équipe à un inject de simulation et évalue leur performance.
Réponds UNIQUEMENT en JSON valide, sans markdown.`;

    const userPrompt = `Évalue la gestion de cet inject par l'équipe.

INJECT #${params.injectionId}:
Titre: ${injectionTitle}
Type: ${injectionType}  
Contenu: ${injectionContent}
Envoyé à: ${new Date(injectedAt).toLocaleTimeString("fr-FR")}

${planContext}

COMMUNICATIONS DE L'ÉQUIPE APRÈS L'INJECT:
${commsText || "(Aucune communication détectée)"}

Retourne un JSON avec cette structure exacte:
{
  "reactionDelayMin": <minutes avant première réaction, null si aucune>,
  "firstActor": "<prénom nom de la personne ayant réagi en premier>",
  "actualAction": "<description de ce qui a été fait concrètement>",
  "expectedAction": "<ce que le plan prescrit, ou null>",
  "expectedActor": "<rôle censé réagir selon le plan, ou null>",
  "expectedDelayMin": <délai max selon le plan, ou null>,
  "conformityScore": <0-100>,
  "conformityStatus": "CONFORMANT|PARTIAL|NON_CONFORMANT|NOT_APPLICABLE",
  "gaps": ["écart identifié 1", "écart 2"],
  "reactionQuality": <0-100>,
  "decisionQuality": <0-100>,
  "communicationQuality": <0-100>,
  "tonalityScores": {<"prenom nom">: <0-100>},
  "stressLevels": {<"prenom nom">: "low|medium|high|critical"},
  "keyDecisions": ["décision prise 1", "..."],
  "observations": ["observation clé 1", "..."],
  "improvementPoints": ["point d'amélioration 1", "..."]
}`;

    const aiResponse = await callAzureAI(systemPrompt, userPrompt);

    let analysis: Record<string, unknown>;
    try {
      const clean = aiResponse.replace(/```json|```/g, "").trim();
      analysis = JSON.parse(clean);
    } catch {
      analysis = {
        reactionDelayMin: null, firstActor: null, actualAction: "Analyse indisponible",
        expectedAction: relevantProcedure?.etapes[0]?.action || null,
        expectedActor: relevantProcedure?.etapes[0]?.responsable || null,
        expectedDelayMin: relevantProcedure?.etapes[0]?.delai_max_min || null,
        conformityScore: 50, conformityStatus: "NOT_APPLICABLE",
        gaps: [], reactionQuality: 50, decisionQuality: 50, communicationQuality: 50,
        tonalityScores: {}, stressLevels: {}, keyDecisions: [], observations: [], improvementPoints: [],
      };
    }

    // Save InjectResponse to DB
    const firstResponse = communications.sort((a:{createdAt:Date},b:{createdAt:Date}) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )[0];

    await prisma.injectResponse.upsert({
      where: { id: `${params.simulationId}_${params.injectionId}`.substring(0, 24) },
      create: {
        simulationId: params.simulationId,
        injectionId: params.injectionId,
        injectedAt,
        firstResponseAt: firstResponse ? new Date(firstResponse.createdAt) : null,
        reactionDelayMin: typeof analysis.reactionDelayMin === "number" ? analysis.reactionDelayMin : null,
        expectedAction: typeof analysis.expectedAction === "string" ? analysis.expectedAction : null,
        expectedActor: typeof analysis.expectedActor === "string" ? analysis.expectedActor : null,
        expectedDelayMin: typeof analysis.expectedDelayMin === "number" ? analysis.expectedDelayMin : null,
        actualAction: typeof analysis.actualAction === "string" ? analysis.actualAction : null,
        actualActor: typeof analysis.firstActor === "string" ? analysis.firstActor : null,
        conformityScore: typeof analysis.conformityScore === "number" ? analysis.conformityScore : 50,
        conformity: (analysis.conformityStatus as ConformityStatus) || ConformityStatus.NOT_APPLICABLE,
        conformityNotes: (analysis.gaps as string[])?.join("; ") || null,
        aiAnalysis: analysis as any,
        linkedCommunicationIds: communications.map(c => c.id),
        analyzedAt: new Date(),
      },
      update: {
        firstResponseAt: firstResponse ? new Date(firstResponse.createdAt) : null,
        reactionDelayMin: typeof analysis.reactionDelayMin === "number" ? analysis.reactionDelayMin : null,
        actualAction: typeof analysis.actualAction === "string" ? analysis.actualAction : null,
        actualActor: typeof analysis.firstActor === "string" ? analysis.firstActor : null,
        conformityScore: typeof analysis.conformityScore === "number" ? analysis.conformityScore : 50,
        conformity: (analysis.conformityStatus as ConformityStatus) || ConformityStatus.NOT_APPLICABLE,
        conformityNotes: (analysis.gaps as string[])?.join("; ") || null,
        aiAnalysis: analysis as any,
        linkedCommunicationIds: communications.map(c => c.id),
        analyzedAt: new Date(),
      },
    });

    return {
      success: true,
      data: {
        injectionId: params.injectionId,
        injectionTitle,
        injectionType,
        injectedAt: injectedAt.toISOString(),
        reactionDelayMin: analysis.reactionDelayMin as number,
        conformityScore: analysis.conformityScore as number,
        conformityStatus: analysis.conformityStatus as InjectAnalysis["conformityStatus"],
        gaps: (analysis.gaps as string[]) || [],
        reactionQuality: analysis.reactionQuality as number,
        decisionQuality: analysis.decisionQuality as number,
        communicationQuality: analysis.communicationQuality as number,
        expectedAction: analysis.expectedAction as string,
        expectedActor: analysis.expectedActor as string,
        expectedDelayMin: analysis.expectedDelayMin as number,
        actualAction: analysis.actualAction as string,
        actualActor: analysis.firstActor as string,
        observations: (analysis.observations as string[]) || [],
        improvementPoints: (analysis.improvementPoints as string[]) || [],
      },
    };
  } catch (error) {
    console.error("analyzeInjectWithAI error:", error);
    return { success: false, error: "Erreur lors de l'analyse IA de l'inject" };
  }
}

// ─── Generate participant score ───────────────────────────────────────────────

export async function computeParticipantScore(params: {
  simulationId: string;
  assignmentId: string;
  userId: string;
  userName: string;
  role: string;
  communications: Array<{ content: string; createdAt: Date; type: string }>;
  injectResponses: Array<{ conformityScore?: number; reactionQuality?: number; decisionQuality?: number; communicationQuality?: number }>;
  previousScore?: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { communications, injectResponses, previousScore } = params;

    if (injectResponses.length === 0 && communications.length === 0) {
      return { success: true }; // Pas assez de données
    }

    // Analyse IA du participant
    const commsText = communications
      .slice(-30) // Derniers 30 messages
      .map(c => c.content)
      .join("\n");

    const systemPrompt = `Tu es un évaluateur expert en gestion de crise. Évalue un participant à une simulation d'exercice BCM.
Réponds UNIQUEMENT en JSON valide.`;

    const userPrompt = `Évalue ce participant à la simulation de gestion de crise.

Rôle: ${params.role}
Nombre de communications émises: ${communications.length}

Extraits de ses communications:
${commsText.substring(0, 2000) || "(Aucune communication)"}

Scores moyens sur les injects traités:
- Conformité plan: ${injectResponses.length > 0 ? Math.round(injectResponses.reduce((a,r) => a+(r.conformityScore||0), 0)/injectResponses.length) : "N/A"}
- Réactivité: ${injectResponses.length > 0 ? Math.round(injectResponses.reduce((a,r) => a+(r.reactionQuality||0), 0)/injectResponses.length) : "N/A"}
- Décisions: ${injectResponses.length > 0 ? Math.round(injectResponses.reduce((a,r) => a+(r.decisionQuality||0), 0)/injectResponses.length) : "N/A"}
- Communication: ${injectResponses.length > 0 ? Math.round(injectResponses.reduce((a,r) => a+(r.communicationQuality||0), 0)/injectResponses.length) : "N/A"}

Retourne:
{
  "scoreTonality": <0-100>,
  "scoreDecision": <0-100>,
  "scoreConformity": <0-100>,
  "scoreCommunication": <0-100>,
  "scoreLeadership": <0-100>,
  "scoreTimeliness": <0-100>,
  "scoreGlobal": <0-100>,
  "strengths": ["point fort 1", "point fort 2"],
  "weaknesses": ["axe d'amélioration 1", "axe 2"],
  "narrative": "Synthèse narrative sur ce participant en 2-3 phrases"
}`;

    const aiResponse = await callAzureAI(systemPrompt, userPrompt);
    let scores: Record<string, unknown>;
    try {
      scores = JSON.parse(aiResponse.replace(/```json|```/g, "").trim());
    } catch {
      // Fallback: calculate from inject data
      const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : 60;
      scores = {
        scoreTonality: 65,
        scoreDecision: avg(injectResponses.map(r => r.decisionQuality || 60)),
        scoreConformity: avg(injectResponses.map(r => r.conformityScore || 60)),
        scoreCommunication: avg(injectResponses.map(r => r.communicationQuality || 60)),
        scoreLeadership: 60,
        scoreTimeliness: avg(injectResponses.map(r => r.reactionQuality || 60)),
        scoreGlobal: 62,
        strengths: [],
        weaknesses: [],
        narrative: "Analyse en cours.",
      };
    }

    const global = scores.scoreGlobal as number;
    const level = global >= 90 ? "EXCELLENT" : global >= 70 ? "GOOD" : global >= 50 ? "ACCEPTABLE" : global >= 30 ? "INSUFFICIENT" : "CRITICAL";

    await prisma.participantScore.upsert({
      where: { simulationId_assignmentId: { simulationId: params.simulationId, assignmentId: params.assignmentId } },
      create: {
        simulationId: params.simulationId,
        assignmentId: params.assignmentId,
        scoreTonality: scores.scoreTonality as number || 0,
        scoreDecision: scores.scoreDecision as number || 0,
        scoreConformity: scores.scoreConformity as number || 0,
        scoreCommunication: scores.scoreCommunication as number || 0,
        scoreLeadership: scores.scoreLeadership as number || 0,
        scoreTimeliness: scores.scoreTimeliness as number || 0,
        scoreGlobal: global,
        level: level as "EXCELLENT" | "GOOD" | "ACCEPTABLE" | "INSUFFICIENT" | "CRITICAL",
        strengths: (scores.strengths as string[]) || [],
        weaknesses: (scores.weaknesses as string[]) || [],
        aiNarrative: typeof scores.narrative === "string" ? scores.narrative : null,
        injectsHandled: injectResponses.length,
        injectsTotal: injectResponses.length,
        previousScore: previousScore || null,
        progressDelta: previousScore != null ? global - previousScore : null,
        lastUpdated: new Date(),
      },
      update: {
        scoreTonality: scores.scoreTonality as number || 0,
        scoreDecision: scores.scoreDecision as number || 0,
        scoreConformity: scores.scoreConformity as number || 0,
        scoreCommunication: scores.scoreCommunication as number || 0,
        scoreLeadership: scores.scoreLeadership as number || 0,
        scoreTimeliness: scores.scoreTimeliness as number || 0,
        scoreGlobal: global,
        level: level as "EXCELLENT" | "GOOD" | "ACCEPTABLE" | "INSUFFICIENT" | "CRITICAL",
        strengths: (scores.strengths as string[]) || [],
        weaknesses: (scores.weaknesses as string[]) || [],
        aiNarrative: typeof scores.narrative === "string" ? scores.narrative : null,
        injectsHandled: injectResponses.length,
        lastUpdated: new Date(),
      },
    });

    revalidatePath(`/simulation/${params.simulationId}/analysis`);
    return { success: true };
  } catch (error) {
    console.error("computeParticipantScore error:", error);
    return { success: false, error: "Erreur calcul score participant" };
  }
}

// ─── Generate full debrief ────────────────────────────────────────────────────

export async function generateDebrief(simulationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [simulation, scores, injectResponses, crisisPlan] = await Promise.all([
      prisma.simulation.findUnique({
        where: { id: simulationId },
        include: {
          assignments: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
        },
      }),
      prisma.participantScore.findMany({
        where: { simulationId },
        include: { assignment: { include: { user: { select: { firstName: true, lastName: true } } } } },
      }),
      prisma.injectResponse.findMany({ where: { simulationId } }),
      prisma.simulationCrisisPlan.findUnique({ where: { simulationId }, select: { parsedStructure: true, aiSummary: true } }),
    ]);

    if (!simulation) return { success: false, error: "Simulation introuvable" };

    // Team aggregate scores
    const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : 0;

    const teamScoreGlobal = avg((scores as {scoreGlobal:number}[]).map(s => s.scoreGlobal));
    const teamScoreConformity = avg((scores as {scoreConformity:number}[]).map(s => s.scoreConformity));
    const teamScoreCommunication = avg((scores as {scoreCommunication:number}[]).map(s => s.scoreCommunication));
    const teamScoreDecision = avg((scores as {scoreDecision:number}[]).map(s => s.scoreDecision));
    const teamScoreTonality = avg((scores as {scoreTonality:number}[]).map(s => s.scoreTonality));
    const teamScoreTimeliness = avg((scores as {scoreTimeliness:number}[]).map(s => s.scoreTimeliness));

    const conformantInjects = injectResponses.filter((r: any) => r.conformityStatus === "CONFORMANT").length;
    const nonConformantInjects = injectResponses.filter((r: any) => r.conformityStatus === "NON_CONFORMANT").length;
    const avgReactionDelay = avg(injectResponses.filter((r: {reactionDelayMin:number|null}) => r.reactionDelayMin != null).map((r: {reactionDelayMin:number|null}) => r.reactionDelayMin!));

    const teamLevel = teamScoreGlobal >= 90 ? "EXCELLENT" : teamScoreGlobal >= 70 ? "GOOD" : teamScoreGlobal >= 50 ? "ACCEPTABLE" : teamScoreGlobal >= 30 ? "INSUFFICIENT" : "CRITICAL";

    // Generate AI debrief
    const participantSummary = (scores as {assignment:{user:{firstName:string;lastName:string};role:string};scoreGlobal:number;strengths:string[];weaknesses:string[]}[]).map(s => ({
      name: `${s.assignment.user.firstName} ${s.assignment.user.lastName}`,
      role: s.assignment.role,
      global: s.scoreGlobal,
      strengths: s.strengths,
      weaknesses: s.weaknesses,
    }));

    const systemPrompt = `Tu es un expert senior en gestion de crise et exercices BCM. 
Génère un debrief professionnel complet pour les dirigeants d'entreprise.
Réponds en JSON valide uniquement.`;

    const userPrompt = `Génère un debrief complet pour cette simulation de gestion de crise.

SIMULATION: ${simulation.title}
DURÉE: ${simulation.startDate} → ${simulation.endDate}
ÉQUIPE: ${simulation.assignments.length} participants

SCORES ÉQUIPE:
- Global: ${teamScoreGlobal}/100
- Conformité plan: ${teamScoreConformity}/100
- Communication: ${teamScoreCommunication}/100  
- Décisions: ${teamScoreDecision}/100
- Réactivité: ${teamScoreTimeliness}/100
- Gestion stress: ${teamScoreTonality}/100

INJECTS: ${injectResponses.length} traités, ${conformantInjects} conformes, ${nonConformantInjects} non conformes
DÉLAI MOYEN DE RÉACTION: ${avgReactionDelay} minutes

PARTICIPANTS:
${JSON.stringify(participantSummary, null, 2)}

PLAN DE CRISE: ${crisisPlan?.aiSummary || "Non fourni"}

Retourne:
{
  "executiveSummary": "Synthèse pour CODIR en 3-4 phrases",
  "teamStrengths": ["Point fort collectif 1", "..."],
  "teamWeaknesses": ["Axe d'amélioration collectif 1", "..."],
  "criticalGaps": ["Lacune critique 1", "..."],
  "planGaps": [{"section": "...", "gap": "...", "recommendation": "..."}],
  "improvementPlan": {
    "individual": [{"name": "...", "actions": ["..."]}],
    "team": ["Action collective 1", "..."],
    "plan_updates": ["Mise à jour plan recommandée 1", "..."],
    "next_simulation_focus": ["Focus pour prochaine simulation"]
  }
}`;

    const aiResponse = await callAzureAI(systemPrompt, userPrompt);
    let debriefData: Record<string, unknown>;
    try {
      debriefData = JSON.parse(aiResponse.replace(/```json|```/g, "").trim());
    } catch {
      debriefData = {
        executiveSummary: `La simulation ${simulation.title} a obtenu un score global de ${teamScoreGlobal}/100.`,
        teamStrengths: [], teamWeaknesses: [], criticalGaps: [], planGaps: [],
        improvementPlan: { individual: [], team: [], plan_updates: [], next_simulation_focus: [] },
      };
    }

    await prisma.simulationDebrief.upsert({
      where: { simulationId },
      create: {
        simulationId,
        teamScoreGlobal, teamScoreConformity, teamScoreCommunication,
        teamScoreDecision, teamScoreTonality, teamScoreTimeliness,
        teamLevel: teamLevel as "EXCELLENT" | "GOOD" | "ACCEPTABLE" | "INSUFFICIENT" | "CRITICAL",
        totalInjects: injectResponses.length,
        injectsHandledOnTime: injectResponses.filter((r: {reactionDelayMin:number|null;expectedDelayMin:number|null}) => {
          if (!r.reactionDelayMin || !r.expectedDelayMin) return true;
          return r.reactionDelayMin <= r.expectedDelayMin;
        }).length,
        avgReactionDelayMin: avgReactionDelay || null,
        conformantInjects, nonConformantInjects,
        planConformityScore: teamScoreConformity,
        executiveSummary: debriefData.executiveSummary as string,
        teamStrengths: debriefData.teamStrengths as string[],
        teamWeaknesses: debriefData.teamWeaknesses as string[],
        criticalGaps: debriefData.criticalGaps as string[],
        planGaps: debriefData.planGaps as any,
        improvementPlan: debriefData.improvementPlan as any,
        status: "draft",
        generatedAt: new Date(),
      },
      update: {
        teamScoreGlobal, teamScoreConformity, teamScoreCommunication,
        teamScoreDecision, teamScoreTonality, teamScoreTimeliness,
        teamLevel: teamLevel as "EXCELLENT" | "GOOD" | "ACCEPTABLE" | "INSUFFICIENT" | "CRITICAL",
        totalInjects: injectResponses.length,
        conformantInjects, nonConformantInjects,
        planConformityScore: teamScoreConformity,
        executiveSummary: debriefData.executiveSummary as string,
        teamStrengths: debriefData.teamStrengths as string[],
        teamWeaknesses: debriefData.teamWeaknesses as string[],
        criticalGaps: debriefData.criticalGaps as string[],
        planGaps: debriefData.planGaps as any,
        improvementPlan: debriefData.improvementPlan as any,
        generatedAt: new Date(),
      },
    });

    revalidatePath(`/simulation/${simulationId}/debrief`);
    revalidatePath(`/simulation/${simulationId}/analysis`);
    return { success: true };
  } catch (error) {
    console.error("generateDebrief error:", error);
    return { success: false, error: "Erreur génération debrief" };
  }
}

// ─── Get analysis data ────────────────────────────────────────────────────────

export async function getSimulationAnalysis(simulationId: string) {
  try {
    const [injectResponses, participantScores, debrief, crisisPlan, criteria] = await Promise.all([
      prisma.injectResponse.findMany({
        where: { simulationId },
        include: {
          injection: { select: { title: true, type: true, content: true } },
          assignment: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
        },
        orderBy: { injectedAt: "asc" },
      }),
      prisma.participantScore.findMany({
        where: { simulationId },
        include: {
          assignment: {
            include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
          },
        },
        orderBy: { scoreGlobal: "desc" },
      }),
      prisma.simulationDebrief.findUnique({ where: { simulationId } }),
      prisma.simulationCrisisPlan.findUnique({
        where: { simulationId },
        select: { fileName: true, status: true, aiSummary: true, parsedStructure: true, parsedAt: true },
      }),
      prisma.evaluationCriteria.findMany({
        where: { simulationId, isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    return {
      success: true,
      data: { injectResponses, participantScores, debrief, crisisPlan, criteria },
    };
  } catch (error) {
    console.error("getSimulationAnalysis error:", error);
    return { success: false, error: "Erreur récupération analyse" };
  }
}

// ─── Run full analysis on a simulation ───────────────────────────────────────

export async function runFullAnalysis(simulationId: string) {
  try {
    const [injections, communications, assignments, crisisPlan] = await Promise.all([
      prisma.injection.findMany({
        where: { simulationId },
        orderBy: { createdAt: "asc" },
      }),
      prisma.communication.findMany({
        where: { simulationId },
        include: { sender: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.simulationAssignment.findMany({
        where: { simulationId },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
      }),
      prisma.simulationCrisisPlan.findUnique({ where: { simulationId } }),
    ]);

    const parsed = crisisPlan?.parsedStructure as unknown as ParsedCrisisPlan | null;

    // Analyze each inject
    for (const injection of injections) {
      const injectComms = communications.filter((c: {createdAt: Date}) => {
        const afterInject = new Date(c.createdAt) >= new Date(injection.createdAt);
        const nextInject = injections.find((i: {createdAt: Date}) => new Date(i.createdAt) > new Date(injection.createdAt));
        const beforeNext = !nextInject || new Date(c.createdAt) <= new Date(nextInject.createdAt);
        return afterInject && beforeNext;
      });

      await analyzeInjectWithAI({
        simulationId,
        injectionId: injection.id,
        injectionTitle: injection.title,
        injectionContent: injection.content || "",
        injectionType: injection.type,
        injectedAt: new Date(injection.createdAt),
        communications: injectComms.map(c => ({
          id: c.id,
          content: c.content,
          type: c.type,
          createdAt: new Date(c.createdAt),
          sender: { 
            firstName: c.sender?.firstName || "", 
            lastName: c.sender?.lastName || "" 
          },
        })),
        crisisPlan: parsed,
      });
    }

    // Compute scores per participant
    const injectResponsesAll = await prisma.injectResponse.findMany({ where: { simulationId } });

    for (const assignment of assignments) {
      const userComms = communications.filter((c: {sender:{id:string}}) => c.sender.id === assignment.userId);
      const userInjectResponses = injectResponsesAll.filter((r: {assignmentId:string|null}) => r.assignmentId === assignment.id);

      // Check previous simulation score
      const prevAssignment = await prisma.simulationAssignment.findFirst({
        where: { userId: assignment.userId, simulationId: { not: simulationId } },
        include: { simulation: { include: { participantScores: { where: {} } } } },
        orderBy: { createdAt: "desc" },
      });

      const prevScore = prevAssignment?.simulation?.participantScores?.find(
        s => s.assignmentId === prevAssignment.id
      )?.scoreGlobal;

      await computeParticipantScore({
        simulationId,
        assignmentId: assignment.id,
        userId: assignment.userId,
        userName: `${assignment.user.firstName} ${assignment.user.lastName}`,
        role: assignment.role,
        communications: userComms.map(c => ({
          content: c.content, createdAt: new Date(c.createdAt), type: c.type,
        })),
        injectResponses: userInjectResponses.map(r => ({
          conformityScore: r.conformityScore || undefined,
          reactionQuality: undefined, decisionQuality: undefined, communicationQuality: undefined,
        })),
        previousScore: prevScore,
      });
    }

    // Generate debrief
    await generateDebrief(simulationId);

    return { success: true, data: { injectsAnalyzed: injections.length, participantsScored: assignments.length } };
  } catch (error) {
    console.error("runFullAnalysis error:", error);
    return { success: false, error: "Erreur lors de l'analyse complète" };
  }
}

export async function getParticipantScoreForSimulation(simulationId: string, participantId: string) {
  try {
    const score = await prisma.participantScore.findFirst({
      where: {
        simulationId,
        assignmentId: participantId,
      },
    });

    const injectResponses = await prisma.injectResponse.findMany({
      where: {
        simulationId,
        assignmentId: participantId,
      },
      select: {
        id: true,
        injectionId: true,
        reactionDelayMin: true,
        conformityScore: true,
        conformity: true,
        actualAction: true,
      }
    });

    return {
      success: true,
      data: { score, injectResponses },
    };
  } catch (error) {
    console.error("getParticipantScoreForSimulation error:", error);
    return { success: false, error: "Erreur récupération score participant" };
  }
}
