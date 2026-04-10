import { getAuth } from "@actnow/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }) => getAuth().handler(request),
      POST: async ({ request }) => getAuth().handler(request),
    },
  },
});
