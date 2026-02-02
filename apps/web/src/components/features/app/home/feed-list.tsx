import { PostCard } from "@/components/features/app/post/post-card";
import type { FeedItem } from "./feed-types";

interface FeedListProps {
  items: FeedItem[];
  onLikeChange: (postId: string, liked: boolean) => void;
}

export function FeedList({ items, onLikeChange }: FeedListProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
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
  );
}
