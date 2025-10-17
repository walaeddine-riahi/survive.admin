import fs from "fs";
import { marked } from "marked";
import puppeteer from "puppeteer";

// Fonction pour convertir les images en base64
function embedImages(html) {
  const screenshotsDir = "./public/screenshots/";

  // Remplacer toutes les références d'images par des données base64
  return html.replace(
    /src="\.\/public\/screenshots\/(SCREENSHOT-[^"]+)"/g,
    (match, filename) => {
      try {
        const imagePath = screenshotsDir + filename;
        if (fs.existsSync(imagePath)) {
          const imageBuffer = fs.readFileSync(imagePath);
          const base64Image = imageBuffer.toString("base64");
          const extension = filename.split(".").pop().toLowerCase();
          let mimeType = "image/jpeg";

          if (extension === "png") mimeType = "image/png";
          else if (extension === "jpg" || extension === "jpeg")
            mimeType = "image/jpeg";

          console.log(`  ✓ Image intégrée: ${filename}`);
          return `src="data:${mimeType};base64,${base64Image}"`;
        } else {
          console.warn(`  ⚠ Image non trouvée: ${filename}`);
          return match;
        }
      } catch (error) {
        console.error(`  ✗ Erreur avec l'image ${filename}:`, error.message);
        return match;
      }
    }
  );
}

