import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc";
import { authQueryOptions } from "@/lib/queries";
import { postFormDialog } from "@/stores/handlers";

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
  const totalLikes = posts.reduce((sum, item) => sum + item.post.likes, 0);
  const stats = [
    {
      label: "Posts shared",
      value: posts.length,
      icon: "i-hugeicons-image-01",
    },
    { label: "Likes received", value: totalLikes, icon: "i-hugeicons-heart" },
    {
      label: "Plan",
      value: subscription?.subscription?.plan ?? "Free",
      icon: "i-hugeicons-credit-card",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-medium text-[11px] text-brand uppercase tracking-[0.16em]">
            Your space
          </p>
          <h1 className="mt-2 text-balance font-medium text-3xl tracking-tight">
            Welcome back, {user?.name?.split(" ")[0] ?? "creator"}
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Keep track of what you&apos;ve shared and pick up your next idea.
          </p>
        </div>
        <Button
          className="h-11 rounded-xl"
          onClick={() => postFormDialog.openWithPayload({ mode: "create" })}
        >
          <span className="i-hugeicons-plus-sign size-4" /> Create a post
        </Button>
      </section>

      <section>
        <h2 className="mb-3 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
          Your activity
        </h2>
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="grid gap-px bg-border sm:grid-cols-3">
            {stats.map((stat) => (
              <div className="bg-card p-5" key={stat.label}>
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`${stat.icon} size-4 text-brand`}
                  />
                  <p className="text-muted-foreground text-[11px] uppercase tracking-[0.12em]">
                    {stat.label}
                  </p>
                </div>
                <p className="mt-2 truncate font-medium text-3xl tabular-nums tracking-tight">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-medium text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
            Your posts
          </h2>
          <Link
            className="text-sm font-medium text-brand hover:underline"
            params={{ userSlug: user?.id ?? "" }}
            to="/$userSlug"
          >
            View profile
          </Link>
        </div>
        {posts.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {posts.slice(0, 2).map((item) => (
              <Link
                className="group flex min-h-24 items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-brand"
                key={item.post.id}
                params={{ userSlug: user?.id ?? "", postSlug: item.post.id }}
                to="/$userSlug/$postSlug"
              >
                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-placeholder-gradient text-placeholder-text">
                  {item.post.media?.[0] ? (
                    <img
                      alt=""
                      className="size-full object-cover"
                      src={item.post.media[0]}
                    />
                  ) : (
                    <span className="i-hugeicons-image-01 size-6" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium group-hover:text-brand">
                    {item.post.comment ?? item.post.prompt ?? "Untitled post"}
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    {item.post.likes} likes <span className="px-1">·</span>{" "}
                    {item.post.visits} views
                  </p>
                </div>
                <span className="i-hugeicons-arrow-up-right-01 size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card px-6 py-10 text-center">
            <p className="font-medium text-lg">Your first post starts here</p>
            <p className="mt-1 text-muted-foreground text-sm">
              Save a spark and share it with the community.
            </p>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
          Quick links
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <QuickLink
            description="Posts you have saved for later."
            icon="i-hugeicons-heart"
            label="Liked posts"
            to="/likes"
          />
          <QuickLink
            description="Update your profile and account preferences."
            icon="i-hugeicons-settings-01"
            label="Account settings"
            to="/account/settings"
          />
        </div>
      </section>
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
  to: "/likes" | "/account/settings";
}) {
  return (
    <Link
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-brand"
      to={to}
    >
      <span
        aria-hidden="true"
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
