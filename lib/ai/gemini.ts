// ===========================================
// AskMe AI — Gemini AI Client & Fallback Layer
// ===========================================
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  SUMMARY_PROMPT,
  RAG_ANSWER_PROMPT,
  QUIZ_PROMPT,
  WEAK_TOPIC_PROMPT,
  RTM_EVALUATION_PROMPT,
  SINGLE_QUESTION_PROMPT,
} from "./prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Use Gemini 3.5 Flash for high-quality reasoning tasks (chat, quizzes, evaluations, diagnostics)
const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

// Use Gemini 3.1 Flash Lite for fast and routine tasks (document summaries)
const liteModel = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

// Use the embedding model for vector search
const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-2",
});

interface RawQuizQuestion {
  question?: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
  topic?: string;
}

/**
 * Determine the primary AI provider for text-generation operations
 */
const getTextProvider = (): string => {
  const configProvider = (process.env.AI_PROVIDER || "").toLowerCase().trim();
  if (configProvider === "groq") return "groq";
  if (configProvider === "openai") return "openai";
  if (configProvider === "openrouter") return "openrouter";
  if (configProvider === "gemini") return "gemini";

  // Hybrid smart routing: If Groq key is present, default text operations to Groq
  if (process.env.GROQ_API_KEY) {
    return "groq";
  }
  return "gemini";
};

/**
 * Determine the primary AI provider for vector embedding operations
 */
const getEmbeddingProvider = (): string => {
  const configProvider = (process.env.AI_PROVIDER || "").toLowerCase().trim();
  // Vector embeddings default to Gemini unless explicitly overridden
  if (configProvider === "openai") return "openai";
  if (configProvider === "openrouter") return "openrouter";
  return "gemini";
};

/**
 * Adjust embedding vectors dynamically to exactly 768 dimensions using L2 Euclidean normalization.
 * Matches Supabase pgvector column constraints (vector(768)).
 */
function ensure768Dimensions(vector: number[]): number[] {
  if (!vector || !Array.isArray(vector) || vector.length === 0) {
    console.warn("[Dimension System] Empty or invalid vector received. Generating zero-filled array.");
    return new Array(768).fill(0);
  }

  if (vector.length === 768) {
    return vector;
  }

  if (vector.length > 768) {
    console.log(`[Dimension System] Truncating embedding vector from ${vector.length} to 768 dimensions.`);
    const sliced = vector.slice(0, 768);
    // L2 Normalize the truncated vector to preserve directional similarity
    const sqSum = sliced.reduce((sum, val) => sum + val * val, 0);
    const norm = Math.sqrt(sqSum) || 1;
    return sliced.map((val) => val / norm);
  }

  console.warn(`[Dimension System] Embedding vector is too small (${vector.length} dimensions). Padding with zeros to 768.`);
  const padded = [...vector];
  while (padded.length < 768) {
    padded.push(0);
  }
  return padded;
}

/**
 * Fallback text generation helper using Groq, OpenRouter, or OpenAI
 */
async function generateTextFallback(
  prompt: string, 
  systemInstruction?: string,
  keys?: {
    groqKey?: string;
    openrouterKey?: string;
    openaiKey?: string;
  }
): Promise<string> {
  const groqKey = keys?.groqKey || process.env.GROQ_API_KEY;
  const openRouterKey = keys?.openrouterKey || process.env.OPENROUTER_API_KEY;
  const openAiKey = keys?.openaiKey || process.env.OPENAI_API_KEY;

  // Tier 1: Groq (Ultra-high speed & generous free-tier throughput limits)
  if (groqKey) {
    console.log("[Text Fallback] Attempting Groq text generation (llama-3.3-70b-versatile)...");
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
            { role: "user", content: prompt }
          ],
          temperature: 0.3
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.choices && json.choices[0]?.message?.content) {
          console.log("[Text Fallback] Groq text generation succeeded.");
          return json.choices[0].message.content;
        }
      } else {
        const errorText = await response.text();
        console.warn("[Text Fallback] Groq API returned non-OK status:", response.status, errorText);
      }
    } catch (e) {
      console.error("[Text Fallback] Groq connection failed:", e);
    }
  }

  // Tier 2: OpenRouter (Highly-flexible multi-model endpoint proxying)
  if (openRouterKey) {
    console.log("[Text Fallback] Attempting OpenRouter text generation (openai/gpt-4o-mini)...");
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://askme-ai.vercel.app",
          "X-Title": "AskMe AI"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
            { role: "user", content: prompt }
          ]
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.choices && json.choices[0]?.message?.content) {
          console.log("[Text Fallback] OpenRouter text generation succeeded.");
          return json.choices[0].message.content;
        }
      } else {
        const errorText = await response.text();
        console.warn("[Text Fallback] OpenRouter API returned non-OK status:", response.status, errorText);
      }
    } catch (e) {
      console.error("[Text Fallback] OpenRouter connection failed:", e);
    }
  }

  // Tier 3: OpenAI Direct Endpoint (Gold-standard industry fallback)
  if (openAiKey) {
    console.log("[Text Fallback] Attempting OpenAI text generation (gpt-4o-mini)...");
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openAiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
            { role: "user", content: prompt }
          ]
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.choices && json.choices[0]?.message?.content) {
          console.log("[Text Fallback] OpenAI text generation succeeded.");
          return json.choices[0].message.content;
        }
      } else {
        const errorText = await response.text();
        console.warn("[Text Fallback] OpenAI API returned non-OK status:", response.status, errorText);
      }
    } catch (e) {
      console.error("[Text Fallback] OpenAI connection failed:", e);
    }
  }

  throw new Error("All fallback text generation providers failed (Groq, OpenRouter, OpenAI).");
}

