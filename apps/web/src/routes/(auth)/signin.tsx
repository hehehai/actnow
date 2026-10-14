import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { SignIn } from "@/components/features/app/auth/signin";
import { createPageMeta } from "@/lib/seo";

const routeSearchSchema = z.object({
  mode: z.enum(["email", "email-otp", "password"]).default("email").nullish(),
  error: z.string().nullish(),
  error_description: z.string().nullish(),
});

const signinMeta = createPageMeta({
  title: "Sign In",
  description:
    "Sign in to your Actnow account to save and share creative ideas.",
  url: "/signin",
  noIndex: true,
});

export const Route = createFileRoute("/(auth)/signin")({
  validateSearch: routeSearchSchema,
  component: SignIn,
  head: () => ({
    meta: signinMeta.meta,
    links: signinMeta.links,
  }),
});
