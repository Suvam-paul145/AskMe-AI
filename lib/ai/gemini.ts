// ===========================================
// AskMe AI — Gemini AI Client
// ===========================================
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  SUMMARY_PROMPT,
  RAG_ANSWER_PROMPT,
  QUIZ_PROMPT,
  WEAK_TOPIC_PROMPT,
  RTM_EVALUATION_PROMPT,
} from "./prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Use Gemini 3.5 Flash for high-quality reasoning tasks (chat, quizzes, evaluations, diagnostics)
const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

// Use Gemini 3.1 Flash Lite for fast and routine tasks (document summaries)
const liteModel = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

// Use the embedding model for vector search
const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-001",
});

/**
 * Generate a structured summary from extracted document text
 */
export async function generateSummary(
  text: string
): Promise<{
  overview: string;
  keyPoints: string[];
  formulas: string[];
  examTips: string[];
  confusedTopics: string[];
}> {
  const prompt = SUMMARY_PROMPT + text.slice(0, 15000); // Limit input to avoid token limits
  const result = await liteModel.generateContent(prompt);
  const response = result.response.text();

  // Extract JSON from response (handle potential markdown wrapping)
  const jsonStr = response
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    // Return a fallback summary if parsing fails
    return {
      overview: "Summary generated from your study material.",
      keyPoints: ["Key concepts identified from the document."],
      formulas: [],
      examTips: ["Review the core concepts thoroughly."],
      confusedTopics: ["Pay attention to nuanced definitions."],
    };
  }
}

/**
 * Generate a RAG-powered contextual chat response
 */
export async function generateChatResponse(
  question: string,
  contextChunks: { content: string; similarity: number }[]
): Promise<string> {
  const context = contextChunks
    .map(
      (chunk, i) =>
        `[Source ${i + 1}] (relevance: ${(chunk.similarity * 100).toFixed(0)}%)\n${chunk.content}`
    )
    .join("\n\n---\n\n");

  const prompt = RAG_ANSWER_PROMPT.replace("{context}", context).replace(
    "{question}",
    question
  );

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Generate quiz questions from document text
 */
export async function generateQuiz(
  text: string,
  numQuestions: number = 5
): Promise<
  {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    topic: string;
  }[]
> {
  const prompt = QUIZ_PROMPT.replace("{numQuestions}", String(numQuestions))
    .replace("{text}", text.slice(0, 15000));

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  const jsonStr = response
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    const questions = JSON.parse(jsonStr);
    // Validate structure
    if (Array.isArray(questions) && questions.length > 0) {
      return questions.map((q: any, idx: number) => ({
        question: q.question || `Question ${idx + 1}`,
        options: Array.isArray(q.options) ? q.options : ["A", "B", "C", "D"],
        correctAnswer:
          typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
        explanation: q.explanation || "Review the source material.",
        topic: q.topic || "General",
      }));
    }
    throw new Error("Invalid quiz format");
  } catch {
    // Return a minimal fallback quiz
    return [
      {
        question:
          "What is the primary topic discussed in this study material?",
        options: [
          "A) The main concept",
          "B) An unrelated topic",
          "C) A historical event",
          "D) A mathematical proof",
        ],
        correctAnswer: 0,
        explanation: "The material focuses on the core concept as described.",
        topic: "General",
      },
    ];
  }
}

/**
 * Analyze weak topics from wrong quiz answers
 */
export async function analyzeWeakTopics(
  wrongAnswers: { question: string; topic: string; explanation: string }[]
): Promise<{
  analysis: string;
  weakTopics: string[];
  revisionPlan: { topic: string; action: string; duration: number }[];
}> {
  const wrongAnswersStr = wrongAnswers
    .map(
      (wa) =>
        `Topic: ${wa.topic}\nQuestion: ${wa.question}\nCorrect explanation: ${wa.explanation}`
    )
    .join("\n\n");

  const prompt = WEAK_TOPIC_PROMPT.replace("{wrongAnswers}", wrongAnswersStr);
  const result = await model.generateContent(prompt);
  const response = result.response.text();

  const jsonStr = response
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    const topics = [...new Set(wrongAnswers.map((wa) => wa.topic))];
    return {
      analysis:
        "You have some areas that need review based on your quiz performance.",
      weakTopics: topics,
      revisionPlan: topics.map((t) => ({
        topic: t,
        action: `Review ${t} concepts and practice related problems`,
        duration: 15,
      })),
    };
  }
}

/**
 * Evaluate a Reverse Teacher Mode (RTM) student explanation
 */
export async function evaluateRTM(
  explanation: string,
  contextChunks: { content: string }[]
): Promise<{
  score: number;
  strengths: string[];
  gaps: string[];
  feedback: string;
  suggestedReview: string[];
}> {
  const context = contextChunks.map((c) => c.content).join("\n\n");
  const prompt = RTM_EVALUATION_PROMPT.replace("{context}", context).replace(
    "{explanation}",
    explanation
  );

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  const jsonStr = response
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    return {
      score: 70,
      strengths: ["Attempted a comprehensive explanation"],
      gaps: ["Some key details may have been missed"],
      feedback:
        "Good attempt! Review the source material to fill in missing details.",
      suggestedReview: ["Core concepts from the document"],
    };
  }
}

/**
 * Generate embedding vector for text using Gemini gemini-embedding-001
 * Truncated to 768 dimensions using Matryoshka Representation Learning (MRL)
 * to match database pgvector constraints.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent({
    content: { parts: [{ text }] },
    outputDimensionality: 768,
  } as any);
  return result.embedding.values;
}