/**
 * Fallback single embedding helper using OpenRouter or OpenAI (exactly 768 dimensions)
 */
async function generateEmbeddingFallback(text: string): Promise<number[]> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (openRouterKey) {
    console.log("[Embedding Fallback] Attempting OpenRouter single embedding (openai/text-embedding-3-small)...");
    try {
      const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://askme-ai.vercel.app",
          "X-Title": "AskMe AI"
        },
        body: JSON.stringify({
          model: "openai/text-embedding-3-small",
          input: text,
          dimensions: 768
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data && json.data[0] && json.data[0].embedding) {
          console.log("[Embedding Fallback] OpenRouter single embedding succeeded.");
          return ensure768Dimensions(json.data[0].embedding);
        }
      } else {
        const errorText = await response.text();
        console.warn("[Embedding Fallback] OpenRouter single embedding error:", errorText);
      }
    } catch (e) {
      console.error("[Embedding Fallback] OpenRouter single embedding request failed:", e);
    }
  }

  if (openAiKey) {
    console.log("[Embedding Fallback] Attempting OpenAI single embedding (text-embedding-3-small)...");
    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openAiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: text,
          dimensions: 768
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data && json.data[0] && json.data[0].embedding) {
          console.log("[Embedding Fallback] OpenAI single embedding succeeded.");
          return ensure768Dimensions(json.data[0].embedding);
        }
      } else {
        const errorText = await response.text();
        console.warn("[Embedding Fallback] OpenAI single embedding error:", errorText);
      }
    } catch (e) {
      console.error("[Embedding Fallback] OpenAI single embedding request failed:", e);
    }
  }

  throw new Error("All embedding fallback providers failed (OpenRouter, OpenAI).");
}

/**
 * Fallback batch embedding helper using OpenRouter or OpenAI (exactly 768 dimensions)
 */
async function generateEmbeddingsBatchFallback(chunks: string[]): Promise<number[][]> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (openRouterKey) {
    console.log("[Embedding Fallback] Attempting OpenRouter batch embedding (openai/text-embedding-3-small)...");
    try {
      const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://askme-ai.vercel.app",
          "X-Title": "AskMe AI"
        },
        body: JSON.stringify({
          model: "openai/text-embedding-3-small",
          input: chunks,
          dimensions: 768
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data && Array.isArray(json.data)) {
          const sorted = [...json.data].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
          console.log("[Embedding Fallback] OpenRouter batch embedding succeeded.");
          return sorted.map((item) => ensure768Dimensions(item.embedding));
        }
      } else {
        const errorText = await response.text();
        console.warn("[Embedding Fallback] OpenRouter batch embedding error:", errorText);
      }
    } catch (e) {
      console.error("[Embedding Fallback] OpenRouter batch embedding request failed:", e);
    }
  }

  if (openAiKey) {
    console.log("[Embedding Fallback] Attempting OpenAI batch embedding (text-embedding-3-small)...");
    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openAiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: chunks,
          dimensions: 768
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data && Array.isArray(json.data)) {
          const sorted = [...json.data].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
          console.log("[Embedding Fallback] OpenAI batch embedding succeeded.");
          return sorted.map((item) => ensure768Dimensions(item.embedding));
        }
      } else {
        const errorText = await response.text();
        console.warn("[Embedding Fallback] OpenAI batch embedding error:", errorText);
      }
    } catch (e) {
      console.error("[Embedding Fallback] OpenAI batch embedding request failed:", e);
    }
  }

  throw new Error("All batch embedding fallback providers failed (OpenRouter, OpenAI).");
}

