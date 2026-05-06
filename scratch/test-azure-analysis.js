
require('dotenv').config({ path: '.env' });
const { AzureOpenAI } = require('openai');

async function testAzureAnalysis() {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";

  console.log("Testing Azure OpenAI Analysis...");
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Deployment: ${deployment}`);

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

  const processData = {
    name: "Système de Paiement Critique",
    department: "Finance",
    location: "Tunis",
    description: "Traitement des transactions bancaires en temps réel.",
    criticality: "critical",
    rto: 4,
    rpo: 1,
    mtpd: 12
  };

  const prompt = `Génère une analyse d'impact métier (BIA) pour le processus suivant en JSON:
  Nom: ${processData.name}
  Département: ${processData.department}
  RTO: ${processData.rto}h
  
  Format: { "summary": "...", "riskLevel": "high/medium/low", "recommendations": [] }`;

  try {
    const completion = await client.chat.completions.create({
      model: deployment,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    console.log("Response received:");
    console.log(completion.choices[0].message.content);
  } catch (error) {
    console.error("Analysis failed:", error.message);
  }
}

testAzureAnalysis();
