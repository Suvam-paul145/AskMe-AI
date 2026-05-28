import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features — AskMe AI Cognitive Engines",
  description: "10 AI-powered learning engines: RAG chat, quiz generation, memory graph, learning DNA profiling, and more.",
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
