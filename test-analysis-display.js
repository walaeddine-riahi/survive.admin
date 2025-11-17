/**
 * Script de diagnostic pour vérifier pourquoi l'analyse ne s'affiche pas
 */

const BASE_URL = "http://localhost:3001";

async function diagnose(reportId) {
  console.log("\n🔍 DIAGNOSTIC - Affichage de l'analyse");
  console.log("=".repeat(60));
  console.log("ID du rapport:", reportId);
  console.log("");

  try {
    // 1. Vérifier que le rapport existe
    console.log("📋 Étape 1: Vérification du rapport");
    const reportResponse = await fetch(
      `${BASE_URL}/api/bia/report/${reportId}`
    );
    console.log("   Status:", reportResponse.status, reportResponse.statusText);

    if (!reportResponse.ok) {
      console.error("   ❌ Rapport non trouvé!");
      return;
    }

    const report = await reportResponse.json();
    console.log("   ✅ Rapport:", report.success ? report.data.name : "N/A");

    // 2. Vérifier l'analyse sauvegardée
    console.log("\n📊 Étape 2: Vérification de l'analyse sauvegardée");
    const analysisResponse = await fetch(
      `${BASE_URL}/api/bia/reports/${reportId}/analysis`
    );
    console.log(
      "   Status:",
      analysisResponse.status,
      analysisResponse.statusText
    );

    if (analysisResponse.status === 404) {
      console.log(
        "   ℹ️  Aucune analyse sauvegardée (normal si pas encore analysé)"
      );
      console.log("\n💡 Solution: Lancez une analyse depuis l'interface:");
      console.log(
        "   1. Allez sur http://localhost:3001/bia/reports/" + reportId
      );
      console.log(
        '   2. Cliquez sur "Lancer l\'analyse IA" ou "Lancer l\'analyse locale"'
      );
      console.log("   3. Attendez que l'analyse se termine");
      console.log("   4. L'analyse devrait s'afficher automatiquement");
      return;
    }

    if (!analysisResponse.ok) {
      console.error(
        "   ❌ Erreur lors de la récupération:",
        analysisResponse.status
      );
      const errorText = await analysisResponse.text();
      console.error("   Détails:", errorText);
      return;
    }

    const analysis = await analysisResponse.json();
    console.log("   ✅ Analyse trouvée!");

    // 3. Vérifier la structure de l'analyse
    console.log("\n🔬 Étape 3: Vérification de la structure");
    console.log("   Type:", typeof analysis);
    console.log(
      "   Est un objet:",
      typeof analysis === "object" && analysis !== null
    );

    if (typeof analysis === "object" && analysis !== null) {
      console.log("   Clés principales:", Object.keys(analysis).join(", "));

      // Vérifier les champs essentiels
      const essentialFields = [
        "impacts",
        "criticality",
        "metrics",
        "continuityLevel",
        "resume",
      ];
      const missingFields = essentialFields.filter((field) => !analysis[field]);

      if (missingFields.length > 0) {
        console.warn("   ⚠️  Champs manquants:", missingFields.join(", "));
      } else {
        console.log("   ✅ Tous les champs essentiels présents");
      }

      // Afficher un résumé
      console.log("\n📊 Résumé de l'analyse:");
      if (analysis.resume) {
        console.log("   Résumé:", analysis.resume.substring(0, 100) + "...");
      }
      if (analysis.metrics) {
        console.log("   Métriques:");
        console.log("     - RTO:", analysis.metrics.rto || "N/A");
        console.log("     - MTPD:", analysis.metrics.mtpd || "N/A");
        console.log("     - MBCO:", analysis.metrics.mbco || "N/A");
      }
      if (analysis.criticality) {
        console.log("   Criticité:");
        console.log("     - Niveau:", analysis.criticality.level || "N/A");
        console.log("     - Score:", analysis.criticality.score || "N/A");
      }
      if (analysis.impacts) {
        console.log("   Impacts:", analysis.impacts.length, "identifiés");
      }
      if (analysis.dependencies) {
        console.log(
          "   Dépendances:",
          analysis.dependencies.length,
          "identifiées"
        );
      }
      if (analysis.spof) {
        console.log("   SPOF:", analysis.spof.length, "identifiés");
      }
      console.log("   Confiance:", analysis.confidence || "N/A", "%");
    }

    // 4. Test de l'affichage
    console.log("\n🖥️  Étape 4: Vérification de l'affichage");
    console.log(
      "   URL de la page:",
      `http://localhost:3001/bia/reports/${reportId}`
    );
    console.log("\n   ✅ L'analyse devrait s'afficher sur cette page!");

    console.log("\n💡 Si l'analyse ne s'affiche toujours pas:");
    console.log("   1. Ouvrez la console du navigateur (F12)");
    console.log("   2. Rechargez la page");
    console.log('   3. Cherchez les logs commençant par "📥", "🔍", "✅"');
    console.log("   4. Vérifiez qu'il n'y a pas d'erreur JavaScript");

    console.log("\n" + "=".repeat(60));
    console.log("✅ DIAGNOSTIC TERMINÉ\n");
  } catch (error) {
    console.error("\n❌ ERREUR:", error.message);
    console.error("\nStack:", error.stack);
  }
}

// Récupérer l'ID depuis les arguments
const reportId = process.argv[2];

if (!reportId) {
  console.log("\n❌ Usage: node test-analysis-display.js <REPORT_ID>");
  console.log(
    "\nExemple: node test-analysis-display.js 6919b232bae6cd9e99373d6a"
  );
  console.log("\n💡 Pour obtenir un ID de rapport:");
  console.log("   1. Allez sur http://localhost:3001/bia/reports");
  console.log("   2. Cliquez sur un rapport");
  console.log("   3. Copiez l'ID depuis l'URL\n");
  process.exit(1);
}

diagnose(reportId);
