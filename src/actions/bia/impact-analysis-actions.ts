'use server';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

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

const GEMINI_API_KEY = "AIzaSyB1LRhsvFGjlJbvtUJ7SxEgFZ1qAS0epI4";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function queryGemini(prompt: string): Promise<string> {
  try {
    const response = await fetch(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur de l'API Gemini: ${response.status}`);
    }

    const data = (await response.json()) as GeminiResponse;

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Aucune réponse de l\'API Gemini');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Erreur lors de la requête à Gemini:', error);
    throw error;
  }
}

export async function generateImpactAnalysis(processData: any): Promise<ImpactAnalysisResult> {
  try {
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
    - Fournis une analyse complète et structurée en format JSON
    - Sois précis et basé sur les données fournies
    - Propose des recommandations actionnables
    - Tient compte des délais de reprise (RTO, RPO, MTPD)
    - Évalue les risques et impacts potentiels
    
    ## Format de Réponse Requis (JSON uniquement)
    {
      "summary": "Résumé concis de l'impact global et de l'importance du processus",
      "riskLevel": "low/medium/high",
      "estimatedRecoveryTime": "Estimation du temps de rétablissement",
      "financialImpact": "Impact financier potentiel",
      "operationalImpact": "Impact sur les opérations",
      "reputationImpact": "Impact sur la réputation",
      "keyRisks": ["Risque 1", "Risque 2", "Risque 3"],
      "criticalDependencies": ["Dépendance 1", "Dépendance 2"],
      "recommendations": [
        {
          "title": "Titre de la recommandation",
          "description": "Description détaillée",
          "priority": "high/medium/low",
          "estimatedTime": "Temps estimé pour la mise en œuvre"
        }
      ],
      "recoveryStrategy": "Stratégie de reprise recommandée",
      "contingencyMeasures": "Mesures d'urgence à mettre en place"
    }`;

    const response = await queryGemini(prompt);
    
    // Essayer d'extraire et de parser le JSON
    try {
      // Nettoyer la réponse pour ne garder que le JSON
      let jsonString = response.trim();
      
      // Supprimer les éventuels marqueurs de code
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.substring(7);
      }
      if (jsonString.startsWith('```')) {
        jsonString = jsonString.substring(3);
      }
      if (jsonString.endsWith('```')) {
        jsonString = jsonString.substring(0, jsonString.length - 3);
      }
      
      // Nettoyer les éventuels espaces et sauts de ligne au début et à la fin
      jsonString = jsonString.trim();
      
      // S'assurer que c'est bien un objet JSON valide
      if (!jsonString.startsWith('{') || !jsonString.endsWith('}')) {
        throw new Error('Format JSON invalide');
      }
      
      const analysis = JSON.parse(jsonString) as ImpactAnalysisResult;
      
      // Valider la structure de la réponse
      if (!analysis.summary || !analysis.recommendations || !analysis.riskLevel || !analysis.estimatedRecoveryTime) {
        throw new Error('Format de réponse invalide');
      }
      
      return analysis;
    } catch (parseError) {
      console.error('Erreur lors du parsing de la réponse:', parseError);
      // Retourner une réponse par défaut en cas d'échec du parsing
      const defaultRecommendation: Recommendation = {
        title: 'Vérification manuelle requise',
        description: 'Veuillez vérifier manuellement les détails du processus.',
        priority: 'high',
        estimatedTime: 'Non spécifié'
      };
      
      return {
        summary: 'Impossible de générer une analyse complète. ' + response.substring(0, 200) + '...',
        recommendations: [defaultRecommendation],
        riskLevel: 'medium',
        estimatedRecoveryTime: 'Non spécifié',
        financialImpact: 'Non évalué',
        operationalImpact: 'Non évalué',
        reputationImpact: 'Non évalué',
        keyRisks: ['Impossible de générer une analyse des risques'],
        criticalDependencies: [],
        recoveryStrategy: 'Non spécifiée',
        contingencyMeasures: 'Non spécifiées'
      };
    }
    
  } catch (error) {
    console.error('Erreur lors de la génération du rapport d\'impact:', error);
    // Retourner une réponse d'erreur claire
    const errorRecommendations: Recommendation[] = [
      {
        title: 'Vérification de la connexion',
        description: 'Vérifiez votre connexion internet',
        priority: 'high',
        estimatedTime: '5 minutes'
      },
      {
        title: 'Nouvelle tentative',
        description: 'Réessayez plus tard',
        priority: 'medium',
        estimatedTime: '15 minutes'
      },
      {
        title: 'Contact du support',
        description: 'Contactez le support si le problème persiste',
        priority: 'low',
        estimatedTime: '1 heure'
      }
    ];
    
    return {
      summary: 'Une erreur est survenue lors de la génération du rapport d\'impact.',
      recommendations: errorRecommendations,
      riskLevel: 'medium',
      estimatedRecoveryTime: 'Non disponible',
      financialImpact: 'Non évalué',
      operationalImpact: 'Non évalué',
      reputationImpact: 'Non évalué',
      keyRisks: ['Erreur lors de la génération du rapport'],
      criticalDependencies: [],
      recoveryStrategy: 'Non spécifiée',
      contingencyMeasures: 'Non spécifiées'
    };
  }
}
