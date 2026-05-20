import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function extractTextFromPDF(filePath) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const buffer = fs.readFileSync(filePath);
  const uint8Array = new Uint8Array(buffer);

  const loadingTask = pdfjs.getDocument({ data: uint8Array });
  const pdfDocument = await loadingTask.promise;

  let fullText = "";
  console.log(`  → Extracting ${pdfDocument.numPages} pages from ${path.basename(filePath)}...`);

  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
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
      console.log(`✅ Already extracted: ${txt} – skipping.`);
      continue;
    }

    try {
      console.log(`📖 Processing: ${pdf}`);
      const text = await extractTextFromPDF(pdfPath);
      fs.writeFileSync(txtPath, text, "utf-8");
      console.log(`✅ Saved ${txt}  (${text.length.toLocaleString()} chars)`);
    } catch (err) {
      console.error(`❌ Failed on ${pdf}:`, err.message);
    }
  }
}

main();
