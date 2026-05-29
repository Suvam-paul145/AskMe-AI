import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY", // Completely blocks clickjacking attacks
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Blocks MIME sniffing and unauthorized code execution
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin", // Keeps URLs private when routing cross-origin
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=()", // Sandbox device features
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block", // Blocks reflective Cross-Site Scripting (XSS)
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload", // Enforces HSTS (Force SSL/HTTPS)
          }
        ]
      }
    ];
  }
};

export default nextConfig;
