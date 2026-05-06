
const id = "69ce773da48b9b0f6335c78f"; // ID from the browser session
const data = {
  id: id,
  name: "Contrôle Qualité et Conformité (Test Update)",
  criticality: "medium", // lowercase
  rto: 4,
  mtpd: 12,
  rpo: 0,
  mbco: "Normal",
  department: "Production",
  location: "Site A"
};

fetch("http://localhost:3000/api/bia/processes", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
})
.then(async res => {
  console.log("Status:", res.status);
  const json = await res.json();
  console.log("Response:", json);
})
.catch(err => console.error("Error:", err));
