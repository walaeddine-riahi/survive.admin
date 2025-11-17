/**
 * Script de test complet pour l'API d'analyse BIA
 * Ce script teste la chaîne complète: création rapport → analyse IA → sauvegarde → récupération
 */

const BASE_URL = "http://localhost:3001";

// Couleurs console
const c = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function log(msg, color = "reset") {
  console.log(`${c[color]}${msg}${c.reset}`);
}

function section(title) {
  console.log("\n" + "=".repeat(70));
  log(title, "bright");
  console.log("=".repeat(70));
}

// Données de test
const testReport = {
  name: `Test Analyse BIA - ${new Date().toLocaleTimeString("fr-FR")}`,
  description: "Rapport de test pour validation de l'analyse IA",
  format: "DOCX",
  category: "Usine Test",
  reportData: {
    content: `
      RAPPORT BIA CRITIQUE - TEST AUTOMATISÉ
      
      === INFORMATIONS GÉNÉRALES ===
      Date: ${new Date().toLocaleDateString("fr-FR")}
      Processus: Production Automatisée Test
      
      === RESPONSABLE ===
      Responsable: Alice Testeur
      Fonction: Responsable Production Test
      Email: alice.testeur@test.com
      Téléphone: +33 6 98 76 54 32
      
      === MÉTRIQUES BIA ===
      RTO (Recovery Time Objective): 6 heures
      RPO (Recovery Point Objective): 3 heures  
      MTPD (Maximum Tolerable Period): 18 heures
      MBCO (Minimum Business Continuity): 4 heures
      
      === ANALYSE D'IMPACT ===
      
      Impact Financier:
      - Perte directe estimée: 75000 euros par jour d'arrêt
      - Coûts de récupération: 25000 euros
      - Impact sur le chiffre d'affaires annuel: critique
      
      Impact Opérationnel:
      - Arrêt complet de la ligne de production principale
      - Retard de livraison client de 24 à 48 heures
      - Perturbation de la chaîne logistique
      - Impossibilité de respecter les SLA contractuels
      
      Impact Réputationnel:
      - Risque de perte de confiance des clients stratégiques
      - Potentiel impact négatif sur l'image de marque
      - Risque de pénalités contractuelles
      
      Impact Réglementaire:
      - Non-conformité ISO 9001 en cas d'arrêt prolongé
      - Risque d'audit qualité urgent
      - Possibles sanctions administratives
      
      === PROCESSUS CRITIQUES ===
      1. Production automatisée (critique)
      2. Contrôle qualité (important)
      3. Logistique sortante (critique)
      4. Maintenance préventive (important)
      5. Gestion des stocks (normal)
      
      === DÉPENDANCES CRITIQUES ===
      
      Systèmes Informatiques:
      - ERP central (criticité: CRITIQUE)
      - MES (Manufacturing Execution System) - CRITIQUE
      - Système de traçabilité - CRITIQUE
      - GMAO (Gestion Maintenance) - IMPORTANT
      
      Fournisseurs:
      - Fournisseur matière première A (unique - SPOF potentiel)
      - Transporteur logistique principal (contrat SLA)
      - Fournisseur énergie (électricité industrielle)
      - Fournisseur pièces de rechange
      
      Infrastructure:
      - Alimentation électrique 380V triphasé (CRITIQUE)
      - Réseau internet fibre optique (CRITIQUE)
      - Système de climatisation serveurs (IMPORTANT)
      - Réseau téléphonique (NORMAL)
      
      Personnel:
      - 12 opérateurs de production qualifiés
      - 2 responsables maintenance (compétences spécialisées)
      - 1 responsable qualité (certifié)
      - 3 chefs d'équipe
      
      === POINTS DE DÉFAILLANCE UNIQUES (SPOF) ===
      
      1. Serveur ERP Principal
         Description: Serveur unique hébergeant l'ERP sans redondance
         Impact: Arrêt total de la production et impossibilité de traçabilité
         Niveau de risque: CRITIQUE
         Mitigations proposées:
         - Mise en place d'un cluster haute disponibilité
         - Sauvegarde à chaud avec réplication
         - Plan de bascule automatique
         - Test de récupération trimestriel
      
      2. Responsable Technique Unique
         Description: Une seule personne maîtrise certains systèmes critiques
         Impact: Délai de résolution incident multiplié par 5
         Niveau de risque: ÉLEVÉ
         Mitigations proposées:
         - Formation d'une équipe de backup (2 personnes)
         - Documentation complète des procédures
         - Contrat de support externe
         - Partage de connaissances mensuel
      
      3. Fournisseur Unique Matière Première
         Description: Dépendance totale à un seul fournisseur
         Impact: Arrêt production sous 72h en cas de rupture
         Niveau de risque: MOYEN
         Mitigations proposées:
         - Qualification de 2 fournisseurs alternatifs
         - Stock de sécurité de 7 jours
         - Contrat de livraison d'urgence
         - Diversification géographique
      
      === BESOINS EN CONTINUITÉ ===
      
      Équipement:
      - Groupe électrogène 250 kVA
      - Serveur de backup
      - Onduleur industriel
      - Équipement de communication satellite
      
      Matériel:
      - Stock de sécurité matières premières (5 jours)
      - Pièces de rechange critiques
      - Documentation papier des procédures
      - Supports de données de sauvegarde
      
      Personnel:
      - Cellule de crise (5 personnes)
      - Équipe IT d'astreinte
      - Techniciens de maintenance qualifiés
      - Coordinateur de continuité
      
      Infrastructure:
      - Site de secours distant (accord de réciprocité)
      - Ligne télécom redondante
      - Connexion internet 4G backup
      - Accès VPN sécurisé
      
      Technologie:
      - Cloud backup AWS
      - Monitoring temps réel
      - Système d'alerte automatique
      - Plateforme de travail collaboratif
      
      Supply Chain:
      - Fournisseurs alternatifs qualifiés
      - Contrats de livraison express
      - Stock tournant de sécurité
      - Transport alternatif contracté
      
      === MESURES DE CONTINUITÉ EXISTANTES ===
      - Sauvegardes automatiques quotidiennes (rétention 30 jours)
      - Procédures d'urgence documentées et testées
      - Formation du personnel aux situations de crise
      - Contrats de maintenance avec SLA
      - Assurance perte d'exploitation
      - Tests de continuité semestriels
      - Équipe de crise identifiée et formée
      - Plan de communication de crise
      
      === NIVEAU DE MATURITÉ BIA ===
      Score actuel: 6.5/10
      Niveau: JAUNE (À améliorer)
      
      Points forts:
      + Documentation complète et à jour
      + Personnel formé et sensibilisé
      + Tests réguliers effectués
      + Équipements de secours en place
      + Sauvegardes automatisées
      
      Points d'amélioration:
      - Éliminer les SPOF identifiés
      - Améliorer la redondance IT
      - Diversifier les fournisseurs critiques
      - Opérationnaliser le site de secours
      - Automatiser la bascule
      
      === RECOMMANDATIONS PRIORITAIRES ===
      
      Priorité 1 (0-1 mois):
      1. Mise en place cluster serveur ERP haute disponibilité
      2. Formation équipe backup technique (2 personnes)
      3. Test grandeur nature du plan de continuité
      
      Priorité 2 (1-3 mois):
      4. Installation groupe électrogène avec bascule auto
      5. Qualification 2 fournisseurs alternatifs matières premières
      6. Mise en place monitoring temps réel infrastructure
      
      Priorité 3 (3-6 mois):
      7. Certification site de secours
      8. Automatisation des procédures de basculement
      9. Mise en conformité ISO 22301
      
      Priorité 4 (6-12 mois):
      10. Programme de formation continue BCM
      11. Extension capacités de stockage sécurisé
      12. Audit externe de maturité BIA
    `,
    extractedText: "Rapport BIA complet avec analyse détaillée...",
    metadata: {
      createdBy: "Test Automation",
      version: "1.0",
      testMode: true,
    },
  },
};

