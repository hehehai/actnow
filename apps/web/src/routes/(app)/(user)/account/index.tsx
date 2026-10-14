import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc";
import { authQueryOptions } from "@/lib/queries";

export const Route = createFileRoute("/(app)/(user)/account/")({
  component: AccountDashboardPage,
});

function AccountDashboardPage() {
  const { data: user } = useSuspenseQuery(authQueryOptions());
  const { data: profile } = useQuery({
    ...orpc.app.user.publicProfile.queryOptions({
      input: { id: user?.id ?? "" },
    }),
    enabled: Boolean(user?.id),
  });
  const { data: subscription } = useQuery(
    orpc.app.user.getProfile.queryOptions()
  );
  const posts = profile?.posts ?? [];
  const published = posts.filter((item) => item.post.status === "published");
  const drafts = posts.filter((item) => item.post.status === "draft");
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="font-medium text-[11px] text-brand uppercase tracking-[0.16em]">
            Your account
          </p>
          <h1 className="mt-2 text-balance font-medium text-3xl tracking-tight">
            Welcome back, {user?.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Manage your profile and account preferences.
          </p>
        </div>
        {isAdmin && (
          <Button
            className="h-11 rounded-xl"
            nativeButton={false}
            render={<Link to="/panel" />}
          >
            Manage content
          </Button>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
          Overview
        </h2>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
          <Stat label="Published" value={published.length} />
          <Stat label="Drafts" value={drafts.length} />
          <Stat
            label="Plan"
            value={subscription?.subscription?.plan ?? "Free"}
          />
        </div>
      </section>

      {isAdmin && (
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-medium text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
              Your content
            </h2>
            <Link
              className="text-sm font-medium text-brand hover:underline"
              to="/panel"
            >
              Open content manager
            </Link>
          </div>
          {posts.length ? (
            <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {posts.slice(0, 5).map(({ post }) => (
                <div className="flex items-center gap-4 p-4" key={post.id}>
                  <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-placeholder-gradient">
                    {post.cover ? (
                      <img
                        alt=""
                        className="size-full object-cover"
                        src={post.cover}
                      />
                    ) : (
                      <span className="i-hugeicons-news-01 size-5 text-placeholder-text" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{post.title}</p>
                    <p className="mt-1 line-clamp-1 text-muted-foreground text-xs">
                      {post.description || "No description"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${post.status === "published" ? "bg-brand-muted text-brand-strong" : "bg-muted text-muted-foreground"}`}
                  >
                    {post.status === "published" ? "Published" : "Draft"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center">
              <p className="font-medium">No content yet</p>
              <p className="mt-1 text-muted-foreground text-sm">
                Create and publish content from the admin workspace.
              </p>
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-3 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
          Account
        </h2>
        <div className="grid gap-3 sm:max-w-xl">
          <QuickLink
            description="Update your name, avatar, and profile details."
            icon="i-hugeicons-user-account"
            label="Edit profile"
            to="/account/profile"
          />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card p-5">
      <p className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-2 truncate font-medium text-2xl tabular-nums">{value}</p>
    </div>
  );
}

function QuickLink({
  description,
  icon,
  label,
  to,
}: {
  description: string;
  icon: string;
  label: string;
  to: "/account/profile";
}) {
  return (
    <Link
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-brand"
      to={to}
    >
      <span
        className={`${icon} flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand-strong`}
      />
      <span className="min-w-0">
        <span className="block font-medium">{label}</span>
        <span className="mt-0.5 block text-muted-foreground text-xs">
          {description}
        </span>
      </span>
      <span className="i-hugeicons-arrow-up-right-01 ml-auto size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
