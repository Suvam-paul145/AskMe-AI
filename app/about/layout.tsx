import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — AskMe AI Story & Mission",
  description: "Learn about AskMe AI's mission to maximize cognitive efficiency through active retrieval, memory decay compensation, and meta-cognitive tracking.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
