/**
 * Script de test pour l'analyse AI des rapports BIA
 * Usage: node test-bia-analysis.js
 */

const BASE_URL = "http://localhost:3001";

// Couleurs pour la console
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log("\n" + "=".repeat(60));
  log(title, "bright");
  console.log("=".repeat(60));
}

// Test data - Contenu de rapport BIA simulé
const testReportData = {
  basicReport: {
    content: `
      Analyse BIA - Processus Critique de Production
      
      Responsable: Jean Dupont
      Fonction: Chef de service Production
      Email: jean.dupont@survive.com
      Téléphone: +33 6 12 34 56 78
      
      Processus: Production de composants électroniques
      
      Métriques:
      - RTO: 8 heures
      - RPO: 4 heures
      - MTPD: 24 heures
      - MBCO: 6 heures
      
      Impact Financier: Perte estimée à 50000€ par jour d'arrêt
      Impact Opérationnel: Arrêt complet de la chaîne de production
      Impact Réputationnel: Retard de livraison clients critiques
      
      Dépendances critiques:
      - Système informatique ERP
      - Fournisseur électricité
      - Personnel spécialisé (5 opérateurs)
      - Réseau internet
      
      Risques identifiés:
      - Panne du serveur principal (SPOF critique)
      - Absence du responsable technique unique
      - Fournisseur unique de matières premières
      
      Mesures de continuité existantes:
      - Sauvegardes quotidiennes des données
      - Groupe électrogène de secours
      - Documentation des procédures
      - Plan de communication de crise
      
      Recommandations:
      - Mettre en place un cluster de serveurs redondants
      - Former une équipe de backup
      - Diversifier les fournisseurs
      - Tester le plan de continuité semestriellement
    `,
  },
  richReport: {
    content: `
      RAPPORT BIA COMPLET - USINE DE DELICE DANONE
      
      === RESPONSABILITÉ ===
      Process Owner: Marie Laurent
      Poste: Directeur des Opérations
      Contact: marie.laurent@delice.tn
      
      === PROCESSUS CRITIQUES ===
      1. Production laitière
      2. Conditionnement
      3. Logistique et distribution
      4. Contrôle qualité
      5. Maintenance préventive
      
      === MÉTRIQUES BIA ===
      RTO (Recovery Time Objective): 4h
      RPO (Recovery Point Objective): 1h
      MTPD (Maximum Tolerable Period): 12h
      MBCO (Minimum Business Continuity): 2h
      
      === IMPACTS ===
      
      Impact Financier:
      - Perte directe: 100000€/jour
      - Coûts de récupération: 50000€
      - Pénalités contractuelles: 20000€/jour
      
      Impact Opérationnel:
      - Arrêt de 3 lignes de production
      - Perte de 50000 litres de lait/jour
      - Rupture de stock client sous 24h
      
      Impact Réputationnel:
      - Risque de perte de certification ISO
      - Mécontentement des distributeurs
      - Impact média négatif potentiel
      
      Impact Réglementaire:
      - Non-conformité HACCP
      - Risque d'audit sanitaire
      - Suspension temporaire d'activité possible
      
      === DÉPENDANCES CRITIQUES ===
      
      Systèmes IT:
      - ERP SAP (critique)
      - Système de traçabilité (critique)
      - Automates de production (critique)
      
      Fournisseurs:
      - Producteurs laitiers locaux (15 fermes)
      - Fournisseur d'emballages Tetra Pak
      - Transporteur frigorifique Logistrans
      
      Infrastructure:
      - Électricité STEG 380V triphasé
      - Réseau internet fibre optique
      - Système de refroidissement industriel
      - Chaîne du froid -5°C à +4°C
      
      Personnel:
      - 45 opérateurs de production
      - 8 techniciens de maintenance
      - 3 responsables qualité
      - 12 conducteurs frigorifiques
      
      === POINTS DE DÉFAILLANCE UNIQUES (SPOF) ===
      
      1. Serveur central de traçabilité
         Risque: CRITIQUE
         Impact: Impossible de garantir la conformité réglementaire
         Mitigation: Cluster haute disponibilité à mettre en place
      
      2. Responsable maintenance unique
         Risque: ÉLEVÉ
         Impact: Arrêt prolongé en cas d'incident technique
         Mitigation: Formation d'une équipe de backup
      
      3. Transformateur électrique principal
         Risque: CRITIQUE
         Impact: Arrêt total de la production
         Mitigation: Transformateur de secours et groupe électrogène
      
      === BESOINS EN CONTINUITÉ ===
      
      Équipement:
      - 2 groupes électrogènes de 500 kVA
      - Serveurs de backup
      - Équipement de réfrigération mobile
      - Postes de travail de secours
      
      Matériel:
      - Stock de sécurité de matières premières (3 jours)
      - Emballages d'urgence
      - Pièces de rechange critiques
      - Documentation papier des procédures
      
      Personnel:
      - Équipe de crise (6 personnes)
      - Personnel IT qualifié 24/7
      - Techniciens de maintenance d'astreinte
      - Coordinateur de continuité
      
      Infrastructure:
      - Site de secours à Sousse (120 km)
      - Lignes télécom redondantes
      - Accès internet 4G backup
      - Système de vidéosurveillance autonome
      
      Technologie:
      - Sauvegarde cloud AWS
      - Réplication temps réel des données
      - VPN pour accès distant
      - Système de monitoring IoT
      
      Supply Chain:
      - 3 fournisseurs alternatifs qualifiés
      - Contrats de livraison d'urgence
      - Stock tournant de sécurité
      - Transport frigorifique de backup
      
      === NIVEAU DE CONTINUITÉ ===
      Score actuel: 7/10 (JAUNE - À améliorer)
      
      Points forts:
      - Documentation complète
      - Formation du personnel
      - Tests réguliers
      - Équipements de secours
      
      Points à améliorer:
      - Réduire les SPOF
      - Améliorer la redondance IT
      - Renforcer les accords fournisseurs
      - Site de secours à opérationnaliser
      
      === RECOMMANDATIONS PRIORITAIRES ===
      
      Court terme (0-3 mois):
      1. Mise en place du cluster serveur haute disponibilité
      2. Formation équipe de backup maintenance
      3. Test du plan de continuité grandeur nature
      4. Audit des contrats fournisseurs
      
      Moyen terme (3-6 mois):
      5. Installation transformateur de secours
      6. Certification du site de secours Sousse
      7. Mise en place monitoring temps réel
      8. Diversification des fournisseurs critiques
      
      Long terme (6-12 mois):
      9. Programme de formation continue BCM
      10. Mise en place norme ISO 22301
      11. Extension des capacités de stockage
      12. Automatisation des procédures de basculement
    `,
  },
  minimalReport: {
    content: `
      Rapport BIA simple
      Processus: Vente
      Risque: Panne système
    `,
  },
};

