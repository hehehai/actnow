import { createFileRoute, redirect } from "@tanstack/react-router";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/formatters";
import { orpc } from "@/lib/orpc";
import type { PostDetailOutput } from "@/lib/orpc-types";

export const Route = createFileRoute("/(app)/$userSlug/$postSlug")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(
      orpc.app.post.detail.queryOptions({ input: { id: params.postSlug } })
    );
    if (data.author?.id && data.author.id !== params.userSlug) {
      throw redirect({
        to: "/$userSlug/$postSlug",
        params: { userSlug: data.author.id, postSlug: params.postSlug },
      });
    }
    return data;
  },
  component: PostDetailPage,
});

function PostDetailPage() {
  const { post, author } = Route.useLoaderData() as PostDetailOutput;
  const publishedAt = post.publishedAt ?? post.createdAt;
  return (
    <article className="container mx-auto max-w-4xl px-4 py-10 sm:py-16">
      <header className="mb-8 border-b border-border pb-7">
        <p className="text-sm text-muted-foreground">
          Published {format(new Date(publishedAt), "MMMM d, yyyy")}
        </p>
        <h1 className="mt-3 text-balance font-medium text-4xl leading-tight tracking-tight sm:text-5xl">
          {post.title}
        </h1>
        {post.description && (
          <p className="mt-4 max-w-3xl text-pretty text-muted-foreground text-lg leading-relaxed">
            {post.description}
          </p>
        )}
        {author && (
          <div className="mt-6 flex items-center gap-3">
            <Avatar className="size-10 rounded-xl">
              {author.image && (
                <AvatarImage alt={author.name ?? ""} src={author.image} />
              )}
              <AvatarFallback>
                {getInitials(author.name, { fallback: "AN" })}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">
                {author.name ?? "Actnow editor"}
              </p>
              <p className="text-muted-foreground text-xs">Actnow</p>
            </div>
          </div>
        )}
      </header>
      {post.cover && (
        <img
          alt=""
          className="mb-9 max-h-[36rem] w-full rounded-3xl object-cover"
          src={post.cover}
        />
      )}
      <div className="whitespace-pre-wrap text-pretty text-base leading-8 sm:text-lg sm:leading-9">
        {post.content}
      </div>
    </article>
  );
}
