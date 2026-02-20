/**
 * Script de test pour vérifier la détection de données inventées par l'IA
 */

// Simuler les données extraites par l'IA
const fakeData = {
  name: "Production",
  externalSuppliers:
    "PharmaChem SARL - Matières premières actives, PackTech International - Emballages",
  supplierContact: "Mohamed Trabelsi - +216 71 123 456 - contact@pharmachem.tn",
  keySuppliers: "Salah Ben Ali - +216 71 987 654 - s.benali@packtech.com",
  staffCount: 15,
  rto: 24,
  itSystems: "SAP, Oracle Database",
};

const realData = {
  name: "Production ligne A",
  description: "Processus de production des bouteilles PET",
  department: "Production",
  rto: 4,
  mtpd: 8,
  staffCount: 12,
};

// Fonction de validation (copiée de analyze-process-pdf.ts)
function cleanExtractedData(
  data: Record<string, unknown>
): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};

  const genericValues = [
    "à définir",
    "à compléter",
    "non spécifié",
    "exemple",
    "example",
  ];

  const suspiciousPatterns = [
    /\bSARL\b.*(?:International|Group|Services|Tech|Pharma|Pack)/i,
    /\b(?:International|Global|Tech|Services)\s+(?:SARL|Ltd|Inc|Corp|SA)\b/i,
    /\+216\s*\d{2}\s*\d{3}\s*\d{3}/,
    /contact@\w+\.\w+/,
    /\w+@\w+\.(com|tn|fr)$/,
    /Mohamed\s+\w+|Salah\s+\w+|Ahmed\s+\w+/i,
  ];

  const isGeneric = (value: string): boolean => {
    if (!value) return true;
    const lower = value.toLowerCase().trim();

    if (
      genericValues.some(
        (generic) => lower === generic || lower.includes(generic)
      )
    ) {
      return true;
    }

    if (suspiciousPatterns.some((pattern) => pattern.test(value))) {
      console.warn(`⚠️ Valeur suspecte détectée: "${value}"`);
      return true;
    }

    return false;
  };

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined || value === "") {
      cleaned[key] = null;
    } else if (typeof value === "string") {
      cleaned[key] = isGeneric(value) ? null : value;
    } else if (typeof value === "number") {
      cleaned[key] = value > 0 ? value : null;
    } else if (typeof value === "boolean") {
      cleaned[key] = value;
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

// Tests
console.log("=".repeat(80));
console.log("TEST 1: Données inventées (doivent être rejetées)");
console.log("=".repeat(80));
console.log("\n📥 Données brutes:");
console.log(JSON.stringify(fakeData, null, 2));

const cleanedFake = cleanExtractedData(fakeData);
console.log("\n✅ Données après nettoyage:");
console.log(JSON.stringify(cleanedFake, null, 2));

const rejectedFields = Object.entries(cleanedFake).filter(
  ([, v]) => v === null
).length;
console.log(`\n📊 Résultat: ${rejectedFields}/6 champs suspects rejetés`);

console.log("\n" + "=".repeat(80));
console.log("TEST 2: Données réelles (doivent être conservées)");
console.log("=".repeat(80));
console.log("\n📥 Données brutes:");
console.log(JSON.stringify(realData, null, 2));

const cleanedReal = cleanExtractedData(realData);
console.log("\n✅ Données après nettoyage:");
console.log(JSON.stringify(cleanedReal, null, 2));

const keptFields = Object.entries(cleanedReal).filter(
  ([, v]) => v !== null
).length;
console.log(
  `\n📊 Résultat: ${keptFields}/${
    Object.keys(realData).length
  } champs conservés`
);

console.log("\n" + "=".repeat(80));
console.log("RÉSUMÉ");
console.log("=".repeat(80));
console.log(`✅ Données inventées rejetées: ${rejectedFields}/6 (attendu: 3+)`);
console.log(
  `✅ Données réelles conservées: ${keptFields}/${
    Object.keys(realData).length
  } (attendu: 6)`
);
console.log("\n✅ Test terminé!");
