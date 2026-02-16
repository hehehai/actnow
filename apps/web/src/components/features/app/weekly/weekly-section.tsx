import { useSuspenseQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/features/app/post/post-card";
import { Badge } from "@/components/ui/badge";
import { orpc } from "@/lib/orpc";
import type { TrendingOutput } from "@/lib/orpc-types";

export function WeeklySection() {
  const { data } = useSuspenseQuery<TrendingOutput>(
    orpc.app.post.trending.queryOptions({
      input: { postsLimit: 6, tagsLimit: 12 },
    })
  );

  return (
    <div className="space-y-12">
      <section>
        <h2 className="mb-4 text-balance font-semibold text-lg">
          Trending Posts
        </h2>
        {data.posts.length === 0 ? (
          <p className="text-pretty text-muted-foreground text-sm">
            No trending posts yet. Start sharing your progress!
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.posts.map((post) => (
              <PostCard
                author={post.author}
                key={post.id}
                liked={false}
                post={{
                  ...post,
                  createdAt: new Date(post.createdAt),
                }}
                tags={[]}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-balance font-semibold text-lg">Top Tags</h2>
        {data.tags.length === 0 ? (
          <p className="text-pretty text-muted-foreground text-sm">
            Stay tuned for trending tags.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag) => (
              <Badge key={tag.id} variant="outline">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
