import { CommandGroup, CommandItem } from "@/components/ui/command";
import type { FeedItem } from "@/lib/orpc-types";

interface FilterLatestPostsProps {
  posts: FeedItem[];
  onPostClick: (params: { postId: string; userId: string | null }) => void;
}

export function FilterLatestPosts({
  posts,
  onPostClick,
}: FilterLatestPostsProps) {
  return (
    <CommandGroup heading="Recently published">
      {posts.map(({ post, author }) => (
        <CommandItem
          className="items-start py-2.5"
          key={post.id}
          onSelect={() =>
            onPostClick({ postId: post.id, userId: post.createdById })
          }
          value={`post:${post.title}:${post.id}`}
        >
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-placeholder">
            {post.cover ? (
              <img alt="" className="size-full object-cover" src={post.cover} />
            ) : (
              <span className="i-hugeicons-news-01 size-4 text-muted-foreground" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{post.title}</span>
            {post.description && (
              <span className="mt-0.5 block truncate text-muted-foreground text-sm">
                {post.description}
              </span>
            )}
            <span className="mt-1 block truncate text-muted-foreground text-xs">
              {author?.name ?? "Actnow"} ·{" "}
              {new Date(
                post.publishedAt ?? post.createdAt
              ).toLocaleDateString()}
            </span>
          </span>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}
