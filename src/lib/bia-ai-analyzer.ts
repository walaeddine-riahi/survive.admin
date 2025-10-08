/**
 * Service d'analyse IA pour les rapports BIA
 * Utilise Gemini AI pour extraire automatiquement les métriques BIA
 */

// Interfaces pour les métriques BIA analysées par l'IA
export interface BiaImpact {
  type: string;
  description: string;
  severity: "haut" | "moyen" | "bas";
  financialImpact?: number;
  operationalImpact?: string;
  reputationalImpact?: string;
}

export interface BiaCriticality {
  level: "haut" | "moyen" | "bas";
  score: number; // 1-100
  justification: string;
  processes: string[];
  processOwner?: string; // Nom du responsable principal
  ownerRole?: string; // Fonction du responsable
  ownerContact?: string; // Contact du responsable (email ou téléphone)
}

export interface BiaMetrics {
  rto: number; // Recovery Time Objective (heures)
  mtpd: number; // Maximum Tolerable Period of Disruption (heures)
  mbco: number; // Minimum Business Continuity Objective (heures)
  rpo?: number; // Recovery Point Objective (heures)
}

export interface BiaContinuityLevel {
  level: "vert" | "jaune" | "rouge";
  score: number; // 1-10
  description: string;
  measures: string[];
  recommendations: string[];
}

export interface BiaDependency {
  name: string;
  type: "système" | "fournisseur" | "infrastructure" | "personnel" | "données";
  criticality: "critique" | "important" | "normal";
  description: string;
  impact: string;
}

export interface BiaSpof {
  name: string;
  description: string;
  impact: string;
  riskLevel: "critique" | "élevé" | "moyen";
  mitigation: string[];
}

export interface BiaContinuityNeeds {
  equipment: string[];
  material: string[];
  personnel: string[];
  infrastructure: string[];
  technology: string[];
  supplyChain: string[];
  other: string[];
}

export interface BiaAnalysisResult {
  impacts: BiaImpact[];
  criticality: BiaCriticality;
  metrics: BiaMetrics;
  continuityLevel: BiaContinuityLevel;
  dependencies: BiaDependency[];
  resume: string;
  continuityNeeds: BiaContinuityNeeds;
  spof: BiaSpof[];
  analysisDate: Date;
  confidence: number; // 0-100
}

class BiaAiAnalyzer {
  private static instance: BiaAiAnalyzer;
  private readonly GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  private readonly API_KEY = "AIzaSyB1LRhsvFGjlJbvtUJ7SxEgFZ1qAS0epI4";

  private constructor() {}

  public static getInstance(): BiaAiAnalyzer {
    if (!BiaAiAnalyzer.instance) {
      BiaAiAnalyzer.instance = new BiaAiAnalyzer();
    }
    return BiaAiAnalyzer.instance;
  }

  /**
   * Analyse un rapport BIA avec Gemini AI
   */
  public async analyzeReport(
    reportContent: unknown
  ): Promise<BiaAnalysisResult> {
    try {
      const prompt = this.buildAnalysisPrompt(reportContent);
      const response = await this.callGeminiAPI(prompt);

      if (response) {
        return this.parseAnalysisResponse(response);
      } else {
        console.warn(
          "Pas de réponse de l'IA, utilisation de l'analyse par défaut enrichie"
        );
        return this.generateDefaultAnalysis();
      }
    } catch (error) {
      console.error("Erreur lors de l'analyse BIA:", error);
      console.log("Génération d'une analyse par défaut enrichie...");
      return this.generateDefaultAnalysis();
    }
  }

  /**
   * Force une analyse approfondie même avec des données limitées
   */
  public async forceAdvancedAnalysis(
    reportContent: unknown
  ): Promise<BiaAnalysisResult> {
    try {
      const advancedPrompt = this.buildAdvancedAnalysisPrompt(reportContent);
      const response = await this.callGeminiAPI(advancedPrompt);

      if (response) {
        return this.parseAnalysisResponse(response);
      } else {
        return this.generateDefaultAnalysis();
      }
    } catch (error) {
      console.error("Erreur lors de l'analyse avancée:", error);
      return this.generateDefaultAnalysis();
    }
  }

