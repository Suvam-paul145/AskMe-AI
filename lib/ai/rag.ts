// ===========================================
// AskMe AI — RAG Pipeline
// ===========================================
import { generateEmbedding, generateEmbeddingsBatch } from "./gemini";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Split text into overlapping chunks for vector search
 * Uses a sliding window with overlap to preserve context at boundaries
 */
export function chunkText(
  text: string,
  chunkSize: number = 600,
  overlap: number = 120
): string[] {
  const chunks: string[] = [];
  
  // Normalize horizontal spaces and tabs, but strictly preserve line breaks
  const cleanText = text.replace(/[ \t]+/g, " ").replace(/\r\n/g, "\n").trim();

  if (cleanText.length <= chunkSize) {
    return [cleanText];
  }

  let start = 0;
  while (start < cleanText.length) {
    let end = start + chunkSize;

    // Try to break at paragraph boundary (\n\n) or sentence boundary (\n or .)
    if (end < cleanText.length) {
      const lastParagraph = cleanText.lastIndexOf("\n\n", end);
      const lastNewline = cleanText.lastIndexOf("\n", end);
      const lastPeriod = cleanText.lastIndexOf(".", end);
      
      let breakPoint = -1;
      if (lastParagraph > start + chunkSize * 0.4) {
        breakPoint = lastParagraph + 2; // Break at paragraph end
      } else if (lastNewline > start + chunkSize * 0.5) {
        breakPoint = lastNewline + 1; // Break at newline
      } else if (lastPeriod > start + chunkSize * 0.5) {
        breakPoint = lastPeriod + 1; // Break at sentence end
      }

      if (breakPoint > start) {
        end = breakPoint;
      }
    }

    const chunk = cleanText.slice(start, end).trim();
    if (chunk.length > 25) {
      chunks.push(chunk);
    }

    start = end - overlap;
    if (start >= cleanText.length) break;
    if (start < 0 || end <= start) {
      start = end;
    }
  }

  return chunks;
}

/**
 * Generate embeddings for text chunks and store them in Supabase pgvector
 */
export async function storeEmbeddings(
  chunks: string[],
  documentId: string,
  userId: string
): Promise<void> {
  const supabase = createAdminClient();

  // Process chunks in batches to avoid rate limits
  // batchSize of 40 is a great balance to fit within single requests
  const batchSize = 40;
  const promises: Promise<void>[] = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const batchIndex = i;

    promises.push(
      (async () => {
        // Call batch embedding API
        const embeddings = await generateEmbeddingsBatch(batch);

        const rows = batch.map((chunk, idx) => ({
          document_id: documentId,
          user_id: userId,
          chunk_index: batchIndex + idx,
          content: chunk,
          embedding: JSON.stringify(embeddings[idx]),
          metadata: {
            chunk_index: batchIndex + idx,
            char_count: chunk.length,
          },
        }));

        const { error } = await supabase.from("document_chunks").insert(rows);

        if (error) {
          console.error("Error storing embeddings batch:", error);
          throw new Error(`Failed to store embeddings: ${error.message}`);
        }
      })()
    );
  }

  // Await all parallel embedding batch uploads
  await Promise.all(promises);
}

/**
 * Retrieve the most relevant document chunks for a query using vector similarity.
 * Supports querying across a single document, multiple documents, or all documents.
 */
export async function retrieveRelevantChunks(
  query: string,
  documentId: string | string[] | null,
  userId: string,
  matchCount: number = 5
): Promise<{ id: string; document_id: string; content: string; metadata: Record<string, unknown>; similarity: number }[]> {
  const supabase = createAdminClient();
  const queryEmbedding = await generateEmbedding(query);

  // Case 1: Multiple specific documents are requested
  if (Array.isArray(documentId)) {
    if (documentId.length === 0) return [];

    try {
      const promises = documentId.map(async (docId) => {
        const { data, error } = await supabase.rpc("match_document_chunks", {
          query_embedding: JSON.stringify(queryEmbedding),
          match_count: matchCount,
          filter_document_id: docId,
          filter_user_id: userId,
        });

        if (error) {
          console.error(`Error retrieving chunks for document ${docId}:`, error);
          return [];
        }
        return data || [];
      });

      const results = await Promise.all(promises);
      const allChunks = results.flat();
      
      // Sort combined chunks by similarity descending, then take the top matchCount
      allChunks.sort((a, b) => b.similarity - a.similarity);
      return allChunks.slice(0, matchCount);
    } catch (err) {
      console.error("Error in multi-document chunk retrieval:", err);
      return [];
    }
  }

  // Case 2: Single document (or null for all documents)
  const { data, error } = await supabase.rpc("match_document_chunks", {
    query_embedding: JSON.stringify(queryEmbedding),
    match_count: matchCount,
    filter_document_id: documentId,
    filter_user_id: userId,
  });

  if (error) {
    console.error("Error retrieving chunks:", error);
    return [];
  }

  return data || [];
}