/**
 * Return default summary fallback object
 */
function getFallbackSummary() {
  return {
    overview: "Summary generated from your study material.",
    keyPoints: ["Key concepts identified from the document."],
    formulas: [],
    examTips: ["Review the core concepts thoroughly."],
    confusedTopics: ["Pay attention to nuanced definitions."],
  };
}

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
  let response = "";

  const provider = getTextProvider();
  if (provider !== "gemini") {
    console.log(`[AI Engine] Bypassing Gemini as requested by config. Using custom provider: ${provider}`);
    try {
      response = await generateTextFallback(prompt);
    } catch (fallbackErr) {
      console.error("[AI Engine] Primary summary generation failed, using static safe fallback:", fallbackErr);
      return getFallbackSummary();
    }
  } else {
    try {
      const result = await liteModel.generateContent(prompt);
      response = result.response.text();
    } catch (err) {
      console.error("[Gemini API] Summary generation failed, engaging openrouter/openai fallback...", err);
      try {
        response = await generateTextFallback(prompt);
      } catch (fallbackErr) {
        console.error("[Fallback Failure] Failed to generate summary across all APIs:", fallbackErr);
        return getFallbackSummary();
      }
    }
  }

  // Extract JSON from response (handle potential markdown wrapping)
  const jsonStr = response
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    return getFallbackSummary();
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

  const provider = getTextProvider();
  if (provider !== "gemini") {
    console.log(`[AI Engine] Bypassing Gemini as requested by config. Using custom provider: ${provider}`);
    try {
      return await generateTextFallback(prompt);
    } catch (fallbackErr) {
      console.error("[AI Engine] Primary chat response failed:", fallbackErr);
      return "I encountered an API rate limit from my providers. Please check your credentials or try again shortly.";
    }
  }

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("[Gemini API] Chat generation failed, engaging openrouter/openai fallback...", err);
    try {
      return await generateTextFallback(prompt);
    } catch (fallbackErr) {
      console.error("[Fallback Failure] Failed to generate chat answer:", fallbackErr);
      return "I encountered a quota limits rate block from Gemini. Fallback providers also failed. Please check your credentials or try again shortly.";
    }
  }
}

/**
 * Generate a RAG-powered contextual chat response stream
 */
