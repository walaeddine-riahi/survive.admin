"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BUILTIN_TEMPLATES, type InjectDef, type SimTemplate } from "@/lib/simulation/templates";
import type { SimChannel, InjectPriority, InjectPhase } from "@/lib/simulation/templates";

// ─── Azure OpenAI ─────────────────────────────────────────────────────────────
async function callAI(system: string, user: string, maxTokens = 3000): Promise<string> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey   = process.env.AZURE_OPENAI_API_KEY;
  const deploy   = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
  const version  = process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";
  if (!endpoint || !apiKey) throw new Error("Azure OpenAI non configuré");
  const res = await fetch(
    `${endpoint}openai/deployments/${deploy}/chat/completions?api-version=${version}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify({
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        max_tokens: maxTokens, temperature: 0.4,
      }),
    }
  );
  if (!res.ok) throw new Error(`AI error ${res.status}`);
  const d = await res.json();
  return d.choices?.[0]?.message?.content || "";
}

// ═══════════════════════════════════════════════════════════════
// WIZARD — Create / Update / Get
// ═══════════════════════════════════════════════════════════════

export async function createSimulationFromWizard(step1: {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: string;
  objectives: string[];
  sector?: string;
}): Promise<{ success: boolean; simulationId?: string; error?: string }> {
  try {
    const simulation = await prisma.simulation.create({
      data: {
        title: step1.title,
        description: step1.description,
        startDate: new Date(step1.startDate),
        endDate: new Date(step1.endDate),
        status: "draft",
        type: step1.type,
        objectives: step1.objectives,
        sector: step1.sector,
      },
    });

    // Create draft state
    await prisma.simulationDraft.create({
      data: {
        simulationId: simulation.id,
        currentStep: 1,
        completedSteps: [1],
        step1Data: step1 as object,
      },
    });

    // Create default scenario
    await prisma.scenario.create({
      data: {
        simulationId: simulation.id,
        name: "Scénario principal",
        description: "Scénario généré automatiquement",
      },
    });

    revalidatePath("/simulation");
    return { success: true, simulationId: simulation.id };
  } catch (error) {
    console.error("createSimulationFromWizard:", error);
    return { success: false, error: "Erreur création simulation" };
  }
}

export async function saveWizardStep(
  simulationId: string,
  step: number,
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    const stepKey = `step${step}Data` as keyof {
      step1Data: unknown; step2Data: unknown; step3Data: unknown;
      step4Data: unknown; step5Data: unknown;
    };

    const existing = await prisma.simulationDraft.findUnique({ where: { simulationId } });
    const completedSteps = existing?.completedSteps || [];
    if (!completedSteps.includes(step)) completedSteps.push(step);

    await prisma.simulationDraft.upsert({
      where: { simulationId },
      create: {
        simulationId,
        currentStep: step,
        completedSteps,
        [stepKey]: data,
      },
      update: {
        currentStep: step,
        completedSteps,
        [stepKey]: data,
      },
    });

    // Apply step data to simulation
    if (step === 2) {
      await prisma.simulation.update({
        where: { id: simulationId },
        data: {
          description: (data.scenarioContext as string) || undefined,
          scenarioContext: data.scenarioContext as string || undefined,
          briefingText: data.briefingText as string || undefined,
        },
      });
    }

    revalidatePath(`/simulation/builder/${simulationId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur sauvegarde wizard" };
  }
}

