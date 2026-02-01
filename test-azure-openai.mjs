import OpenAI from "openai";
import * as dotenv from "dotenv";

dotenv.config();

async function testAzureOpenAI() {
  console.log("🧪 Testing Azure OpenAI connection...\n");

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

  console.log("📋 Configuration:");
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   Deployment: ${deployment}`);
  console.log(`   API Key: ${apiKey ? "✓ Present" : "✗ Missing"}\n`);

  if (!endpoint || !apiKey || !deployment) {
    console.error("❌ Missing required environment variables!");
    process.exit(1);
  }

  try {
    const baseEndpoint = endpoint.replace(/\/$/, "");
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: `${baseEndpoint}/openai/deployments/${deployment}`,
      defaultQuery: { "api-version": "2024-02-15-preview" },
      defaultHeaders: { "api-key": apiKey },
      timeout: 30000,
    });

    console.log("🚀 Sending test request...");

    const result = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: "Say 'Hello from Azure OpenAI!' in French.",
        },
      ],
      max_tokens: 100,
    });

    console.log("\n✅ Success! Response received:");
    console.log("─".repeat(50));
    console.log(result.choices[0].message.content);
    console.log("─".repeat(50));
    console.log(`\n📊 Stats:`);
    console.log(`   Prompt tokens: ${result.usage.prompt_tokens}`);
    console.log(`   Completion tokens: ${result.usage.completion_tokens}`);
    console.log(`   Total tokens: ${result.usage.total_tokens}`);
    console.log(`   Model: ${result.model}`);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.code) console.error(`   Code: ${error.code}`);
    if (error.status) console.error(`   Status: ${error.status}`);
    process.exit(1);
  }
}

testAzureOpenAI();
