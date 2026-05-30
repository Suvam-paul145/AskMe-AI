import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ask-me-ai-chi.vercel.app"),
  title: "AskMe AI - Your Personal Cognitive Learning OS",
  description: "Upload notes, solve doubts, generate quizzes, track weak topics, and map your learning DNA with AI-powered study tools.",
  manifest: "/manifest.json",
  openGraph: {
    title: "AskMe AI — Cognitive Learning OS",
    description: "Upload notes → AI tutor, quizzes, and revision plans in 60 seconds.",
    url: "https://ask-me-ai-chi.vercel.app",
    siteName: "AskMe AI",
    type: "website",
    images: ["/favicon.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AskMe AI — Cognitive Learning OS",
    description: "Upload notes → AI tutor, quizzes, and revision plans in 60 seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          {children}
        </StoreProvider>
        {/* Puter.js SDK — provides puter.ai.txt2img() for FLUX image generation */}
        <Script
          src="https://js.puter.com/v2/"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
