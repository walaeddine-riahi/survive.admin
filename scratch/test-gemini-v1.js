
async function testGemini() {
  const GEMINI_API_KEY = "AIzaSyB1LRhsvFGjlJbvtUJ7SxEgFZ1qAS0epI4";
  const model = "gemini-1.5-flash";
  const URL = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  console.log(`Testing with model: ${model} on v1`);
  
  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Bonjour !" }] }]
      })
    });

    const data = await response.json();
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(data, null, 2));

  } catch (error) {
    console.error("Fetch error:", error);
  }
}

testGemini();
