"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Timer, Cpu, Award, RefreshCw, ArrowRight, HelpCircle, CheckCircle, XCircle, Keyboard, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { DEMO_QUIZ, DEMO_DOCUMENT } from "@/lib/demo-data";
import Link from "next/link";

interface QuizServerResult {
  weakTopics?: string[];
  revisionPlan?: { topic: string; action: string; duration: number }[];
  analysis?: string;
}

export default function DemoQuizPage() {
  const router = useRouter();

  // States
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const [quizComplete, setQuizComplete] = useState(false);
  const [serverResult, setServerResult] = useState<QuizServerResult | null>(null);
  const [answersHistory, setAnswersHistory] = useState<{ questionIndex: number; selectedOption: number }[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Timer Effect
  useEffect(() => {
    if (quizComplete) return;
    const interval = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [quizComplete]);

  // Keyboard Navigation
  useEffect(() => {
    if (quizComplete) return;
    const handler = (e: KeyboardEvent) => {
      const key = e.key;
      // Number keys 1-4 to select options
      if (key >= "1" && key <= "4" && !isAnswerSubmitted) {
        const optionIdx = parseInt(key) - 1;
        if (optionIdx < DEMO_QUIZ[currentQuestionIdx].options.length) {
          setSelectedOption(optionIdx);
        }
      }
      // Enter to submit or next
      if (key === "Enter") {
        if (!isAnswerSubmitted && selectedOption !== null) {
          handleSubmitAnswer();
        } else if (isAnswerSubmitted) {
          handleNextQuestion();
        }
      }
      // H to show hint
      if ((key === "h" || key === "H") && !isAnswerSubmitted) {
        setShowHint(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [quizComplete, isAnswerSubmitted, selectedOption, currentQuestionIdx]);

  const currentQuestion = DEMO_QUIZ[currentQuestionIdx];

  const handleOptionSelect = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const getHintText = () => {
    const topic = currentQuestion.topic;
    if (topic === "Kepler's Laws") return "Think about Kepler's second law and how angular momentum is defined for a system orbiting under central forces.";
    if (topic === "Acceleration due to Gravity") return "Think about the formula g(d) = g * (1 - d/R). What happens when depth d is equal to the radius R?";
    if (topic === "Escape Velocity") return "Check the formula v_e = sqrt(2GM/R). Does the mass of the projectile appear anywhere in this equation?";
    if (topic === "Satellite Dynamics") return "Recall that orbital speed v_o = sqrt(GM/R) and escape velocity v_e = sqrt(2GM/R). Double check the ratio.";
    if (topic === "Weightlessness") return "Think about free fall: what is the reaction force on a scale if both you and the scale are falling at the exact same rate?";
    return "Read the options carefully and eliminate the ones that contradict the chapter text.";
  };

  function handleSubmitAnswer() {
    if (selectedOption === null || isAnswerSubmitted) return;

    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    setAnswersHistory(prev => [...prev, { questionIndex: currentQuestionIdx, selectedOption }]);

    if (isCorrect) {
      setScore(s => s + 1);
    }
  }

  function handleNextQuestion() {
    setIsAnswerSubmitted(false);
    setSelectedOption(null);
    setShowHint(false);

    if (currentQuestionIdx + 1 < DEMO_QUIZ.length) {
      setCurrentQuestionIdx(idx => idx + 1);
    } else {
      // Quiz finished!
      setQuizComplete(true);
      const finalScore = score + (selectedOption === currentQuestion.correctAnswer ? 1 : 0);
      const scorePct = Math.round((finalScore / DEMO_QUIZ.length) * 100);

      // Generate simulated diagnostic result client-side
      const wrongAnswers = DEMO_QUIZ.filter((q, idx) => {
        const ans = idx === currentQuestionIdx ? selectedOption : answersHistory.find(h => h.questionIndex === idx)?.selectedOption;
        return ans !== q.correctAnswer;
      });

      const weakTopics = Array.from(new Set(wrongAnswers.map(q => q.topic)));
      const revisionPlan = weakTopics.map(t => {
        let action = `Review Ch.8 Gravitation notes on ${t} and practice related derivations.`;
        if (t === "Weightlessness") action = "Review Kepler's free-fall logic and reaction force equations.";
        if (t === "Satellite Dynamics") action = "Re-derive binding energy E = -G*M*m/(2r) and kinetic energy equations.";
        return {
          topic: t,
          action,
          duration: 15
        };
      });

      let analysis = "Superb job! You have fully mastered the gravitational mechanics concepts in this chapter. Try sharing your score with friends!";
      if (scorePct < 80) {
        analysis = "Good attempt! You demonstrated solid understanding, but show minor gaps in formulas and specific conditions. Follow the revision plan below to lock in the material.";
      }

      setServerResult({
        weakTopics,
        revisionPlan,
        analysis
      });

      // Trigger Confetti Celebration for high scores (>= 80%)!
      if (scorePct >= 80) {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#7C3AED', '#2563EB', '#10B981', '#F59E0B'],
        });
      }
    }
  }

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleShare = () => {
    const scorePct = Math.round((score / DEMO_QUIZ.length) * 100);
    const url = `/api/dna-card?archetype=Gravitation%20Master&scores=${JSON.stringify({
      "Conceptual": scorePct,
      "Precision": 100,
      "Retention": 90,
      "Speed": Math.min(100, Math.max(10, 100 - timerSeconds))
    })}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />

      {/* Warning banner */}
      <div className="bg-gradient-to-r from-violet-900/50 via-purple-900/40 to-violet-900/50 border-b border-violet-500/20 py-2 px-4 text-center text-xs font-semibold text-violet-300 flex items-center justify-center gap-2 relative z-20">
        <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
        <span>📌 Demo Mode — Sign up free to calibrate custom quizzes.</span>
        <Link href="/login" className="underline hover:text-white ml-1">
          Sign Up Free
        </Link>
      </div>

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        {!quizComplete ? (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary block mb-1">
                  Active Calibration: Physics
                </span>
                <h1 className="text-xl font-bold text-white truncate max-w-[200px] sm:max-w-md">
                  {DEMO_DOCUMENT.title}
                </h1>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono text-zinc-300">
                  <Timer className="h-4 w-4 text-primary animate-pulse" />
                  <span>{formatTime(timerSeconds)}</span>
                </div>
                
                <span className="text-xs font-semibold text-zinc-400">
                  Question <strong className="text-white">{currentQuestionIdx + 1}</strong> of {DEMO_QUIZ.length}
                </span>
              </div>
            </div>

            {/* Question Panel */}
            <div className="border border-white/5 bg-[#0d0d11]/80 rounded-3xl p-6 md:p-8 space-y-6 glass-card relative overflow-hidden matte-layer">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-25 pointer-events-none" />
              
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 text-[9px] font-bold text-primary uppercase tracking-wider">
                <Cpu className="h-3 w-3" />
                <span>Topic: {currentQuestion.topic}</span>
              </span>

              <h2 className="text-base md:text-lg font-bold text-white leading-relaxed">
                {currentQuestion.question}
              </h2>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.correctAnswer;
                  
                  let optionStyle = "border-white/5 bg-[#060608]/40 text-zinc-300 hover:text-white hover:border-white/20 hover:bg-white/5";
                  
                  if (isSelected && !isAnswerSubmitted) {
                    optionStyle = "border-primary bg-primary/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]";
                  } else if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optionStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold";
                    } else if (isSelected) {
                      optionStyle = "border-rose-500 bg-rose-500/10 text-rose-300";
                    } else {
                      optionStyle = "border-white/5 bg-[#060608]/20 text-zinc-500 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full text-left p-4 rounded-xl border text-xs md:text-sm transition-all duration-300 flex items-center justify-between group cursor-pointer ${optionStyle}`}
                    >
                      <span>{option}</span>
                      
                      {isAnswerSubmitted && isCorrect && <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 ml-2" />}
                      {isAnswerSubmitted && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-rose-400 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {/* Hint section */}
              {showHint && !isAnswerSubmitted && (
                <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl text-xs text-primary/90 leading-relaxed font-light">
                  <strong>💡 Hint:</strong> {getHintText()}
                </div>
              )}

              {/* Submit & Next actions */}
              <div className="flex items-center justify-between border-t border-white/5 pt-6">
                {!isAnswerSubmitted ? (
                  <>
                    <button
                      onClick={() => setShowHint(true)}
                      className="text-xs text-zinc-500 hover:text-white underline cursor-pointer"
                    >
                      Need a hint? (Press H)
                    </button>
                    
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedOption === null}
                      className="px-6 py-3 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/95 disabled:opacity-40 transition-all cursor-pointer"
                    >
                      Confirm Selection
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-xs text-zinc-400 max-w-[70%] leading-relaxed font-light">
                      {selectedOption === currentQuestion.correctAnswer ? (
                        <span className="text-emerald-400 font-semibold">Correct!</span>
                      ) : (
                        <span className="text-rose-400 font-semibold">Incorrect.</span>
                      )}{" "}
                      {currentQuestion.explanation}
                    </div>

                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-3 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/95 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>{currentQuestionIdx + 1 === DEMO_QUIZ.length ? "Finish Quiz" : "Next Question"}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-600 font-light">
              <Keyboard className="h-3.5 w-3.5" />
              <span>Press <kbd className="bg-white/5 px-1 py-0.5 rounded border border-white/10">1</kbd>–<kbd className="bg-white/5 px-1 py-0.5 rounded border border-white/10">4</kbd> to select option · <kbd className="bg-white/5 px-1 py-0.5 rounded border border-white/10">Enter</kbd> to submit/continue · <kbd className="bg-white/5 px-1 py-0.5 rounded border border-white/10">H</kbd> for hint</span>
            </div>

          </div>
        ) : (
          <div className="space-y-6 text-center py-10">
            
            {/* Completion card */}
            <div className="border border-white/5 bg-[#0d0d11]/80 rounded-3xl p-8 max-w-xl mx-auto space-y-6 glass-card relative overflow-hidden matte-layer">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-20 pointer-events-none" />
              
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                <Award className="h-8 w-8 animate-bounce" />
              </div>

              <div>
                <h1 className="text-2xl font-bold">Calibration Completed</h1>
                <p className="text-xs text-zinc-500 mt-1 font-mono">Time elapsed: {formatTime(timerSeconds)}</p>
              </div>

              {/* Score Display */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 grid grid-cols-2 gap-4 divide-x divide-white/5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Final Score</span>
                  <p className="text-3xl font-extrabold text-primary">
                    {Math.round((score / DEMO_QUIZ.length) * 100)}%
                  </p>
                  <span className="text-[10px] text-zinc-400 font-mono">({score} / {DEMO_QUIZ.length} correct)</span>
                </div>
                
                <div className="pl-4">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">XP Gained</span>
                  <p className="text-3xl font-extrabold text-amber-400">+{score * 10} XP</p>
                  <span className="text-[10px] text-zinc-400">Demo bonus included</span>
                </div>
              </div>

              {/* AI Diagnostic Analysis */}
              {serverResult && (
                <div className="text-left space-y-4 pt-2">
                  <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl space-y-2">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5" />
                      Cognitive Diagnostic Analysis
                    </h3>
                    <p className="text-xs text-zinc-300 leading-relaxed font-light">{serverResult.analysis}</p>
                  </div>

                  {serverResult.weakTopics && serverResult.weakTopics.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                        <XCircle className="h-3.5 w-3.5" />
                        Gaps Detected in Topics
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {serverResult.weakTopics.map(t => (
                          <span key={t} className="text-[10px] font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3 py-1 rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {serverResult.revisionPlan && serverResult.revisionPlan.length > 0 && (
                    <div className="space-y-3 border-t border-white/5 pt-4">
                      <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Autopilot Spaced Revision Plan
                      </h3>
                      <div className="space-y-2">
                        {serverResult.revisionPlan.map((item, idx) => (
                          <div key={idx} className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between text-xs">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-zinc-300">{item.topic}</span>
                              <p className="text-[10px] text-zinc-500 font-light">{item.action}</p>
                            </div>
                            <span className="font-mono text-primary font-bold text-[10px] shrink-0 ml-4">
                              {item.duration} min
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleShare}
                  className="w-full py-3 bg-amber-500 text-black hover:bg-amber-400 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Share My Score Card</span>
                </button>
                
                <button
                  onClick={() => router.push("/workspace/demo")}
                  className="w-full py-3 bg-white/10 hover:bg-white/15 border border-white/10 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Return to Workspace
                </button>
              </div>

            </div>

            {/* CTA warning banner to register */}
            <div className="max-w-md mx-auto p-5 bg-gradient-to-br from-violet-900/20 to-blue-900/10 border border-violet-500/20 rounded-2xl space-y-3">
              <p className="text-xs text-zinc-300 leading-normal font-light">
                Unlock active recall tracking, 3D memory decay forecasting, custom study note parsing, and 8-axis Learning DNA profiling!
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-purple-400 hover:underline"
              >
                <span>Create a Free Account Now</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
