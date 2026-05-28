import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — AskMe AI Scientific Recall Journal",
  description: "Explore neuroscientific publications, spacing calibrations, and vector indexing strategies behind AskMe AI.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
