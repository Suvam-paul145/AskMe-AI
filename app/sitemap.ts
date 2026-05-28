import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ask-me-ai-chi.vercel.app";
  const lastModified = new Date();

  return [
    { url: baseUrl, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/features`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/architecture`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/pricing`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/blog`, lastModified, changeFrequency: "weekly", priority: 0.6 },
  ];
}
