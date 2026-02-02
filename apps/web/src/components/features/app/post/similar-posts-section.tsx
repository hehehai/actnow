import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { orpc } from "@/lib/orpc";
import type { ClientOutputs } from "@/lib/orpc-types";
import { PostCard } from "./post-card";

type SimilarPost = ClientOutputs["app"]["post"]["similar"][number];

interface SimilarPostsSectionProps {
  postId: string;
  tagIds: string[];
}

export function SimilarPostsSection({
  postId,
  tagIds,
}: SimilarPostsSectionProps) {
  const queryClient = useQueryClient();

  const { data: similarPosts, isLoading } = useQuery(
    orpc.app.post.similar.queryOptions({
      input: { postId, tagIds, limit: 6 },
    })
  );

  const handleLikeChange = useCallback(
    (targetPostId: string, liked: boolean) => {
      queryClient.setQueryData(
        orpc.app.post.similar.queryKey({
          input: { postId, tagIds, limit: 6 },
        }),
        (oldData: SimilarPost[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((item) =>
            item.post.id === targetPostId
              ? {
                  ...item,
                  liked,
                  post: {
                    ...item.post,
                    likes: Math.max(item.post.likes + (liked ? 1 : -1), 0),
                  },
                }
              : item
          );
        }
      );
    },
    [queryClient, postId, tagIds]
  );

  if (tagIds.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="space-y-6">
        <h2 className="font-semibold text-xl">Similar Posts</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              className="aspect-4/5 animate-pulse rounded-2xl bg-muted"
              key={i}
            />
          ))}
        </div>
      </section>
    );
  }

  if (!similarPosts || similarPosts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <h2 className="font-semibold text-xl">Similar Posts</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {similarPosts.map((item) => (
          <PostCard
            author={item.author}
            key={item.post.id}
            liked={item.liked}
            onLikeChange={(liked) => handleLikeChange(item.post.id, liked)}
            post={item.post}
            tags={item.tags}
          />
        ))}
      </div>
    </section>
  );
}
