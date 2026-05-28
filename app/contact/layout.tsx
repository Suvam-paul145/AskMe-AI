import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — AskMe AI Support",
  description: "Get in touch with the AskMe AI team for technical support, licensing inquiries, or general questions.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
