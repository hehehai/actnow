import { site } from "@actnow/common";
import { getEnvValue, isDevelopment } from "@actnow/common/runtime-env";

export function getAppBaseUrl() {
  const configuredUrl = getEnvValue("BETTER_AUTH_URL");
  if (configuredUrl) {
    return configuredUrl;
  }

  const corsOrigin = getEnvValue("CORS_ORIGIN");
  if (corsOrigin) {
    return corsOrigin;
  }

  if (isDevelopment()) {
    return "http://localhost:3002";
  }

  return site.url;
}
