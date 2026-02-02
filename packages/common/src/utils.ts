import { site } from "./site";

export function getBaseUrl() {
  // Vercel (legacy/alternative deployment)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.VERCEL_ENV === "production") {
    return site.url;
  }

  // Development
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3001";
  }

  // Production (Cloudflare Workers or other)
  return site.url;
}
