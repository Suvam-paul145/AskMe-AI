import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Architecture — AskMe AI RAG Pipeline",
  description: "Technical blueprint of AskMe AI's RAG pipeline: document ingestion, semantic chunking, vector embeddings, and AI response synthesis.",
};

export default function ArchitectureLayout({ children }: { children: React.ReactNode }) {
  return children;
}
