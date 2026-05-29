// ===========================================
// AskMe AI — PDF Text Extraction
// ===========================================

/**
 * Extract text content from a PDF file buffer
 * Uses pdf-parse v2 for reliable text extraction
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Import the worker first to set up the necessary DOMMatrix polyfills
    await import("pdf-parse/worker");
  } catch (err) {
    console.warn("Failed to load pdf-parse/worker, falling back to manual DOMMatrix polyfill:", err);
  }

  // Double check and manually polyfill DOMMatrix if still not defined
  if (typeof global !== "undefined" && !("DOMMatrix" in global)) {
    (global as unknown as Record<string, unknown>).DOMMatrix = class DOMMatrix {
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
      constructor() {}
      toString() { return "matrix(1, 0, 0, 1, 0, 0)"; }
    };
  }

  // Dynamic import to handle pdf-parse v2 ESM module
  const { PDFParse } = await import("pdf-parse");
  
  // pdf-parse v2 requires Uint8Array, not Buffer
  const uint8 = new Uint8Array(buffer);
  const pdfParser = new PDFParse({ data: uint8 });
  
  try {
    const textResult = await pdfParser.getText();
    return textResult.text || "";
  } catch (error) {
    console.error("Error parsing PDF text:", error);
    return "";
  }
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
  } else if (mimeType.startsWith("image/")) {
    const { describeImage } = await import("@/lib/ai/gemini");
    return await describeImage(buffer, mimeType);
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}
