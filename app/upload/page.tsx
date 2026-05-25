"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore } from "@/lib/store";
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Cpu, Database } from "lucide-react";

export default function UploadPage() {
  const { addDocument } = useStore();
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [logHistory, setLogHistory] = useState<string[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const simulateIngestion = (name: string, size: string, text: string) => {
    setUploading(true);
    setFileName(name);
    setError("");
    setProgress(0);
    setLogHistory([]);

    const stages = [
      { prg: 20, msg: "Initializing local OCR scanner...", log: "[SYSTEM] Ingestion channel secure. Starting visual scanner." },
      { prg: 45, msg: "Cleaning layout noise and mapping math definitions...", log: "[PARSER] Cleaned layout noise. Detected formulas: F = k*q1*q2/r^2." },
      { prg: 70, msg: "Generating 768-dimensional semantic embeddings vectors...", log: "[VECTOR] Computed 768-dimensional semantic embeddings matrix weights." },
      { prg: 90, msg: "Ingesting embeddings into local vector store...", log: "[DB] Embeddings indexed into local Vector Weight DB successfully." },
      { prg: 100, msg: "Ingestion complete! Syncing cognitive profile graph nodes...", log: "[SYNC] Memory graph synced! XP rewarded: +50 XP." }
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < stages.length) {
        setProgress(stages[currentIdx].prg);
        setStage(stages[currentIdx].msg);
        setLogHistory(prev => [...prev, stages[currentIdx].log]);
        currentIdx++;
      } else {
        clearInterval(interval);
        // Complete the ingestion in store
        addDocument(name, size, text);
        setTimeout(() => {
          router.push("/workspace");
        }, 1500);
      }
    }, 1000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf") || file.type === "text/plain") {
        const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
        simulateIngestion(file.name, sizeStr, "Sample extracted syllabus text from " + file.name + ". Physics formulas: F = m*a, E = h*nu. DNA replication starts at origins of replication.");
      } else {
        setError("Only PDF and TXT text files are supported for vector indexing.");
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      simulateIngestion(file.name, sizeStr, "Sample parsed contents. Coulomb's Law dictates electrical forces. Translation happens in the ribosome where peptide bonds bond amino acids.");
    }
  };

  // Trigger quick load demo file
  const handleLoadDemo = () => {
    simulateIngestion("Genetics and Chromosomal Crossing Over.pdf", "1.8 MB", "Genetics is the study of genes and heredity. Chromosomal crossover is the exchange of genetic material between homologous chromosomes that results in recombinant chromosomes during sexual reproduction. It occurs in prophase I of meiosis. Recombination frequency maps relative distances on chromosomes.");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />

      {/* Atmospheric ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-primary/5 rounded-full filter blur-[120px] pointer-events-none animate-breathe" />
      <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-[#6366f1]/5 rounded-full filter blur-[80px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-16 sm:px-6 lg:px-8 flex flex-col justify-center relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[10px] font-bold text-primary dark:text-purple-400 uppercase tracking-widest biometric-glow mb-2">
            <Database className="h-3.5 w-3.5 animate-pulse" />
            <span>Chamber Access Enabled</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white cinematic-title">
            Knowledge Ingestion Chamber
          </h1>
          <p className="text-zinc-400 text-xs font-light max-w-lg mx-auto leading-relaxed">
            Feed textbooks or notes slides to the compiler. Our parsing engine indexes context vectors and calibrates memory networks instantly.
          </p>
        </div>

        {/* Ingestion Chamber Container */}
        <div className="bg-[#0b0b0e]/95 border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden matte-layer spatial-shadow-lg">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-25 pointer-events-none" />

          {!uploading ? (
            <div className="space-y-6">
              {/* Drag/Drop scanner box */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                  dragActive 
                    ? "border-primary bg-primary/15" 
                    : "border-white/10 hover:border-primary/45 bg-[#070709]/60 hover:bg-[#0c0c0f]"
                }`}
              >
                {/* Visual scanner sweep line only on hover or active */}
                <div className="absolute inset-x-0 h-1/2 w-full scanner-sweep pointer-events-none opacity-40" />

                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,text/plain"
                  onChange={handleFileInput}
                />
                
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary dark:text-purple-400 border border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.15)] group-hover:scale-105 transition-transform">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white tracking-wide">Drag and drop document here</p>
                    <p className="text-[10px] text-zinc-500 mt-1 font-light">or click to browse local files (PDF, TXT)</p>
                  </div>
                </label>
              </div>

              {error && (
                <div className="bg-rose-500/5 border border-rose-500/10 text-rose-400 rounded-xl p-3.5 flex items-center gap-2.5 text-[10px] font-semibold">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 biometric-glow" />
                  <span>{error}</span>
                </div>
              )}

              {/* Demo button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">No study files ready?</span>
                <button
                  onClick={handleLoadDemo}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-[#09090b]/80 hover:bg-[#121217] px-4.5 py-2.5 text-xs font-bold text-zinc-200 transition-all duration-300"
                >
                  <FileText className="h-4 w-4 text-primary" />
                  Load Genetics Demo Chapter
                </button>
              </div>
            </div>
          ) : (
            // Processing scanner state
            <div className="space-y-6 text-center py-6">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary/5 border border-primary/20 animate-ping pointer-events-none" />
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary dark:text-purple-400 border border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white tracking-wide">Parsing "{fileName}"</h3>
                <p className="text-[10px] text-primary dark:text-purple-400 font-bold uppercase tracking-wider animate-pulse">{stage}</p>
              </div>

              {/* Ingestion Progress Bar */}
              <div className="w-full max-w-md mx-auto bg-white/5 rounded-full h-1 overflow-hidden border border-white/5">
                <div 
                  className="bg-primary h-full transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Real-time scanning log terminal */}
              <div className="w-full max-w-md mx-auto bg-[#070709] border border-white/5 rounded-xl p-4 text-left font-mono text-[9px] text-zinc-400 space-y-2.5 max-h-[140px] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[8px] uppercase tracking-wider text-zinc-500">
                  <span className="flex items-center gap-1"><Cpu className="h-3 w-3" /> Console Log output</span>
                  <span className="animate-pulse">● Recv</span>
                </div>
                {logHistory.map((log, idx) => (
                  <div key={idx} className="animate-drift leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-zinc-400 font-light">
                <CheckCircle2 className={`h-4.5 w-4.5 ${progress === 100 ? "text-emerald-400 animate-pulse" : "text-zinc-600"}`} />
                <span>{progress}% Vectorized</span>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
