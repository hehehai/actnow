import { PostCard } from "@/components/features/app/post/post-card";
import type { FeedItem } from "./feed-types";

export function FeedList({ items }: { items: FeedItem[] }) {
  const [featured, ...remaining] = items;
  return (
    <div className="space-y-8">
      {featured && (
        <section>
          <h2 className="mb-3 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
            Recently published
          </h2>
          <PostCard author={featured.author} featured post={featured.post} />
        </section>
      )}
      {remaining.length > 0 && (
        <section>
          <h2 className="mb-3 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
            More content
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {remaining.map((item) => (
              <PostCard
                author={item.author}
                key={item.post.id}
                post={item.post}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
