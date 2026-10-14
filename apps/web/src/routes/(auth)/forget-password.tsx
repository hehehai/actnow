import { createFileRoute } from "@tanstack/react-router";
import { ForgotPassword } from "@/components/features/app/auth/forgot-password";
import { createPageMeta } from "@/lib/seo";

const forgetPasswordMeta = createPageMeta({
  title: "Forgot Password",
  description: "Reset your Actnow account password.",
  url: "/forget-password",
  noIndex: true,
});

export const Route = createFileRoute("/(auth)/forget-password")({
  component: ForgotPassword,
  head: () => ({
    meta: forgetPasswordMeta.meta,
    links: forgetPasswordMeta.links,
  }),
});
