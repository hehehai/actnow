import { createFileRoute } from "@tanstack/react-router";
import { SignUp } from "@/components/features/app/auth/signup";
import { createPageMeta } from "@/lib/seo";

const signupMeta = createPageMeta({
  title: "Sign Up",
  description:
    "Create an Actnow account to save ideas and share creative work.",
  url: "/signup",
  noIndex: true,
});

export const Route = createFileRoute("/(auth)/signup")({
  component: SignUp,
  head: () => ({
    meta: signupMeta.meta,
    links: signupMeta.links,
  }),
});
