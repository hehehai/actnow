import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/formatters";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    description: string;
    cover: string | null;
    status?: "draft" | "published";
    createdAt: Date;
    publishedAt: Date | null;
  };
  author?: {
    id: string | null;
    name: string | null;
    image: string | null;
  } | null;
  hideAuthor?: boolean;
  featured?: boolean;
}

export function PostCard({
  post,
  author,
  hideAuthor = false,
  featured = false,
}: PostCardProps) {
  const initials = getInitials(author?.name, { fallback: "AN" });
  const detailParams =
    author?.id && post.status !== "draft"
      ? { userSlug: author.id, postSlug: post.id }
      : null;
  const image = post.cover ? (
    <img
      alt=""
      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
      loading="lazy"
      src={post.cover}
    />
  ) : (
    <div className="flex h-full items-end justify-between bg-placeholder-gradient p-5">
      <span className="line-clamp-2 max-w-[80%] font-medium text-3xl text-placeholder-text/80">
        {post.title}
      </span>
      <span className="text-placeholder-text/60 text-xs uppercase tracking-[0.16em]">
        Actnow
      </span>
    </div>
  );
  const date = post.publishedAt ?? post.createdAt;

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-border bg-card transition-colors hover:border-brand">
      {detailParams ? (
        <Link
          className={`relative block overflow-hidden bg-card p-2 ${featured ? "aspect-[1.9/1]" : "aspect-[4/3]"}`}
          params={detailParams}
          to="/$userSlug/$postSlug"
        >
          <div className="h-full overflow-hidden rounded-[calc(var(--radius)+6px)] bg-placeholder">
            {image}
          </div>
        </Link>
      ) : (
        <div
          className={`relative overflow-hidden bg-card p-2 ${featured ? "aspect-[1.9/1]" : "aspect-[4/3]"}`}
        >
          <div className="h-full overflow-hidden rounded-[calc(var(--radius)+6px)] bg-placeholder">
            {image}
          </div>
        </div>
      )}
      <div
        className={`flex flex-1 flex-col ${featured ? "px-5 pt-4 pb-5 sm:px-6" : "px-4 pt-3 pb-4"}`}
      >
        <time
          className="text-xs text-muted-foreground"
          dateTime={date.toISOString()}
        >
          {format(date, "MMM d, yyyy")}
        </time>
        {post.status === "draft" && (
          <span className="mt-1 w-fit rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Draft
          </span>
        )}
        {detailParams ? (
          <Link
            className={`mt-1 line-clamp-2 text-balance font-medium leading-tight tracking-tight text-foreground transition-colors hover:text-brand ${featured ? "text-2xl sm:text-3xl" : "text-lg"}`}
            params={detailParams}
            to="/$userSlug/$postSlug"
          >
            {post.title}
          </Link>
        ) : (
          <h2 className="mt-1 line-clamp-2 text-balance font-medium text-lg leading-tight">
            {post.title}
          </h2>
        )}
        {post.description && (
          <p className="mt-2 line-clamp-3 text-muted-foreground text-sm leading-relaxed">
            {post.description}
          </p>
        )}
        {!hideAuthor && author && (
          <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
            <Avatar className="size-8 rounded-xl">
              {author.image && (
                <AvatarImage alt={author.name ?? ""} src={author.image} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-medium">
              {author.name ?? "Actnow editor"}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