// Fonction pour tester l'analyse locale (heuristique)
async function testLocalAnalysis(reportData) {
  logSection("🧪 TEST: Analyse Locale (Heuristique)");

  try {
    log("📊 Données du rapport:", "cyan");
    console.log(reportData.content.substring(0, 200) + "...\n");

    // Simuler l'analyse locale (normalement côté client)
    log("⚡ Exécution de l'analyse heuristique...", "yellow");

    // Compter les mots-clés
    const content = reportData.content.toLowerCase();
    const keywords = {
      processus: (content.match(/processus|process|activité/g) || []).length,
      risques: (content.match(/risque|risk|menace/g) || []).length,
      impacts: (content.match(/impact|conséquence|perte/g) || []).length,
      continuité: (content.match(/continuité|rto|rpo|mtpd/g) || []).length,
      critique: (content.match(/critique|critical|essentiel/g) || []).length,
    };

    log("\n📈 Statistiques:", "green");
    console.log('  - Mots-clés "processus":', keywords.processus);
    console.log('  - Mots-clés "risques":', keywords.risques);
    console.log('  - Mots-clés "impacts":', keywords.impacts);
    console.log('  - Mots-clés "continuité":', keywords.continuité);
    console.log('  - Mots-clés "critique":', keywords.critique);

    // Extraction de métriques
    const rtoMatch = content.match(/rto[:\s]*(\d+)\s*h/i);
    const rpoMatch = content.match(/rpo[:\s]*(\d+)\s*h/i);
    const mtpdMatch = content.match(/mtpd[:\s]*(\d+)\s*h/i);

    log("\n📊 Métriques extraites:", "blue");
    console.log("  - RTO:", rtoMatch ? rtoMatch[1] + "h" : "Non détecté");
    console.log("  - RPO:", rpoMatch ? rpoMatch[1] + "h" : "Non détecté");
    console.log("  - MTPD:", mtpdMatch ? mtpdMatch[1] + "h" : "Non détecté");

    // Extraction du responsable
    const responsableMatch = content.match(
      /responsable[:\s]*([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)*)/i
    );
    const emailMatch = content.match(/([a-z0-9._-]+@[a-z0-9._-]+\.[a-z]{2,})/i);

    log("\n👤 Responsable détecté:", "cyan");
    console.log(
      "  - Nom:",
      responsableMatch ? responsableMatch[1] : "Non détecté"
    );
    console.log("  - Email:", emailMatch ? emailMatch[1] : "Non détecté");

    // Calcul du score de criticité
    const totalKeywords = Object.values(keywords).reduce(
      (sum, count) => sum + count,
      0
    );
    const criticalityScore = Math.min(
      Math.round((totalKeywords / 50) * 100),
      100
    );

    log("\n⚠️ Score de criticité:", "yellow");
    console.log("  - Score:", criticalityScore + "/100");
    console.log(
      "  - Niveau:",
      criticalityScore >= 75 ? "HAUT" : criticalityScore >= 50 ? "MOYEN" : "BAS"
    );

    log("\n✅ Analyse locale terminée avec succès!", "green");
    return { success: true, score: criticalityScore };
  } catch (error) {
    log("\n❌ Erreur lors de l'analyse locale:", "red");
    console.error(error.message);
    return { success: false, error: error.message };
  }
}

