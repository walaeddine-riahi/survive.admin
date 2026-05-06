
async function testGemini() {
  const GEMINI_API_KEY = "AIzaSyB1LRhsvFGjlJbvtUJ7SxEgFZ1qAS0epI4";
  const model = "gemini-1.5-flash"; // Try stable first
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  console.log(`Testing with model: ${model}`);
  
  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Coucou, es-tu là ?" }] }]
      })
    });

    const data = await response.json();
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(data, null, 2));

    // Now try gemini-2.0-flash
    const model2 = "gemini-2.0-flash";
    const URL2 = `https://generativelanguage.googleapis.com/v1beta/models/${model2}:generateContent?key=${GEMINI_API_KEY}`;
    console.log(`\nTesting with model: ${model2}`);
    
    const response2 = await fetch(URL2, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Bonjour !" }] }]
      })
    });
    
    const data2 = await response2.json();
    console.log("Response 2 status:", response2.status);
    console.log("Response 2 data:", JSON.stringify(data2, null, 2));

  } catch (error) {
    console.error("Fetch error:", error);
  }
}

testGemini();