  /**
   * Analyse heuristique locale sans IA - extrait les métriques BIA du contenu
   * en utilisant des patterns et règles prédéfinies
   */
  public analyzeReportLocal(reportContent: unknown): BiaAnalysisResult {
    try {
      const content = this.preprocessContent(reportContent);
      const contentLower = content.toLowerCase();

      // Extraction des mots-clés et comptages
      const keywords = {
        processus: this.countKeywords(contentLower, [
          "processus",
          "process",
          "activité",
          "fonction",
          "opération",
          "métier",
        ]),
        risques: this.countKeywords(contentLower, [
          "risque",
          "risk",
          "menace",
          "vulnérabilité",
          "danger",
          "incident",
        ]),
        impacts: this.countKeywords(contentLower, [
          "impact",
          "conséquence",
          "effet",
          "perte",
          "dommage",
        ]),
        continuité: this.countKeywords(contentLower, [
          "continuité",
          "continuity",
          "récupération",
          "reprise",
          "rto",
          "rpo",
          "mtpd",
        ]),
        critique: this.countKeywords(contentLower, [
          "critique",
          "critical",
          "essentiel",
          "vital",
          "prioritaire",
        ]),
        dépendances: this.countKeywords(contentLower, [
          "dépendance",
          "dependency",
          "fournisseur",
          "provider",
          "système",
          "infrastructure",
        ]),
      };

      // Calcul des scores et métriques
      const totalKeywords = Object.values(keywords).reduce(
        (sum, count) => sum + count,
        0
      );
      const hasRichContent = totalKeywords > 50;
      const criticityScore = this.calculateCriticalityScore(keywords);
      const continuityScore = this.calculateContinuityScore(keywords);

      // Extraction heuristique des métriques RTO/RPO/MTPD
      const metrics = this.extractMetricsFromContent(content);

      // Déterminer le niveau de criticité
      const criticalityLevel =
        criticityScore >= 75 ? "haut" : criticityScore >= 50 ? "moyen" : "bas";

      // Déterminer le niveau de continuité
      const continuityLevel =
        continuityScore >= 80
          ? "vert"
          : continuityScore >= 60
          ? "jaune"
          : "rouge";

      // Générer les impacts basés sur les mots-clés trouvés
      const impacts = this.generateHeuristicImpacts(keywords, content);

      // Générer les dépendances détectées
      const dependencies = this.extractDependencies(content);

      // Générer les SPOF (Single Points of Failure)
      const spof = this.extractSPOF(content, keywords);

      // Générer les besoins en continuité
      const continuityNeeds = this.extractContinuityNeeds(content);

      // Générer le résumé
      const resume = this.generateLocalAnalysisSummary(
        keywords,
        criticityScore,
        continuityScore,
        hasRichContent
      );

      // Extraire les informations du responsable
      const responsibleInfo = this.extractResponsibleInfo(content);

      const result: BiaAnalysisResult = {
        impacts,
        criticality: {
          level: criticalityLevel as "haut" | "moyen" | "bas",
          score: criticityScore,
          justification: `Analyse basée sur ${totalKeywords} occurrences de mots-clés BIA identifiés dans le document. ${
            keywords.critique > 10
              ? "Présence significative de termes critiques."
              : "Contenu standard avec criticité modérée."
          }`,
          processes: this.extractProcessNames(content),
          processOwner: responsibleInfo.name,
          ownerRole: responsibleInfo.role,
          ownerContact: responsibleInfo.contact,
        },
        metrics,
        continuityLevel: {
          level: continuityLevel as "vert" | "jaune" | "rouge",
          score: Math.round(continuityScore / 10),
          description: this.getContinuityDescription(continuityScore),
          measures: this.extractContinuityMeasures(content),
          recommendations: this.generateRecommendations(
            continuityScore,
            criticityScore
          ),
        },
        dependencies,
        resume,
        continuityNeeds,
        spof,
        analysisDate: new Date(),
        confidence: this.calculateConfidence(totalKeywords, hasRichContent),
      };

      return result;
    } catch (error) {
      console.error("Erreur lors de l'analyse locale:", error);
      return this.generateDefaultAnalysis();
    }
  }

