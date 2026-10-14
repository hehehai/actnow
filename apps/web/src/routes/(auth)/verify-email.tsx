import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { VerifyEmailInvalid } from "@/components/features/app/auth/verify-email-invalid";
import { VerifyEmailSuccess } from "@/components/features/app/auth/verify-email-success";
import { client } from "@/lib/orpc";
import { createPageMeta } from "@/lib/seo";

const searchSchema = z.object({
  token: z.string(),
  email: z.email(),
});

const verifyEmailMeta = createPageMeta({
  title: "Verify Email",
  description: "Verify your email address for your Actnow account.",
  url: "/verify-email",
  noIndex: true,
});

export const Route = createFileRoute("/(auth)/verify-email")({
  validateSearch: searchSchema,
  beforeLoad: async ({ search }) => {
    const { token } = search;
    const result = await client.auth.verifyEmail({ token });
    return result;
  },
  component: RouteComponent,
  errorComponent: VerifyEmailInvalid,
  head: () => ({
    meta: verifyEmailMeta.meta,
    links: verifyEmailMeta.links,
  }),
});

function RouteComponent() {
  const { email } = Route.useSearch();
  const success = Route.useLoaderData();

  if (success) {
    return <VerifyEmailSuccess />;
  }

  return <VerifyEmailInvalid email={email} />;
}
