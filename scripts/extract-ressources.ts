import fs from "fs";
import path from "path";

async function extractTextFromPDF(filePath: string): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const buffer = fs.readFileSync(filePath);
  const uint8Array = new Uint8Array(buffer);
  
  const loadingTask = pdfjs.getDocument({ data: uint8Array });
  const pdfDocument = await loadingTask.promise;
  
  let fullText = "";
  console.log(`Extracting ${pdfDocument.numPages} pages from ${path.basename(filePath)}...`);
  
  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");
    
    fullText += `\n--- PAGE ${pageNum} ---\n${pageText}\n`;
  }
  
  return fullText.trim();
}

async function main() {
  const srcDir = "C:\\Users\\Raouf\\Desktop\\survive.admin\\ressources";
  const pcaPath = path.join(srcDir, "PCA SBC_version finale.pdf");
  const pguiPath = path.join(srcDir, "PGUI-SBC-V1.0 .pdf");
  
  try {
    if (fs.existsSync(pcaPath)) {
      const pcaText = await extractTextFromPDF(pcaPath);
      fs.writeFileSync(path.join(srcDir, "extracted_pca.txt"), pcaText, "utf-8");
      console.log(`Successfully saved PCA text (${pcaText.length} characters)`);
    } else {
      console.log("PCA PDF not found");
    }
    
    if (fs.existsSync(pguiPath)) {
      const pguiText = await extractTextFromPDF(pguiPath);
      fs.writeFileSync(path.join(srcDir, "extracted_pgui.txt"), pguiText, "utf-8");
      console.log(`Successfully saved PGUI text (${pguiText.length} characters)`);
    } else {
      console.log("PGUI PDF not found");
    }
  } catch (error) {
    console.error("Error during extraction:", error);
  }
}

main();
