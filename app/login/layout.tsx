import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — AskMe AI",
  description: "Sign in or create your AskMe AI account to start your personalized learning journey.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
