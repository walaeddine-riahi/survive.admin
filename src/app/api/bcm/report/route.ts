import { NextRequest, NextResponse } from "next/server";
import { getBcmDashboardData } from "@/actions/bcm/bcm-dashboard-actions";
import { getGaps } from "@/actions/bcm/gap-analysis-actions";
import { getStrategies } from "@/actions/bcm/strategy-actions";
import { getRisks } from "@/actions/bcm/risk-assessment-actions";
import { prisma } from "@/lib/prisma";

// ─── Report data aggregator ───────────────────────────────────────────────────
async function collectReportData(factoryId?: string) {
  const [dashboard, gapsResult, strategiesResult, risksResult] = await Promise.all([
    getBcmDashboardData(factoryId),
    getGaps(factoryId),
    getStrategies(factoryId),
    getRisks(factoryId),
  ]);

  const factory = factoryId
    ? await prisma.factory.findUnique({
        where: { id: factoryId },
        select: { name: true, code: true, city: true, country: true, certifications: true },
      })
    : null;

  return {
    factory,
    summary: dashboard.data?.summary ?? {},
    processHeatmap: dashboard.data?.processHeatmap ?? [],
    gaps: gapsResult.data ?? [],
    strategies: strategiesResult.data ?? [],
    risks: risksResult.data ?? [],
    generatedAt: new Date().toISOString(),
  };
}

