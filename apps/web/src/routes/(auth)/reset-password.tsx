import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { ResetPasswordForm } from "@/components/features/app/auth/reset-password-form";
import { ResetPasswordInvalid } from "@/components/features/app/auth/reset-password-invalid";
import { createPageMeta } from "@/lib/seo";

const searchSchema = z.object({
  token: z.string(),
  email: z.email(),
});

const resetPasswordMeta = createPageMeta({
  title: "Reset Password",
  description: "Set a new password for your Refto account.",
  url: "/reset-password",
  noIndex: true,
});

export const Route = createFileRoute("/(auth)/reset-password")({
  component: RouteComponent,
  validateSearch: searchSchema,
  errorComponent: ResetPasswordInvalid,
  head: () => ({
    meta: resetPasswordMeta.meta,
    links: resetPasswordMeta.links,
  }),
});

function RouteComponent() {
  const { token, email } = Route.useSearch();

  if (!(email && token)) {
    return <ResetPasswordInvalid />;
  }

  // Render the password reset form - OTP will be validated when user submits
  return <ResetPasswordForm email={email} token={token} />;
}