// Test de l'API complète
async function testCompleteFlow() {
  section("🚀 TEST COMPLET DE L'API D'ANALYSE BIA");
  log("Serveur: " + BASE_URL, "cyan");
  log("Date: " + new Date().toLocaleString("fr-FR"), "cyan");

  let reportId = null;

  try {
    // ÉTAPE 1: Obtenir un rapport existant ou utiliser un ID
    section("📋 ÉTAPE 1: Sélection du rapport");

    // Option A: Utiliser un ID de rapport existant (recommandé)
    log("\n💡 Option A: Utiliser un ID existant", "yellow");
    log("   Allez sur http://localhost:3001/bia/reports", "cyan");
    log("   Cliquez sur un rapport et copiez l'ID depuis l'URL", "cyan");
    log("   Exemple: /bia/reports/6919b232bae6cd9e99373d6a", "cyan");
    log("   L'ID est: 6919b232bae6cd9e99373d6a\n", "cyan");

    // Pour ce test, on utilise un ID hardcodé (à remplacer)
    reportId = process.argv[2]; // Premier argument de ligne de commande

    if (!reportId) {
      log("❌ Aucun ID de rapport fourni!", "red");
      log("\n📝 Usage: node test-bia-api-complete.js <REPORT_ID>", "yellow");
      log(
        "   Exemple: node test-bia-api-complete.js 6919b232bae6cd9e99373d6a\n",
        "yellow"
      );

      log("💡 Pour obtenir un ID:", "cyan");
      log("   1. Allez sur http://localhost:3001/bia/reports", "cyan");
      log("   2. Cliquez sur un rapport", "cyan");
      log("   3. Copiez l'ID depuis l'URL", "cyan");
      log("   4. Relancez le script avec cet ID\n", "cyan");

      return;
    }

    log(`✅ Utilisation du rapport ID: ${reportId}`, "green");

    // ÉTAPE 2: Vérifier que le rapport existe
    section("🔍 ÉTAPE 2: Vérification du rapport");

    log("📡 GET /api/bia/report/" + reportId, "cyan");
    const reportResponse = await fetch(
      `${BASE_URL}/api/bia/report/${reportId}`
    );

    if (!reportResponse.ok) {
      throw new Error(`Rapport non trouvé (HTTP ${reportResponse.status})`);
    }

    const reportData = await reportResponse.json();
    log(`✅ Rapport trouvé: "${reportData.name}"`, "green");
    log(`   Format: ${reportData.format}`, "cyan");
    log(
      `   Créé le: ${new Date(reportData.createdAt).toLocaleString("fr-FR")}`,
      "cyan"
    );

    // ÉTAPE 3: Lancer l'analyse IA
    section("🧠 ÉTAPE 3: Analyse IA (Gemini)");

    log("📡 POST /api/bia/report/" + reportId + "/analyze", "cyan");
    log("⏳ Analyse en cours (peut prendre 10-30s)...", "yellow");

    const startTime = Date.now();
    const analyzeResponse = await fetch(
      `${BASE_URL}/api/bia/report/${reportId}/analyze`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (!analyzeResponse.ok) {
      const error = await analyzeResponse.text();
      throw new Error(`Analyse échouée: ${error}`);
    }

    const analyzeResult = await analyzeResponse.json();

    if (!analyzeResult.success || !analyzeResult.data) {
      throw new Error(analyzeResult.error || "Analyse échouée");
    }

    log(`✅ Analyse terminée en ${duration}s`, "green");

    const analysis = analyzeResult.data.analysis;

    // Afficher les résultats
    log("\n📊 RÉSULTATS DE L'ANALYSE:", "bright");

    console.log("\n  📝 Résumé:");
    console.log("     " + (analysis.resume || "N/A").substring(0, 120) + "...");

    console.log("\n  📈 Métriques BIA:");
    console.log(`     • RTO: ${analysis.metrics?.rto || 0}h`);
    console.log(`     • MTPD: ${analysis.metrics?.mtpd || 0}h`);
    console.log(`     • MBCO: ${analysis.metrics?.mbco || 0}h`);
    console.log(`     • RPO: ${analysis.metrics?.rpo || 0}h`);

    console.log("\n  ⚠️  Criticité:");
    console.log(
      `     • Niveau: ${(analysis.criticality?.level || "N/A").toUpperCase()}`
    );
    console.log(`     • Score: ${analysis.criticality?.score || 0}/100`);
    console.log(
      `     • Justification: ${(
        analysis.criticality?.justification || "N/A"
      ).substring(0, 80)}...`
    );

    if (analysis.criticality?.processOwner) {
      console.log("\n  👤 Responsable du Processus:");
      console.log(`     • Nom: ${analysis.criticality.processOwner}`);
      console.log(`     • Rôle: ${analysis.criticality.ownerRole || "N/A"}`);
      console.log(
        `     • Contact: ${analysis.criticality.ownerContact || "N/A"}`
      );
    }

    if (analysis.criticality?.processes?.length > 0) {
      console.log("\n  📋 Processus identifiés:");
      analysis.criticality.processes.slice(0, 5).forEach((p, i) => {
        console.log(`     ${i + 1}. ${p}`);
      });
    }

    console.log("\n  🎯 Niveau de Continuité:");
    console.log(
      `     • Niveau: ${(
        analysis.continuityLevel?.level || "N/A"
      ).toUpperCase()}`
    );
    console.log(`     • Score: ${analysis.continuityLevel?.score || 0}/10`);
    console.log(
      `     • Description: ${(
        analysis.continuityLevel?.description || "N/A"
      ).substring(0, 80)}...`
    );

    if (analysis.impacts?.length > 0) {
      console.log("\n  💥 Impacts identifiés: " + analysis.impacts.length);
      analysis.impacts.slice(0, 3).forEach((impact, i) => {
        console.log(`     ${i + 1}. ${impact.type} (${impact.severity})`);
        console.log(`        ${impact.description.substring(0, 70)}...`);
      });
    }

    if (analysis.dependencies?.length > 0) {
      console.log(
        "\n  🔗 Dépendances critiques: " + analysis.dependencies.length
      );
      analysis.dependencies.slice(0, 3).forEach((dep, i) => {
        console.log(
          `     ${i + 1}. ${dep.name} (${dep.type} - ${dep.criticality})`
        );
      });
    }

    if (analysis.spof?.length > 0) {
      console.log(
        "\n  🚨 SPOF (Points de défaillance): " + analysis.spof.length
      );
      analysis.spof.forEach((spof, i) => {
        console.log(
          `     ${i + 1}. ${
            spof.name
          } - Risque: ${spof.riskLevel.toUpperCase()}`
        );
        console.log(`        Impact: ${spof.impact.substring(0, 60)}...`);
      });
    }

    if (analysis.continuityLevel?.recommendations?.length > 0) {
      console.log(
        "\n  💡 Recommandations: " +
          analysis.continuityLevel.recommendations.length
      );
      analysis.continuityLevel.recommendations.slice(0, 3).forEach((rec, i) => {
        console.log(`     ${i + 1}. ${rec}`);
      });
    }

    console.log(`\n  📊 Confiance de l'analyse: ${analysis.confidence}%`);

    // ÉTAPE 4: Sauvegarder l'analyse
    section("💾 ÉTAPE 4: Sauvegarde de l'analyse");

    log("📡 POST /api/bia/reports/" + reportId + "/analysis", "cyan");

    const saveResponse = await fetch(
      `${BASE_URL}/api/bia/reports/${reportId}/analysis`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysis),
      }
    );

    if (!saveResponse.ok) {
      const error = await saveResponse.text();
      throw new Error(`Sauvegarde échouée: ${error}`);
    }

    const saveResult = await saveResponse.json();

    if (saveResult.success) {
      log("✅ Analyse sauvegardée avec succès!", "green");
      log(`   Message: ${saveResult.message}`, "cyan");
    } else {
      throw new Error(saveResult.error || "Sauvegarde échouée");
    }

    // ÉTAPE 5: Récupérer l'analyse sauvegardée
    section("📥 ÉTAPE 5: Vérification de la sauvegarde");

    log("📡 GET /api/bia/reports/" + reportId + "/analysis", "cyan");

    const getResponse = await fetch(
      `${BASE_URL}/api/bia/reports/${reportId}/analysis`
    );

    if (!getResponse.ok) {
      throw new Error(`Récupération échouée (HTTP ${getResponse.status})`);
    }

    const savedAnalysis = await getResponse.json();

    log("✅ Analyse récupérée avec succès!", "green");
    log(`   Métriques RTO: ${savedAnalysis.metrics?.rto}h`, "cyan");
    log(`   Criticité: ${savedAnalysis.criticality?.level}`, "cyan");
    log(`   Confiance: ${savedAnalysis.confidence}%`, "cyan");

    // Vérification de cohérence
    const isConsistent =
      savedAnalysis.metrics?.rto === analysis.metrics?.rto &&
      savedAnalysis.criticality?.level === analysis.criticality?.level;

    if (isConsistent) {
      log("\n✅ Les données sont cohérentes!", "green");
    } else {
      log("\n⚠️  Attention: Incohérence détectée!", "yellow");
    }

    // RÉSUMÉ FINAL
    section("✅ TEST TERMINÉ AVEC SUCCÈS");

    log("\n📊 Résumé du test:", "cyan");
    log(`   • Rapport ID: ${reportId}`, "cyan");
    log(`   • Durée analyse IA: ${duration}s`, "cyan");
    log(`   • Impacts identifiés: ${analysis.impacts?.length || 0}`, "cyan");
    log(`   • Dépendances: ${analysis.dependencies?.length || 0}`, "cyan");
    log(`   • SPOF: ${analysis.spof?.length || 0}`, "cyan");
    log(`   • Confiance: ${analysis.confidence}%`, "cyan");

    log("\n🎉 Tous les tests ont réussi!", "green");
  } catch (error) {
    log("\n❌ ERREUR LORS DU TEST", "red");
    console.error("\n  ", error.message);

    if (error.stack) {
      log("\n📋 Stack trace:", "yellow");
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// Exécution
testCompleteFlow();
