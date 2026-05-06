const { jsPDF } = require("jspdf");
const fs = require("fs");

const doc = new jsPDF();

const content = `
BUSINESS IMPACT ANALYSIS (BIA) - TEST DOCUMENT
==============================================

PROCESSUS : Maintenance des Infrastructure IT
DEPARTEMENT : Support Technique
LOCALISATION : Data Center - Salle 4B
RESPONSABLE : Jean Dupont
ROLE : Responsable Infrastructure
EMAIL : j.dupont@survive-admin.tn
TELEPHONE : +216 71 123 456

DESCRIPTION :
Ce processus assure la maintenance préventive et curative des serveurs critiques 
de l'entreprise, incluant les mises à jour de sécurité et la gestion du matériel.

IMPACT :
Une interruption prolongée entraîne l'arrêt total des services numériques internes.
L'impact financier est estimé à 10 000 TND par heure d'arrêt.
L'impact sur la réputation est élevé en cas de fuite de données.

METRIQUES :
CRITICITE : CRITICAL
RTO : 2 heures
MTPD : 6 heures
RPO : 1 heure (Sauvegardes horaires)

MBCO (Minimum Business Continuity Objective) :
Disponibilité de 50% des serveurs cœurs pour maintenir les fonctions vitales.

RESSOURCES CRITIQUES :
- Systèmes IT : Cluster VMware, Baie de stockage NetApp, commutateurs Cisco.
- Personnel : 2 ingénieurs système, 1 technicien réseau.
- Equipement : Consoles KVM, Outillage réseau.

FOURNISSEURS CLES :
- Dell Technologies (SLA 4h)
- Microsoft (Licences et Support)
- Cisco (Réseau)
`;

doc.text(content, 10, 10);
const pdfData = doc.output();
fs.writeFileSync("test-bia-process.pdf", Buffer.from(pdfData, "binary"));

console.log("✅ PDF de test créé avec succès : test-bia-process.pdf");