export async function getWizardDraft(simulationId: string) {
  try {
    const [draft, simulation, injects, assignments, criteria] = await Promise.all([
      prisma.simulationDraft.findUnique({ where: { simulationId } }),
      prisma.simulation.findUnique({
        where: { id: simulationId },
        select: {
          id: true, title: true, description: true, startDate: true, endDate: true,
          status: true, type: true, objectives: true, sector: true,
          scenarioContext: true, briefingText: true, estimatedDuration: true,
        },
      }),
      prisma.injection.findMany({
        where: { simulationId },
        orderBy: { offsetMin: "asc" },
      }),
      prisma.simulationAssignment.findMany({
        where: { simulationId },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      }),
      prisma.evaluationCriteria.findMany({ where: { simulationId } }),
    ]);

    return { success: true, data: { draft, simulation, injects, assignments, criteria } };
  } catch (error) {
    return { success: false, error: "Erreur récupération wizard" };
  }
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE APPLICATION
// ═══════════════════════════════════════════════════════════════

export async function applyTemplate(
  simulationId: string,
  templateId: string
): Promise<{ success: boolean; injectedCount?: number; error?: string }> {
  try {
    const template = BUILTIN_TEMPLATES.find(t => t.id === templateId);
    if (!template) return { success: false, error: "Template introuvable" };

    // Get the default scenario
    let scenario = await prisma.scenario.findFirst({ where: { simulationId } });
    if (!scenario) {
      scenario = await prisma.scenario.create({
        data: { simulationId, name: template.title, description: template.scenarioContext },
      });
    }

    // Update simulation with template data
    await prisma.simulation.update({
      where: { id: simulationId },
      data: {
        description: template.description,
        scenarioContext: template.scenarioContext,
        briefingText: template.briefingText,
        objectives: template.objectives,
        estimatedDuration: template.duration_min,
      },
    });

    // Delete existing injects
    await prisma.injection.deleteMany({ where: { simulationId } });

    // Create inject sequence
    const injects = await Promise.all(
      template.injectSequence.map(inj =>
        prisma.injection.create({
          data: {
            simulationId,
            scenarioId: scenario!.id,
            title: `[${inj.channel}] ${inj.senderPersona}${inj.subject ? ` — ${inj.subject}` : ""}`,
            description: inj.body,
            content: inj.body,
            type: mapChannelToInjectionType(inj.channel) as "EMAIL" | "SMS" | "CALL" | "ALERT" | "DOCUMENT" | "VIDEO" | "AUDIO" | "SYSTEM" | "OTHER",
            triggerType: "TIMED" as "MANUAL" | "TIMED",
            timeOffset: inj.offsetMin,
            offsetMin: inj.offsetMin,
            channel: inj.channel,
            priority: inj.priority,
            senderPersona: inj.senderPersona,
            subject: inj.subject,
            phase: inj.phase,
            expectedActions: inj.expectedActions,
            targetRoles: inj.targetRoles || [],
            isActive: true,
            payload: {},
          },
        })
      )
    );

    // Create evaluation criteria
    await prisma.evaluationCriteria.deleteMany({ where: { simulationId } });
    await prisma.evaluationCriteria.createMany({
      data: template.evaluationConfig.map(c => ({
        simulationId,
        name: c.name,
        description: c.description,
        category: c.category,
        weight: c.weight,
        maxScore: 10,
        excellentThreshold: 90,
        goodThreshold: 70,
        acceptableThreshold: 50,
        appliesTo: "all",
        sortOrder: template.evaluationConfig.indexOf(c),
      })),
    });

    // Save to draft
    await prisma.simulationDraft.upsert({
      where: { simulationId },
      create: { simulationId, currentStep: 4, completedSteps: [1, 2, 4, 5], templateId },
      update: { templateId, completedSteps: [1, 2, 4, 5] },
    });

    revalidatePath(`/simulation/builder/${simulationId}`);
    return { success: true, injectedCount: injects.length };
  } catch (error) {
    console.error("applyTemplate:", error);
    return { success: false, error: "Erreur application template" };
  }
}

// ═══════════════════════════════════════════════════════════════
// AI SCENARIO GENERATION
// ═══════════════════════════════════════════════════════════════

export async function generateAIScenario(input: {
  simulationId: string;
  description: string;     // Free description of the crisis
  duration_min: number;
  participantRoles: string[];
  sector?: string;
  objectives?: string[];
  // Optional context from BCM platform
  criticalProcesses?: string[];
  mainRisks?: string[];
}): Promise<{ success: boolean; data?: { scenarioContext: string; briefingText: string; injects: InjectDef[] }; error?: string }> {
  try {
    const systemPrompt = `Tu es un expert senior en gestion de crise, BCM (ISO 22301) et en conception d'exercices de simulation.
Tu crées des scénarios de simulation réalistes, pédagogiques et progressifs.
Réponds UNIQUEMENT en JSON valide, sans markdown.`;

    const userPrompt = `Génère un scénario de simulation de gestion de crise complet.

CONTEXTE DE LA SIMULATION:
Description: ${input.description}
Durée: ${input.duration_min} minutes
Secteur: ${input.sector || "Non précisé"}
Rôles participants: ${input.participantRoles.join(", ")}
Objectifs pédagogiques: ${input.objectives?.join(", ") || "Tester les procédures de gestion de crise"}
${input.criticalProcesses?.length ? `Processus critiques: ${input.criticalProcesses.join(", ")}` : ""}
${input.mainRisks?.length ? `Risques principaux: ${input.mainRisks.join(", ")}` : ""}

Génère en JSON:
{
  "scenarioContext": "Narration complète du scénario (3-4 paragraphes, immersif, premier degré)",
  "briefingText": "Texte de briefing pour les participants (2-3 paragraphes, ton neutre)",
  "injects": [
    {
      "order": 1,
      "offsetMin": 0,
      "channel": "EMAIL|SMS|CALL|ALERT|FLASH_INFO|WHATSAPP",
      "priority": "LOW|NORMAL|HIGH|CRITICAL",
      "senderPersona": "Nom/rôle de l'expéditeur",
      "subject": "Objet email (optionnel)",
      "body": "Contenu complet du message (réaliste, immersif)",
      "expectedActions": ["Action attendue 1", "Action attendue 2"],
      "phase": "detection|containment|escalation|recovery|comms|legal|debrief",
      "targetRoles": ["RSSI", "DG"],
      "expiresInMin": 10
    }
  ]
}

RÈGLES:
- 8 à 12 injects pour une simulation de ${input.duration_min} minutes
- Progression logique : détection → escalade → décisions difficiles → reprise
- Varier les canaux (pas que emails)
- Inclure au moins 1 inject CRITIQUE avec sentiment d'urgence
- Inclure au moins 1 appel téléphonique avec un acteur externe
- Les injects doivent tester chaque rôle participant
- Rédiger les messages en français, ton professionnel, style réaliste`;

    const raw = await callAI(systemPrompt, userPrompt, 4000);
    const result = JSON.parse(raw.replace(/```json|```/g, "").trim());

    // Save to simulation
    await prisma.simulation.update({
      where: { id: input.simulationId },
      data: {
        scenarioContext: result.scenarioContext,
        briefingText: result.briefingText,
      },
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("generateAIScenario:", error);
    return { success: false, error: "Erreur génération scénario IA" };
  }
}

// ═══════════════════════════════════════════════════════════════
// INJECT MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export async function createInject(simulationId: string, data: {
  title?: string;
  body: string;
  channel: SimChannel;
  priority: InjectPriority;
  offsetMin: number;
  senderPersona: string;
  subject?: string;
  phase: InjectPhase;
  expectedActions?: string[];
  targetRoles?: string[];
  expiresInMin?: number;
}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const scenario = await prisma.scenario.findFirst({ where: { simulationId } });
    if (!scenario) return { success: false, error: "Scénario introuvable" };

    const inject = await prisma.injection.create({
      data: {
        simulationId,
        scenarioId: scenario.id,
        title: data.title || `[${data.channel}] ${data.senderPersona}`,
        description: data.body,
        content: data.body,
        type: mapChannelToInjectionType(data.channel) as "EMAIL" | "SMS" | "CALL" | "ALERT" | "DOCUMENT" | "VIDEO" | "AUDIO" | "SYSTEM" | "OTHER",
        triggerType: "TIMED" as "MANUAL" | "TIMED",
        timeOffset: data.offsetMin,
        offsetMin: data.offsetMin,
        channel: data.channel,
        priority: data.priority,
        senderPersona: data.senderPersona,
        subject: data.subject,
        phase: data.phase,
        expectedActions: data.expectedActions || [],
        targetRoles: data.targetRoles || [],
        isActive: true,
        payload: {},
      },
    });

    revalidatePath(`/simulation/builder/${simulationId}`);
    return { success: true, data: inject };
  } catch (error) {
    return { success: false, error: "Erreur création inject" };
  }
}

