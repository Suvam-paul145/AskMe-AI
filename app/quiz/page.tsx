"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore, QuizQuestion } from "@/lib/store";
import { Timer, Cpu, Award, RefreshCw, ArrowRight, HelpCircle, CheckCircle, XCircle } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 py-32">
        <HelpCircle className="h-16 w-16 text-primary" />
        <h2 className="text-xl font-bold text-foreground">No quiz calibration ready</h2>
        <p className="text-sm text-muted-foreground max-w-sm">Please select a valid study notes chapter containing generated questions.</p>
        <button
          onClick={() => router.push("/workspace")}
          className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary/95"
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

  return (
    <div className="max-w-2xl mx-auto w-full py-8 space-y-6">
      
      {/* Quiz Top bar info */}
      <div className="flex items-center justify-between bg-card border border-border p-4 rounded-xl glass-card text-xs font-semibold shadow-sm">
        <span className="text-muted-foreground flex items-center gap-1.5">
          <Cpu className="h-4 w-4 text-primary shrink-0 animate-pulse" />
          Active: <strong className="text-foreground truncate max-w-[200px]">{activeDoc?.title || "Notes Chapter"}</strong>
        </span>
        <div className="flex items-center gap-1.5 text-zinc-500">
          <Timer className="h-4 w-4" />
          <span>{formatTime(timerSeconds)}</span>
        </div>
      </div>

      {!quizComplete ? (
        <div className="bg-card/40 border border-border rounded-2xl glass-card p-6 md:p-8 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-25 pointer-events-none" />

          {/* Progress row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/80 pb-4">
            <span>Question {currentQuestionIdx + 1} of {docQuestions.length}</span>
            <span className="font-bold text-primary dark:text-purple-400">Topic: {currentQuestion.topic}</span>
          </div>

          {/* Question Text */}
          <h3 className="text-lg font-bold text-foreground leading-snug">
            {currentQuestion.question}
          </h3>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = currentQuestion.correctAnswer === idx;
              
              let btnClass = "border-border bg-card/60 hover:bg-muted text-muted-foreground hover:text-foreground";
              if (isSelected && !isAnswerSubmitted) {
                btnClass = "border-primary bg-primary/5 text-primary ring-2 ring-primary/15";
              } else if (isAnswerSubmitted) {
                if (isCorrect) {
                  btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold";
                } else if (isSelected) {
                  btnClass = "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between ${btnClass}`}
                >
                  <span>{opt}</span>
                  {isAnswerSubmitted && (
                    isCorrect ? (
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 ml-2" />
                    ) : isSelected ? (
                      <XCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 ml-2" />
                    ) : null
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer explanations */}
          {isAnswerSubmitted && (
            <div className="bg-muted/40 border border-border p-4 rounded-xl space-y-2 text-xs text-muted-foreground leading-relaxed animate-float">
              <strong className="text-foreground font-bold uppercase tracking-wider block text-[10px] text-primary">Explanation</strong>
              <p>{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-4 border-t border-border/80 flex justify-end">
            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary/95 disabled:opacity-40 transition-all glowing-border"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary/95 transition-all flex items-center gap-1 glowing-border"
              >
                <span>{currentQuestionIdx + 1 === docQuestions.length ? "Finish Assessment" : "Next Question"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        // Results complete screen
        <div className="bg-card/40 border border-border rounded-2xl glass-card p-8 shadow-xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] radial-glow opacity-30 pointer-events-none" />

          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/10 border border-primary/20 animate-ping pointer-events-none" />
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary dark:text-purple-400">
              <Award className="h-8 w-8" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-foreground">Assessment Complete!</h2>
            <p className="text-xs text-muted-foreground">Calibration nodes and learning DNA metrics successfully synced.</p>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto border-t border-b border-border/85 py-6 my-4">
            <div>
              <span className="text-2xl font-bold text-foreground">
                {score} / {docQuestions.length}
              </span>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mt-1">Questions Correct</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-primary dark:text-purple-400">
                +{30 + Math.round((score / docQuestions.length) * 50)} XP
              </span>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mt-1">Cognitive Points Gained</p>
            </div>
          </div>

          {/* Navigation Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
              className="rounded-xl border border-border bg-card hover:bg-muted px-5 py-2.5 text-xs font-bold text-foreground transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="h-4 w-4" />
              Retake quiz
            </button>
            <button
              onClick={() => router.push("/workspace")}
              className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary/95 transition-all glowing-border"
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
    <div className="flex flex-col min-h-screen bg-background neural-grid relative">
      <Navbar />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8 flex flex-col justify-center">
        <Suspense fallback={
          <div className="text-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-xs text-muted-foreground mt-2">Loading cognitive questions...</p>
          </div>
        }>
          <QuizContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