export async function generateChatResponseStream(
  question: string,
  contextChunks: { content: string; similarity: number }[],
  mode?: string,
  settings?: {
    temperature?: number;
    maxTokens?: number;
    geminiKey?: string;
    groqKey?: string;
    openrouterKey?: string;
    openaiKey?: string;
  }
) {
  const context = contextChunks
    .map(
      (chunk, i) =>
        `[Source ${i + 1}] (relevance: ${(chunk.similarity * 100).toFixed(0)}%)\n${chunk.content}`
    )
    .join("\n\n---\n\n");

  let prompt = RAG_ANSWER_PROMPT.replace("{context}", context).replace(
    "{question}",
    question
  );

  // Inject Mode-Specific Prompt Instructions
  if (mode === "ask") {
    prompt += `\n\n[MODE DIRECTIVE: ASK MODE] The user is asking a quick, direct question. Answer their question directly, comprehensively, and clearly. Keep explanations concise and highly focused.`;
  } else if (mode === "learning") {
    prompt += `\n\n[MODE DIRECTIVE: LEARNING MODE] The user wants to learn a concept deeply. Act as an encouraging socratic academic tutor. Break down complex ideas into manageable steps, define variables, list key formulas, and use practical examples. Make sure to generate a Mermaid flowchart code block (\`\`\`mermaid\n...\n\`\`\`) to visually map out relationships if it helps explain the concept structurally!`;
  } else if (mode === "agent") {
    prompt += `\n\n[MODE DIRECTIVE: AGENT MODE] Act as a highly personalized, guiding cognitive mentor. Guide the student specifically based on their recent performance and their document's context. Proactively suggest revision steps, mention spacing review intervals, ask diagnostic questions, and direct them to focus on areas of potential weakness. Maintain a highly supportive, coaching tone.`;
  }

  // Check if we use a dynamic custom provider override
  const primaryProvider = getTextProvider();
  
  // Custom headers override with user-provided keys if supplied
  const activeGroqKey = settings?.groqKey || process.env.GROQ_API_KEY;
  const activeOpenRouterKey = settings?.openrouterKey || process.env.OPENROUTER_API_KEY;
  const activeOpenAIKey = settings?.openaiKey || process.env.OPENAI_API_KEY;
  const activeTemperature = settings?.temperature !== undefined ? settings.temperature : 0.7;

  if (primaryProvider !== "gemini") {
    console.log(`[AI Engine] Bypassing Gemini as requested by config. Using custom provider stream: ${primaryProvider}`);
    try {
      // Direct request using custom credentials if present
      let fullText = "";
      if (primaryProvider === "groq" && activeGroqKey) {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${activeGroqKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: activeTemperature,
            max_tokens: settings?.maxTokens ?? 16384
          })
        });
        if (response.ok) {
          const json = await response.json();
          fullText = json.choices[0]?.message?.content || "";
        }
      }

      if (!fullText) {
        fullText = await generateTextFallback(prompt, undefined, {
          groqKey: activeGroqKey,
          openrouterKey: activeOpenRouterKey,
          openaiKey: activeOpenAIKey
        });
      }

      return {
        stream: {
          async *[Symbol.asyncIterator]() {
            yield {
              text: () => fullText
            };
          }
        }
      };
    } catch (fallbackErr) {
      console.error("[AI Engine] Stream generation failed on fallback provider:", fallbackErr);
      throw fallbackErr;
    }
  }

  // Dynamic Gemini config initialization
  const activeGeminiKey = settings?.geminiKey || process.env.GEMINI_API_KEY || "";
  const dynamicGenAI = activeGeminiKey ? new GoogleGenerativeAI(activeGeminiKey) : genAI;
  const dynamicModel = dynamicGenAI.getGenerativeModel({
    model: "gemini-3.5-flash",
    generationConfig: {
      temperature: activeTemperature,
      maxOutputTokens: settings?.maxTokens ?? 16384
    }
  });

  try {
    return await dynamicModel.generateContentStream(prompt);
  } catch (err) {
    console.error("[Gemini API] Failed to initiate stream, trying OpenRouter/OpenAI fallback...", err);
    try {
      const fullText = await generateTextFallback(prompt, undefined, {
        groqKey: activeGroqKey,
        openrouterKey: activeOpenRouterKey,
        openaiKey: activeOpenAIKey
      });
      
      return {
        stream: {
          async *[Symbol.asyncIterator]() {
            yield {
              text: () => fullText
            };
          }
        }
      };
    } catch {
      console.error("[Fallback Failure] Failed to generate chat stream");
      throw new Error("Failed to stream RAG response from primary and fallback engines.");
    }
  }
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
  const provider = getTextProvider();

  if (text.length <= 15000) {
    const prompt = QUIZ_PROMPT.replace("{numQuestions}", String(numQuestions)).replace("{text}", text);
    let response = "";

    if (provider !== "gemini") {
      console.log(`[AI Engine] Bypassing Gemini as requested by config. Using custom provider: ${provider}`);
      try {
        response = await generateTextFallback(prompt);
      } catch (fallbackErr) {
        console.error("[AI Engine] Fallback quiz generation failed:", fallbackErr);
      }
    } else {
      try {
        const result = await model.generateContent(prompt);
        response = result.response.text();
      } catch (err) {
        console.error("[Gemini API] Failed to generate quiz, engaging fallback...", err);
        try {
          response = await generateTextFallback(prompt);
        } catch (fallbackErr) {
          console.error("[Fallback Failure] Quiz generation fallback failed:", fallbackErr);
        }
      }
    }

    if (response) {
      const jsonStr = response
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      try {
        const questions = JSON.parse(jsonStr);
        if (Array.isArray(questions) && questions.length > 0) {
          return questions.map((q: RawQuizQuestion, idx: number) => ({
            question: q.question || `Question ${idx + 1}`,
            options: Array.isArray(q.options) ? q.options : ["A", "B", "C", "D"],
            correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
            explanation: q.explanation || "Review the source material.",
            topic: q.topic || "General",
          }));
        }
      } catch {
        // Fallback handled below
      }
    }
  } else {
    // Multi-segment scan across the ENTIRE document length (e.g. 70 pages)
    const segmentLength = Math.floor(text.length / numQuestions);
    const promises = [];

    for (let i = 0; i < numQuestions; i++) {
      const start = i * segmentLength;
      const end = start + Math.min(segmentLength, 10000);
      const segmentText = text.substring(start, end);

      promises.push(
        (async () => {
          const prompt = SINGLE_QUESTION_PROMPT.replace("{text}", segmentText);
          let response = "";

          if (provider !== "gemini") {
            try {
              response = await generateTextFallback(prompt);
            } catch {
              return null;
            }
          } else {
            try {
              const result = await model.generateContent(prompt);
              response = result.response.text();
            } catch (err) {
              console.error(`[Gemini API] Failed to generate segmented question for chunk ${i}, trying fallback...`, err);
              try {
                response = await generateTextFallback(prompt);
              } catch {
                return null;
              }
            }
          }

          if (response) {
            const jsonStr = response
              .replace(/```json\n?/g, "")
              .replace(/```\n?/g, "")
              .trim();

            try {
              const q = JSON.parse(jsonStr);
              if (q && q.question && Array.isArray(q.options) && q.options.length === 4) {
                return {
                  question: q.question,
                  options: q.options,
                  correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
                  explanation: q.explanation || "Review this section of the notes.",
                  topic: q.topic || `Section ${i + 1}`,
                };
              }
            } catch (err) {
              console.error(`Failed to parse segmented question for chunk ${i}:`, err);
            }
          }
          return null;
        })()
      );
    }

    try {
      const results = await Promise.all(promises);
      const validQuestions = results.filter((q): q is Exclude<typeof q, null> => q !== null);
      if (validQuestions.length > 0) {
        return validQuestions;
      }
    } catch (err) {
      console.error("Error generating segmented quiz:", err);
    }
  }

  // Return a minimal fallback quiz if all else fails
  return [
    {
      question: "What is the primary topic discussed in this study material?",
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
  let response = "";

  const provider = getTextProvider();
  if (provider !== "gemini") {
    console.log(`[AI Engine] Bypassing Gemini as requested by config. Using custom provider: ${provider}`);
    try {
      response = await generateTextFallback(prompt);
    } catch (fallbackErr) {
      console.error("[AI Engine] Fallback weak topic analysis failed:", fallbackErr);
    }
  } else {
    try {
      const result = await model.generateContent(prompt);
      response = result.response.text();
    } catch (err) {
      console.error("[Gemini API] Failed to analyze weak topics, engaging fallback...", err);
      try {
        response = await generateTextFallback(prompt);
      } catch (fallbackErr) {
        console.error("[Fallback Failure] Failed to analyze weak topics across all APIs:", fallbackErr);
      }
    }
  }

  if (response) {
    const jsonStr = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    try {
      return JSON.parse(jsonStr);
    } catch {
      // Fallback handled below
    }
  }

  const topics = [...new Set(wrongAnswers.map((wa) => wa.topic))];
  return {
    analysis: "You have some areas that need review based on your quiz performance.",
    weakTopics: topics,
    revisionPlan: topics.map((t) => ({
      topic: t,
      action: `Review ${t} concepts and practice related problems`,
      duration: 15,
    })),
  };
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

  let response = "";

  const provider = getTextProvider();
  if (provider !== "gemini") {
    console.log(`[AI Engine] Bypassing Gemini as requested by config. Using custom provider: ${provider}`);
    try {
      response = await generateTextFallback(prompt);
    } catch (fallbackErr) {
      console.error("[AI Engine] Fallback RTM evaluation failed:", fallbackErr);
    }
  } else {
    try {
      const result = await model.generateContent(prompt);
      response = result.response.text();
    } catch (err) {
      console.error("[Gemini API] RTM evaluation failed, engaging fallback...", err);
      try {
        response = await generateTextFallback(prompt);
      } catch (fallbackErr) {
        console.error("[Fallback Failure] Failed to evaluate RTM across all APIs:", fallbackErr);
      }
    }
  }

  if (response) {
    const jsonStr = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    try {
      return JSON.parse(jsonStr);
    } catch {
      // Fallback handled below
    }
  }

  return {
    score: 70,
    strengths: ["Attempted a comprehensive explanation"],
    gaps: ["Some key details may have been missed"],
    feedback: "Good attempt! Review the source material to fill in missing details.",
    suggestedReview: ["Core concepts from the document"],
  };
}

/**
 * Helper to retry API requests that fail due to rate limits or transient errors
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 5,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const err = error as { message?: string; status?: number };
    const errorMessage = err?.message || "";
    const isRateLimit =
      err?.status === 429 ||
      errorMessage.includes("429") ||
      errorMessage.includes("Quota exceeded") ||
      errorMessage.includes("Too Many Requests");

    if (retries > 0 && isRateLimit) {
      console.warn(`[Gemini API] Rate limit hit. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Generate embedding vector for text using Gemini gemini-embedding-2
 * Truncated/adjusted to exactly 768 dimensions using L2 normalisation
 * to match database pgvector constraints.
 * Falls back to OpenRouter or OpenAI text-embedding-3-small (exactly 768 dimensions) on failure.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const provider = getEmbeddingProvider();
  if (provider !== "gemini") {
    console.log(`[AI Engine] Bypassing Gemini for single embedding. Using provider fallback...`);
    return await generateEmbeddingFallback(text);
  }

  try {
    return await retryWithBackoff(async () => {
      const result = await embeddingModel.embedContent({
        content: { parts: [{ text }] },
        outputDimensionality: 768,
      } as unknown as Parameters<typeof embeddingModel.embedContent>[0]);
      return ensure768Dimensions(result.embedding.values);
    });
  } catch (err) {
    console.error("[Gemini API] Single embedding failed. Engaging OpenRouter/OpenAI fallback...", err);
    return await generateEmbeddingFallback(text);
  }
}

/**
 * Generate embedding vectors for multiple texts in a batch using gemini-embedding-2
 * Adjusted to exactly 768 dimensions to match database pgvector constraints.
 * Falls back to OpenRouter or OpenAI text-embedding-3-small (exactly 768 dimensions) on failure.
 */
export async function generateEmbeddingsBatch(chunks: string[]): Promise<number[][]> {
  if (chunks.length === 0) return [];

  const provider = getEmbeddingProvider();
  if (provider !== "gemini") {
    console.log(`[AI Engine] Bypassing Gemini for batch embeddings. Using provider fallback...`);
    return await generateEmbeddingsBatchFallback(chunks);
  }

  try {
    return await retryWithBackoff(async () => {
      const result = await embeddingModel.batchEmbedContents({
        requests: chunks.map((text) => ({
          content: { parts: [{ text }] },
          outputDimensionality: 768,
        })),
      } as unknown as Parameters<typeof embeddingModel.batchEmbedContents>[0]);

      if (!result.embeddings) {
        throw new Error("Failed to generate batch embeddings: response did not contain embeddings.");
      }

      return result.embeddings.map((e) => ensure768Dimensions(e.values));
    });
  } catch (err) {
    console.error("[Gemini API] Batch embeddings failed. Engaging OpenRouter/OpenAI fallback...", err);
    return await generateEmbeddingsBatchFallback(chunks);
  }
}

/**
 * Describe or perform OCR on an uploaded image using Gemini Vision (or OpenAI fallback)
 */
export async function describeImage(buffer: Buffer, mimeType: string): Promise<string> {
  try {
    console.log("[AI Vision] Analyzing image contents using Gemini Vision...");
    const imagePart = {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType
      }
    };

    const prompt = "You are an expert academic study assistant. Transcribe any text visible in this image. If there are diagrams, charts, formulas, or drawings, describe them in highly detailed academic terms so a student can learn from them. Format your response clearly.";
    
    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();
    if (text) {
      console.log("[AI Vision] Image analysis succeeded.");
      return text;
    }
  } catch (err) {
    console.error("[AI Vision] Gemini image analysis failed, trying OpenAI vision fallback...", err);
  }

  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey) {
    try {
      console.log("[AI Vision] Attempting OpenAI Vision fallback...");
      const base64Image = buffer.toString("base64");
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openAiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "You are an expert academic study assistant. Transcribe any text visible in this image. If there are diagrams, charts, formulas, or drawings, describe them in highly detailed academic terms so a student can learn from them. Format your response clearly."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`
                  }
                }
              ]
            }
          ]
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.choices && json.choices[0]?.message?.content) {
          console.log("[AI Vision] OpenAI vision fallback succeeded.");
          return json.choices[0].message.content;
        }
      }
    } catch (fallbackErr) {
      console.error("[AI Vision] OpenAI vision fallback failed:", fallbackErr);
    }
  }

  return "Image file uploaded. [No visual transcription could be extracted from image content due to AI provider quota limits]";
}
