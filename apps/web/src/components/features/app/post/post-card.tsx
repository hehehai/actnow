import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/formatters";
import { LikeButton } from "./like-button";

interface PostCardProps {
  post: {
    id: string;
    prompt?: string | null;
    comment: string | null;
    media: string[] | null;
    likes: number;
    visits: number;
    createdAt: Date;
  };
  tags: Array<{ id: string; name: string; type: string }>;
  author?: {
    id: string | null;
    name: string | null;
    image: string | null;
  } | null;
  liked?: boolean;
  onLikeChange?: (liked: boolean) => void;
  hideAuthor?: boolean;
  featured?: boolean;
}

export function PostCard({
  post,
  tags,
  author,
  liked = false,
  onLikeChange,
  hideAuthor = false,
  featured = false,
}: PostCardProps) {
  const cover = post.media?.[0] ?? null;
  const title = post.comment ?? post.prompt ?? "Untitled post";
  const initials = getInitials(author?.name, { fallback: "AN" });
  const detailParams = author?.id
    ? { userSlug: author.id, postSlug: post.id }
    : null;
  const imageContent = (
    <div className="relative h-full overflow-hidden rounded-[calc(var(--radius)+6px)] bg-placeholder">
      {cover ? (
        <img
          alt={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          loading="lazy"
          src={cover}
        />
      ) : (
        <div className="flex h-full min-h-40 items-end justify-between bg-placeholder-gradient p-5">
          <span className="font-medium text-5xl text-placeholder-text/75 sm:text-6xl">
            {title.slice(0, 2)}
          </span>
          <span className="text-placeholder-text/55 text-xs uppercase tracking-[0.18em]">
            Actnow
          </span>
        </div>
      )}
    </div>
  );

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-colors hover:border-brand">
      {detailParams ? (
        <Link
          className={`relative block overflow-hidden bg-card px-2 pt-2 ${featured ? "aspect-[1.9/1]" : "aspect-video"}`}
          params={detailParams}
          to="/$userSlug/$postSlug"
        >
          {imageContent}
        </Link>
      ) : (
        <div
          className={`relative block overflow-hidden bg-card px-2 pt-2 ${featured ? "aspect-[1.9/1]" : "aspect-video"}`}
        >
          {imageContent}
        </div>
      )}

      <div
        className={`flex flex-1 flex-col ${featured ? "px-5 pt-4 pb-5 sm:px-6" : "px-3.5 pt-3 pb-3.5 sm:px-4 sm:pb-4"}`}
      >
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-brand">
            {tags[0]?.name ?? "Community post"}
          </span>
          <span aria-hidden="true">·</span>
          <time dateTime={new Date(post.createdAt).toISOString()}>
            {format(new Date(post.createdAt), "MMM d, yyyy")}
          </time>
        </div>

        {detailParams ? (
          <Link
            className={`block text-balance font-medium leading-[1.2] tracking-[-0.02em] text-foreground transition-colors hover:text-brand ${featured ? "text-2xl sm:text-[1.75rem]" : "text-lg sm:text-xl"}`}
            params={detailParams}
            to="/$userSlug/$postSlug"
          >
            {title}
          </Link>
        ) : (
          <p
            className={`text-balance font-medium leading-[1.2] tracking-[-0.02em] ${featured ? "text-2xl sm:text-[1.75rem]" : "text-lg sm:text-xl"}`}
          >
            {title}
          </p>
        )}

        {post.prompt && post.comment && (
          <p className="mt-1 line-clamp-2 text-muted-foreground text-sm leading-relaxed">
            {post.prompt}
          </p>
        )}

        {tags.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.slice(1, featured ? 6 : 4).map((tag) => (
              <Badge
                className="rounded-full px-2.5 py-1 font-normal"
                key={tag.id}
                variant="outline"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3 mt-4">
          {hideAuthor ? (
            <p className="text-muted-foreground text-xs tabular-nums">
              {post.likes} likes <span className="px-1">·</span> {post.visits}{" "}
              views
            </p>
          ) : author?.id ? (
            <Link
              className="flex min-w-0 items-center gap-2"
              params={{ userSlug: author.id }}
              to="/$userSlug"
            >
              <Avatar className="size-8 rounded-xl">
                {author.image && (
                  <AvatarImage alt={author.name ?? ""} src={author.image} />
                )}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-sm">
                <p className="truncate font-medium leading-tight">
                  {author.name ?? "Anonymous"}
                </p>
                <p className="mt-0.5 truncate text-muted-foreground text-xs tabular-nums">
                  {post.likes} likes <span className="px-1">·</span>{" "}
                  {post.visits} views
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="size-8 rounded-xl">
                {author?.image && (
                  <AvatarImage alt={author.name ?? ""} src={author.image} />
                )}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-sm">
                <p className="truncate font-medium leading-tight">
                  {author?.name ?? "Anonymous"}
                </p>
                <p className="mt-0.5 truncate text-muted-foreground text-xs tabular-nums">
                  {post.likes} likes <span className="px-1">·</span>{" "}
                  {post.visits} views
                </p>
              </div>
            </div>
          )}
          <LikeButton
            className="size-9 shrink-0 rounded-full"
            liked={liked}
            onLikeChange={onLikeChange}
            postId={post.id}
          />
        </div>
      </div>
    </article>
  );
}
