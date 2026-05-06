import { NextRequest, NextResponse } from "next/server";
import * as pdfjs from "pdfjs-dist";
import mammoth from "mammoth";
import { Readable } from "stream";
import { AzureOpenAI } from "openai";

// Initialiser Azure OpenAI
const openai = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o",
});

// Extraire texte d'un PDF
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  let text = "";

  for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    text += textContent.items.map((item: any) => item.str).join(" ") + "\n";
  }

  return text;
}

// Extraire texte d'un Word
async function extractTextFromWord(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// Détecter les documents BIA
function isBIADocument(text: string): boolean {
  const biaKeywords = [
    "business impact",
    "RTO",
    "MTPD",
    "MBCO",
    "RPO",
    "ISO 22301",
    "ISO 22317",
    "business continuity",
    "continuité d'activité",
    "analyse d'impact",
    "criticité",
    "recovery",
    "objectif de récupération",
    "impact métier",
  ];

  const lowerText = text.toLowerCase();
  const matchCount = biaKeywords.filter((keyword) =>
    lowerText.includes(keyword.toLowerCase())
  ).length;

  // Si au moins 3 mots-clés BIA sont trouvés, c'est un document BIA
  return matchCount >= 3;
}

// Extraire les données BIA du document
function extractBIAData(text: string): Record<string, any> {
  const extractedData: Record<string, any> = {
    general: {},
    disruption: {},
    scope: {},
    outsourced: {},
    legal: {},
    it: {},
    infrastructure: {},
    personnel: {},
    industrial: {},
    office: {},
    documentation: {},
    suppliers: {},
  };

  // Fonction utilitaire pour extraire des valeurs
  const extractValue = (pattern: RegExp, defaultValue = ""): string => {
    const match = text.match(pattern);
    return match ? match[1]?.trim() || defaultValue : defaultValue;
  };

  // Extraire les données générales
  extractedData.general = {
    rto: extractValue(
      /RTO\s*(?::|=|:|\s*Recovery\s*Time\s*Objective)[\s:]*([^\n]*)/i
    ),
    rpo: extractValue(
      /RPO\s*(?::|=|:|\s*Recovery\s*Point\s*Objective)[\s:]*([^\n]*)/i
    ),
    mtpd: extractValue(
      /MTPD\s*(?::|=|:|\s*Maximum\s*Tolerable)[\s:]*([^\n]*)/i
    ),
    backup_systems:
      text.toLowerCase().includes("backup") ||
      text.toLowerCase().includes("secours"),
    prior_incidents:
      text.toLowerCase().includes("incident") ||
      text.toLowerCase().includes("panne"),
  };

  // Extraire les impacts
  extractedData.disruption = {
    financial_impacts: extractValue(
      /(?:impact.*financier|impacts financiers|coûts?|perte|revenue)[\s:]*([^\n]*)/i
    ),
    operational_impacts: extractValue(
      /(?:impact.*opérationnel|impacts opérationnels|production|service)[\s:]*([^\n]*)/i
    ),
    regulatory_impacts: extractValue(
      /(?:impact.*réglementaire|obligations|conformité|légal)[\s:]*([^\n]*)/i
    ),
  };

  // Extraire les dépendances
  extractedData.scope = {
    depends_other_processes:
      text.toLowerCase().includes("dépend") ||
      text.toLowerCase().includes("depend"),
    critical_dependencies: extractValue(
      /(?:dépendances?|criticités?|liées?|liées?\s*à)[\s:]*([^\n]*)/i
    ),
  };

  // Extraire les données IT/Application
  extractedData.it = {
    app_name: extractValue(
      /(?:application|application IT|système IT|MES)[\s:]*([^\n]*)/i
    ),
    app_rto: extractValue(
      /(?:application.*RTO|IT.*RTO|app.*RTO)[\s:]*([^\n]*)/i
    ),
    app_rpo: extractValue(
      /(?:application.*RPO|IT.*RPO|app.*RPO)[\s:]*([^\n]*)/i
    ),
    app_mtpd: extractValue(
      /(?:application.*MTPD|IT.*MTPD|app.*MTPD)[\s:]*([^\n]*)/i
    ),
  };

  // Extraire les données infrastructure
  extractedData.infrastructure = {
    infrastructure_type: extractValue(
      /(?:infrastructure|serveurs?|data.*center|cloud)[\s:]*([^\n]*)/i
    ),
    infra_rto: extractValue(
      /(?:infra.*RTO|infrastructure.*RTO)[\s:]*([^\n]*)/i
    ),
    infra_mtpd: extractValue(
      /(?:infra.*MTPD|infrastructure.*MTPD)[\s:]*([^\n]*)/i
    ),
    remote_work_possible:
      text.toLowerCase().includes("télétravail") ||
      text.toLowerCase().includes("remote") ||
      text.toLowerCase().includes("travail à distance"),
  };

  // Extraire les données personnel
  extractedData.personnel = {
    role: extractValue(/(?:rôle|fonction|poste)[\s:]*([^\n]*)/i),
    staff_count:
      parseInt(extractValue(/(?:nombre|effectif|personnel)[\s:]*(\d+)/i)) || 0,
    unique_skills:
      text.toLowerCase().includes("compétence") ||
      text.toLowerCase().includes("expertise"),
  };

  // Extraire les données fournisseurs
  const supplierMatch = text.match(
    /(?:fournisseur|prestataire|partenaire)[\s:]*([^\n]*)/i
  );
  if (supplierMatch) {
    extractedData.suppliers = {
      supplier_name: supplierMatch[1]?.trim() || "",
      supplier_rto: extractValue(
        /(?:fournisseur.*RTO|prestataire.*RTO)[\s:]*([^\n]*)/i
      ),
      supplier_mtpd: extractValue(
        /(?:fournisseur.*MTPD|prestataire.*MTPD)[\s:]*([^\n]*)/i
      ),
      supplier_critical:
        text.toLowerCase().includes("critique") ||
        text.toLowerCase().includes("critical"),
    };
  }

  return extractedData;
}

// Générer résumé/analyse avec Azure GPT
async function generateSummary(
  text: string,
  documentType: "bia" | "standard" = "standard"
): Promise<string> {
  // Limiter le texte selon le type de document
  const maxCharacters = documentType === "bia" ? 100000 : 50000;
  const limitedText = text.substring(0, maxCharacters);

  let prompt: string;

  if (documentType === "bia") {
    prompt = `RÔLE : Expert BIA (ISO 22301/22317)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⛔ INTERDICTIONS ABSOLUES ⛔
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

N'ÉCRIS JAMAIS :
❌ "À compléter"
❌ "dépasse la capacité"
❌ "requiert un effort"
❌ "diviser la demande"
❌ "sous-sections"
❌ "partie précise"
❌ "je recommande"
❌ "je serai ravi"
❌ "limites"
❌ "..." ou "etc."
❌ "je ne peux pas"
❌ Toute excuse

⚠️ VÉRITÉ :
Tu as 16 384 tokens disponibles = LARGEMENT suffisant pour remplir ce formulaire.
C'est une tâche NORMALE, pas une "capacité maximale dépassée".

✅ ORDRE :
Remplis les 13 sections ci-dessous. Point final.
Si info manquante → écris "NON DOCUMENTÉ"
Continue jusqu'à la section 13 SANS T'ARRÊTER.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCUMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${limitedText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMULAIRE (REMPLIS TOUT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ INFORMATIONS GÉNÉRALES DU PROCESSUS

Nom du processus :
Département / Unité :
Localisation :
Responsable (Nom / Rôle / Tel / Email) :
Impact en cas d'indisponibilité :
Niveau de criticité global du processus : ☐ Haute ☐ Moyenne ☐ Faible
RTO global :
MTPD global :
MBCO global :
MBCO – Justification :
Perte financière estimée / heure :
Perte financière estimée / jour :
Single Point of Failure identifié ? ☐ Oui ☐ Non
Si oui, préciser :
Temps critiques (jour/mois/année) :

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2️⃣ ACTIVITÉS DÉTAILLÉES DU PROCESSUS

🔹 Activité Act1
Nom de l'activité :
Rôle dans le processus :
Impact en cas d'indisponibilité :
Criticité : ☐ Haute ☐ Moyenne ☐ Faible
RTO :
MTPD :
RPO :
MBCO :
Justification du MBCO :
Solution de contournement :
Dépendances associées :
Single Point of Failure pour cette activité ? ☐ Oui ☐ Non

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3️⃣ IMPACTS DE LA PERTURBATION

Description des impacts financiers :
Impacts opérationnels :
Impacts réglementaires :
Impacts réputationnels :
Retards / Backlog / Saturation capacité :

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4️⃣ PÉRIMÈTRE ET DÉPENDANCES

Fonctionnalité principale du processus :
Ce processus dépend-il d'autres processus ? ☐ Oui ☐ Non
Si oui, préciser :
Produits/Services dépendants :
Type de dépendance :
Départements/Fonctions supports :
Type de soutien :
Single Point of Failure organisationnel identifié ? ☐ Oui ☐ Non
Plan de mitigation :

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5️⃣ ACTIVITÉS EXTERNALISÉES

🔹 Activité externalisée 1
Activité :
Prestataire :
Contact principal :
Téléphone :
Email :
Zone géographique :
Dispose d'un plan de reprise ? ☐ Oui ☐ Non ☐ NON DOCUMENTÉ
Contrat/SLA avec clauses de continuité ? ☐ Oui ☐ Non ☐ NON DOCUMENTÉ
Criticité après rupture : ☐ Faible ☐ Moyenne ☐ Élevée
RTO fournisseur :
MTPD fournisseur :

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6️⃣ CADRE LÉGAL ET RÉGLEMENTAIRE

Exigence légale applicable :
Référence :
Autorité :
Détails :
Conséquences en cas de non-conformité :
Délais réglementaires à respecter :

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7️⃣ MES / APPLICATIONS INFORMATIQUES

🔹 Application 1
Nom :
Description d'utilisation :
Activités soutenues :
Critique après rupture ? ☐ Oui ☐ Non
Système de secours disponible ? ☐ Oui ☐ Non
RTO :
RPO :
MTPD :
RPO validé par IT ? ☐ Oui ☐ Non ☐ NON DOCUMENTÉ
Solution de contournement :
Incidents antérieurs ? ☐ Oui ☐ Non

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

8️⃣ INFRASTRUCTURE

🔹 Infrastructure 1
Type d'infrastructure :
Dépendance critique ? ☐ Oui ☐ Non
RTO :
MTPD :
Possibilité de travail en ligne ? ☐ Oui ☐ Non
Infrastructure alternative disponible ? ☐ Oui ☐ Non

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9️⃣ RÔLES – COMPÉTENCES – PERSONNEL

🔹 Rôle 1
Nom du rôle :
Nombre de personnel affecté :
Tâches exécutées :
Compétences uniques ? ☐ Oui ☐ Non
Rôle critique après rupture ? ☐ Oui ☐ Non
Délai de reprise requis :
Possibilité de remplacement dans les délais ? ☐ Oui ☐ Non
Remplacement par :
Solution de contournement :

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔟 ÉQUIPEMENT INDUSTRIEL

🔹 Équipement industriel 1
Nom :
Tâche exécutée :
Critique après rupture ? ☐ Oui ☐ Non
Réaffectation possible ? ☐ Oui ☐ Non
RTO :
MTPD :
Solution de contournement :
Tension (V) :
Type courant :
Puissance nominale (kW) :
Puissance démarrage (kW) :
Consommation/jour (kWh) :
Compatible alimentation secours ? ☐ Oui ☐ Non ☐ NON DOCUMENTÉ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣1️⃣ ÉQUIPEMENT BUREAUTIQUE

🔹 Équipement bureautique 1
Nom :
Quantité :
Tâche exécutée :
Critique après rupture ? ☐ Oui ☐ Non
RTO :
MTPD :
Quantité requise après rupture :
Réaffectation possible ? ☐ Oui ☐ Non
Solution de contournement :

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣2️⃣ DOCUMENTATION

🔹 Document 1
Nom :
Emplacement :
Nécessaire après rupture ? ☐ Oui ☐ Non
RTO :
Copie disponible ailleurs ? ☐ Oui ☐ Non
Documentation de remplacement disponible ? ☐ Oui ☐ Non
Mesures de remplacement :

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣3️⃣ PARTENAIRES EXTERNES CLÉS

🔹 Fournisseur 1
Nom :
Service fourni :
Contact principal :
Téléphone :
Email :
Zone géographique :
Critique après incident ? ☐ Oui ☐ Non
Fournisseur alternatif disponible ? ☐ Oui ☐ Non
Dispose d'un plan de reprise ? ☐ Oui ☐ Non ☐ NON DOCUMENTÉ
Contrat / SLA continuité ? ☐ Oui ☐ Non ☐ NON DOCUMENTÉ
RTO :
MTPD :`;
  } else {
    prompt = `Veuillez générer un résumé clair et concis du document suivant. Le résumé doit inclure les points clés, les éléments importants et une conclusion. Format: texte lisible.\n\nDocument:\n${limitedText}`;
  }

  const completion = await openai.chat.completions.create({
    model: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o",
    max_tokens: documentType === "bia" ? 16384 : 2048,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (content) {
    return content;
  }

  return documentType === "bia"
    ? "Impossible de générer l'analyse BIA"
    : "Impossible de générer le résumé";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Convertir File en Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    let extractedText = "";

    // Extraire selon le type
    if (file.type === "application/pdf") {
      extractedText = await extractTextFromPDF(buffer);
    } else if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "application/msword"
    ) {
      extractedText = await extractTextFromWord(buffer);
    } else {
      return NextResponse.json(
        { error: "Type de fichier non supporté" },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "Impossible d'extraire du texte du fichier" },
        { status: 400 }
      );
    }

    // Détecter le type de document
    const documentType = isBIADocument(extractedText) ? "bia" : "standard";

    // Générer résumé ou analyse BIA
    const summary = await generateSummary(extractedText, documentType);

    // Extraire les données BIA si c'est un document BIA
    const extractedData =
      documentType === "bia" ? extractBIAData(extractedText) : undefined;

    return NextResponse.json({
      summary,
      fileName: file.name,
      documentType,
      analysisType:
        documentType === "bia"
          ? "Analyse Critique BIA (ISO 22301/22317)"
          : "Résumé Standard",
      extractedData,
    });
  } catch (error) {
    console.error("Erreur lors du traitement du fichier:", error);
    return NextResponse.json(
      {
        error: "Erreur lors du traitement du fichier",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
