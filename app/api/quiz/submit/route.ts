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

    // Update user XP & all 8 Cognitive Traits dynamically based on performance
    const xpGain = 30 + Math.round(score / 2);
    const { data: profile } = await admin
      .from("profiles")
      .select("xp, streak, cognitive_profile")
      .eq("id", user.id)
      .single();

    if (profile) {
      const cogProfile = (profile.cognitive_profile || {}) as unknown as CognitiveProfileDB;
      const currentStreak = profile.streak || 0;

      // Dynamic calculation for all 8 learning dimensions
      const newConceptual = Math.max(10, Math.min(100, (cogProfile.conceptual || 50) + (score >= 80 ? 4 : (score < 50 ? -3 : 1))));
      const newRetention = Math.max(10, Math.min(100, (cogProfile.retention || 50) + (score >= 70 ? 3 : -2)));
      const newAnalytical = Math.max(10, Math.min(100, (cogProfile.analytical || 50) + (score >= 90 ? 5 : (score < 40 ? -2 : 2))));
      const newConsistency = Math.max(10, Math.min(100, Math.round(50 + (currentStreak * 5) + (score >= 70 ? 2 : 0))));
      const newDiscipline = Math.max(10, Math.min(100, (cogProfile.discipline || 50) + (score >= 60 ? 3 : 1)));
      const newCalibration = Math.max(10, Math.min(100, Math.round((cogProfile.calibration || 50) + (score - 50) / 10)));
      const newAdaptability = Math.max(10, Math.min(100, (cogProfile.adaptability || 50) + (score >= 75 ? 4 : 1)));
      const newEfficiency = Math.max(10, Math.min(100, Math.round((cogProfile.efficiency || 50) + (score >= 80 ? 4 : -2))));

      // Dynamically determine student archetype and descriptions based on their strongest coordinates
      let archetype = "The Diligent Scholar";
      let description = "You are a steady and systematic learner, building strong foundations across conceptual domains.";

      if (newConceptual > 75 && newAnalytical > 75) {
        archetype = "The Cognitive Architect";
        description = "Your mind excels at building complex logical blueprints, combining high speed with conceptual precision.";
      } else if (newConceptual > 70 && newRetention < 55) {
        archetype = "The Intuitive Analyst";
        description = "You naturally grasp abstract principles quickly, though memory retention benefits from spaced repetitions.";
      } else if (newDiscipline > 70 && newRetention > 70) {
        archetype = "The Autopilot Master";
        description = "Highly organized and disciplined, your retention is reinforced by robust scheduling and revisions.";
      } else if (newEfficiency > 75 && newAnalytical > 70) {
        archetype = "The Speed Strategist";
        description = "You solve quantitative problems with maximum efficiency, making every second count during assessments.";
      } else if (newAdaptability > 75 && newCalibration > 70) {
        archetype = "The Calibration Expert";
        description = "You possess deep metacognitive awareness, correctly predicting what you know and adapting under pressure.";
      }

      await admin
        .from("profiles")
        .update({
          xp: (profile.xp || 0) + xpGain,
          cognitive_profile: {
            ...cogProfile,
            conceptual: newConceptual,
            retention: newRetention,
            analytical: newAnalytical,
            consistency: newConsistency,
            discipline: newDiscipline,
            calibration: newCalibration,
            adaptability: newAdaptability,
            efficiency: newEfficiency,
            archetype,
            description,
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
