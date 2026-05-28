import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { analyzeWeakTopics } from "@/lib/ai/gemini";

interface QuizQuestionDB {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

interface CognitiveProfileDB {
  conceptual?: number;
  retention?: number;
  analytical?: number;
  discipline?: number;
  consistency?: number;
  adaptability?: number;
  calibration?: number;
  efficiency?: number;
  archetype?: string;
  description?: string;
}

interface RevisionPlanItem {
  topic: string;
  action: string;
  duration: number;
}

interface DocRelation {
  title: string;
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

    const body = await request.json();
    const { quizId, answers } = body;
    // answers: Array of { questionIndex: number, selectedOption: number }

    if (!quizId || !answers) {
      return NextResponse.json(
        { error: "quizId and answers are required" },
        { status: 400 }
      );
    }

    // Fetch quiz data
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("*, documents(title)")
      .eq("id", quizId)
      .eq("user_id", user.id)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    const questions = quiz.questions as unknown as QuizQuestionDB[];
    let correctCount = 0;
    const wrongAnswers: {
      question: string;
      topic: string;
      explanation: string;
    }[] = [];

    // Grade the quiz
    answers.forEach(
      (answer: { questionIndex: number; selectedOption: number }) => {
        const question = questions[answer.questionIndex];
        if (!question) return;

        if (answer.selectedOption === question.correctAnswer) {
          correctCount++;
        } else {
          wrongAnswers.push({
            question: question.question,
            topic: question.topic,
            explanation: question.explanation,
          });
        }
      }
    );

    const score = Math.round((correctCount / questions.length) * 100);
    const weakTopicNames = [
      ...new Set(wrongAnswers.map((wa) => wa.topic)),
    ];

    // Analyze weak topics with AI if there are wrong answers
    let revisionPlan = null;
    let analysis = null;
    if (wrongAnswers.length > 0) {
      const aiAnalysis = await analyzeWeakTopics(wrongAnswers);
      revisionPlan = aiAnalysis.revisionPlan;
      analysis = aiAnalysis.analysis;
    }

    const admin = createAdminClient();

    // Store attempt
    const { data: attempt, error: attemptError } = await admin
      .from("quiz_attempts")
      .insert({
        quiz_id: quizId,
        user_id: user.id,
        document_id: quiz.document_id,
        answers,
        score,
        total_questions: questions.length,
        correct_count: correctCount,
        weak_topics: weakTopicNames,
        revision_plan: revisionPlan,
      })
      .select()
      .single();

    if (attemptError) {
      console.error("Error storing attempt:", attemptError);
    }

    // Update user XP
    const xpGain = 30 + Math.round(score / 2);
    const { data: profile } = await admin
      .from("profiles")
      .select("xp, cognitive_profile")
      .eq("id", user.id)
      .single();

    if (profile) {
      const cogProfile = (profile.cognitive_profile || {}) as unknown as CognitiveProfileDB;
      await admin
        .from("profiles")
        .update({
          xp: (profile.xp || 0) + xpGain,
          cognitive_profile: {
            ...cogProfile,
            adaptability: Math.min(
              100,
              (cogProfile.adaptability || 50) + 3
            ),
            calibration: Math.min(
              100,
              Math.round((cogProfile.calibration || 50) + score / 10)
            ),
            consistency: Math.min(
              100,
              (cogProfile.consistency || 50) + 5
            ),
          },
        })
        .eq("id", user.id);
    }

    // Create revision planner items if score is low
    if (score < 70 && revisionPlan) {
      const plannerItems = revisionPlan.map((item: RevisionPlanItem) => ({
        user_id: user.id,
        title: `Review: ${item.topic} — ${item.action}`,
        date: new Date().toISOString().split("T")[0],
        duration: item.duration || 15,
        is_urgent: true,
        completed: false,
      }));

      await admin.from("planner_items").insert(plannerItems);
    }

    // Update graph node strength
    const { data: nodes } = await admin
      .from("graph_nodes")
      .select("*")
      .eq("user_id", user.id);

    if (nodes) {
      const docRelation = quiz.documents as unknown as DocRelation | null;
      const docTitle = docRelation?.title
        ?.replace(/\.[^/.]+$/, "")
        ?.toLowerCase();

      for (const node of nodes) {
        if (node.label.toLowerCase() === docTitle) {
          const delta = score >= 80 ? 15 : -10;
          const newStrength = Math.max(
            0,
            Math.min(100, node.strength + delta)
          );
          let status = "learning";
          if (newStrength >= 85) status = "mastered";
          else if (newStrength >= 60) status = "learning";
          else if (newStrength >= 35) status = "weak";
          else status = "forgotten";

          await admin
            .from("graph_nodes")
            .update({ strength: newStrength, status })
            .eq("id", node.id);
          break;
        }
      }
    }

    return NextResponse.json({
      attempt: attempt
        ? {
            id: attempt.id,
            score,
            totalQuestions: questions.length,
            correctCount,
            weakTopics: weakTopicNames,
            revisionPlan,
            analysis,
            xpGain,
          }
        : null,
    });
  } catch (error: unknown) {
    console.error("Quiz submit error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit quiz";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
