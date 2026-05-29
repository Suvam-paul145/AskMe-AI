"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore } from "@/lib/store";
import { Upload, CheckCircle2, AlertCircle, RefreshCw, Cpu, Database } from "lucide-react";

export default function UploadPage() {
  const { uploadDocument } = useStore();
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

  const processFile = async (file: File) => {
    // Validate file type
    const allowedTypes = ["application/pdf", "text/plain"];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".pdf") && !file.name.endsWith(".txt")) {
      setError("Only PDF and TXT text files are supported for vector indexing.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("This file is too large. Upload a PDF or TXT file under 10 MB.");
      return;
    }

    setUploading(true);
    setFileName(file.name);
    setError("");
    setProgress(0);
    setLogHistory([]);

    try {
      await uploadDocument(file, (stageMsg: string, prog: number) => {
        setStage(stageMsg);
        setProgress(prog);
        setLogHistory((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${stageMsg}`]);
      });

      // Add final log entries
      setLogHistory((prev) => [
        ...prev,
        `[SYSTEM] All vector embeddings stored in Supabase pgvector.`,
        `[SYNC] Memory graph node created. XP rewarded: +50 XP.`,
      ]);

      setTimeout(() => {
        router.push("/workspace");
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
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
            <span>Upload and learn</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white cinematic-title">
            Upload Study Material
          </h1>
          <p className="text-zinc-400 text-xs font-light max-w-lg mx-auto leading-relaxed">
            Add a PDF or TXT notes file. AskMe AI will extract the text, summarize it, index it for grounded chat, and create a starter quiz.
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
                  accept=".pdf,.txt,application/pdf,text/plain"
                  onChange={handleFileInput}
                />
                
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary dark:text-purple-400 border border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.15)] group-hover:scale-105 transition-transform">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white tracking-wide">Drag and drop document here</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-300 mt-1 font-light">or click to browse local files (PDF or TXT, under 10 MB)</p>
                  </div>
                </label>
              </div>

              {error && (
                <div className="bg-rose-500/5 border border-rose-500/10 text-rose-400 rounded-xl p-3.5 flex items-center gap-2.5 text-[10px] font-semibold">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 biometric-glow" />
                  <span>{error}</span>
                </div>
              )}
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
                <h3 className="text-sm font-bold text-white tracking-wide">Processing &quot;{fileName}&quot;</h3>
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
                <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[8px] uppercase tracking-wider text-zinc-400 dark:text-zinc-300">
                  <span className="flex items-center gap-1"><Cpu className="h-3 w-3" /> Console Log output</span>
                  <span className="animate-pulse">● Live</span>
                </div>
                {logHistory.map((log, idx) => (
                  <div key={idx} className="animate-drift leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-zinc-400 font-light">
                <CheckCircle2 className={`h-4.5 w-4.5 ${progress === 100 ? "text-emerald-400 animate-pulse" : "text-zinc-400"}`} />
                <span>{progress}% Complete</span>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
