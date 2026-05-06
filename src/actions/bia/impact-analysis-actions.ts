'use server';

import { AzureOpenAI } from 'openai';

export interface Recommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: string;
}

export interface ImpactAnalysisResult {
  summary: string;
  riskLevel: 'low' | 'medium' | 'high';
  estimatedRecoveryTime: string;
  financialImpact: string;
  operationalImpact: string;
  reputationImpact: string;
  keyRisks: string[];
  criticalDependencies: string[];
  recommendations: Recommendation[];
  recoveryStrategy: string;
  contingencyMeasures: string;
}

/**
 * Initialise le client Azure OpenAI
 */
function getAzureClient() {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";

  if (!apiKey || !endpoint) {
    throw new Error("Azure OpenAI n'est pas configuré. Vérifiez vos variables d'environnement.");
  }

  return new AzureOpenAI({
    apiKey,
    endpoint,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
    deployment,
  });
}

export async function generateImpactAnalysis(processData: any): Promise<ImpactAnalysisResult> {
  try {
    const client = getAzureClient();
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";

    const prompt = `# Analyse d'Impact Métier (BIA) - Génération de Rapport

    ## 1. Contexte du Processus
    - **Nom du Processus**: ${processData.name}
    - **Département**: ${processData.department}
    - **Localisation**: ${processData.location}
    - **Description**: ${processData.description}
    - **Fonctionnalité Principale**: ${processData.mainFunctionality || 'Non spécifiée'}
    
    ## 2. Métriques Clés
    - **Niveau de Criticité**: ${processData.criticality}
    - **RTO (Recovery Time Objective)**: ${processData.rto} heures
    - **RPO (Recovery Point Objective)**: ${processData.rpo} heures
    - **MTPD (Maximum Tolerable Period of Disruption)**: ${processData.mtpd} heures
    - **MBCO (Minimum Business Continuity Objective)**: ${processData.mbco || 'Non spécifié'}
    
    ## 3. Analyse d'Impact
    - **Impact Financier**: ${processData.financialImpact || 'Non évalué'}
    - **Impact Opérationnel**: ${processData.operationalImpact || 'Non évalué'}
    - **Impact sur la Réputation**: ${processData.reputationImpact || 'Non évalué'}
    - **Impact sur la Capacité Opérationnelle**: ${processData.operationalCapacityImpact || 'Non évalué'}
    - **Périodes Critiques**: ${processData.criticalTimes || 'Non spécifiées'}
    
    ## 4. Dépendances et Ressources
    - **Dépendances Produits**: ${processData.productDependencies || 'Aucune'}
    - **Dépendances Inter-Services**: ${processData.interServiceDependencies || 'Aucune'}
    - **Rôles du Personnel**: ${processData.staffRoles || 'Non spécifiés'} (${processData.staffCount || '0'} personnes)
    - **Compétences Uniques Requises**: ${processData.uniqueSkills || 'Aucune'}
    
    ## 5. Infrastructure et Équipements
    - **Type d'Infrastructure**: ${processData.infrastructureType || 'Non spécifié'}
    - **Équipement Industriel**: ${processData.industrialEquipment || 'Aucun'}
    - **Équipement Bureautique**: ${processData.officeEquipment || 'Aucun'}
    - **Systèmes IT**: ${processData.itSystems || 'Aucun'}
    
    ## 6. Fournisseurs Externes
    - **Fournisseurs Clés**: ${processData.keySuppliers || 'Aucun'}
    - **Services Externalisés**: ${processData.externalSuppliers || 'Aucun'}
    - **Plans de Continuité Fournisseurs**: ${processData.supplierHasContinuityPlan ? 'Oui' : 'Non'}
    
    ## 7. Conformité et Documentation
    - **Obligations Légales**: ${processData.legalObligations || 'Aucune'}
    - **Documentation Requise**: ${processData.requiredDocumentation || 'Aucune'}
    - **Localisation Documentation**: ${processData.documentationLocation || 'Non spécifiée'}

    ## Instructions pour l'Analyse
    - Fournis une analyse complète et structurée en format JSON.
    - Sois précis et basé sur les données fournies.
    - Évalue les risques en fonction des délais de reprise (RTO, RPO, MTPD).
    - Propose des recommandations actionnables pour améliorer la résilience.
    
    ## Format de Réponse Requis (JSON uniquement)
    {
      "summary": "Résumé de l'impact global",
      "riskLevel": "low/medium/high",
      "estimatedRecoveryTime": "Estimation en heures/jours",
      "financialImpact": "Description détaillée",
      "operationalImpact": "Description détaillée",
      "reputationImpact": "Description détaillée",
      "keyRisks": ["Risque 1", "Risque 2"],
      "criticalDependencies": ["Dépendance 1"],
      "recommendations": [
        {
          "title": "Titre",
          "description": "Description",
          "priority": "high/medium/low",
          "estimatedTime": "Durée"
        }
      ],
      "recoveryStrategy": "Stratégie détaillée",
      "contingencyMeasures": "Mesures détaillées"
    }`;

    const completion = await client.chat.completions.create({
      model: deployment,
      messages: [
        {
          role: "system",
          content: "Tu es un expert en BIA et continuité d'activité. Tu fournis des analyses d'impact précises en format JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const analysis = JSON.parse(responseText) as ImpactAnalysisResult;

    // Validation basique
    if (!analysis.summary || !analysis.riskLevel) {
      throw new Error("Réponse IA incomplète");
    }

    return analysis;

  } catch (error) {
    console.error('Erreur lors de la génération du rapport d\'impact (Azure):', error);
    
    // Fallback gracieux avec informations d'erreur pour l'utilisateur
    return {
      summary: 'Une erreur est survenue lors de la génération de l\'analyse automatique. Veuillez vérifier vos configurations IA.',
      riskLevel: 'medium',
      estimatedRecoveryTime: 'Non disponible',
      financialImpact: 'Échec de l\'analyse automatique',
      operationalImpact: 'Échec de l\'analyse automatique',
      reputationImpact: 'Échec de l\'analyse automatique',
      keyRisks: ['Erreur de service IA'],
      criticalDependencies: [],
      recommendations: [
        {
          title: 'Analyse Manuelle',
          description: 'L\'IA n\'a pas pu générer l\'analyse. Veuillez procéder à une évaluation manuelle.',
          priority: 'high',
          estimatedTime: 'Non spécifié'
        }
      ],
      recoveryStrategy: 'Non disponible',
      contingencyMeasures: 'Non disponible'
    };
  }
}

