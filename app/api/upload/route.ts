import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { extractText } from "@/lib/pdf/extract-text";
import { generateSummary, generateQuiz } from "@/lib/ai/gemini";
import { chunkText, storeEmbeddings } from "@/lib/ai/rag";

export const maxDuration = 60; // Allow up to 60s for processing

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Upload processing failed";
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type and size before doing AI work.
    const allowedTypes = ["application/pdf", "text/plain"];
    const hasAllowedExtension = /\.(pdf|txt)$/i.test(file.name);
    if (!allowedTypes.includes(file.type) && !hasAllowedExtension) {
      return NextResponse.json(
        { error: "Only PDF and TXT files are supported" },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "File is too large. Upload a PDF or TXT file under 10 MB." },
        { status: 413 }
      );
    }

    const admin = createAdminClient();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileSize =
      file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(0)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    // Step 1: Upload file to Supabase Storage
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await admin.storage
      .from("documents")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    // Get public URL (storage bucket may not exist yet - non-blocking)
    let fileUrl = "";
    if (!uploadError) {
      const {
        data: { publicUrl },
      } = admin.storage.from("documents").getPublicUrl(filePath);
      fileUrl = publicUrl;
    }

    // Step 2: Extract text
    const normalizedType =
      file.type ||
      (file.name.toLowerCase().endsWith(".pdf")
        ? "application/pdf"
        : "text/plain");
    const extractedText = await extractText(fileBuffer, normalizedType);

    if (!extractedText || extractedText.trim().length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract enough text from the file. Please try a different file.",
        },
        { status: 422 }
      );
    }

    // Step 3: Generate AI summary
    const summary = await generateSummary(extractedText);

    // Step 4: Create document record
    const { data: document, error: docError } = await admin
      .from("documents")
      .insert({
        user_id: user.id,
        title: file.name,
        file_url: fileUrl,
        file_size: fileSize,
        extracted_text: extractedText,
        summary,
      })
      .select()
      .single();

    if (docError || !document) {
      console.error("Error creating document:", docError);
      return NextResponse.json(
        { error: "Failed to save document" },
        { status: 500 }
      );
    }

    // Step 5: Chunk text and generate embeddings
    const chunks = chunkText(extractedText);
    await storeEmbeddings(chunks, document.id, user.id);

    // Step 6: Auto-generate quiz
    const quizQuestions = await generateQuiz(extractedText, 5);
    const { data: quiz } = await admin
      .from("quizzes")
      .insert({
        document_id: document.id,
        user_id: user.id,
        title: `Quiz: ${file.name}`,
        questions: quizQuestions,
      })
      .select()
      .single();

    // Step 7: Create memory graph node
    const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
    await admin.from("graph_nodes").insert({
      user_id: user.id,
      label: cleanTitle,
      strength: 45,
      status: "learning",
      x: 300 + Math.random() * 200,
      y: 200 + Math.random() * 150,
    });

    // Step 8: Grant XP
    const { data: userProfile } = await admin
      .from("profiles")
      .select("xp")
      .eq("id", user.id)
      .single();

    if (userProfile) {
      await admin
        .from("profiles")
        .update({ xp: (userProfile.xp || 0) + 50 })
        .eq("id", user.id);
    }

    // Step 9: Create initial AI chat message
    await admin.from("chat_messages").insert({
      document_id: document.id,
      user_id: user.id,
      sender: "ai",
      content: `Hello! I've fully analyzed '${file.name}' and indexed ${chunks.length} knowledge chunks. Ask me any question about this material — I'll reference the exact parts of your notes to give you accurate answers!`,
    });

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        summary: document.summary,
        fileSize,
        chunksCreated: chunks.length,
      },
      quizId: quiz?.id,
    });
  } catch (error: unknown) {
    console.error("Upload pipeline error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