async function convertMarkdownToPDF() {
  try {
    console.log("📖 Lecture du fichier Markdown...");
    const markdown = fs.readFileSync("GUIDE-SIMULATION-UTILISATEUR.md", "utf-8");

    console.log("🔄 Conversion du Markdown en HTML...");
    let html = marked.parse(markdown);

    console.log("🖼️  Intégration des screenshots...");
    html = embedImages(html);

    // Extraire le titre et créer une page de garde professionnelle
    const coverPage = `
    <div class="cover-page">
      <div class="cover-header">
        <div class="cover-logo">
          <div class="logo-icon">SURVIVE</div>
        </div>
      </div>
      <div class="cover-content">
        <h1 class="cover-title">Guide Utilisateur</h1>
        <h2 class="cover-subtitle">S.U.R.V.I.V.E.</h2>
        <h3 class="cover-brand">Resilience</h3>
        <p class="cover-acronym">Sustainability • Unity • Resilience • Vision<br>Innovation • Versatility • Efficiency</p>
        <p class="cover-description">Plateforme de Gestion de la Continuité d'Activité<br>et de Simulation de Crise</p>
        <div class="cover-divider"></div>
        <p class="cover-motto">"When the going gets tough, the tough get going"</p>
        <div class="cover-version">
          <p><strong>Version 1.0</strong></p>
          <p>Mars 2025</p>
        </div>
      </div>
      <div class="cover-footer">
        <p>Document confidentiel - Usage interne uniquement</p>
        <p>© 2025 S.U.R.V.I.V.E. Resilience. Tous droits réservés.</p>
      </div>
    </div>
    <div style="page-break-after: always;"></div>
    `;

    // Template HTML avec styles pour un PDF professionnel
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Guide Utilisateur S.U.R.V.I.V.E. Resilience</title>
  <style>
    @page {
      size: A4;
      margin: 2cm 1.5cm;
    }
    
    /* PAGE DE GARDE */
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: linear-gradient(135deg, #008080 0%, #005555 100%);
      color: white;
      padding: 0;
      margin: -2cm -1.5cm;
      page-break-after: always;
    }
    
    .cover-header {
      padding: 40px;
      text-align: center;
    }
    
    .cover-logo {
      display: inline-block;
    }
    
    .logo-icon {
      background: white;
      color: #008080;
      width: 140px;
      height: 140px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: bold;
      margin: 0 auto;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      letter-spacing: 1px;
    }
    
    .cover-content {
      text-align: center;
      padding: 0 60px;
    }
    
    .cover-title {
      font-size: 56px;
      font-weight: 300;
      margin: 0 0 10px 0;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: white;
      border: none;
      padding: 0;
    }
    
    .cover-subtitle {
      font-size: 64px;
      font-weight: bold;
      margin: 0 0 10px 0;
      color: white;
      border: none;
      padding: 0;
      letter-spacing: 8px;
    }
    
    .cover-brand {
      font-size: 42px;
      font-weight: 300;
      font-style: italic;
      margin: 0 0 25px 0;
      color: rgba(255,255,255,0.95);
      border: none;
      padding: 0;
      letter-spacing: 3px;
    }
    
    .cover-acronym {
      font-size: 16px;
      color: rgba(255,255,255,0.85);
      margin: 20px 0;
      line-height: 1.8;
      font-weight: 400;
      letter-spacing: 1px;
    }
    
    .cover-description {
      font-size: 20px;
      line-height: 1.8;
      color: rgba(255,255,255,0.9);
      margin: 30px 0;
    }
    
    .cover-divider {
      width: 100px;
      height: 3px;
      background: white;
      margin: 30px auto;
    }
    
    .cover-motto {
      font-size: 18px;
      font-style: italic;
      color: rgba(255,255,255,0.9);
      margin: 20px 0;
      font-weight: 300;
      letter-spacing: 0.5px;
    }
    
    .cover-version {
      font-size: 18px;
      color: rgba(255,255,255,0.95);
    }
    
    .cover-version p {
      margin: 5px 0;
    }
    
    .cover-footer {
      text-align: center;
      padding: 40px;
      font-size: 12px;
      color: rgba(255,255,255,0.7);
      border-top: 1px solid rgba(255,255,255,0.2);
    }
    
    .cover-footer p {
      margin: 5px 0;
    }
    
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.7;
      color: #2c3e50;
      max-width: 100%;
      margin: 0;
      padding: 0;
      font-size: 11pt;
    }
    
    h1 {
      color: #008080;
      font-size: 28px;
      font-weight: 600;
      margin-top: 50px;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 3px solid #008080;
      page-break-before: always;
      page-break-after: avoid;
      letter-spacing: 0.5px;
    }
    
    h1:first-of-type {
      page-break-before: avoid;
      text-align: center;
      font-size: 38px;
      margin-top: 0;
      background: linear-gradient(135deg, #008080 0%, #005555 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      border: none;
      margin-bottom: 40px;
      box-shadow: 0 5px 15px rgba(0,128,128,0.2);
    }
    
    h2 {
      color: #005555;
      font-size: 22px;
      font-weight: 600;
      margin-top: 35px;
      margin-bottom: 18px;
      padding-left: 20px;
      border-left: 5px solid #008080;
      background: linear-gradient(to right, rgba(0,128,128,0.05), transparent);
      padding: 12px 20px;
      page-break-after: avoid;
    }
    
    h3 {
      color: #006666;
      font-size: 18px;
      font-weight: 600;
      margin-top: 28px;
      margin-bottom: 14px;
      page-break-after: avoid;
    }
    
    h4 {
      color: #007777;
      font-size: 16px;
      font-weight: 600;
      margin-top: 22px;
      margin-bottom: 12px;
      page-break-after: avoid;
    }
    
    p {
      margin-bottom: 14px;
      text-align: justify;
      line-height: 1.8;
    }
    
    ul, ol {
      margin-bottom: 18px;
      padding-left: 35px;
      line-height: 1.8;
    }
    
    li {
      margin-bottom: 10px;
    }
    
    code {
      background: linear-gradient(to bottom, #f8f9fa, #f1f3f5);
      padding: 3px 8px;
      border-radius: 4px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      color: #c7254e;
      border: 1px solid #e1e8ed;
      font-weight: 500;
    }
    
    pre {
      background: linear-gradient(to bottom, #f8f9fa, #f1f3f5);
      border: 1px solid #dee2e6;
      border-left: 4px solid #008080;
      border-radius: 6px;
      padding: 18px;
      overflow-x: auto;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    
    pre code {
      background: transparent;
      padding: 0;
      color: #2c3e50;
      border: none;
      font-weight: normal;
    }
    
    blockquote {
      border-left: 5px solid #008080;
      padding-left: 25px;
      margin-left: 0;
      margin-right: 0;
      color: #555;
      font-style: italic;
      background: linear-gradient(to right, rgba(0,128,128,0.08), transparent);
      padding: 15px 25px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 20px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.03);
    }
    
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 25px;
      font-size: 13px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.08);
      border-radius: 8px;
      overflow: hidden;
    }
    
    th {
      background: linear-gradient(135deg, #008080 0%, #006666 100%);
      color: white;
      padding: 14px 12px;
      text-align: left;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.5px;
    }
    
    td {
      border: 1px solid #e1e8ed;
      padding: 12px;
      background: white;
    }
    
    tr:nth-child(even) td {
      background-color: #f8f9fa;
    }
    
    tr:hover td {
      background-color: #e8f5f5;
      transition: background-color 0.2s ease;
    }
    
    a {
      color: #008080;
      text-decoration: none;
      font-weight: 500;
      border-bottom: 1px dotted #008080;
    }
    
    a:hover {
      color: #005555;
      border-bottom: 1px solid #005555;
    }
    
    img {
      max-width: 85%;
      height: auto;
      display: block;
      margin: 30px auto;
      border: 3px solid #008080;
      border-radius: 10px;
      box-shadow: 0 8px 20px rgba(0,128,128,0.2);
      page-break-inside: avoid;
    }
    
    /* Style pour les légendes d'images */
    img + blockquote {
      text-align: center;
      font-size: 11px;
      margin-top: -15px;
      margin-bottom: 35px;
      background: linear-gradient(to right, rgba(0,128,128,0.1), rgba(0,128,128,0.05));
      border-left: 4px solid #008080;
      font-style: normal;
      color: #555;
      font-weight: 500;
      padding: 10px 20px;
    }
    
    hr {
      border: none;
      height: 2px;
      background: linear-gradient(to right, transparent, #008080, transparent);
      margin: 40px 0;
    }
    
    .page-break {
      page-break-after: always;
    }
    
    /* Styles pour les badges/étiquettes */
    strong {
      color: #008080;
      font-weight: 600;
    }
    
    /* Style pour les notes d'avertissement et info boxes */
    blockquote p:first-child strong {
      color: #008080;
      font-size: 14px;
      display: block;
      margin-bottom: 5px;
    }
    
    /* Emojis styling */
    blockquote:has(> p:first-child:contains("📸")),
    blockquote:has(> p:first-child:contains("⚠️")),
    blockquote:has(> p:first-child:contains("💡")),
    blockquote:has(> p:first-child:contains("📧")),
    blockquote:has(> p:first-child:contains("📞")) {
      background: linear-gradient(to right, rgba(0,128,128,0.1), rgba(0,128,128,0.02));
      border-left: 5px solid #008080;
      padding: 15px 25px;
    }
    
    /* Footer styling */
    footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 2px solid #008080;
      text-align: center;
      color: #666;
      font-size: 11px;
    }
    
    footer p {
      margin: 8px 0;
    }
    
    /* Table of contents styling */
    nav ul {
      list-style: none;
      padding-left: 0;
    }
    
    nav ul li {
      margin-bottom: 12px;
      padding-left: 20px;
      position: relative;
    }
    
    nav ul li:before {
      content: "▸";
      position: absolute;
      left: 0;
      color: #008080;
      font-weight: bold;
    }
  </style>
</head>
<body>
  ${coverPage}
  ${html}
  
  <hr>
  <footer>
    <div style="background: linear-gradient(135deg, rgba(0,128,128,0.1), rgba(0,128,128,0.05)); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
      <p style="font-size: 13px; color: #008080; font-weight: 600; margin-bottom: 10px;">📧 Support et Contact</p>
      <p style="margin: 5px 0;">Email : support@survive-resilience.com</p>
      <p style="margin: 5px 0;">Téléphone : +33 (0)1 XX XX XX XX</p>
    </div>
    <p style="font-style: italic; color: #888;">Guide utilisateur S.U.R.V.I.V.E. Resilience - Version 1.0 - Dernière mise à jour : Mars 2025</p>
    <p style="font-weight: 600; color: #008080;">© 2025 S.U.R.V.I.V.E. Resilience. Tous droits réservés.</p>
  </footer>
</body>
</html>
    `;

    console.log("🚀 Lancement du navigateur...");
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    console.log("📄 Génération du PDF...");
    await page.setContent(htmlTemplate, {
      waitUntil: "networkidle0",
    });

    await page.pdf({
      path: "GUIDE-SIMULATION-UTILISATEUR.pdf",
      format: "A4",
      printBackground: true,
      margin: {
        top: "2cm",
        right: "1.5cm",
        bottom: "2cm",
        left: "1.5cm",
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 9px; text-align: center; width: 100%; color: #888; padding-top: 10px; border-bottom: 1px solid #e1e8ed;">
          <span style="color: #008080; font-weight: 600;">S.U.R.V.I.V.E. Resilience</span> - Guide Utilisateur
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 9px; width: 100%; padding: 0 1.5cm; display: flex; justify-content: space-between; color: #888; border-top: 1px solid #e1e8ed; padding-top: 8px;">
          <span style="color: #008080;">© 2025 S.U.R.V.I.V.E. Resilience</span>
          <span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
        </div>
      `,
    });

    await browser.close();

    console.log("✅ PDF généré avec succès : GUIDE-SIMULATION-UTILISATEUR.pdf");
    console.log(
      "📊 Taille du fichier :",
      (fs.statSync("GUIDE-SIMULATION-UTILISATEUR.pdf").size / 1024 / 1024).toFixed(2),
      "MB"
    );
  } catch (error) {
    console.error("❌ Erreur lors de la conversion :", error);
    process.exit(1);
  }
}

convertMarkdownToPDF();