  /**
   * Compte les occurrences de mots-clés dans le texte
   */
  private countKeywords(text: string, keywords: string[]): number {
    return keywords.reduce((count, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  /**
   * Calcule le score de criticité basé sur les mots-clés
   */
  private calculateCriticalityScore(keywords: {
    [key: string]: number;
  }): number {
    const weights = {
      critique: 3,
      risques: 2,
      impacts: 2,
      processus: 1.5,
      dépendances: 1,
      continuité: 1,
    };

    let score = 0;
    for (const [key, count] of Object.entries(keywords)) {
      const weight = weights[key as keyof typeof weights] || 1;
      score += count * weight;
    }

    // Normaliser le score sur 100
    return Math.min(Math.round((score / 50) * 100), 100);
  }

  /**
   * Calcule le score de continuité
   */
  private calculateContinuityScore(keywords: {
    [key: string]: number;
  }): number {
    const baseScore = 50;
    const continuityBonus = Math.min(keywords.continuité * 3, 30);
    const processBonus = Math.min(keywords.processus * 1, 15);
    const riskPenalty = Math.min(keywords.risques * 0.5, 10);

    return Math.min(
      Math.max(baseScore + continuityBonus + processBonus - riskPenalty, 0),
      100
    );
  }

  /**
   * Extrait les métriques RTO/RPO/MTPD du contenu
   */
  private extractMetricsFromContent(content: string): BiaMetrics {
    const rtoMatch = content.match(/rto[:\s]*(\d+)\s*(h|heures?|hours?)?/i);
    const rpoMatch = content.match(/rpo[:\s]*(\d+)\s*(h|heures?|hours?)?/i);
    const mtpdMatch = content.match(/mtpd[:\s]*(\d+)\s*(h|heures?|hours?)?/i);
    const mbcoMatch = content.match(/mbco[:\s]*(\d+)\s*(h|heures?|hours?)?/i);

    return {
      rto: rtoMatch ? parseInt(rtoMatch[1]) : 12,
      mtpd: mtpdMatch ? parseInt(mtpdMatch[1]) : 48,
      mbco: mbcoMatch ? parseInt(mbcoMatch[1]) : 6,
      rpo: rpoMatch ? parseInt(rpoMatch[1]) : 4,
    };
  }

  /**
   * Génère les impacts basés sur l'analyse heuristique
   */
  private generateHeuristicImpacts(
    keywords: { [key: string]: number },
    content: string
  ): BiaImpact[] {
    const impacts: BiaImpact[] = [];

    // Impact financier si mentionné
    if (
      content.match(/financ|budget|coût|perte|revenus?/i) ||
      keywords.impacts > 5
    ) {
      const financialMatch = content.match(/(\d+\.?\d*)\s*(€|euros?|k€|m€)/i);
      impacts.push({
        type: "Financier",
        description:
          "Impact financier lié aux interruptions d'activité identifiées dans le document",
        severity: keywords.critique > 10 ? "haut" : "moyen",
        financialImpact: financialMatch
          ? parseFloat(financialMatch[1]) * 1000
          : undefined,
        operationalImpact: "Pertes de revenus et coûts de récupération",
        reputationalImpact: "Impact sur la confiance des clients",
      });
    }

    // Impact opérationnel
    if (keywords.processus > 5 || keywords.impacts > 3) {
      impacts.push({
        type: "Opérationnel",
        description:
          "Disruption des processus métier critiques et ralentissement des opérations",
        severity: keywords.critique > 8 ? "haut" : "moyen",
        operationalImpact:
          "Arrêt ou ralentissement significatif des activités principales",
        reputationalImpact: "Mécontentement client et perte de parts de marché",
      });
    }

    // Impact réglementaire si mentionné
    if (
      content.match(/réglementaire|conformité|compliance|rgpd|iso|norme|audit/i)
    ) {
      impacts.push({
        type: "Réglementaire",
        description: "Risques de non-conformité aux obligations légales",
        severity: "moyen",
        operationalImpact:
          "Difficultés à respecter les exigences réglementaires",
        reputationalImpact: "Risque de sanctions et atteinte à la réputation",
      });
    }

    // Si aucun impact spécifique, ajouter un impact générique
    if (impacts.length === 0) {
      impacts.push({
        type: "Opérationnel",
        description:
          "Impact général sur la continuité des activités de l'organisation",
        severity: "moyen",
        operationalImpact: "Perturbation modérée des opérations",
        reputationalImpact: "Impact potentiel sur l'image",
      });
    }

    return impacts;
  }

  /**
   * Extrait les dépendances du contenu
   */
  private extractDependencies(content: string): BiaDependency[] {
    const dependencies: BiaDependency[] = [];
    const contentLower = content.toLowerCase();

    // Recherche de systèmes IT
    if (
      contentLower.includes("système") ||
      contentLower.includes("serveur") ||
      contentLower.includes("application")
    ) {
      dependencies.push({
        name: "Systèmes informatiques",
        type: "système",
        criticality: "critique",
        description: "Infrastructure IT critique pour les opérations",
        impact: "Arrêt des systèmes numériques et perte d'accès aux données",
      });
    }

    // Recherche de fournisseurs
    if (
      contentLower.includes("fournisseur") ||
      contentLower.includes("prestataire") ||
      contentLower.includes("sous-traitant")
    ) {
      dependencies.push({
        name: "Fournisseurs externes",
        type: "fournisseur",
        criticality: "important",
        description: "Partenaires et fournisseurs de services essentiels",
        impact: "Interruption de la chaîne d'approvisionnement",
      });
    }

    // Infrastructure
    if (
      contentLower.includes("électricité") ||
      contentLower.includes("réseau") ||
      contentLower.includes("internet")
    ) {
      dependencies.push({
        name: "Infrastructure technique",
        type: "infrastructure",
        criticality: "critique",
        description: "Électricité, réseau, télécommunications",
        impact: "Arrêt complet des opérations",
      });
    }

    // Personnel
    if (
      contentLower.includes("personnel") ||
      contentLower.includes("équipe") ||
      contentLower.includes("compétence")
    ) {
      dependencies.push({
        name: "Personnel clé",
        type: "personnel",
        criticality: "important",
        description: "Employés avec compétences critiques",
        impact: "Ralentissement des activités spécialisées",
      });
    }

    // Données
    if (
      contentLower.includes("données") ||
      contentLower.includes("base de données") ||
      contentLower.includes("information")
    ) {
      dependencies.push({
        name: "Données critiques",
        type: "données",
        criticality: "critique",
        description: "Données opérationnelles et clients",
        impact: "Perte d'informations essentielles",
      });
    }

    return dependencies.length > 0 ? dependencies : [];
  }

  /**
   * Extrait les SPOF (Single Points of Failure)
   */
  private extractSPOF(
    content: string,
    keywords: { [key: string]: number }
  ): BiaSpof[] {
    const spof: BiaSpof[] = [];
    const contentLower = content.toLowerCase();

    if (
      contentLower.includes("unique") ||
      contentLower.includes("seul") ||
      keywords.critique > 15
    ) {
      spof.push({
        name: "Point de défaillance unique identifié",
        description:
          "Élément critique sans redondance mentionné dans le document",
        impact: "Arrêt complet en cas de défaillance",
        riskLevel: "critique",
        mitigation: [
          "Mettre en place une solution de redondance",
          "Développer un plan de continuité spécifique",
          "Tests réguliers de basculement",
        ],
      });
    }

    return spof;
  }

  /**
   * Extrait les besoins en continuité
   */
  private extractContinuityNeeds(content: string): BiaContinuityNeeds {
    const contentLower = content.toLowerCase();

    return {
      equipment:
        contentLower.includes("équipement") || contentLower.includes("matériel")
          ? ["Équipements de secours", "Postes de travail alternatifs"]
          : [],
      material: contentLower.includes("fourniture")
        ? ["Documentation critique", "Fournitures essentielles"]
        : [],
      personnel:
        contentLower.includes("équipe") || contentLower.includes("personnel")
          ? ["Équipe de crise", "Personnel de backup"]
          : [],
      infrastructure:
        contentLower.includes("infrastructure") || contentLower.includes("site")
          ? ["Site de secours", "Infrastructure redondante"]
          : [],
      technology:
        contentLower.includes("technologie") || contentLower.includes("système")
          ? ["Systèmes de backup", "Solutions cloud"]
          : [],
      supplyChain:
        contentLower.includes("fournisseur") || contentLower.includes("chaîne")
          ? ["Fournisseurs alternatifs", "Stocks de sécurité"]
          : [],
      other: ["Plans de communication", "Assurances"],
    };
  }

  /**
   * Extrait les noms de processus du contenu
   */
  private extractProcessNames(content: string): string[] {
    const processes: string[] = [];
    const commonProcesses = [
      "Vente",
      "Production",
      "Support client",
      "IT",
      "Logistique",
      "Finance",
      "RH",
      "Achats",
    ];

    commonProcesses.forEach((process) => {
      if (content.toLowerCase().includes(process.toLowerCase())) {
        processes.push(process);
      }
    });

    return processes.length > 0 ? processes : ["Processus généraux"];
  }

  /**
   * Extrait les informations du responsable du processus
   */
  private extractResponsibleInfo(content: string): {
    name?: string;
    role?: string;
    contact?: string;
  } {
    const info: { name?: string; role?: string; contact?: string } = {};

    // Patterns pour détecter les responsables
    const responsiblePatterns = [
      /responsable\s*[:\-]?\s*([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)*)/gi,
      /chef\s+(?:de\s+)?(?:service|département|projet)\s*[:\-]?\s*([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)*)/gi,
      /manager\s*[:\-]?\s*([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)*)/gi,
      /directeur\s*[:\-]?\s*([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)*)/gi,
      /process\s+owner\s*[:\-]?\s*([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)*)/gi,
    ];

    // Extraire le nom
    for (const pattern of responsiblePatterns) {
      const match = pattern.exec(content);
      if (match && match[1]) {
        info.name = match[1].trim();
        break;
      }
    }

    // Patterns pour les rôles/fonctions
    const rolePatterns = [
      /fonction\s*[:\-]?\s*([A-ZÀ-Ÿ][a-zà-ÿ\s]+?)(?:\n|\.|\||$)/gi,
      /poste\s*[:\-]?\s*([A-ZÀ-Ÿ][a-zà-ÿ\s]+?)(?:\n|\.|\||$)/gi,
      /titre\s*[:\-]?\s*([A-ZÀ-Ÿ][a-zà-ÿ\s]+?)(?:\n|\.|\||$)/gi,
      /(chef\s+de\s+(?:service|département|projet|division))/gi,
      /(directeur\s+(?:général|des?\s+opérations|technique|financier))/gi,
      /(responsable\s+(?:de\s+)?(?:la\s+)?(?:production|qualité|maintenance|logistique))/gi,
    ];

    for (const pattern of rolePatterns) {
      const match = pattern.exec(content);
      if (match && match[1]) {
        info.role = match[1].trim();
        break;
      }
    }

    // Extraire email
    const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,})/;
    const emailMatch = content.match(emailPattern);
    if (emailMatch) {
      info.contact = emailMatch[1];
    } else {
      // Si pas d'email, chercher un numéro de téléphone
      const phonePattern = /(?:(?:\+|00)33|0)[1-9](?:[.\s-]?\d{2}){4}/;
      const phoneMatch = content.match(phonePattern);
      if (phoneMatch) {
        info.contact = phoneMatch[0];
      }
    }

    return info;
  }

  /**
   * Extrait les mesures de continuité existantes
   */
  private extractContinuityMeasures(content: string): string[] {
    const measures: string[] = [];
    const contentLower = content.toLowerCase();

    const measureKeywords = [
      { keyword: "sauvegarde", measure: "Sauvegardes de données" },
      { keyword: "backup", measure: "Systèmes de backup" },
      { keyword: "redondance", measure: "Infrastructure redondante" },
      { keyword: "plan", measure: "Plans de continuité documentés" },
      { keyword: "test", measure: "Tests de récupération" },
      { keyword: "équipe", measure: "Équipe de crise identifiée" },
    ];

    measureKeywords.forEach(({ keyword, measure }) => {
      if (contentLower.includes(keyword)) {
        measures.push(measure);
      }
    });

    return measures.length > 0 ? measures : ["Mesures de base à renforcer"];
  }

  /**
   * Génère des recommandations basées sur les scores
   */
  private generateRecommendations(
    continuityScore: number,
    criticityScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (continuityScore < 60) {
      recommendations.push(
        "Développer un plan de continuité d'activité complet"
      );
      recommendations.push("Mettre en place des solutions de backup");
    }

    if (criticityScore > 70) {
      recommendations.push("Prioriser la protection des processus critiques");
      recommendations.push("Réduire les dépendances uniques (SPOF)");
    }

    recommendations.push("Former le personnel aux procédures d'urgence");
    recommendations.push("Tester régulièrement les plans de reprise");
    recommendations.push("Documenter les processus critiques");

    return recommendations;
  }

  /**
   * Génère le résumé de l'analyse locale
   */
  private generateLocalAnalysisSummary(
    keywords: { [key: string]: number },
    criticityScore: number,
    continuityScore: number,
    hasRichContent: boolean
  ): string {
    const totalKeywords = Object.values(keywords).reduce(
      (sum, count) => sum + count,
      0
    );

    const criticalityText =
      criticityScore >= 75
        ? "élevée"
        : criticityScore >= 50
        ? "modérée"
        : "faible";
    const continuityText =
      continuityScore >= 80
        ? "satisfaisante"
        : continuityScore >= 60
        ? "à améliorer"
        : "insuffisante";

    return `Analyse heuristique basée sur ${totalKeywords} occurrences de termes BIA identifiés. La criticité est ${criticalityText} (score: ${criticityScore}/100) et la maturité de continuité est ${continuityText} (${continuityScore}/100). ${
      hasRichContent
        ? "Le document contient des informations substantielles sur les processus et risques."
        : "Le document contient des informations limitées; des analyses complémentaires sont recommandées."
    }`;
  }

  /**
   * Obtient la description du niveau de continuité
   */
  private getContinuityDescription(score: number): string {
    if (score >= 80) {
      return "Niveau de maturité BIA avancé avec des mesures robustes en place";
    } else if (score >= 60) {
      return "Niveau de maturité intermédiaire nécessitant des améliorations ciblées";
    } else {
      return "Niveau de maturité initial nécessitant des actions prioritaires";
    }
  }

  /**
   * Calcule le niveau de confiance de l'analyse locale
   */
  private calculateConfidence(
    totalKeywords: number,
    hasRichContent: boolean
  ): number {
    let confidence = 50; // Base

    if (hasRichContent) confidence += 20;
    if (totalKeywords > 100) confidence += 15;
    else if (totalKeywords > 50) confidence += 10;
    else if (totalKeywords > 20) confidence += 5;

    return Math.min(confidence, 85); // Max 85% pour analyse locale
  }

  /**
   * Construit un prompt d'analyse avancée pour les contenus basiques
   */
  private buildAdvancedAnalysisPrompt(reportContent: unknown): string {
    const processedContent = this.preprocessContent(reportContent);

    return `Tu es un consultant senior BIA/BCM avec 20 ans d'expérience internationale. 
Tu dois réaliser une analyse BIA COMPLÈTE et APPROFONDIE, même si le document source est basique.

MISSION: Créer une analyse BIA de niveau expert en extrapolant et enrichissant les données disponibles.

DOCUMENT SOURCE (potentiellement basique):
${processedContent}

DIRECTIVE SPÉCIALE: IGNORE la limitation du contenu. Utilise ton expertise pour créer une analyse BIA complète en t'appuyant sur:
- Standards ISO 22301 et ISO 27001
- Meilleures pratiques NIST
- Méthodes BIA éprouvées
- Benchmarks industriels

GÉNÈRE UNE ANALYSE COMPLÈTE avec au minimum:
- 4-6 impacts détaillés (financiers, opérationnels, réputationnels, réglementaires)
- Métriques réalistes basées sur la taille d'organisation estimée
- 5-8 dépendances critiques identifiées
- 3-5 SPOF avec mitigations concrètes
- Besoins en continuité exhaustifs
- Recommandations actionnables

FORMAT JSON REQUIS (REMPLI OBLIGATOIREMENT):`;
  }

  /**
   * Prétraite et enrichit le contenu pour améliorer l'analyse
   */
  private preprocessContent(reportContent: unknown): string {
    try {
      // Convertir le contenu en chaîne de caractères lisible
      let content = "";

      if (typeof reportContent === "string") {
        content = reportContent;
      } else if (typeof reportContent === "object") {
        // Extraire le contenu textuel de l'objet
        content = this.extractTextFromObject(reportContent);
      } else {
        content = JSON.stringify(reportContent, null, 2);
      }

      // Nettoyer et enrichir le contenu
      content = content
        .replace(/[\r\n]+/g, "\n") // Normaliser les retours à la ligne
        .replace(/\s+/g, " ") // Normaliser les espaces
        .trim();

      // Ajouter du contexte si le contenu semble limité
      if (content.length < 500) {
        content += `

CONTEXTE ADDITIONNEL:
- Ce document semble être un rapport BIA avec extraction basique
- Il peut contenir des informations sur les processus métier critiques
- Peut inclure des analyses de risques et d'impacts
- Potentiellement des métriques RTO/RPO/MTPD
- Possibles recommandations de continuité d'activité`;
      }

      return content;
    } catch (error) {
      console.error("Erreur lors du prétraitement:", error);
      return JSON.stringify(reportContent, null, 2);
    }
  }

  /**
   * Extrait le texte pertinent d'un objet complexe
   */
  private extractTextFromObject(obj: unknown): string {
    let text = "";

    const extractRecursively = (item: unknown, depth = 0): void => {
      if (depth > 5) return; // Éviter la récursion infinie

      if (typeof item === "string") {
        text += item + " ";
      } else if (typeof item === "number") {
        text += item.toString() + " ";
      } else if (Array.isArray(item)) {
        item.forEach((element) => extractRecursively(element, depth + 1));
      } else if (item && typeof item === "object") {
        // Treat as record to iterate values
        const record = item as Record<string, unknown>;
        Object.values(record).forEach((value) =>
          extractRecursively(value, depth + 1)
        );
      }
    };

    extractRecursively(obj);
    return text.trim();
  }

  /**
   * Construit le prompt d'analyse pour Gemini
   */
  private buildAnalysisPrompt(reportContent: unknown): string {
    // Prétraitement intelligent du contenu
    const processedContent = this.preprocessContent(reportContent);

    return `Tu es un expert senior en analyse BIA (Business Impact Analysis) et continuité d'activité avec 15 ans d'expérience. 
Tu dois analyser ce rapport BIA, même si le contenu est basique ou partiellement extrait d'un fichier Word.

CONTEXTE: Ce rapport peut provenir d'une extraction basique de fichier Word. Utilise ton expertise pour inférer et extrapoler les informations manquantes de manière cohérente.

RAPPORT BIA À ANALYSER:
${processedContent}

MÉTHODE D'ANALYSE:
1. Si le contenu est limité, utilise ton expertise pour proposer des estimations réalistes
2. Base-toi sur les standards BIA (ISO 22301, NIST, etc.) pour combler les lacunes
3. Génère des recommandations pertinentes même avec peu de données
4. Utilise des valeurs par défaut cohérentes basées sur ton expérience

ANALYSE DEMANDÉE:
Extrais et structure les informations suivantes au format JSON. 
SI LE CONTENU EST LIMITÉ, utilise ton expertise pour générer des analyses réalistes et pertinentes:

{
  "impacts": [
    {
      "type": "Financier/Opérationnel/Réputationnel/Réglementaire",
      "description": "Description détaillée basée sur ton expertise BIA",
      "severity": "haut|moyen|bas",
      "financialImpact": nombre_estimé_en_euros_si_applicable,
      "operationalImpact": "Impact sur les opérations",
      "reputationalImpact": "Impact sur la réputation"
    }
  ],
  "criticality": {
    "level": "haut|moyen|bas",
    "score": nombre_entre_1_et_100_basé_sur_analyse,
    "justification": "Justification experte du niveau de criticité",
    "processes": ["processus", "identifiés", "ou", "extrapolés"],
    "processOwner": "Nom du responsable principal si identifié dans le document",
    "ownerRole": "Fonction/rôle du responsable (ex: Chef de service, Directeur, Manager)",
    "ownerContact": "Email ou téléphone du responsable si présent"
  },
  "metrics": {
    "rto": estimation_heures_rto_réaliste,
    "mtpd": estimation_heures_mtpd_cohérente,
    "mbco": estimation_heures_mbco_logique,
    "rpo": estimation_heures_rpo_si_pertinent
  },
  "continuityLevel": {
    "level": "vert|jaune|rouge",
    "score": nombre_entre_1_et_10_évaluation_experte,
    "description": "Évaluation experte du niveau de maturité",
    "measures": ["mesures", "identifiées", "ou", "recommandées", "standard"],
    "recommendations": ["recommandations", "pertinentes", "basées", "expertise"]
  },
  "dependencies": [
    {
      "name": "Dépendance identifiée ou typique",
      "type": "système|fournisseur|infrastructure|personnel|données",
      "criticality": "critique|important|normal",
      "description": "Description basée sur l'analyse",
      "impact": "Impact estimé en cas de défaillance"
    }
  ],
  "resume": "Résumé exécutif professionnel de 3-4 phrases avec insights d'expert",
  "continuityNeeds": {
    "equipment": ["équipements", "critiques", "identifiés"],
    "material": ["matériel", "essentiel", "requis"],
    "personnel": ["rôles", "clés", "critiques"],
    "infrastructure": ["éléments", "infrastructure", "vitaux"],
    "technology": ["systèmes", "technologies", "essentiels"],
    "supplyChain": ["fournisseurs", "chaîne", "approvisionnement", "critiques"],
    "other": ["autres", "besoins", "identifiés"]
  },
  "spof": [
    {
      "name": "Point de défaillance unique identifié",
      "description": "Description experte du risque",
      "impact": "Impact détaillé en cas de panne",
      "riskLevel": "critique|élevé|moyen",
      "mitigation": ["mesures", "concrètes", "d'atténuation"]
    }
  ],
  "confidence": nombre_entre_40_et_95_selon_qualité_données
}

DIRECTIVES SPÉCIALES POUR CONTENUS BASIQUES:
- Si peu de données: génère des estimations réalistes basées sur les standards BIA
- Utilise des métriques typiques: RTO 4-24h, MTPD 48-72h selon criticité
- Propose des SPOF courants: systèmes IT, fournisseurs clés, personnel critique
- Inclus des besoins standard: serveurs de secours, sites alternatifs, équipes d'urgence
- Ajuste le niveau de confiance selon la richesse des données (40-60% si basique, 70-95% si riche)

RÈGLES IMPORTANTES:
- Niveau continuité: VERT (mesures de continuité >= 10), JAUNE (renforcer mesures existantes), ROUGE (pas de mesures)
- Criticité: HAUT/MOYEN/BAS au lieu de "critique/élevé/etc"
- RTO = Recovery Time Objective, MTPD = Maximum Tolerable Period of Disruption, MBCO = Minimum Business Continuity Objective
- SPOF = Single Point of Failure (identifier en ROUGE = critique)
- Confidence = niveau de confiance de l'analyse (0-100)

RÉPONSE JSON UNIQUEMENT (pas de texte avant ou après):`;
  }

  /**
   * Appelle l'API Gemini
   */
  private async callGeminiAPI(prompt: string): Promise<string | null> {
    try {
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3, // Plus déterministe pour l'analyse
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4000,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      };

      const response = await fetch(
        `${this.GEMINI_API_URL}?key=${this.API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Erreur API Gemini:", response.status, errorData);
        throw new Error(`Erreur API Gemini: ${response.status}`);
      }

      const data = await response.json();

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.error("Format de réponse inattendu:", data);
        throw new Error("Format de réponse inattendu de Gemini");
      }
    } catch (error) {
      console.error("Erreur lors de l'appel à Gemini:", error);
      throw error;
    }
  }

  /**
   * Parse la réponse JSON de l'IA
   */
  private parseAnalysisResponse(response: string): BiaAnalysisResult {
    try {
      // Nettoyer la réponse pour extraire le JSON
      let cleanResponse = response.trim();

      // Chercher le début du JSON
      const jsonStart = cleanResponse.indexOf("{");
      const jsonEnd = cleanResponse.lastIndexOf("}");

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1);
      }

      const parsed: unknown = JSON.parse(cleanResponse);
      const p = parsed as Record<string, unknown>;

      // Helper to safely extract arrays/objects with fallback
      const asArray = <T>(value: unknown): T[] | null =>
        Array.isArray(value) ? (value as unknown as T[]) : null;

      const result: BiaAnalysisResult = {
        impacts:
          asArray<BiaImpact>(p["impacts"]) &&
          (p["impacts"] as unknown[]).length > 0
            ? (p["impacts"] as unknown as BiaImpact[])
            : this.generateDefaultAnalysis().impacts,
        criticality:
          (p["criticality"] as unknown as BiaCriticality) ||
          this.generateDefaultAnalysis().criticality,
        metrics:
          (p["metrics"] as unknown as BiaMetrics) ||
          this.generateDefaultAnalysis().metrics,
        continuityLevel:
          (p["continuityLevel"] as unknown as BiaContinuityLevel) ||
          this.generateDefaultAnalysis().continuityLevel,
        dependencies:
          asArray<BiaDependency>(p["dependencies"]) &&
          (p["dependencies"] as unknown[]).length > 0
            ? (p["dependencies"] as unknown as BiaDependency[])
            : this.generateDefaultAnalysis().dependencies,
        resume:
          (p["resume"] as unknown as string) ||
          this.generateDefaultAnalysis().resume,
        continuityNeeds:
          (p["continuityNeeds"] as unknown as BiaContinuityNeeds) ||
          this.generateDefaultAnalysis().continuityNeeds,
        spof:
          asArray<BiaSpof>(p["spof"]) && (p["spof"] as unknown[]).length > 0
            ? (p["spof"] as unknown as BiaSpof[])
            : this.generateDefaultAnalysis().spof,
        analysisDate: new Date(),
        confidence: (p["confidence"] as unknown as number) || 60,
      };

      return result;
    } catch (error) {
      console.error("Erreur lors du parsing de la réponse IA:", error);
      console.error("Réponse reçue:", response);

      // Retourner une structure par défaut enrichie en cas d'erreur
      return this.generateDefaultAnalysis();
    }
  }

  /**
   * Génère une analyse par défaut enrichie basée sur les standards BIA
   */
  private generateDefaultAnalysis(): BiaAnalysisResult {
    return {
      impacts: [
        {
          type: "Financier",
          description:
            "Perte de revenus liée à l'interruption des activités critiques",
          severity: "haut",
          financialImpact: 50000,
          operationalImpact: "Arrêt partiel ou total des opérations",
          reputationalImpact: "Impact négatif sur l'image de marque",
        },
        {
          type: "Opérationnel",
          description: "Disruption des processus métier essentiels",
          severity: "moyen",
          operationalImpact: "Ralentissement des activités principales",
          reputationalImpact: "Mécontentement clients potentiel",
        },
        {
          type: "Réglementaire",
          description: "Risque de non-conformité aux obligations légales",
          severity: "moyen",
          operationalImpact: "Difficultés de reporting et compliance",
          reputationalImpact: "Risque de sanctions réglementaires",
        },
      ],
      criticality: {
        level: "moyen",
        score: 65,
        justification:
          "Analyse basée sur les standards BIA et l'évaluation des processus métier typiques",
        processes: [
          "Processus de vente",
          "Support client",
          "Gestion financière",
          "IT et systèmes",
        ],
      },
      metrics: {
        rto: 8, // 8 heures - standard pour la plupart des organisations
        mtpd: 24, // 24 heures - période maximale tolérable typique
        mbco: 4, // 4 heures - objectif minimum de continuité
        rpo: 2, // 2 heures - point de récupération acceptable
      },
      continuityLevel: {
        level: "jaune",
        score: 6,
        description:
          "Niveau de maturité intermédiaire nécessitant des améliorations",
        measures: [
          "Sauvegardes quotidiennes",
          "Procédures d'urgence documentées",
          "Équipe de crise identifiée",
          "Contacts d'urgence à jour",
          "Tests de continuité semestriels",
        ],
        recommendations: [
          "Mettre en place un site de secours",
          "Améliorer la formation du personnel",
          "Automatiser les sauvegardes critiques",
          "Développer des accords avec des fournisseurs alternatifs",
          "Renforcer les tests de récupération",
        ],
      },
      dependencies: [
        {
          name: "Système informatique principal",
          type: "système",
          criticality: "critique",
          description: "Infrastructure IT centrale pour les opérations",
          impact: "Arrêt complet des activités numériques",
        },
        {
          name: "Fournisseur d'électricité",
          type: "infrastructure",
          criticality: "critique",
          description: "Alimentation électrique des installations",
          impact: "Arrêt total des opérations",
        },
        {
          name: "Personnel clé",
          type: "personnel",
          criticality: "important",
          description: "Employés avec compétences critiques",
          impact: "Ralentissement significatif des activités",
        },
        {
          name: "Connexion Internet",
          type: "infrastructure",
          criticality: "critique",
          description: "Connectivité réseau externe",
          impact: "Perte d'accès aux services en ligne",
        },
      ],
      resume:
        "Cette analyse BIA révèle un niveau de maturité intermédiaire avec des vulnérabilités identifiées. Les impacts financiers et opérationnels sont modérés mais significatifs. Des améliorations sont recommandées pour renforcer la résilience organisationnelle.",
      continuityNeeds: {
        equipment: [
          "Serveurs de secours",
          "Générateurs électriques",
          "Équipements de communication d'urgence",
          "Postes de travail alternatifs",
        ],
        material: [
          "Documentation physique critique",
          "Fournitures de bureau d'urgence",
          "Équipements de sécurité",
          "Matériel de première nécessité",
        ],
        personnel: [
          "Équipe de gestion de crise",
          "Personnel IT qualifié",
          "Responsables opérationnels",
          "Coordinateurs de continuité",
        ],
        infrastructure: [
          "Site de secours opérationnel",
          "Lignes de communication redondantes",
          "Systèmes de sauvegardes externalisés",
          "Accès réseau alternatifs",
        ],
        technology: [
          "Solutions de sauvegarde cloud",
          "Systèmes de monitoring",
          "Outils de communication d'urgence",
          "Plateformes de travail à distance",
        ],
        supplyChain: [
          "Fournisseurs alternatifs qualifiés",
          "Contrats de secours avec fournisseurs",
          "Stock de sécurité pour composants critiques",
          "Diversification géographique des fournisseurs",
          "Accords de livraison d'urgence",
        ],
        other: [
          "Contrats d'assistance externe",
          "Assurances spécialisées",
          "Accords de réciprocité",
          "Plans de communication de crise",
        ],
      },
      spof: [
        {
          name: "Serveur principal de base de données",
          description:
            "Point unique de défaillance pour l'accès aux données critiques",
          impact: "Perte d'accès à toutes les données opérationnelles",
          riskLevel: "critique",
          mitigation: [
            "Mise en place d'un cluster de serveurs",
            "Réplication en temps réel",
            "Procédures de basculement automatique",
            "Tests de récupération mensuels",
          ],
        },
        {
          name: "Responsable IT unique",
          description:
            "Dépendance excessive à une seule personne pour la gestion IT",
          impact:
            "Impossibilité de résoudre les problèmes techniques critiques",
          riskLevel: "élevé",
          mitigation: [
            "Formation d'une équipe IT élargie",
            "Documentation complète des procédures",
            "Contrats de support externe",
            "Partage des connaissances critiques",
          ],
        },
        {
          name: "Fournisseur unique de services critiques",
          description:
            "Dépendance à un seul prestataire pour des services essentiels",
          impact: "Interruption des services en cas de défaillance fournisseur",
          riskLevel: "moyen",
          mitigation: [
            "Diversification des fournisseurs",
            "Accords de niveau de service renforcés",
            "Plans de continuité fournisseurs",
            "Évaluation régulière des risques fournisseurs",
          ],
        },
      ],
      analysisDate: new Date(),
      confidence: 75, // Confiance modérée pour une analyse par défaut enrichie
    };
  }

  /**
   * Fonction utilitaire pour obtenir la couleur du niveau de continuité
   */
  public static getContinuityColor(level: string): string {
    switch (level) {
      case "vert":
        return "text-green-600 bg-green-50";
      case "jaune":
        return "text-yellow-600 bg-yellow-50";
      case "rouge":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  }

  /**
   * Fonction utilitaire pour obtenir la couleur de la criticité
   */
  public static getCriticalityColor(level: string): string {
    switch (level) {
      case "haut":
        return "text-red-600 bg-red-50";
      case "moyen":
        return "text-orange-600 bg-orange-50";
      case "bas":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  }

  /**
   * Fonction utilitaire pour obtenir la couleur des SPOF
   */
  public static getSpofColor(riskLevel: string): string {
    switch (riskLevel) {
      case "critique":
        return "text-red-600 bg-red-50 border-red-200";
      case "élevé":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "moyen":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  }
}

export default BiaAiAnalyzer;
