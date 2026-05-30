import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Architecture — 6-Step RAG Pipeline | AskMe AI",
  description: "How AskMe AI works: pdf-parse ingestion → semantic chunking → Gemini embeddings → pgvector indexing → cosine retrieval → LLM synthesis.",
};

export default function ArchitectureLayout({ children }: { children: React.ReactNode }) {
  return children;
}
