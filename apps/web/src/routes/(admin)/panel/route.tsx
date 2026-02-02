import { UserRole } from "@actnow/common";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  notFound,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import PanelLayout from "@/components/features/panel/layout/layout";
import { authQueryOptions } from "@/lib/queries";
import { createPageMeta } from "@/lib/seo";

const adminMeta = createPageMeta({
  noIndex: true,
});

export const Route = createFileRoute("/(admin)/panel")({
  beforeLoad: async ({ context }) => {
    const data = await context.queryClient.ensureQueryData(authQueryOptions());

    if (!data) {
      throw redirect({ to: "/signin" });
    }

    if (data.role !== UserRole.ADMIN) {
      throw notFound();
    }

    return data;
  },
  head: () => ({
    meta: adminMeta.meta,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useSuspenseQuery(authQueryOptions());
  return (
    <PanelLayout user={data}>
      <Outlet />
    </PanelLayout>
  );
}
