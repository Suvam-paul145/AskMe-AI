import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — AskMe AI Plans",
  description: "Choose your learning plan: Free Starter, Cognitive Pro, or Institutional. All Pro features free during beta.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
