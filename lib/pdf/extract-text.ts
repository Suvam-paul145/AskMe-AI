// ===========================================
// AskMe AI — PDF Text Extraction
// ===========================================

/**
 * Extract text content from a PDF file buffer
 * Uses pdf-parse v2 for reliable text extraction
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Dynamic import to handle pdf-parse v2 ESM module
  const { PDFParse } = await import("pdf-parse");
  
  // pdf-parse v2 requires Uint8Array, not Buffer
  const uint8 = new Uint8Array(buffer);
  const pdfParser = new PDFParse(uint8) as any;
  await pdfParser.load();
  
  // Get total pages from info
  const info = pdfParser.getInfo();
  const totalPages = info?.numPages || info?.Pages || 1;
  
  // Collect text from all pages
  const textParts: string[] = [];
  for (let i = 1; i <= totalPages; i++) {
    try {
      const pageText = pdfParser.getPageText(i);
      if (pageText) textParts.push(pageText);
    } catch {
      // Skip pages that fail to parse
    }
  }
  
  // Fallback: try getText() if page-by-page didn't work
  if (textParts.length === 0) {
    try {
      const allText = pdfParser.getText();
      if (allText) return allText;
    } catch {
      // Fall through
    }
  }
  
  return textParts.join("\n\n") || "";
}

/**
 * Extract text from a plain text file buffer
 */
export function extractTextFromTXT(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

/**
 * Extract text from a file based on its MIME type
 */
export async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    return extractTextFromPDF(buffer);
  } else if (mimeType === "text/plain") {
    return extractTextFromTXT(buffer);
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}
