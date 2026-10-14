import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AccountSidebar } from "@/components/features/app/account/account-sidebar";
import { authQueryOptions } from "@/lib/queries";
import { createPageMeta } from "@/lib/seo";

const accountMeta = createPageMeta({ title: "Your account", noIndex: true });

export const Route = createFileRoute("/(app)/(user)/account")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(authQueryOptions());
    if (!user) throw redirect({ to: "/signin" });
  },
  head: () => ({ meta: accountMeta.meta }),
  component: AccountLayout,
});

function AccountLayout() {
  return (
    <div className="min-h-full">
      <div className="container mx-auto max-w-7xl px-4 py-9 pb-16">
        <div className="grid items-start gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
          <AccountSidebar />
          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
