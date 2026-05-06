import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── AI helper ───────────────────────────────────────────────────────────────
async function callAzureAI(system: string, user: string): Promise<string> {
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
        max_tokens: 3000, temperature: 0.3,
      }),
    }
  );
  if (!res.ok) throw new Error(`Azure AI ${res.status}`);
  const d = await res.json();
  return d.choices?.[0]?.message?.content || "";
}

// ─── GET: collect all data for the report ────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ simulationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { simulationId } = await params;

    const [simulation, communications, injectResponses, participantScores, debrief, crisisPlan] =
      await Promise.all([
        prisma.simulation.findUnique({
          where: { id: simulationId },
          include: {
            assignments: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
                team: { select: { id: true, name: true } },
              },
            },
            scenarios: {
              include: {
                injections: { orderBy: { createdAt: "asc" } },
              },
            },
          },
        }),
        prisma.communication.findMany({
          where: { simulationId },
          include: { sender: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: "asc" },
        }),
        prisma.injectResponse.findMany({
          where: { simulationId },
          include: {
            injection: { select: { id: true, title: true, type: true, content: true } },
            assignment: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
          orderBy: { injectedAt: "asc" },
        }),
        prisma.participantScore.findMany({
          where: { simulationId },
          include: {
            assignment: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
          orderBy: { scoreGlobal: "desc" },
        }),
        prisma.simulationDebrief.findUnique({ where: { simulationId } }),
        prisma.simulationCrisisPlan.findUnique({
          where: { simulationId },
          select: { fileName: true, aiSummary: true, parsedStructure: true, status: true },
        }),
      ]);

    if (!simulation) return NextResponse.json({ error: "Simulation non trouvée" }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: { simulation, communications, injectResponses, participantScores, debrief, crisisPlan },
    });
  } catch (error) {
    console.error("report GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ─── POST: generate full AI report ───────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ simulationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { simulationId } = await params;
    const body = await req.json().catch(() => ({}));
    const format: "json" | "html" = body.format || "json";

    // Gather all data
    const [simulation, communications, injectResponses, participantScores, debrief, crisisPlan] =
      await Promise.all([
        prisma.simulation.findUnique({
          where: { id: simulationId },
          include: {
            assignments: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
            scenarios: { include: { injections: { orderBy: { createdAt: "asc" } } } },
          },
        }),
        prisma.communication.findMany({
          where: { simulationId },
          include: { sender: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: "asc" },
        }),
        prisma.injectResponse.findMany({
          where: { simulationId },
          include: { injection: { select: { title: true, type: true, content: true } } },
          orderBy: { injectedAt: "asc" },
        }),
        prisma.participantScore.findMany({
          where: { simulationId },
          include: { assignment: { include: { user: { select: { firstName: true, lastName: true } } } } },
          orderBy: { scoreGlobal: "desc" },
        }),
        prisma.simulationDebrief.findUnique({ where: { simulationId } }),
        prisma.simulationCrisisPlan.findUnique({ where: { simulationId }, select: { aiSummary: true, parsedStructure: true } }),
      ]);

    if (!simulation) return NextResponse.json({ error: "Simulation non trouvée" }, { status: 404 });

    // Compute basic stats
    const allInjections = simulation.scenarios.flatMap((s: {injections: unknown[]}) => s.injections);
    const totalInjections = allInjections.length;
    const conformant = injectResponses.filter((r: {conformityStatus: string}) => r.conformityStatus === "CONFORMANT").length;
    const nonConformant = injectResponses.filter((r: {conformityStatus: string}) => r.conformityStatus === "NON_CONFORMANT").length;
    const avgReaction = injectResponses.filter((r: {reactionDelayMin: number|null}) => r.reactionDelayMin != null).length > 0
      ? Math.round(injectResponses.reduce((a: number, r: {reactionDelayMin: number|null}) => a + (r.reactionDelayMin || 0), 0) / injectResponses.filter((r: {reactionDelayMin: number|null}) => r.reactionDelayMin != null).length)
      : null;
    const teamScore = participantScores.length > 0
      ? Math.round(participantScores.reduce((a: number, s: {scoreGlobal: number}) => a + s.scoreGlobal, 0) / participantScores.length)
      : null;

    // Prepare AI context
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const injectSummary = (injectResponses as any[]).map((r: any) => ({
      inject: r.injection?.title,
      type: r.injection?.type,
      delaiReaction: r.reactionDelayMin,
      delaiAttendu: r.expectedDelayMin,
      actionAttendue: r.expectedAction,
      actionReelle: r.actualAction,
      conformite: r.conformityStatus,
      scoreConformite: r.conformityScore,
      ecarts: r.conformityNotes,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const participantSummary = (participantScores as any[]).map((s: any) => ({
      nom: `${s.assignment.user.firstName} ${s.assignment.user.lastName}`,
      role: s.assignment.role,
      scoreGlobal: s.scoreGlobal,
      scoreConformite: s.scoreConformity,
      scoreCommunication: s.scoreCommunication,
      scoreDecision: s.scoreDecision,
      scoreReactivite: s.scoreTimeliness,
      pointsForts: s.strengths,
      axesAmelioration: s.weaknesses,
    }));

    // Generate comprehensive AI report
    const system = `Tu es un expert senior en gestion de crise et exercices BCM (ISO 22301, BCI GPG, ISO 22317).
Tu rédiges des comptes-rendus d'exercices professionnels destinés aux dirigeants et responsables BCM.
Ton style est précis, professionnel, constructif. Tu utilises des termes BCM exacts.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans explication.`;

    const prompt = `Rédige le rapport complet de cette simulation d'exercice de gestion de crise.

=== SIMULATION ===
Titre: ${simulation.title}
Description: ${simulation.description || "Non renseignée"}
Début: ${simulation.startDate}
Fin: ${simulation.endDate}
Statut: ${simulation.status}
Participants: ${simulation.assignments.length}
Scénarios: ${simulation.scenarios.map(s => s.name).join(", ")}

=== PLAN DE CRISE UTILISÉ ===
${crisisPlan?.aiSummary || "Aucun plan de crise uploadé"}

=== INJECTS (${totalInjections} au total) ===
${JSON.stringify(injectSummary, null, 2)}

=== PARTICIPANTS ===
${JSON.stringify(participantSummary, null, 2)}

=== MÉTRIQUES GLOBALES ===
Score équipe: ${teamScore}/100
Conformes au plan: ${conformant}/${injectResponses.length}
Non conformes: ${nonConformant}
Délai moyen de réaction: ${avgReaction ? avgReaction + " min" : "N/A"}

Génère le JSON suivant (chaque section doit être substantielle, entre 2 et 5 phrases minimum):
{
  "descriptionScenario": "Description narrative complète du scénario exercé, son contexte et ses objectifs",
  "deroulement": "Narration chronologique du déroulement de l'exercice, des moments clés, des tournants",
  "analyseReponseParInject": [
    {
      "inject": "Titre de l'inject",
      "type": "Type",
      "analyse": "Analyse détaillée de la réponse à cet inject",
      "ecart": "Description précise de l'écart entre réponse réelle et plan",
      "scoreConformite": 85,
      "delaiReaction": 8,
      "delaiAttendu": 5,
      "appreciation": "CONFORME|PARTIEL|NON_CONFORME"
    }
  ],
  "comportementEquipe": "Analyse narrative du comportement général de l'équipe — coordination, communication, leadership, gestion du stress",
  "pointsForts": ["Point fort 1 précis", "Point fort 2", "Point fort 3", "Point fort 4"],
  "pointsAmeliorer": ["Axe d'amélioration 1 précis", "Axe 2", "Axe 3", "Axe 4"],
  "lacunesPlan": [
    {
      "section": "Section concernée du plan",
      "lacune": "Description de la lacune identifiée",
      "impact": "Impact observé pendant l'exercice"
    }
  ],
  "recommandations": [
    {
      "priorite": "HAUTE|MOYENNE|BASSE",
      "titre": "Titre court de la recommandation",
      "description": "Description détaillée",
      "actions": ["Action concrète 1", "Action concrète 2"]
    }
  ],
  "conclusion": "Conclusion synthétique — évaluation globale, prochaines étapes recommandées",
  "scoreGlobal": ${teamScore || 65},
  "niveauGlobal": "EXCELLENT|BIEN|ACCEPTABLE|INSUFFISANT|CRITIQUE"
}`;

    const aiRaw = await callAzureAI(system, prompt);
    let report: Record<string, unknown>;
    try {
      report = JSON.parse(aiRaw.replace(/```json|```/g, "").trim());
    } catch {
      report = {
        descriptionScenario: simulation.description || `Simulation "${simulation.title}" — exercice de gestion de crise.`,
        deroulement: `L'exercice s'est déroulé du ${new Date(simulation.startDate).toLocaleDateString("fr-FR")} au ${new Date(simulation.endDate).toLocaleDateString("fr-FR")}.`,
        analyseReponseParInject: injectSummary.map(i => ({
          inject: i.inject, type: i.type,
          analyse: "Analyse en cours.", ecart: i.ecarts || "Aucun écart notable.",
          scoreConformite: i.scoreConformite || 70,
          delaiReaction: i.delaiReaction, delaiAttendu: i.delaiAttendu,
          appreciation: i.conformite === "CONFORMANT" ? "CONFORME" : i.conformite === "NON_CONFORMANT" ? "NON_CONFORME" : "PARTIEL",
        })),
        comportementEquipe: `L'équipe a démontré une capacité de réaction globalement satisfaisante avec un score de ${teamScore}/100.`,
        pointsForts: debrief?.teamStrengths || ["Réactivité globale", "Communication interne"],
        pointsAmeliorer: debrief?.teamWeaknesses || ["Conformité aux procédures", "Délais de réaction"],
        lacunesPlan: [],
        recommandations: [{ priorite: "HAUTE", titre: "Révision du plan", description: "Mettre à jour le plan suite aux lacunes identifiées.", actions: ["Organiser un atelier de révision"] }],
        conclusion: "L'exercice a permis d'identifier des axes d'amélioration importants.",
        scoreGlobal: teamScore || 65,
        niveauGlobal: (teamScore || 65) >= 80 ? "BIEN" : (teamScore || 65) >= 60 ? "ACCEPTABLE" : "INSUFFISANT",
      };
    }

    if (format === "html") {
      // Generate printable HTML report
      const html = buildReportHTML({ report, simulation, participantScores, crisisPlan, communications, avgReaction, conformant, nonConformant, totalInjections, teamScore });
      return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    return NextResponse.json({ success: true, data: { report, stats: { teamScore, totalInjections, conformant, nonConformant, avgReaction, participants: simulation.assignments.length } } });
  } catch (error) {
    console.error("report POST error:", error);
    return NextResponse.json({ error: "Erreur génération rapport" }, { status: 500 });
  }
}

// ─── HTML Report Builder ──────────────────────────────────────────────────────
function buildReportHTML(params: {
  report: Record<string, unknown>;
  simulation: { title: string; description?: string | null; startDate: Date; endDate: Date; status: string; assignments: { user: { firstName: string; lastName: string } }[]; scenarios: { name: string }[] };
  participantScores: { scoreGlobal: number; scoreConformity: number; scoreCommunication: number; scoreDecision: number; scoreTimeliness: number; scoreTonality: number; level: string; strengths: string[]; weaknesses: string[]; aiNarrative?: string | null; assignment: { role: string; user: { firstName: string; lastName: string } } }[];
  crisisPlan: { aiSummary?: string | null; fileName?: string } | null;
  communications: { content: string; sender: { firstName: string; lastName: string }; createdAt: Date }[];
  avgReaction: number | null;
  conformant: number;
  nonConformant: number;
  totalInjections: number;
  teamScore: number | null;
}) {
  const { report, simulation, participantScores, crisisPlan, avgReaction, conformant, nonConformant, totalInjections, teamScore } = params;
  const r = report;
  const score = teamScore || (r.scoreGlobal as number) || 0;
  const scoreColor = score >= 80 ? "#0F6E56" : score >= 60 ? "#185FA5" : score >= 40 ? "#854F0B" : "#A32D2D";
  const niveauLabel: Record<string, string> = { EXCELLENT: "Excellent", BIEN: "Bien", ACCEPTABLE: "Acceptable", INSUFFISANT: "Insuffisant", CRITIQUE: "Critique" };
  const niveau = niveauLabel[(r.niveauGlobal as string)] || "Acceptable";
  const conformiteRate = totalInjections > 0 ? Math.round((conformant / totalInjections) * 100) : 0;
  const injDate = (d: Date) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const injTime = (d: Date) => new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const apprColor = (a: string) => a === "CONFORME" ? "#0F6E56" : a === "NON_CONFORME" ? "#A32D2D" : "#854F0B";
  const apprBg = (a: string) => a === "CONFORME" ? "#E1F5EE" : a === "NON_CONFORME" ? "#FCEBEB" : "#FAEEDA";
  const prioColor = (p: string) => p === "HAUTE" ? "#A32D2D" : p === "MOYENNE" ? "#854F0B" : "#0F6E56";
  const prioBg = (p: string) => p === "HAUTE" ? "#FCEBEB" : p === "MOYENNE" ? "#FAEEDA" : "#E1F5EE";
  const scColor = (s: number) => s >= 80 ? "#0F6E56" : s >= 60 ? "#185FA5" : s >= 40 ? "#854F0B" : "#A32D2D";

  const injectRows = ((r.analyseReponseParInject as Record<string, unknown>[]) || []).map((inj, i) => `
    <div style="margin-bottom:20px;page-break-inside:avoid;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <div style="width:28px;height:28px;border-radius:50%;background:${apprBg(inj.appreciation as string)};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:${apprColor(inj.appreciation as string)};flex-shrink:0;">${i+1}</div>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:700;color:#1a1a1a">${inj.inject || `Inject ${i+1}`}</div>
          <div style="font-size:11px;color:#666;margin-top:1px">${inj.type || ""}</div>
        </div>
        <span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:12px;background:${apprBg(inj.appreciation as string)};color:${apprColor(inj.appreciation as string)};">${inj.appreciation || "N/A"}</span>
        ${inj.scoreConformite != null ? `<span style="font-size:13px;font-weight:700;color:${scColor(inj.scoreConformite as number)};min-width:36px;text-align:right">${inj.scoreConformite}%</span>` : ""}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
        <div style="background:#F5F5F5;border-radius:6px;padding:8px 10px">
          <div style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px">Délai de réaction</div>
          <div style="font-size:13px;font-weight:700;color:${(inj.delaiReaction as number) > (inj.delaiAttendu as number) ? '#A32D2D' : '#0F6E56'}">${inj.delaiReaction ? inj.delaiReaction + " min" : "—"} <span style="font-size:11px;font-weight:400;color:#888">/ cible ${inj.delaiAttendu ? inj.delaiAttendu + " min" : "?"}</span></div>
        </div>
        <div style="background:#F5F5F5;border-radius:6px;padding:8px 10px">
          <div style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px">Conformité plan</div>
          <div style="font-size:13px;font-weight:700;color:${apprColor(inj.appreciation as string)}">${inj.scoreConformite != null ? inj.scoreConformite + "%" : "—"}</div>
        </div>
      </div>
      <div style="margin-bottom:6px"><div style="font-size:11px;font-weight:700;color:#444;margin-bottom:2px">Analyse de la réponse</div><div style="font-size:12px;color:#444;line-height:1.6">${inj.analyse || ""}</div></div>
      ${inj.ecart && inj.ecart !== "Aucun écart notable." ? `<div style="background:#FAEEDA;border-left:3px solid #EF9F27;border-radius:0 4px 4px 0;padding:7px 10px;margin-top:5px"><div style="font-size:11px;font-weight:700;color:#633806;margin-bottom:2px">Écart avec le plan</div><div style="font-size:12px;color:#633806;line-height:1.5">${inj.ecart}</div></div>` : ""}
    </div>`).join('<div style="border-top:1px solid #eee;margin:16px 0"></div>');

  const participantCards = participantScores.map(p => `
    <div style="border:1px solid #e5e5e5;border-top:3px solid ${scColor(p.scoreGlobal)};border-radius:8px;padding:14px;break-inside:avoid;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <div style="width:38px;height:38px;border-radius:50%;background:${scColor(p.scoreGlobal)};display:flex;align-items:center;justify-content:center;color:white;font-size:13px;font-weight:700;flex-shrink:0">${p.assignment.user.firstName[0]}${p.assignment.user.lastName[0]}</div>
        <div style="flex:1"><div style="font-size:14px;font-weight:700">${p.assignment.user.firstName} ${p.assignment.user.lastName}</div><div style="font-size:11px;color:#888">${p.assignment.role}</div></div>
        <div style="text-align:right"><div style="font-size:24px;font-weight:700;color:${scColor(p.scoreGlobal)}">${p.scoreGlobal}</div><div style="font-size:10px;color:#888">/100</div></div>
      </div>
      <table style="width:100%;font-size:11px;border-collapse:collapse;">
        ${[["Conformité plan", p.scoreConformity], ["Communication", p.scoreCommunication], ["Décision", p.scoreDecision], ["Réactivité", p.scoreTimeliness], ["Gestion stress", p.scoreTonality]].map(([label, val]) => `
        <tr><td style="color:#666;padding:2px 0;width:110px">${label}</td><td><div style="height:5px;background:#eee;border-radius:3px;overflow:hidden"><div style="height:100%;width:${val}%;background:${scColor(val as number)};border-radius:3px"></div></div></td><td style="text-align:right;font-weight:700;color:${scColor(val as number)};width:30px">${val}</td></tr>`).join("")}
      </table>
      ${p.aiNarrative ? `<div style="margin-top:8px;font-size:11px;color:#555;font-style:italic;border-top:1px solid #f0f0f0;padding-top:8px">${p.aiNarrative}</div>` : ""}
      ${p.strengths.length > 0 ? `<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px">${p.strengths.slice(0,2).map(s => `<span style="font-size:10px;padding:2px 7px;border-radius:8px;background:#E1F5EE;color:#0F6E56">✓ ${s}</span>`).join("")}</div>` : ""}
    </div>`).join("");

  const lacunesRows = ((r.lacunesPlan as Record<string, unknown>[]) || []).map(l => `
    <tr>
      <td style="padding:8px 10px;font-size:12px;font-weight:700;color:#1a1a1a;border:1px solid #e5e5e5;background:#FAFAFA">${l.section || "—"}</td>
      <td style="padding:8px 10px;font-size:12px;color:#444;border:1px solid #e5e5e5">${l.lacune || "—"}</td>
      <td style="padding:8px 10px;font-size:12px;color:#A32D2D;border:1px solid #e5e5e5">${l.impact || "—"}</td>
    </tr>`).join("");

  const recoBlocks = ((r.recommandations as Record<string, unknown>[]) || []).map((rec, i) => `
    <div style="display:flex;gap:14px;margin-bottom:16px;page-break-inside:avoid;">
      <div style="width:28px;height:28px;border-radius:50%;background:${prioBg(rec.priorite as string)};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:${prioColor(rec.priorite as string)};flex-shrink:0">${i+1}</div>
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <div style="font-size:13px;font-weight:700;color:#1a1a1a">${rec.titre || ""}</div>
          <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;background:${prioBg(rec.priorite as string)};color:${prioColor(rec.priorite as string)}">${rec.priorite || ""}</span>
        </div>
        <div style="font-size:12px;color:#444;line-height:1.6;margin-bottom:6px">${rec.description || ""}</div>
        ${((rec.actions as string[]) || []).map(a => `<div style="font-size:11px;color:#555;padding:2px 0 2px 12px;border-left:2px solid #e5e5e5">→ ${a}</div>`).join("")}
      </div>
    </div>`).join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>Rapport de simulation — ${simulation.title}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',-apple-system,sans-serif;font-size:13px;color:#1a1a1a;background:white;line-height:1.6}
@page{size:A4;margin:20mm 18mm}
@media print{.no-print{display:none!important}.page-break{page-break-before:always}}
.cover{background:linear-gradient(135deg,#0C447C 0%,#185FA5 60%,#378ADD 100%);color:white;padding:48px 52px 40px;min-height:200px;position:relative;overflow:hidden}
.cover::after{content:'';position:absolute;bottom:-40px;right:-40px;width:180px;height:180px;background:rgba(255,255,255,.06);border-radius:50%}
.cover-badge{display:inline-block;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);border-radius:20px;padding:3px 12px;font-size:10px;font-weight:600;margin-bottom:18px;letter-spacing:.05em}
.cover-title{font-size:26px;font-weight:700;line-height:1.2;margin-bottom:10px}
.cover-sub{font-size:13px;opacity:.8;margin-bottom:24px}
.cover-meta{display:flex;gap:24px;font-size:11px;opacity:.7;flex-wrap:wrap}
.content{padding:28px 0}
.section{margin-bottom:32px;page-break-inside:avoid}
.section-header{display:flex;align-items:center;gap:10px;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid #185FA5}
.section-number{width:28px;height:28px;border-radius:6px;background:#185FA5;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:white;flex-shrink:0}
.section-title{font-size:16px;font-weight:700;color:#185FA5}
.kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
.kpi{background:#F8FAFE;border:1px solid #DDE8F8;border-radius:8px;padding:14px;text-align:center}
.kpi-val{font-size:26px;font-weight:700;line-height:1}
.kpi-label{font-size:10px;color:#666;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-top:4px}
.kpi-sub{font-size:10px;color:#999;margin-top:2px}
.prose{font-size:13px;color:#333;line-height:1.7;background:#F8FAFE;border-radius:8px;padding:14px 16px;border-left:4px solid #185FA5}
.participant-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
table.score-table{width:100%;border-collapse:collapse;font-size:12px}
table.score-table th{background:#185FA5;color:white;padding:8px 10px;font-weight:600;text-align:left;font-size:11px}
table.score-table td{padding:7px 10px;border-bottom:1px solid #F0F0F0}
table.score-table tr:hover td{background:#F8FAFE}
.btn-print{position:fixed;bottom:24px;right:24px;background:#185FA5;color:white;border:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 2px 8px rgba(24,95,165,.3)}
.footer{border-top:1px solid #E5E5E5;padding-top:14px;margin-top:32px;display:flex;justify-content:space-between;font-size:10px;color:#999}
.tag{display:inline-block;font-size:11px;padding:2px 8px;border-radius:8px;margin:2px}
.tag-green{background:#E1F5EE;color:#0F6E56}
.tag-amber{background:#FAEEDA;color:#633806}
</style>
</head>
<body>

<button class="btn-print no-print" onclick="window.print()">Imprimer / PDF</button>

<div class="cover">
  <div class="cover-badge">RAPPORT DE SIMULATION — ISO 22301 · BCM</div>
  <div class="cover-title">${simulation.title}</div>
  <div class="cover-sub">Compte-rendu d'exercice de gestion de crise</div>
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
    <div style="text-align:center;background:rgba(255,255,255,.15);border-radius:12px;padding:12px 20px">
      <div style="font-size:36px;font-weight:700;color:white">${score}</div>
      <div style="font-size:11px;opacity:.8">Score équipe /100</div>
      <div style="font-size:12px;font-weight:600;opacity:.9">${niveau}</div>
    </div>
    <div style="font-size:12px;opacity:.8;line-height:1.8">
      <div>📅 ${injDate(simulation.startDate)} au ${injDate(simulation.endDate)}</div>
      <div>👥 ${simulation.assignments.length} participant(s)</div>
      <div>🎯 ${totalInjections} inject(s) · ${conformant} conformes (${conformiteRate}%)</div>
      <div>📋 Plan : ${crisisPlan?.fileName || "Non fourni"}</div>
    </div>
  </div>
  <div class="cover-meta">
    <span>Généré le ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</span>
    <span>Scénarios : ${simulation.scenarios.map(s => s.name).join(", ") || "—"}</span>
    <span>Confidentiel — Usage interne</span>
  </div>
</div>

<div class="content">

  <!-- KPIs -->
  <div class="kpi-row">
    <div class="kpi"><div class="kpi-val" style="color:${scoreColor}">${score}</div><div class="kpi-label">Score global équipe</div><div class="kpi-sub">${niveau}</div></div>
    <div class="kpi"><div class="kpi-val" style="color:${conformiteRate >= 70 ? '#0F6E56' : conformiteRate >= 50 ? '#854F0B' : '#A32D2D'}">${conformiteRate}%</div><div class="kpi-label">Conformité plan</div><div class="kpi-sub">${conformant}/${totalInjections} injects</div></div>
    <div class="kpi"><div class="kpi-val" style="color:${avgReaction != null && avgReaction <= 10 ? '#0F6E56' : '#A32D2D'}">${avgReaction != null ? avgReaction + " min" : "—"}</div><div class="kpi-label">Délai moyen réaction</div><div class="kpi-sub">cible plan: 5 min</div></div>
    <div class="kpi"><div class="kpi-val" style="color:#185FA5">${simulation.assignments.length}</div><div class="kpi-label">Participants</div><div class="kpi-sub">${participantScores.length} évalués</div></div>
  </div>

  <!-- 1. Scénario -->
  <div class="section">
    <div class="section-header"><div class="section-number">1</div><div class="section-title">Description du scénario</div></div>
    <div class="prose">${r.descriptionScenario || simulation.description || "Simulation de gestion de crise."}</div>
    ${crisisPlan?.aiSummary ? `<div style="margin-top:10px;background:#EAF3DE;border-radius:8px;padding:12px 14px;border-left:4px solid #3B6D11"><div style="font-size:11px;font-weight:700;color:#3B6D11;margin-bottom:4px">Plan de crise de référence</div><div style="font-size:12px;color:#27500A">${crisisPlan.aiSummary}</div></div>` : ""}
  </div>

  <!-- 2. Déroulement -->
  <div class="section">
    <div class="section-header"><div class="section-number">2</div><div class="section-title">Déroulement de l'exercice</div></div>
    <div class="prose">${r.deroulement || "L'exercice s'est déroulé conformément au programme établi."}</div>
  </div>

  <!-- 3. Analyse par inject -->
  <div class="section page-break">
    <div class="section-header"><div class="section-number">3</div><div class="section-title">Analyse de la réponse par inject</div></div>
    ${injectRows || '<div style="color:#888;font-style:italic;padding:12px">Aucune donnée d\'analyse disponible.</div>'}
  </div>

  <!-- 4. Comportement équipe -->
  <div class="section">
    <div class="section-header"><div class="section-number">4</div><div class="section-title">Comportement général de l'équipe</div></div>
    <div class="prose">${r.comportementEquipe || "L'équipe a géré la crise de manière globalement satisfaisante."}</div>
  </div>

  <!-- 5. Scores participants -->
  <div class="section page-break">
    <div class="section-header"><div class="section-number">5</div><div class="section-title">Évaluation individuelle des participants</div></div>
    ${participantCards ? `<div class="participant-grid">${participantCards}</div>` : '<div style="color:#888;font-style:italic">Aucune évaluation disponible.</div>'}
  </div>

  <!-- 6. Points forts -->
  <div class="section">
    <div class="section-header"><div class="section-number">6</div><div class="section-title">Points forts identifiés</div></div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${((r.pointsForts as string[]) || []).map((p, i) => `<div style="display:flex;gap:10px;align-items:flex-start;background:#E1F5EE;border-radius:8px;padding:10px 12px"><div style="width:22px;height:22px;border-radius:50%;background:#0F6E56;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;flex-shrink:0">${i+1}</div><div style="font-size:13px;color:#085041">${p}</div></div>`).join("")}
    </div>
  </div>

  <!-- 7. Points à améliorer -->
  <div class="section">
    <div class="section-header"><div class="section-number">7</div><div class="section-title">Points à améliorer</div></div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${((r.pointsAmeliorer as string[]) || []).map((p, i) => `<div style="display:flex;gap:10px;align-items:flex-start;background:#FAEEDA;border-radius:8px;padding:10px 12px"><div style="width:22px;height:22px;border-radius:50%;background:#854F0B;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;flex-shrink:0">${i+1}</div><div style="font-size:13px;color:#412402">${p}</div></div>`).join("")}
    </div>
  </div>

  <!-- 8. Lacunes du plan -->
  <div class="section">
    <div class="section-header"><div class="section-number">8</div><div class="section-title">Lacunes identifiées dans le plan de crise</div></div>
    ${((r.lacunesPlan as Record<string, unknown>[]) || []).length > 0 ? `
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead><tr>
        <th style="background:#534AB7;color:white;padding:8px 10px;text-align:left;font-size:11px;border-radius:6px 0 0 0">Section</th>
        <th style="background:#534AB7;color:white;padding:8px 10px;text-align:left;font-size:11px">Lacune identifiée</th>
        <th style="background:#534AB7;color:white;padding:8px 10px;text-align:left;font-size:11px;border-radius:0 6px 0 0">Impact observé</th>
      </tr></thead>
      <tbody>${lacunesRows}</tbody>
    </table>` : '<div style="background:#F8F8F8;border-radius:8px;padding:14px;font-size:12px;color:#888;font-style:italic">Aucune lacune critique identifiée dans le plan lors de cet exercice.</div>'}
  </div>

  <!-- 9. Recommandations -->
  <div class="section page-break">
    <div class="section-header"><div class="section-number">9</div><div class="section-title">Recommandations</div></div>
    ${recoBlocks || '<div style="color:#888;font-style:italic">Aucune recommandation générée.</div>'}
  </div>

  <!-- 10. Conclusion -->
  <div class="section">
    <div class="section-header"><div class="section-number">10</div><div class="section-title">Conclusion</div></div>
    <div class="prose">${r.conclusion || "L'exercice a permis de valider les procédures et d'identifier des axes d'amélioration."}</div>
  </div>

  <div class="footer">
    <span>Rapport généré automatiquement par S.U.R.V.I.V.E. Resilience Platform · ISO 22301</span>
    <span>${new Date().toLocaleDateString("fr-FR")} ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
  </div>

</div>
</body>
</html>`;
}
