import { site } from "./site";

export function getBaseUrl() {
  const processEnv: Record<string, string | undefined> =
    typeof process !== "undefined" ? (process.env ?? {}) : {};

  // Vercel (legacy/alternative deployment)
  const vercelUrl = processEnv.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  if (processEnv.VERCEL_ENV === "production") {
    return site.url;
  }

  // Development
  if (processEnv.NODE_ENV === "development") {
    return "http://localhost:3002";
  }

  // Production (Cloudflare Workers or other)
  return site.url;
}
