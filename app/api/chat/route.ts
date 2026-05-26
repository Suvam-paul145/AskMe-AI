import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateChatResponse, evaluateRTM } from "@/lib/ai/gemini";
import { retrieveRelevantChunks } from "@/lib/ai/rag";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, documentId, mode } = body;

    if (!message || !documentId) {
      return NextResponse.json(
        { error: "Message and documentId are required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Store user message
    await admin.from("chat_messages").insert({
      document_id: documentId,
      user_id: user.id,
      sender: "user",
      content: message,
    });

    // Retrieve relevant chunks from the document
    const relevantChunks = await retrieveRelevantChunks(
      message,
      documentId,
      user.id,
      5
    );

    let aiResponse: string;
    let sources: string[] = [];

    if (mode === "rtm") {
      // Reverse Teacher Mode — evaluate the student's explanation
      const evaluation = await evaluateRTM(
        message,
        relevantChunks.map((c) => ({ content: c.content }))
      );
      aiResponse = JSON.stringify(evaluation);
    } else {
      // Regular doubt solver — RAG-powered response
      aiResponse = await generateChatResponse(
        message,
        relevantChunks.map((c) => ({
          content: c.content,
          similarity: c.similarity,
        }))
      );
      sources = relevantChunks
        .filter((c) => c.similarity > 0.3)
        .map((c) => c.content.slice(0, 100) + "...");
    }

    // Store AI response
    await admin.from("chat_messages").insert({
      document_id: documentId,
      user_id: user.id,
      sender: "ai",
      content: aiResponse,
      sources: sources.length > 0 ? sources : null,
    });

    // Grant XP for asking questions
    await admin
      .from("profiles")
      .select("xp")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          admin
            .from("profiles")
            .update({ xp: (data.xp || 0) + 5 })
            .eq("id", user.id);
        }
      });

    return NextResponse.json({
      response: aiResponse,
      sources,
      mode: mode || "chat",
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate response" },
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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
