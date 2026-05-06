
require('dotenv').config({ path: '.env' });
const { AzureOpenAI } = require('openai');

async function testSimulationAnalysis() {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";

  console.log("Testing Simulation Analysis (Azure OpenAI) with exact prompt...");
  
  if (!apiKey || !endpoint) {
    console.error("Missing credentials!");
    return;
  }

  const client = new AzureOpenAI({
    apiKey,
    endpoint,
    apiVersion: "2024-02-15-preview",
    deployment,
  });

  const reportData = {
    simulation: {
      title: "Cyberhorizon 2026",
      description: "Simulation d'attaque ransomware majeure.",
      duration: 5.5,
      status: "completed",
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
    },
    participants: {
      total: 12,
      users: [{ name: "Alice" }, { name: "Bob" }],
      teams: [{ name: "SOC" }, { name: "Management" }],
    },
    statistics: {
      totalInjections: 10,
      totalCommunications: 45,
      responseRate: 85,
      avgResponseTimeMinutes: 12.4,
      acknowledgmentRate: 90,
      acknowledgedInjections: 9,
    },
    communicationsByType: { "EMAIL": [], "SMS": [] },
    injectionsByType: { "MALWARE": [], "PHISHING": [] }
  };

  const prompt = `En tant qu'expert en gestion de crise et continuité d'activité, analyse cette simulation de crise et fournis un rapport détaillé en JSON.

DONNÉES DE LA SIMULATION:
- Titre: ${reportData.simulation.title}
- Statistiques: ${JSON.stringify(reportData.statistics)}

Format de réponse attendu (JSON uniquement):
{
  "score": <nombre>,
  "evaluation": "EXCELLENT|BON|MOYEN|INSUFFISANT",
  "resume": "string",
  "pointsForts": [],
  "pointsAmeliorer": [],
  "analyseCommunications": { "description": "string", "tauxReponse": "string", "tempsReponse": "string" },
  "analyseInjections": { "description": "string", "couverture": "string", "acknowledgment": "string" },
  "gestionTemps": { "description": "string", "efficacite": "string", "recommandations": "string" },
  "recommandations": [],
  "conclusion": "string"
}`;

  try {
    const completion = await client.chat.completions.create({
      model: deployment,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    const analysis = JSON.parse(content);
    console.log("Response received:");
    console.log(JSON.stringify(analysis, null, 2));
    
    if (analysis.score !== undefined && analysis.evaluation) {
      console.log("\nSuccess: Analysis structure is valid.");
    } else {
      console.error("\nFailure: Missing required fields.");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testSimulationAnalysis();
