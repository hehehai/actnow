import { Suspense } from "react";
import {
  LazyConfirmDialog,
  LazyFeedbackDetailSheet,
  LazyImagePreviewDialog,
  LazyPanelPostFormDialog,
  LazyPostDetailSheet,
  LazyUserDetailSheet,
} from "@/components/shared/lazy-dialogs";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { NavUserProps } from "./nav-user";
import { AppSidebar } from "./sidebar";

interface PanelLayoutProps {
  children: React.ReactNode;
  user?: NavUserProps["initialUser"] | null;
}

export default function PanelLayout({ children, user }: PanelLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>{children}</SidebarInset>
      <Suspense fallback={null}>
        <LazyUserDetailSheet />
        <LazyPostDetailSheet />
        <LazyFeedbackDetailSheet />
        <LazyConfirmDialog />
        <LazyImagePreviewDialog />
        <LazyPanelPostFormDialog />
      </Suspense>
    </SidebarProvider>
  );
}
