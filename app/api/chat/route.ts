import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateChatResponseStream, evaluateRTM } from "@/lib/ai/gemini";
import { retrieveRelevantChunks } from "@/lib/ai/rag";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function POST(request: NextRequest) {
  try {
    // Enforce Rate Limiting (sliding-window IP check)
    const ip = (request as any).ip || request.headers.get("x-forwarded-for") || "127.0.0.1";
    const { rateLimit } = await import("@/lib/security/rate-limit");
    const rateLimitResult = rateLimit(ip, 15); // Max 15 chat prompts per minute
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Too many chat requests. Please wait ${rateLimitResult.reset} seconds before trying again.` },
        { 
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.reset),
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(rateLimitResult.reset),
          }
        }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, documentId, documentIds, mode, settings } = body;

    if (!message || !documentId) {
      return NextResponse.json(
        { error: "Message and documentId are required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .select("id")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (documentError || !document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Store user message
    await admin.from("chat_messages").insert({
      document_id: documentId,
      user_id: user.id,
      sender: "user",
      content: message,
    });

    // Query matched chunks from attached documents (or fall back to single active document)
    const targetDocIds = Array.isArray(documentIds) && documentIds.length > 0
      ? documentIds
      : documentId;

    // Retrieve relevant chunks from the document(s)
    const relevantChunks = await retrieveRelevantChunks(
      message,
      targetDocIds,
      user.id,
      5
    );

    const sources = relevantChunks
      .filter((c) => c.similarity > 0.3)
      .map((c) => c.content.slice(0, 100) + "...");

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (mode === "rtm") {
            // Reverse Teacher Mode — evaluate the student's explanation
            const evaluation = await evaluateRTM(
              message,
              relevantChunks.map((c) => ({ content: c.content }))
            );
            const evaluationStr = JSON.stringify(evaluation);

            // Send RTM result in one chunk
            controller.enqueue(encoder.encode(JSON.stringify({ rtm: evaluation }) + "\n"));

            // Store AI response in DB
            await admin.from("chat_messages").insert({
              document_id: documentId,
              user_id: user.id,
              sender: "ai",
              content: evaluationStr,
              sources: null,
            });
          } else {
            // Regular doubt solver — stream sources first
            controller.enqueue(encoder.encode(JSON.stringify({ sources }) + "\n"));

            let fullText = "";
            if (relevantChunks.length === 0) {
              const fallbackMsg = "I could not find enough matching material in this document to answer precisely. Try asking a narrower question or upload more related notes.";
              fullText = fallbackMsg;
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
                fullText += chunkText;
                controller.enqueue(encoder.encode(JSON.stringify({ text: chunkText }) + "\n"));
              }
            }

            // Store AI response in DB after stream finishes
            await admin.from("chat_messages").insert({
              document_id: documentId,
              user_id: user.id,
              sender: "ai",
              content: fullText,
              sources: sources.length > 0 ? sources : null,
            });
          }

          // Grant XP for asking questions
          const { data: profile } = await admin
            .from("profiles")
            .select("xp")
            .eq("id", user.id)
            .single();

          if (profile) {
            await admin
              .from("profiles")
              .update({ xp: (profile.xp || 0) + 5 })
              .eq("id", user.id);
          }

          controller.close();
        } catch (err) {
          console.error("Stream generation error:", err);
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      }
    });
  } catch (error: unknown) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to generate response") },
      { status: 500 }
    );
  }
}

// GET — Fetch chat history for a document
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required" },
        { status: 400 }
      );
    }

    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("document_id", documentId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to fetch messages") },
      { status: 500 }
    );
  }
}
