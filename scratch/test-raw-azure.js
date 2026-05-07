const endpoint = "https://survive-openai.openai.azure.com/";
const apiKey = "7MK8FIGgJNCSV48Jqliml9dtoqs0cutq2b2e6lNpq0DhAXA238TsJQQJ99CAACfhMk5XJ3w3AAABACOGtcXO";

async function callGeminiFallback(systemPrompt, userPrompt) {
  const geminiKey = process.env.GEMINI_API_KEY || "AIzaSyB1LRhsvFGjlJbvtUJ7SxEgFZ1qAS0epI4";
  const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  
  console.log("⚠️ Fallback to Gemini 2.0 Flash...");
  
  const prompt = `${systemPrompt}\n\n${userPrompt}`;
  
  const response = await fetch(`${geminiUrl}?key=${geminiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini Fallback error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callAzureAI(systemPrompt, userPrompt) {
  const url = `${endpoint}openai/deployments/gpt-4o/chat/completions?api-version=2024-02-15-preview`;
  console.log("Trying Azure OpenAI url:", url);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey
      },
      signal: controller.signal,
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Azure AI error: ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("❌ Azure OpenAI request failed, trying Gemini fallback:", error.message || error);
    return await callGeminiFallback(systemPrompt, userPrompt);
  }
}

callAzureAI("Tu es un traducteur", "Dit 'Bonjour' en anglais.")
  .then(res => console.log("Success! Final result:\n", res))
  .catch(err => console.error("Ultimate failure:", err));
