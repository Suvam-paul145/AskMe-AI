"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore, QuizQuestion } from "@/lib/store";
import { Timer, Cpu, Award, RefreshCw, ArrowRight, HelpCircle, CheckCircle, XCircle, Activity, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

function QuizContent() {
  const { quizzes, addAttempt, documents } = useStore();
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
  const [timerSeconds, setTimerSeconds] = useState(0);

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
      const percentage = Math.round(((score + (selectedOption === currentQuestion.correctAnswer ? 1 : 0)) / docQuestions.length) * 100);
      
      // Calculate weak topics from incorrect attempts
      const finalIncorrectList = [...incorrectList];
      if (selectedOption !== currentQuestion.correctAnswer) {
        finalIncorrectList.push(currentQuestion);
      }
      const weakTopics = Array.from(new Set(finalIncorrectList.map(q => q.topic)));

      // Add attempt data to store
      addAttempt({
        documentId: docId,
        documentTitle: activeDoc?.title || "Custom Notes Syllabus",
        score: percentage,
        totalQuestions: docQuestions.length,
        correctAnswersCount: score + (selectedOption === currentQuestion.correctAnswer ? 1 : 0),
        weakTopics
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
