import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { SiteHeader } from "@/components/features/app/layout/site-header";
import {
  LazyChangeEmailDialog,
  LazyChangePasswordDialog,
  LazyConfirmDialog,
  LazyFeedbackDialog,
  LazyFilterDialog,
  LazyImagePreviewDialog,
  LazyPostFormDialog,
  LazySetPasswordDialog,
  LazyUserProfileDialog,
  LazyVerifyEmailDialog,
} from "@/components/shared/lazy-dialogs";
import { getUser } from "@/functions/get-user";
import { useGlobalHotkeys } from "@/hooks/use-global-hotkeys";

export const Route = createFileRoute("/(app)")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser();

    return { session };
  },
});

function RouteComponent() {
  const { session } = Route.useRouteContext();

  // 全局快捷键
  useGlobalHotkeys();

  return (
    <div className="grid min-h-svh grid-rows-[auto_1fr]">
      <SiteHeader user={session ?? null} />
      <main className="overflow-auto">
        <Outlet />
      </main>
      <Suspense fallback={null}>
        <LazyUserProfileDialog />
        <LazyChangeEmailDialog />
        <LazyVerifyEmailDialog />
        <LazySetPasswordDialog />
        <LazyChangePasswordDialog />
        <LazyConfirmDialog />
        <LazyFeedbackDialog />
        <LazyPostFormDialog />
        <LazyFilterDialog />
        <LazyImagePreviewDialog />
      </Suspense>
    </div>
  );
}