export async function updateInject(
  injectId: string,
  data: Partial<Parameters<typeof createInject>[1]>
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.injection.update({
      where: { id: injectId },
      data: {
        ...(data.body && { description: data.body, content: data.body }),
        ...(data.channel && { channel: data.channel, type: mapChannelToInjectionType(data.channel) as "EMAIL" | "SMS" | "CALL" | "ALERT" | "DOCUMENT" | "VIDEO" | "AUDIO" | "SYSTEM" | "OTHER" }),
        ...(data.priority && { priority: data.priority }),
        ...(data.offsetMin !== undefined && { offsetMin: data.offsetMin, timeOffset: data.offsetMin }),
        ...(data.senderPersona && { senderPersona: data.senderPersona }),
        ...(data.subject !== undefined && { subject: data.subject }),
        ...(data.phase && { phase: data.phase }),
        ...(data.expectedActions && { expectedActions: data.expectedActions }),
        ...(data.targetRoles && { targetRoles: data.targetRoles }),
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Erreur mise à jour inject" };
  }
}

export async function deleteInject(injectId: string, simulationId: string) {
  try {
    await prisma.injection.delete({ where: { id: injectId } });
    revalidatePath(`/simulation/builder/${simulationId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Erreur suppression inject" };
  }
}

export async function reorderInjects(
  simulationId: string,
  injectOrders: Array<{ id: string; offsetMin: number }>
) {
  try {
    await Promise.all(
      injectOrders.map(({ id, offsetMin }) =>
        prisma.injection.update({
          where: { id },
          data: { offsetMin, timeOffset: offsetMin },
        })
      )
    );
    revalidatePath(`/simulation/builder/${simulationId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Erreur réorganisation" };
  }
}

export async function getSimulationInjects(simulationId: string) {
  try {
    const injects = await prisma.injection.findMany({
      where: { simulationId },
      orderBy: { offsetMin: "asc" },
    });
    return { success: true, data: injects };
  } catch {
    return { success: false, error: "Erreur récupération injects" };
  }
}

// ═══════════════════════════════════════════════════════════════
// PARTICIPANT MANAGEMENT (Wizard Step 3)
// ═══════════════════════════════════════════════════════════════

export async function addParticipantToSimulation(simulationId: string, data: {
  userId: string;
  role: string;
  team?: string;
}) {
  try {
    const assignment = await prisma.simulationAssignment.upsert({
      where: { userId_simulationId: { userId: data.userId, simulationId } },
      create: { simulationId, userId: data.userId, role: data.role, status: "confirmed" },
      update: { role: data.role, status: "confirmed" },
    });

    // Also link to SimSession if one exists
    const session = await prisma.simSession.findFirst({ where: { simulationId } });
    if (session) {
      const user = await prisma.user.findUnique({ where: { id: data.userId }, select: { firstName: true, lastName: true, email: true } });
      if (user) {
        await prisma.simParticipant.upsert({
          where: { sessionId_userId: { sessionId: session.id, userId: data.userId } },
          create: {
            sessionId: session.id,
            userId: data.userId,
            displayName: `${user.firstName} ${user.lastName}`,
            role: data.role,
            team: data.team,
            email: user.email,
            simEmail: `${user.firstName?.toLowerCase()}.${user.lastName?.toLowerCase()}@sim.survive.io`,
          },
          update: { role: data.role },
        });
      }
    }

    revalidatePath(`/simulation/builder/${simulationId}`);
    return { success: true, data: assignment };
  } catch (error) {
    console.error("addParticipantToSimulation:", error);
    return { success: false, error: "Erreur ajout participant" };
  }
}

export async function removeParticipantFromSimulation(assignmentId: string, simulationId: string) {
  try {
    await prisma.simulationAssignment.delete({ where: { id: assignmentId } });
    revalidatePath(`/simulation/builder/${simulationId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Erreur suppression participant" };
  }
}

// ═══════════════════════════════════════════════════════════════
// FINALIZE — Launch simulation
// ═══════════════════════════════════════════════════════════════

export async function finalizeSimulation(simulationId: string): Promise<{
  success: boolean; sessionId?: string; error?: string;
}> {
  try {
    // Init evaluation criteria if not set
    const criteriaCount = await prisma.evaluationCriteria.count({ where: { simulationId } });
    if (criteriaCount === 0) {
      const { initEvaluationCriteria } = await import("./crisis-plan-actions");
      await initEvaluationCriteria(simulationId);
    }

    // Mark simulation as ready
    await prisma.simulation.update({
      where: { id: simulationId },
      data: { status: "ready" },
    });

    // Mark draft as complete
    await prisma.simulationDraft.update({
      where: { simulationId },
      data: { isComplete: true, completedSteps: [1, 2, 3, 4, 5] },
    });

    // Create a SimSession linked to this simulation
    const simulation = await prisma.simulation.findUnique({
      where: { id: simulationId },
      select: { title: true, startDate: true, durationMinutes: true, briefingText: true, scenarioContext: true },
    });

    const { randomBytes } = await import("crypto");
    const wsRoomId = `sim-${randomBytes(8).toString("hex")}`;

    const session = await prisma.simSession.create({
      data: {
        simulationId,
        title: simulation?.title || "Session",
        scenarioContext: simulation?.scenarioContext || undefined,
        briefingText: simulation?.briefingText || undefined,
        scheduledAt: simulation?.startDate || new Date(),
        wsRoomId,
        status: "SETUP",
      },
    });

    // Add existing assignments as participants
    const assignments = await prisma.simulationAssignment.findMany({
      where: { simulationId },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });

    for (const a of assignments) {
      const slug = `${a.user.firstName?.toLowerCase()}.${a.user.lastName?.toLowerCase()}`.replace(/[^a-z.]/g, "");
      await prisma.simParticipant.upsert({
        where: { sessionId_userId: { sessionId: session.id, userId: a.userId } },
        create: {
          sessionId: session.id,
          userId: a.userId,
          displayName: `${a.user.firstName} ${a.user.lastName}`,
          role: a.role,
          email: a.user.email,
          simEmail: `${slug}@sim.survive.io`,
          simPhone: `+SIM-${Math.floor(1000 + Math.random() * 9000)}`,
        },
        update: { role: a.role },
      });
    }

    revalidatePath("/simulation");
    return { success: true, sessionId: session.id };
  } catch (error) {
    console.error("finalizeSimulation:", error);
    return { success: false, error: "Erreur finalisation simulation" };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapChannelToInjectionType(channel: string): string {
  const m: Record<string, string> = {
    EMAIL: "EMAIL", SMS: "SMS", CALL: "CALL", WHATSAPP: "SMS",
    ALERT: "SYSTEM", FLASH_INFO: "SYSTEM", JOURNAL: "DOCUMENT",
    SOCIAL_MEDIA: "OTHER", INTERNAL_RADIO: "AUDIO",
  };
  return m[channel] || "OTHER";
}
