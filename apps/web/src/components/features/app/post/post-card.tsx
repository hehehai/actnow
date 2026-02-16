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
  tags: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  author?: {
    id: string | null;
    name: string | null;
    image: string | null;
  } | null;
  liked?: boolean;
  onLikeChange?: (liked: boolean) => void;
  hideAuthor?: boolean;
}

export function PostCard({
  post,
  tags,
  author,
  liked = false,
  onLikeChange,
  hideAuthor = false,
}: PostCardProps) {
  const cover = post.media?.[0] ?? null;
  const title = post.comment ?? post.prompt ?? "Untitled post";
  const initials = getInitials(author?.name, { fallback: "AN" });

  const detailParams = author?.id
    ? { userSlug: author.id, postSlug: post.id }
    : null;

  const MediaContent = (
    <div className="aspect-video overflow-hidden bg-muted">
      {cover ? (
        <img
          alt={title}
          className="size-full object-cover"
          loading="lazy"
          src={cover}
        />
      ) : (
        <div className="flex size-full items-center justify-center text-muted-foreground">
          <span className="i-hugeicons-image-01 text-4xl" />
        </div>
      )}
    </div>
  );

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border bg-card transition">
      {detailParams ? (
        <Link
          className="relative block"
          params={detailParams}
          to="/$userSlug/$postSlug"
        >
          {MediaContent}
        </Link>
      ) : (
        <div className="relative block">{MediaContent}</div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline">Post</Badge>
          <span className="text-muted-foreground text-xs tabular-nums">
            {format(new Date(post.createdAt), "MMM d, yyyy")}
          </span>
        </div>

        {detailParams ? (
          <Link
            className="line-clamp-2 text-balance font-semibold text-lg"
            params={detailParams}
            to="/$userSlug/$postSlug"
          >
            {title}
          </Link>
        ) : (
          <p className="line-clamp-2 text-balance font-semibold text-lg">
            {title}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 4).map((tag) => (
              <Badge key={tag.id} variant="outline">
                {tag.name}
              </Badge>
            ))}
            {tags.length > 4 && (
              <Badge variant="outline">+{tags.length - 4}</Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t px-4 py-3">
        {hideAuthor ? (
          <p className="text-muted-foreground text-xs tabular-nums">
            {post.likes} like{post.likes === 1 ? "" : "s"} · {post.visits} view
            {post.visits === 1 ? "" : "s"}
          </p>
        ) : author?.id ? (
          <Link
            className="flex items-center gap-2"
            params={{ userSlug: author.id }}
            to="/$userSlug"
          >
            <Avatar className="size-8">
              {author?.image && (
                <AvatarImage alt={author.name ?? ""} src={author.image} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium leading-tight">
                {author?.name ?? "Anonymous"}
              </p>
              <p className="text-muted-foreground text-xs tabular-nums">
                {post.likes} like{post.likes === 1 ? "" : "s"} · {post.visits}{" "}
                view
                {post.visits === 1 ? "" : "s"}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              {author?.image && (
                <AvatarImage alt={author?.name ?? ""} src={author.image} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium leading-tight">
                {author?.name ?? "Anonymous"}
              </p>
              <p className="text-muted-foreground text-xs tabular-nums">
                {post.likes} like{post.likes === 1 ? "" : "s"} · {post.visits}{" "}
                view
                {post.visits === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        )}
        <LikeButton
          className="size-9"
          liked={liked}
          onLikeChange={onLikeChange}
          postId={post.id}
        />
      </div>
    </article>
  );
}
