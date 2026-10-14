import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { SiteFooter } from "@/components/features/app/layout/site-footer";
import { SiteHeader } from "@/components/features/app/layout/site-header";
import {
  LazyChangeEmailDialog,
  LazyChangePasswordDialog,
  LazyConfirmDialog,
  LazyFeedbackDialog,
  LazyImagePreviewDialog,
  LazySetPasswordDialog,
  LazyVerifyEmailDialog,
} from "@/components/shared/lazy-dialogs";
import { getUser } from "@/functions/get-user";

export const Route = createFileRoute("/(app)")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser();

    return { session };
  },
});

function RouteComponent() {
  const { session } = Route.useRouteContext();

  return (
    <div className="grid min-h-svh grid-rows-[auto_1fr_auto]">
      <SiteHeader user={session ?? null} />
      <main className="min-w-0 bg-app">
        <Outlet />
      </main>
      <SiteFooter />
      <Suspense fallback={null}>
        <LazyChangeEmailDialog />
        <LazyVerifyEmailDialog />
        <LazySetPasswordDialog />
        <LazyChangePasswordDialog />
        <LazyConfirmDialog />
        <LazyFeedbackDialog />
        <LazyImagePreviewDialog />
      </Suspense>
    </div>
  );
}
