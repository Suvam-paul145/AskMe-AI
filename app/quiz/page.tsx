"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore, QuizQuestion } from "@/lib/store";
import { Timer, Cpu, Award, RefreshCw, ArrowRight, HelpCircle, CheckCircle, XCircle } from "lucide-react";
import confetti from "canvas-confetti";

type QuizServerResult = {
  weakTopics?: string[];
  revisionPlan?: { topic: string; action: string; duration: number }[];
  analysis?: string;
};

function QuizContent() {
  const { quizzes, submitQuizAttempt, documents, loadQuiz } = useStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const docId = searchParams.get("docId") || "doc-1";

  const docQuestions = quizzes[docId] || [];
  const activeDoc = documents.find(d => d.id === docId);

  // States
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [incorrectList, setIncorrectList] = useState<QuizQuestion[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [serverResult, setServerResult] = useState<QuizServerResult | null>(null);
  const [answersHistory, setAnswersHistory] = useState<{ questionIndex: number; selectedOption: number }[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Load quiz from API on mount
  useEffect(() => {
    if (docId) {
      loadQuiz(docId);
    }
  }, [docId, loadQuiz]);

  // Timer Effect
  useEffect(() => {
    if (quizComplete || docQuestions.length === 0) return;
    const interval = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [quizComplete, docQuestions]);

  if (docQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 space-y-6 py-32">
        <HelpCircle className="h-16 w-16 text-primary animate-drift" />
        <h2 className="text-xl font-bold text-white leading-snug">No quiz calibration ready</h2>
        <p className="text-xs text-zinc-500 max-w-sm font-light">Please select a valid study notes chapter containing generated questions.</p>
        <button
          onClick={() => router.push("/workspace")}
          className="rounded-xl bg-primary px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-primary/95 transition-all duration-300"
        >
          Back to Workspace
        </button>
      </div>
    );
  }

  const currentQuestion = docQuestions[currentQuestionIdx];

  const handleOptionSelect = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;

    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    // Track answer for server submission
    setAnswersHistory(prev => [...prev, { questionIndex: currentQuestionIdx, selectedOption }]);

    if (isCorrect) {
      setScore(s => s + 1);
    } else {
      setIncorrectList(prev => [...prev, currentQuestion]);
    }
  };

  const handleNextQuestion = () => {
    setIsAnswerSubmitted(false);
    setSelectedOption(null);

    if (currentQuestionIdx + 1 < docQuestions.length) {
      setCurrentQuestionIdx(idx => idx + 1);
    } else {
      // Quiz finished!
      setQuizComplete(true);

      // Submit the full quiz attempt to the server for AI analysis
      const allAnswers = [...answersHistory, { questionIndex: currentQuestionIdx, selectedOption: selectedOption! }];

      // Get the quiz ID from the store for API call (quiz ID is the prefix of question IDs)
      const quizId = docQuestions[0]?.id?.split("-q")[0] || docId;

      submitQuizAttempt(quizId, allAnswers).then((result: any) => {
        if (result?.attempt) {
          setServerResult(result.attempt);
        }
      });

      // Trigger Confetti Celebration!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  // Stress Level Math simulation based on time elapsed per question
  const getStressLevel = () => {
    if (timerSeconds < 15) return { name: "Calm Focus", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    if (timerSeconds < 35) return { name: "Cognitive Load Active", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    return { name: "Stress Threshold Peak", color: "text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse" };
  };

  const stressInfo = getStressLevel();
  const weakTopics = serverResult?.weakTopics ?? [];
  const revisionPlan = serverResult?.revisionPlan ?? [];
  const resultAnalysis = serverResult?.analysis;

  return (
    <div className="max-w-2xl mx-auto w-full py-8 space-y-6">
      
      {/* Quiz Top bar info */}
      <div className="flex items-center justify-between bg-[#0d0d11]/80 border border-white/5 p-4.5 rounded-2xl glass-card text-xs font-semibold shadow-sm matte-layer">
        <span className="text-zinc-400 flex items-center gap-1.5 min-w-0">
          <Cpu className="h-4 w-4 text-primary shrink-0 animate-pulse" />
          <span className="truncate max-w-[150px] sm:max-w-[280px]">Active Context: <strong className="text-white font-medium">{activeDoc?.title || "Notes Chapter"}</strong></span>
        </span>
        <div className="flex items-center gap-3 shrink-0 ml-2">
          {/* Stress Level Indicator */}
          <span className={`hidden sm:inline-block text-[8px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border biometric-glow ${stressInfo.color}`}>
            {stressInfo.name}
          </span>
          <div className="flex items-center gap-1.5 text-zinc-400 font-mono">
            <Timer className="h-4 w-4 text-zinc-500" />
            <span>{formatTime(timerSeconds)}</span>
          </div>
        </div>
      </div>

      {!quizComplete ? (
        <div className="bg-[#0b0b0e]/95 border border-white/5 rounded-3xl glass-card p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden matte-layer spatial-shadow-lg">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-25 pointer-events-none" />

          {/* Progress row */}
          <div className="flex items-center justify-between text-xs text-zinc-500 border-b border-white/5 pb-4 font-mono">
            <span>Question {currentQuestionIdx + 1} of {docQuestions.length}</span>
            <span className="font-bold text-primary dark:text-purple-400 uppercase tracking-widest biometric-glow">Topic: {currentQuestion.topic}</span>
          </div>

          {/* Question Text */}
          <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
            {currentQuestion.question}
          </h3>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-3.5">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = currentQuestion.correctAnswer === idx;
              
              let btnClass = "border-white/5 bg-[#0d0d11]/60 hover:bg-[#121217] text-zinc-400 hover:text-white";
              if (isSelected && !isAnswerSubmitted) {
                btnClass = "border-primary bg-primary/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.1)] ring-1 ring-primary/20";
              } else if (isAnswerSubmitted) {
                if (isCorrect) {
                  btnClass = "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-semibold biometric-glow";
                } else if (isSelected) {
                  btnClass = "border-rose-500/20 bg-rose-500/5 text-rose-400 font-semibold biometric-glow";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full text-left p-4 rounded-xl border text-xs transition-all duration-300 flex items-center justify-between font-light ${btnClass} tactile-card`}
                >
                  <span>{opt}</span>
                  {isAnswerSubmitted && (
                    isCorrect ? (
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 ml-2" />
                    ) : isSelected ? (
                      <XCircle className="h-4.5 w-4.5 text-rose-400 shrink-0 ml-2" />
                    ) : null
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer explanations */}
          {isAnswerSubmitted && (
            <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl space-y-2 text-xs text-zinc-400 leading-relaxed animate-drift">
              <strong className="text-primary font-bold uppercase tracking-[0.2em] block text-[9px] biometric-glow">Evaluation Vector</strong>
              <p className="font-light">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-4 border-t border-white/5 flex justify-end">
            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="rounded-xl bg-primary px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-primary/95 disabled:opacity-40 transition-all duration-300 glowing-border"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="rounded-xl bg-primary px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-primary/95 transition-all flex items-center gap-1.5 glowing-border duration-300"
              >
                <span>{currentQuestionIdx + 1 === docQuestions.length ? "Finish Assessment" : "Next Question"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        // Results complete screen
        <div className="bg-[#0b0b0e]/95 border border-white/5 rounded-3xl glass-card p-8 shadow-2xl text-center space-y-6 relative overflow-hidden matte-layer">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] radial-glow opacity-30 pointer-events-none" />

          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/10 border border-primary/20 animate-ping pointer-events-none" />
            <div className="h-16 w-16 rounded-2xl bg-primary/15 flex items-center justify-center text-primary dark:text-purple-400 border border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.2)] animate-drift">
              <Award className="h-8 w-8" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white cinematic-title">Assessment Complete!</h2>
            <p className="text-xs text-zinc-500 font-light">Calibration nodes and learning DNA metrics successfully synced.</p>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto border-t border-b border-white/5 py-6 my-4">
            <div>
              <span className="text-2xl font-bold text-white font-mono">
                {score} / {docQuestions.length}
              </span>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold mt-1">Questions Correct</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-primary dark:text-purple-400 font-mono biometric-glow">
                +{30 + Math.round((score / docQuestions.length) * 50)} XP
              </span>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold mt-1">Cognitive Points</p>
            </div>
          </div>

          {weakTopics.length > 0 && (
            <div className="max-w-lg mx-auto text-left bg-rose-500/5 border border-rose-500/10 rounded-2xl p-5 space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400">Weak topics detected</h3>
              <div className="flex flex-wrap gap-2">
                {weakTopics.map((topic) => (
                  <span key={topic} className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[10px] font-bold text-rose-300">
                    {topic}
                  </span>
                ))}
              </div>
              {resultAnalysis && (
                <p className="text-[11px] leading-relaxed text-zinc-400">{resultAnalysis}</p>
              )}
            </div>
          )}

          {revisionPlan.length > 0 && (
            <div className="max-w-lg mx-auto text-left bg-primary/5 border border-primary/10 rounded-2xl p-5 space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary dark:text-purple-400">Focused revision plan</h3>
              <div className="space-y-2">
                {revisionPlan.map((item, idx) => (
                  <div key={`${item.topic}-${idx}`} className="rounded-xl border border-white/5 bg-[#0d0d11]/60 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-white">{item.topic}</span>
                      <span className="text-[9px] font-mono text-zinc-500">{item.duration || 15} min</span>
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed text-zinc-400">{item.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => {
                setCurrentQuestionIdx(0);
                setScore(0);
                setSelectedOption(null);
                setIsAnswerSubmitted(false);
                setQuizComplete(false);
                setIncorrectList([]);
                setAnswersHistory([]);
                setServerResult(null);
                setTimerSeconds(0);
              }}
              className="rounded-xl border border-white/5 bg-[#0d0d11]/80 hover:bg-[#121217] px-5 py-3 text-xs font-bold text-zinc-300 transition-all duration-300 flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="h-4 w-4" />
              Retake Quiz
            </button>
            <button
              onClick={() => router.push("/workspace")}
              className="rounded-xl bg-primary px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-primary/95 transition-all glowing-border duration-300"
            >
              Open Study Workspace
            </button>
            {revisionPlan.length > 0 && (
              <button
                onClick={() => router.push("/planner")}
                className="rounded-xl border border-primary/20 bg-primary/10 px-6 py-3 text-xs font-bold text-primary dark:text-purple-400 hover:bg-primary/15 transition-all duration-300"
              >
                Review Planner Tasks
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default function QuizPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8 flex flex-col justify-center relative z-10">
        <Suspense fallback={
          <div className="text-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-xs text-zinc-500 mt-2 font-light">Loading cognitive questions...</p>
          </div>
        }>
          <QuizContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
