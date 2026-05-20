// CJS script – works with pdfjs-dist v3 build
const fs = require("fs");
const path = require("path");

async function extractTextFromPDF(filePath) {
  // pdfjs-dist v3 CJS entry point
  const pdfjs = require("pdfjs-dist/build/pdf.js");
  // Disable worker for Node
  pdfjs.GlobalWorkerOptions.workerSrc = "";

  const buffer = fs.readFileSync(filePath);
  const uint8Array = new Uint8Array(buffer);

  const loadingTask = pdfjs.getDocument({ data: uint8Array, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true });
  const pdfDocument = await loadingTask.promise;

  let fullText = "";
  console.log(`  → ${pdfDocument.numPages} pages in ${path.basename(filePath)}`);

  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => (item.str ? item.str : ""))
      .join(" ");
    fullText += `\n--- PAGE ${pageNum} ---\n${pageText}\n`;
  }

  return fullText.trim();
}

async function main() {
  const srcDir = path.join(__dirname, "..", "ressources");
  const files = [
    { pdf: "PCA SBC_version finale.pdf", txt: "extracted_pca.txt" },
    { pdf: "PGUI-SBC-V1.0 .pdf",         txt: "extracted_pgui.txt" },
  ];

  for (const { pdf, txt } of files) {
    const pdfPath = path.join(srcDir, pdf);
    const txtPath = path.join(srcDir, txt);

    if (!fs.existsSync(pdfPath)) {
      console.warn(`⚠  Not found: ${pdf}`);
      continue;
    }

    if (fs.existsSync(txtPath)) {
      const size = fs.statSync(txtPath).size;
      console.log(`✅ Already extracted: ${txt} (${(size/1024).toFixed(0)} KB) – skipping.`);
      continue;
    }

    try {
      console.log(`📖 Processing: ${pdf}`);
      const text = await extractTextFromPDF(pdfPath);
      fs.writeFileSync(txtPath, text, "utf-8");
      console.log(`✅ Saved ${txt}  (${(text.length/1000).toFixed(0)} K chars)`);
    } catch (err) {
      console.error(`❌ Failed on ${pdf}:`, err.message);
    }
  }
}

main().catch(console.error);
