"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore } from "@/lib/store";
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function UploadPage() {
  const { addDocument } = useStore();
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

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

    const stages = [
      { prg: 20, msg: "Initializing local OCR scanner..." },
      { prg: 45, msg: "Cleaning layout noise and mapping math definitions..." },
      { prg: 70, msg: "Generating 768-dimensional semantic embeddings vectors..." },
      { prg: 90, msg: "Ingesting embeddings into local vector store..." },
      { prg: 100, msg: "Ingestion complete! Syncing cognitive profile graph nodes..." }
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < stages.length) {
        setProgress(stages[currentIdx].prg);
        setStage(stages[currentIdx].msg);
        currentIdx++;
      } else {
        clearInterval(interval);
        // Complete the ingestion in store
        addDocument(name, size, text);
        setTimeout(() => {
          router.push("/workspace");
        }, 1200);
      }
    }, 900);
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
    <div className="flex flex-col min-h-screen bg-background neural-grid relative">
      <Navbar />

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-16 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Ingest Study Documents & Syllabus
          </h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Upload text notes, slide outputs, or textbooks. Our parser extracts context formulas and builds high-speed client vector weights instantly.
          </p>
        </div>

        {/* Upload Container */}
        <div className="bg-card/40 border border-border rounded-2xl glass-card p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-25 pointer-events-none" />

          {!uploading ? (
            <div className="space-y-6">
              {/* Drag/Drop box */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragActive 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,text/plain"
                  onChange={handleFileInput}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary dark:text-purple-400">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Drag and drop document here</p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse local storage (PDF, TXT)</p>
                  </div>
                </label>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3.5 flex items-center gap-2 text-xs">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Demo button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/80">
                <span className="text-xs text-muted-foreground font-semibold uppercase">No file ready?</span>
                <button
                  onClick={handleLoadDemo}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-muted/60 px-4 py-2.5 text-xs font-bold text-foreground transition-all"
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
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary dark:text-purple-400">
                  <RefreshCw className="h-7 w-7 animate-spin" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">Parsing "{fileName}"</h3>
                <p className="text-xs text-primary dark:text-purple-400 font-semibold">{stage}</p>
              </div>

              {/* Ingestion Progress Bar */}
              <div className="w-full max-w-md mx-auto bg-muted rounded-full h-2 overflow-hidden border border-border">
                <div 
                  className="bg-primary h-full transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
                <CheckCircle2 className={`h-4.5 w-4.5 ${progress === 100 ? "text-emerald-500" : "text-zinc-600"}`} />
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