// ─── HTML template for PDF/Word export ───────────────────────────────────────
function buildReportHTML(data: Awaited<ReturnType<typeof collectReportData>>, options: {
  title: string;
  sections: string[];
  colorTheme: "blue" | "green" | "dark";
  logo?: string;
  organization?: string;
}): string {
  const COLORS = {
    blue: { primary: "#185FA5", secondary: "#378ADD", light: "#E6F1FB", accent: "#0C447C" },
    green: { primary: "#0F6E56", secondary: "#1D9E75", light: "#E1F5EE", accent: "#085041" },
    dark: { primary: "#2C2C2A", secondary: "#444441", light: "#F1EFE8", accent: "#1a1a18" },
  };
  const C = COLORS[options.colorTheme];
  const s = data.summary as Record<string, number>;

  const severityColor = (sev: string) =>
    sev === "CRITICAL" ? "#E24B4A" : sev === "HIGH" ? "#EF9F27" : sev === "MEDIUM" ? "#97C459" : "#1D9E75";
  const severityLabel = (sev: string) =>
    sev === "CRITICAL" ? "Critique" : sev === "HIGH" ? "Élevé" : sev === "MEDIUM" ? "Moyen" : "Faible";
  const statusLabel = (st: string) =>
    st === "IDENTIFIED" ? "Identifié" : st === "IN_PROGRESS" ? "En cours" : st === "RESOLVED" ? "Résolu" : "Accepté";
  const critLabel = (c: string) =>
    c === "critical" ? "Critique" : c === "high" ? "Élevé" : c === "medium" ? "Moyen" : "Faible";

  const showSection = (key: string) => options.sections.includes(key) || options.sections.includes("all");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, sans-serif; font-size: 10pt; color: #2C2C2A; line-height: 1.6; }
  
  .page { max-width: 210mm; margin: 0 auto; padding: 0; }
  
  /* Cover page */
  .cover { background: linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 100%); min-height: 240px; padding: 48px 48px 40px; color: white; position: relative; overflow: hidden; page-break-after: always; }
  .cover::before { content: ''; position: absolute; top: -60px; right: -60px; width: 240px; height: 240px; background: rgba(255,255,255,0.08); border-radius: 50%; }
  .cover::after { content: ''; position: absolute; bottom: -30px; left: 40px; width: 120px; height: 120px; background: rgba(255,255,255,0.05); border-radius: 50%; }
  .cover-badge { display: inline-block; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; padding: 4px 14px; font-size: 9pt; font-weight: 500; margin-bottom: 20px; }
  .cover-title { font-size: 28pt; font-weight: 700; line-height: 1.2; margin-bottom: 12px; }
  .cover-sub { font-size: 12pt; opacity: 0.85; margin-bottom: 32px; }
  .cover-meta { display: flex; gap: 32px; font-size: 9pt; opacity: 0.75; }
  .cover-org { font-size: 11pt; font-weight: 600; margin-bottom: 4px; }
  
  /* Content area */
  .content { padding: 32px 48px; }
  
  /* Section headers */
  .section-header { display: flex; align-items: center; gap: 10px; margin: 32px 0 16px; border-bottom: 2px solid ${C.primary}; padding-bottom: 8px; }
  .section-icon { width: 28px; height: 28px; background: ${C.light}; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
  .section-title { font-size: 14pt; font-weight: 700; color: ${C.primary}; }
  .section-first { margin-top: 0; }
  
  /* KPI Grid */
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
  .kpi-card { background: #F8F9FA; border: 1px solid #E8E8E8; border-radius: 10px; padding: 14px; border-top: 3px solid ${C.secondary}; }
  .kpi-label { font-size: 8pt; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
  .kpi-value { font-size: 20pt; font-weight: 700; color: ${C.primary}; line-height: 1; }
  .kpi-sub { font-size: 8pt; color: #888; margin-top: 4px; }
  
  /* Tables */
  .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 9pt; }
  .data-table th { background: ${C.primary}; color: white; padding: 8px 10px; text-align: left; font-weight: 600; font-size: 8.5pt; }
  .data-table th:first-child { border-radius: 4px 0 0 0; }
  .data-table th:last-child { border-radius: 0 4px 0 0; }
  .data-table td { padding: 7px 10px; border-bottom: 1px solid #F0F0F0; vertical-align: middle; }
  .data-table tr:nth-child(even) td { background: #FAFAFA; }
  .data-table tr:last-child td { border-bottom: none; }
  
  /* Badges */
  .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 7.5pt; font-weight: 600; }
  .b-c { background: #FCEBEB; color: #A32D2D; }
  .b-h { background: #FAEEDA; color: #854F0B; }
  .b-m { background: #EAF3DE; color: #3B6D11; }
  .b-l { background: #E1F5EE; color: #0F6E56; }
  .b-open { background: #FCEBEB; color: #A32D2D; }
  .b-prog { background: #E6F1FB; color: #185FA5; }
  .b-done { background: #E1F5EE; color: #0F6E56; }
  
  /* Progress bar */
  .progress-wrap { display: flex; align-items: center; gap: 8px; }
  .progress-bar { height: 6px; background: #E8E8E8; border-radius: 3px; flex: 1; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; }
  .progress-val { font-size: 8.5pt; font-weight: 600; min-width: 32px; }
  
  /* Maturity gauge */
  .maturity-section { display: flex; gap: 24px; align-items: flex-start; margin-bottom: 24px; }
  .maturity-score { text-align: center; background: ${C.light}; border-radius: 12px; padding: 20px 24px; }
  .maturity-number { font-size: 36pt; font-weight: 700; color: ${C.primary}; }
  .maturity-label { font-size: 9pt; color: #666; font-weight: 600; }
  .maturity-bars { flex: 1; }
  .maturity-bar-row { margin-bottom: 10px; }
  .maturity-bar-label { display: flex; justify-content: space-between; font-size: 8.5pt; margin-bottom: 3px; color: #555; }
  
  /* Resource cards */
  .resource-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
  .resource-card { border: 1px solid #E8E8E8; border-radius: 10px; padding: 14px; border-left: 4px solid ${C.secondary}; }
  .resource-title { font-size: 11pt; font-weight: 700; color: ${C.primary}; margin-bottom: 8px; }
  
  /* Risk matrix visual */
  .matrix-table { border-collapse: collapse; margin: 0 auto; }
  .matrix-table td { width: 44px; height: 30px; text-align: center; font-size: 8pt; font-weight: 600; color: white; border: 2px solid white; border-radius: 3px; }
  .matrix-axis-label { font-size: 7.5pt; color: #666; text-align: center; padding: 4px; }
  
  /* Page footer */
  .report-footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E8E8E8; display: flex; justify-content: space-between; font-size: 8pt; color: #AAA; }
  
  /* Info box */
  .info-box { background: ${C.light}; border-left: 4px solid ${C.secondary}; border-radius: 0 8px 8px 0; padding: 12px 16px; margin: 12px 0; font-size: 9pt; color: ${C.accent}; }
  
  /* Page break */
  .page-break { page-break-before: always; }
  
  @media print { .cover { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="page">

<!-- COVER PAGE -->
<div class="cover">
  <div class="cover-badge">ISO 22301 — Business Continuity Management</div>
  <div class="cover-title">${options.title}</div>
  <div class="cover-sub">Rapport de continuité d'activité et d'appréciation des risques</div>
  ${options.organization ? `<div class="cover-org">${options.organization}</div>` : ""}
  <div class="cover-meta">
    <span>Généré le ${new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}</span>
    ${data.factory ? `<span>Site : ${data.factory.name} (${data.factory.code})</span>` : "<span>Tous les sites</span>"}
    <span>Confidentiel — Usage interne</span>
  </div>
</div>

<!-- CONTENT -->
<div class="content">

${showSection("summary") ? `
<!-- SECTION 1: SYNTHÈSE EXÉCUTIVE -->
<div class="section-header section-first">
  <div class="section-icon">📊</div>
  <div class="section-title">Synthèse exécutive</div>
</div>

<div class="kpi-grid">
  <div class="kpi-card">
    <div class="kpi-label">Maturité BCM</div>
    <div class="kpi-value" style="color:${(s.maturityScore??0)>=70?'#1D9E75':'#EF9F27'};">${s.maturityScore ?? "—"}</div>
    <div class="kpi-sub">Score composite /100</div>
  </div>
  <div class="kpi-card">
    <div class="kpi-label">Conformité ISO 22301</div>
    <div class="kpi-value">${s.complianceScore ?? "—"}%</div>
    <div class="kpi-sub">${s.totalProcesses ?? 0} processus évalués</div>
  </div>
  <div class="kpi-card">
    <div class="kpi-label">Gap closure moyen</div>
    <div class="kpi-value" style="color:${(s.avgGapClosure??0)>=60?'#1D9E75':'#E24B4A'};">${s.avgGapClosure ?? 0}%</div>
    <div class="kpi-sub">${s.totalStrategies ?? 0} stratégies déployées</div>
  </div>
  <div class="kpi-card">
    <div class="kpi-label">Risques critiques</div>
    <div class="kpi-value" style="color:#E24B4A;">${s.criticalRisks ?? 0}</div>
    <div class="kpi-sub">sur ${s.totalRisks ?? 0} risques évalués</div>
  </div>
</div>

<div class="info-box">
  <strong>Niveau de maturité BCM :</strong> ${(s.maturityScore??0)>=80?"Avancé":(s.maturityScore??0)>=60?"Établi":(s.maturityScore??0)>=40?"En développement":"Initial"} — 
  ${(s.openGaps??0)>5?"Effort prioritaire requis sur la réduction des écarts.":
    (s.avgGapClosure??0)<50?"Les stratégies de continuité doivent être renforcées.":
    "La trajectoire de maturité est satisfaisante. Maintenir l'effort de test et validation."}
</div>
` : ""}

${showSection("gaps") ? `
<!-- SECTION 2: ANALYSE DES ÉCARTS -->
<div class="section-header">
  <div class="section-icon">⚠️</div>
  <div class="section-title">Analyse des écarts BIA</div>
</div>

<p style="font-size:9pt;color:#555;margin-bottom:12px;">
  ${data.gaps.length} écart(s) identifié(s) — dont ${data.gaps.filter(g=>g.severity==="CRITICAL").length} critique(s) et ${data.gaps.filter(g=>g.severity==="HIGH").length} élevé(s).
  ${data.gaps.filter(g=>g.status==="RESOLVED").length} écart(s) résolu(s).
</p>

<table class="data-table">
  <thead><tr>
    <th>Écart</th><th>Type</th><th>Sévérité</th><th>Processus</th><th>Actuel vs Cible</th><th>Statut</th><th>Gap closure</th>
  </tr></thead>
  <tbody>
    ${data.gaps.slice(0,20).map(g => {
      const sc = (g as Record<string,unknown>).severity as string;
      const bc = sc==="CRITICAL"?"b-c":sc==="HIGH"?"b-h":sc==="MEDIUM"?"b-m":"b-l";
      const st = (g as Record<string,unknown>).status as string;
      const bst = st==="RESOLVED"?"b-done":st==="IN_PROGRESS"?"b-prog":"b-open";
      const strats = (g as {strategies?:{gapClosurePercent:number}[]}).strategies??[];
      const closure = strats.length>0?Math.round(strats.reduce((a,s)=>a+s.gapClosurePercent,0)/strats.length):0;
      const proc = (g as {process?:{name:string}}).process;
      return `<tr>
        <td style="font-weight:500;">${(g as {title:string}).title}</td>
        <td style="font-size:8pt;color:#666;">${(g as {gapType:string}).gapType.replace(/_/g," ")}</td>
        <td><span class="badge ${bc}">${severityLabel(sc)}</span></td>
        <td style="font-size:8.5pt;">${proc?.name??"-"}</td>
        <td style="font-size:8pt;color:#555;">${(g as {currentValue?:string}).currentValue??"-"} → ${(g as {targetValue?:string}).targetValue??"-"}</td>
        <td><span class="badge ${bst}">${statusLabel(st)}</span></td>
        <td>
          <div class="progress-wrap">
            <div class="progress-bar"><div class="progress-fill" style="width:${closure}%;background:${closure>=70?"#1D9E75":closure>=40?"#EF9F27":"#E24B4A"};"></div></div>
            <span class="progress-val" style="color:${closure>=70?"#1D9E75":closure>=40?"#854F0B":"#A32D2D"};">${closure}%</span>
          </div>
        </td>
      </tr>`;
    }).join("")}
  </tbody>
</table>
` : ""}

${showSection("strategies") ? `
<!-- SECTION 3: STRATÉGIES DE CONTINUITÉ -->
<div class="section-header">
  <div class="section-icon">🎯</div>
  <div class="section-title">Stratégies et solutions de continuité</div>
</div>

<div class="resource-grid">
  ${(["RH","IT","LOCAUX","FOURNISSEURS"] as const).map(cat => {
    const strats = data.strategies.filter((s: Record<string,unknown>) => s.resourceCategory===cat);
    const impl = strats.filter((s: Record<string,unknown>) => ["IMPLEMENTED","TESTED","VALIDATED"].includes(s.status as string)).length;
    const avg = strats.length>0?Math.round(strats.reduce((a,s)=>a+(s as {gapClosurePercent:number}).gapClosurePercent,0)/strats.length):0;
    const catColors: Record<string,string> = {RH:"#378ADD",IT:"#7F77DD",LOCAUX:"#EF9F27",FOURNISSEURS:"#1D9E75"};
    const catLabels: Record<string,string> = {RH:"Ressources Humaines",IT:"Systèmes d'Information",LOCAUX:"Locaux & Infrastructure",FOURNISSEURS:"Fournisseurs & Sous-traitants"};
    return `<div class="resource-card" style="border-left-color:${catColors[cat]};">
      <div class="resource-title" style="color:${catColors[cat]};">${catLabels[cat]}</div>
      <div style="font-size:8.5pt;color:#666;margin-bottom:8px;">${strats.length} stratégie(s) — ${impl} implémentée(s)</div>
      <div class="progress-wrap" style="margin-bottom:8px;">
        <div class="progress-bar"><div class="progress-fill" style="width:${avg}%;background:${catColors[cat]};"></div></div>
        <span class="progress-val" style="color:${catColors[cat]};">${avg}%</span>
      </div>
      ${strats.slice(0,3).map((s: Record<string,unknown>) => `<div style="font-size:8pt;color:#555;margin-bottom:4px;padding-left:8px;border-left:2px solid ${catColors[cat]}40;">• ${s.title}</div>`).join("")}
    </div>`;
  }).join("")}
</div>
` : ""}

${showSection("risks") ? `
<!-- SECTION 4: APPRÉCIATION DES RISQUES -->
<div class="section-header">
  <div class="section-icon">🛡️</div>
  <div class="section-title">Appréciation des risques — continuité</div>
</div>

<p style="font-size:9pt;color:#555;margin-bottom:12px;">
  ${data.risks.length} risque(s) évalué(s). Score moyen : ${data.risks.length>0?Math.round(data.risks.reduce((a,r)=>a+(r as {riskScore:number}).riskScore,0)/data.risks.length):0}/25.
</p>

<table class="data-table">
  <thead><tr>
    <th>Risque</th><th>Scénario</th><th>Processus</th><th>Score</th><th>Niveau</th><th>Impact RTO</th><th>Traitement</th>
  </tr></thead>
  <tbody>
    ${data.risks.slice(0,15).map((r: Record<string,unknown>) => {
      const score = r.riskScore as number;
      const col = score>=17?"#E24B4A":score>=10?"#EF9F27":score>=5?"#97C459":"#1D9E75";
      const lvl = (r.riskLevelLabel as string)||"—";
      const proc = (r as {process?:{name:string}}).process;
      return `<tr>
        <td style="font-weight:500;font-size:8.5pt;">${r.title}</td>
        <td style="font-size:8pt;color:#666;">${(r.scenario as string).substring(0,45)}...</td>
        <td style="font-size:8.5pt;">${proc?.name??"-"}</td>
        <td style="text-align:center;"><span style="display:inline-block;width:26px;height:18px;background:${col};color:white;border-radius:4px;font-size:8pt;font-weight:700;line-height:18px;text-align:center;">${score}</span></td>
        <td><span class="badge" style="background:${col}20;color:${col};">${lvl}</span></td>
        <td style="font-size:8.5pt;">${r.rtoImpactHours?`+${r.rtoImpactHours}h`:"-"}</td>
        <td style="font-size:8pt;color:#666;">${r.treatmentOption||"-"}</td>
      </tr>`;
    }).join("")}
  </tbody>
</table>
` : ""}

${showSection("processes") ? `
<!-- SECTION 5: PROCESSUS CRITIQUES -->
<div class="section-header">
  <div class="section-icon">⚙️</div>
  <div class="section-title">Processus critiques — RTO/RPO/MTPD</div>
</div>

<table class="data-table">
  <thead><tr>
    <th>Processus</th><th>Département</th><th>Criticité</th><th>RTO (h)</th><th>RPO (h)</th><th>MTPD (h)</th><th>MBCO</th><th>Risque max</th><th>Gap closure</th>
  </tr></thead>
  <tbody>
    ${data.processHeatmap.slice(0,15).map(p => {
      const pc = (p as {criticality:string}).criticality;
      const bc = pc==="critical"?"b-c":pc==="high"?"b-h":pc==="medium"?"b-m":"b-l";
      const risk = (p as {maxRiskScore:number}).maxRiskScore;
      const col = risk>=17?"#E24B4A":risk>=10?"#EF9F27":risk>=5?"#97C459":"#1D9E75";
      const closure = (p as {gapClosure:number}).gapClosure;
      return `<tr>
        <td style="font-weight:500;font-size:8.5pt;">${(p as {name:string}).name}</td>
        <td style="font-size:8.5pt;">${(p as {department:string}).department}</td>
        <td><span class="badge ${bc}">${critLabel(pc)}</span></td>
        <td style="font-weight:500;color:${(p as {rto:number}).rto>4?"#E24B4A":"#1D9E75"};">${(p as {rto:number}).rto}</td>
        <td style="font-weight:500;">${(p as {rpo:number}).rpo}</td>
        <td>—</td>
        <td>—</td>
        <td><span style="display:inline-block;width:24px;height:16px;background:${col};color:white;border-radius:3px;font-size:7.5pt;font-weight:700;line-height:16px;text-align:center;">${risk||"—"}</span></td>
        <td>
          <div class="progress-wrap">
            <div class="progress-bar"><div class="progress-fill" style="width:${closure}%;background:${closure>=70?"#1D9E75":closure>=40?"#EF9F27":"#E24B4A"};"></div></div>
            <span class="progress-val">${closure}%</span>
          </div>
        </td>
      </tr>`;
    }).join("")}
  </tbody>
</table>
` : ""}

<!-- FOOTER -->
<div class="report-footer">
  <span>S.U.R.V.I.V.E. Resilience Platform — Rapport BCM</span>
  <span>Généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</span>
  <span>Confidentiel — Ne pas diffuser</span>
</div>

</div><!-- /content -->
</div><!-- /page -->
</body>
</html>`;
}

// ─── API Route ────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      factoryId,
      format = "html",
      title = "Rapport BCM — Continuité d'Activité",
      sections = ["all"],
      colorTheme = "blue",
      organization = "",
    } = body;

    const data = await collectReportData(factoryId);

    const html = buildReportHTML(data, {
      title,
      sections,
      colorTheme,
      organization,
    });

    if (format === "html") {
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // For Word/PDF, return the HTML as a downloadable file
    // The client-side will use browser print for PDF or docx conversion
    const filename = `rapport-bcm-${new Date().toISOString().split("T")[0]}`;

    return new NextResponse(JSON.stringify({ html, filename, data }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json({ error: "Erreur lors de la génération du rapport" }, { status: 500 });
  }
}
