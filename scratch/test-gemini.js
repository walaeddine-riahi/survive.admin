async function listModels() {
  const GEMINI_API_KEY = "AIzaSyB1LRhsvFGjlJbvtUJ7SxEgFZ1qAS0epI4";
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Status:", res.status);
    if (res.ok) {
      console.log("Models:", data.models.map(m => m.name));
    } else {
      console.log("Error:", data);
    }
  } catch (e) {
    console.error(e);
  }
}
listModels();
