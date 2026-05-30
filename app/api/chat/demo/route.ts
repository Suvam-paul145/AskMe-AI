import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding, generateChatResponseStream, evaluateRTM } from "@/lib/ai/gemini";
import { DEMO_CHUNKS } from "@/lib/demo-data";

// In-memory cache for demo chunk embeddings to prevent API thrashing and rate limits
let cachedChunkEmbeddings: number[][] | null = null;

async function getDemoChunkEmbeddings(): Promise<number[][]> {
  if (cachedChunkEmbeddings) {
    return cachedChunkEmbeddings;
  }

  console.log("[Demo RAG] Generating in-memory embeddings for 8 gravitation chunks...");
  try {
    const promises = DEMO_CHUNKS.map((chunk) => generateEmbedding(chunk.content));
    cachedChunkEmbeddings = await Promise.all(promises);
    return cachedChunkEmbeddings;
  } catch (err) {
    console.error("[Demo RAG] Failed to generate gravitation embeddings:", err);
    // Return empty arrays as fallback
    return DEMO_CHUNKS.map(() => new Array(768).fill(0));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, mode, settings } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Generate embedding for query
    let queryVector: number[];
    try {
      queryVector = await generateEmbedding(message);
    } catch (err) {
      console.error("[Demo RAG] Failed to generate query embedding:", err);
      queryVector = new Array(768).fill(0);
    }

    // 2. Load chunk embeddings
    const chunkVectors = await getDemoChunkEmbeddings();

    // 3. Perform cosine similarity (dot product of L2 normalized vectors)
    const scoredChunks = DEMO_CHUNKS.map((chunk, idx) => {
      const vec = chunkVectors[idx] || [];
      const similarity = queryVector.reduce((sum, val, i) => sum + val * (vec[i] || 0), 0);
      return {
        content: chunk.content,
        topic: chunk.topic,
        similarity,
      };
    });

    // 4. Sort and filter chunks
    scoredChunks.sort((a, b) => b.similarity - a.similarity);
    const relevantChunks = scoredChunks.slice(0, 5);

    // 5. Generate source snippets
    const sources = relevantChunks
      .filter((c) => c.similarity > 0.25)
      .map((c) => `[Topic: ${c.topic}] ${c.content.slice(0, 100)}...`);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (mode === "rtm") {
            // Reverse Teacher Mode evaluation
            const evaluation = await evaluateRTM(
              message,
              relevantChunks.map((c) => ({ content: c.content }))
            );
            controller.enqueue(encoder.encode(JSON.stringify({ rtm: evaluation }) + "\n"));
          } else {
            // Regular RAG chat streaming
            controller.enqueue(encoder.encode(JSON.stringify({ sources }) + "\n"));

            if (relevantChunks.length === 0 || relevantChunks[0].similarity < 0.15) {
              const fallbackMsg = "I could not find enough matching material in the gravitation chapter to answer precisely. However, using my general knowledge: Newton's universal gravitational constant is G = 6.67 x 10^-11 N m^2/kg^2.";
              controller.enqueue(encoder.encode(JSON.stringify({ text: fallbackMsg }) + "\n"));
            } else {
              const resultStream = await generateChatResponseStream(
                message,
                relevantChunks.map((c) => ({
                  content: c.content,
                  similarity: c.similarity,
                })),
                mode,
                settings
              );
              for await (const chunk of resultStream.stream) {
                const chunkText = chunk.text();
                controller.enqueue(encoder.encode(JSON.stringify({ text: chunkText }) + "\n"));
              }
            }
          }
          controller.close();
        } catch (err) {
          console.error("[Demo Stream Error]:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("[Demo Chat Route Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
