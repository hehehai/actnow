import { PostCard } from "@/components/features/app/post/post-card";
import type { FeedItem } from "./feed-types";

interface FeedListProps {
  items: FeedItem[];
  onLikeChange: (postId: string, liked: boolean) => void;
}

export function FeedList({ items, onLikeChange }: FeedListProps) {
  const featured = items[0];
  return (
    <div className="space-y-8">
      {featured && (
        <section>
          <h2 className="mb-3 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
            Featured from the community
          </h2>
          <PostCard
            author={featured.author}
            featured
            liked={featured.liked}
            onLikeChange={(liked) => onLikeChange(featured.post.id, liked)}
            post={featured.post}
            tags={featured.tags}
          />
        </section>
      )}
      {items.length > 1 && (
        <section>
          <h2 className="mb-3 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
            More ideas to explore
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {items.slice(1).map((item) => (
              <PostCard
                author={item.author}
                key={item.post.id}
                liked={item.liked}
                onLikeChange={(liked) => onLikeChange(item.post.id, liked)}
                post={item.post}
                tags={item.tags}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
