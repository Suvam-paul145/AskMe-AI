import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateQuiz } from "@/lib/ai/gemini";

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
    const { documentId, numQuestions = 5 } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required" },
        { status: 400 }
      );
    }

    // Fetch document text
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("extracted_text, title")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Generate quiz using AI
    const questions = await generateQuiz(
      document.extracted_text,
      numQuestions
    );

    // Store quiz in database
    const admin = createAdminClient();
    const { data: quiz, error: quizError } = await admin
      .from("quizzes")
      .insert({
        document_id: documentId,
        user_id: user.id,
        title: `Quiz: ${document.title}`,
        questions,
      })
      .select()
      .single();

    if (quizError) {
      return NextResponse.json(
        { error: "Failed to save quiz" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        questions: quiz.questions,
      },
    });
  } catch (error: unknown) {
    console.error("Quiz generation error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate quiz";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// GET — Fetch quiz for a document
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
    const quizId = searchParams.get("quizId");

    let query = supabase.from("quizzes").select("*").eq("user_id", user.id);

    if (quizId) {
      query = query.eq("id", quizId);
    } else if (documentId) {
      query = query.eq("document_id", documentId);
    }

    const { data: quizzes, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ quizzes: quizzes || [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch quizzes";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
