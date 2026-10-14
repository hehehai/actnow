import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { format } from "date-fns";
import { PostCard } from "@/components/features/app/post/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc";
import { authQueryOptions } from "@/lib/queries";
import { createPageMeta } from "@/lib/seo";

const profileMeta = createPageMeta({
  title: "Profile",
  description: "Published content from the Actnow team.",
});

export const Route = createFileRoute("/(app)/$userSlug/")({
  head: () => ({ meta: profileMeta.meta, links: profileMeta.links }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(authQueryOptions());
    try {
      await context.queryClient.ensureQueryData(
        orpc.app.user.publicProfile.queryOptions({
          input: { id: params.userSlug },
        })
      );
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("NOT_FOUND") ||
          error.message.toLowerCase().includes("not found"))
      )
        throw notFound();
      throw error;
    }
  },
  component: UserProfilePage,
});

function UserProfilePage() {
  const { userSlug } = Route.useParams();
  const { data: sessionUser } = useSuspenseQuery(authQueryOptions());
  const { data } = useSuspenseQuery(
    orpc.app.user.publicProfile.queryOptions({ input: { id: userSlug } })
  );
  const isOwnProfile = sessionUser?.id === userSlug;
  const published = data.posts.filter(
    (item) => item.post.status === "published"
  );
  const drafts = isOwnProfile
    ? data.posts.filter((item) => item.post.status === "draft")
    : [];
  const socialLinks = data.user.socialLinks ?? [];

  return (
    <div className="container mx-auto max-w-7xl space-y-10 px-4 py-8 sm:py-12">
      <section className="grid gap-8 border-b border-border pb-8 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
        <Avatar className="size-20 rounded-2xl">
          <AvatarImage
            alt={data.user.name}
            src={data.user.image ?? undefined}
          />
          <AvatarFallback className="text-2xl">
            {data.user.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-[11px] text-brand uppercase tracking-[0.16em]">
            Actnow profile
          </p>
          <h1 className="mt-1 text-balance font-medium text-3xl tracking-tight sm:text-4xl">
            {data.user.name}
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Member since {format(new Date(data.user.createdAt), "MMMM yyyy")}
          </p>
          {data.user.bio && (
            <p className="mt-4 max-w-2xl text-pretty text-muted-foreground">
              {data.user.bio}
            </p>
          )}
          {socialLinks.length > 0 && (
            <nav
              aria-label="Social links"
              className="mt-4 flex flex-wrap gap-3"
            >
              {socialLinks.map((item) => (
                <a
                  className="text-sm text-brand hover:underline"
                  href={item.url}
                  key={`${item.platform}-${item.url}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {item.platform === "website"
                    ? "Website"
                    : item.platform.toUpperCase()}
                </a>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div>
            <p className="text-muted-foreground text-xs">Published</p>
            <p className="font-medium text-2xl tabular-nums">
              {published.length}
            </p>
          </div>
          {isOwnProfile && (
            <Button
              nativeButton={false}
              render={<Link to="/account/settings" />}
              variant="outline"
            >
              Edit profile
            </Button>
          )}
        </div>
      </section>
      <section className="space-y-5">
        <header>
          <p className="font-medium text-[11px] text-brand uppercase tracking-[0.16em]">
            Library
          </p>
          <h2 className="mt-1 font-medium text-2xl tracking-tight">
            Published content
          </h2>
        </header>
        {published.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {published.map((item) => (
              <PostCard
                author={item.author}
                key={item.post.id}
                post={item.post}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-medium">No published content yet</p>
          </div>
        )}
      </section>
      {drafts.length > 0 && (
        <section className="space-y-5">
          <header>
            <p className="font-medium text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
              Admin workspace
            </p>
            <h2 className="mt-1 font-medium text-2xl tracking-tight">Drafts</h2>
          </header>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {drafts.map((item) => (
              <PostCard
                author={item.author}
                key={item.post.id}
                post={item.post}
                hideAuthor
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