// Fonction pour tester l'analyse IA via l'API
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function testAIAnalysis(reportId) {
  logSection("🧠 TEST: Analyse IA (Gemini)");

  try {
    log("🚀 Envoi de la requête à l'API...", "yellow");
    log(
      `   URL: POST ${BASE_URL}/api/bia/report/${reportId}/analyze\n`,
      "cyan"
    );

    const startTime = Date.now();

    const response = await fetch(
      `${BASE_URL}/api/bia/report/${reportId}/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    log(`⏱️  Durée: ${duration}s`, "cyan");

    if (result.success && result.data) {
      log("\n✅ Analyse IA réussie!", "green");

      const analysis = result.data.analysis;

      log("\n📊 Résultats de l'analyse:", "blue");
      console.log("\n  📝 Résumé:");
      console.log("    ", analysis.resume?.substring(0, 150) + "...");

      console.log("\n  📈 Métriques:");
      console.log("     - RTO:", analysis.metrics?.rto + "h");
      console.log("     - MTPD:", analysis.metrics?.mtpd + "h");
      console.log("     - MBCO:", analysis.metrics?.mbco + "h");
      console.log("     - RPO:", analysis.metrics?.rpo + "h");

      console.log("\n  ⚠️  Criticité:");
      console.log("     - Niveau:", analysis.criticality?.level?.toUpperCase());
      console.log("     - Score:", analysis.criticality?.score + "/100");
      console.log(
        "     - Processus:",
        analysis.criticality?.processes?.join(", ") || "N/A"
      );

      if (analysis.criticality?.processOwner) {
        console.log("\n  👤 Responsable:");
        console.log("     - Nom:", analysis.criticality.processOwner);
        console.log("     - Rôle:", analysis.criticality.ownerRole || "N/A");
        console.log(
          "     - Contact:",
          analysis.criticality.ownerContact || "N/A"
        );
      }

      console.log("\n  🎯 Niveau de continuité:");
      console.log(
        "     - Niveau:",
        analysis.continuityLevel?.level?.toUpperCase()
      );
      console.log("     - Score:", analysis.continuityLevel?.score + "/10");

      console.log("\n  💥 Impacts identifiés:", analysis.impacts?.length || 0);
      if (analysis.impacts?.length > 0) {
        analysis.impacts.slice(0, 3).forEach((impact, i) => {
          console.log(`     ${i + 1}. ${impact.type} (${impact.severity})`);
        });
      }

      console.log(
        "\n  🔗 Dépendances critiques:",
        analysis.dependencies?.length || 0
      );
      if (analysis.dependencies?.length > 0) {
        analysis.dependencies.slice(0, 3).forEach((dep, i) => {
          console.log(`     ${i + 1}. ${dep.name} (${dep.type})`);
        });
      }

      console.log("\n  🚨 SPOF identifiés:", analysis.spof?.length || 0);
      if (analysis.spof?.length > 0) {
        analysis.spof.slice(0, 3).forEach((spof, i) => {
          console.log(
            `     ${i + 1}. ${spof.name} - Risque: ${spof.riskLevel}`
          );
        });
      }

      console.log("\n  📊 Confiance:", analysis.confidence + "%");

      return { success: true, analysis };
    } else {
      throw new Error(result.error || "Erreur inconnue");
    }
  } catch (error) {
    log("\n❌ Erreur lors de l'analyse IA:", "red");
    console.error("   ", error.message);
    return { success: false, error: error.message };
  }
}

// Fonction pour tester la sauvegarde d'une analyse
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function testSaveAnalysis(reportId, analysisData) {
  logSection("💾 TEST: Sauvegarde de l'analyse");

  try {
    log("📤 Envoi des données...", "yellow");

    const response = await fetch(
      `${BASE_URL}/api/bia/reports/${reportId}/analysis`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(analysisData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      log("\n✅ Analyse sauvegardée avec succès!", "green");
      console.log("   ID du rapport:", result.reportId);
      return { success: true };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    log("\n❌ Erreur lors de la sauvegarde:", "red");
    console.error("   ", error.message);
    return { success: false, error: error.message };
  }
}

// Fonction pour tester la récupération d'une analyse
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function testGetAnalysis(reportId) {
  logSection("📥 TEST: Récupération de l'analyse");

  try {
    log("📡 Récupération depuis l'API...", "yellow");

    const response = await fetch(
      `${BASE_URL}/api/bia/reports/${reportId}/analysis`
    );

    if (!response.ok) {
      if (response.status === 404) {
        log("\n⚠️  Aucune analyse trouvée (404)", "yellow");
        return { success: true, found: false };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const analysis = await response.json();

    log("\n✅ Analyse récupérée avec succès!", "green");
    console.log("   - Métriques RTO:", analysis.metrics?.rto + "h");
    console.log("   - Niveau de criticité:", analysis.criticality?.level);
    console.log("   - Confiance:", analysis.confidence + "%");

    return { success: true, found: true, analysis };
  } catch (error) {
    log("\n❌ Erreur lors de la récupération:", "red");
    console.error("   ", error.message);
    return { success: false, error: error.message };
  }
}

// Fonction principale
async function runTests() {
  log("\n🚀 TESTS DE L'ANALYSE BIA - DÉMARRAGE", "bright");
  log("   Serveur: " + BASE_URL, "cyan");
  log("   Date: " + new Date().toLocaleString("fr-FR"), "cyan");

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  // Test 1: Analyse locale avec rapport basique
  console.log("\n\n");
  results.total++;
  const test1 = await testLocalAnalysis(testReportData.basicReport);
  if (test1.success) results.passed++;
  else results.failed++;

  // Test 2: Analyse locale avec rapport riche
  console.log("\n\n");
  results.total++;
  const test2 = await testLocalAnalysis(testReportData.richReport);
  if (test2.success) results.passed++;
  else results.failed++;

  // Test 3: Analyse locale avec rapport minimal
  console.log("\n\n");
  results.total++;
  const test3 = await testLocalAnalysis(testReportData.minimalReport);
  if (test3.success) results.passed++;
  else results.failed++;

  // Note: Les tests API nécessitent un ID de rapport valide
  // Pour tester avec l'API, remplacez 'REPORT_ID' par un vrai ID

  // Exemple (décommentez si vous avez un ID valide):
  /*
  const REPORT_ID = '6919b232bae6cd9e99373d6a'; // Remplacer par un vrai ID
  
  console.log('\n\n');
  results.total++;
  const test4 = await testAIAnalysis(REPORT_ID);
  if (test4.success) {
    results.passed++;
    
    // Test 5: Sauvegarde
    if (test4.analysis) {
      console.log('\n\n');
      results.total++;
      const test5 = await testSaveAnalysis(REPORT_ID, test4.analysis);
      if (test5.success) results.passed++;
      else results.failed++;
      
      // Test 6: Récupération
      console.log('\n\n');
      results.total++;
      const test6 = await testGetAnalysis(REPORT_ID);
      if (test6.success) results.passed++;
      else results.failed++;
    }
  } else {
    results.failed++;
  }
  */

  // Résumé final
  logSection("📊 RÉSUMÉ DES TESTS");
  log(`\nTotal: ${results.total} tests`, "cyan");
  log(`✅ Réussis: ${results.passed}`, "green");
  log(`❌ Échoués: ${results.failed}`, "red");

  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  log(
    `\n📈 Taux de réussite: ${successRate}%`,
    successRate >= 80 ? "green" : "yellow"
  );

  console.log("\n" + "=".repeat(60) + "\n");

  // Instructions pour les tests API
  log("💡 Pour tester les API d'analyse IA:", "yellow");
  log("   1. Créez ou récupérez un rapport BIA via l'interface", "cyan");
  log("   2. Copiez son ID depuis l'URL", "cyan");
  log("   3. Décommentez les tests API dans le script", "cyan");
  log("   4. Remplacez REPORT_ID par l'ID réel", "cyan");
  log("   5. Relancez: node test-bia-analysis.js\n", "cyan");
}

// Exécution
runTests().catch((error) => {
  log("\n❌ ERREUR FATALE:", "red");
  console.error(error);
  process.exit(1);
});
