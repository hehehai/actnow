import { PostFeedSort } from "@actnow/common";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthLayout } from "@/components/features/app/auth/auth-layout";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/(auth)")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      orpc.app.post.list.queryOptions({
        input: {
          cursor: undefined,
          limit: 1,
          sort: PostFeedSort.LATEST,
          visibility: "public",
        },
      })
    ),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}
