import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { LikeButton } from "@/components/features/app/post/like-button";
import { MediaGallery } from "@/components/features/app/post/media-gallery";
import { PostAuthorCard } from "@/components/features/app/post/post-author-card";
import { SimilarPostsSection } from "@/components/features/app/post/similar-posts-section";
import { PostPromptBlock } from "@/components/features/common/post/post-prompt-block";
import { Badge } from "@/components/ui/badge";
import { orpc } from "@/lib/orpc";
import type { PostDetailOutput } from "@/lib/orpc-types";

type PostTag = PostDetailOutput["tags"][number];

export const Route = createFileRoute("/(app)/$userSlug/$postSlug")({
  loader: async ({ params, context }) => {
    const data = (await context.queryClient.ensureQueryData(
      orpc.app.post.detail.queryOptions({ input: { id: params.postSlug } })
    )) as PostDetailOutput;

    if (data?.author?.id && data.author.id !== params.userSlug) {
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
  const data = Route.useLoaderData() as PostDetailOutput;
  const queryClient = useQueryClient();
  const trackedPostId = useRef<string | null>(null);
  const postPrompt = data.post.prompt ?? "";
  const postComment = data.post.comment ?? "";
  const headingSource = postComment || postPrompt;
  const heading =
    headingSource
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length > 0)
      ?.slice(0, 120) ?? "Untitled post";

  const handleLikeChange = (next: boolean) => {
    queryClient.setQueryData(
      orpc.app.post.detail.queryKey({ input: { id: data.post.id } }),
      {
        ...data,
        liked: next,
        post: {
          ...data.post,
          likes: Math.max(data.post.likes + (next ? 1 : -1), 0),
        },
      }
    );
  };

  useEffect(() => {
    if (trackedPostId.current === data.post.id) return;
    trackedPostId.current = data.post.id;
    queryClient
      .fetchQuery(
        orpc.app.post.trackView.queryOptions({
          input: { postId: data.post.id },
        })
      )
      .then((result) => {
        queryClient.setQueryData(
          orpc.app.post.detail.queryKey({ input: { id: data.post.id } }),
          (oldData: PostDetailOutput | undefined) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              post: {
                ...oldData.post,
                visits: result?.visits ?? oldData.post.visits,
              },
            };
          }
        );
      })
      .catch(() => {
        // Ignore tracking failures so the page stays responsive.
      });
  }, [data.post.id, queryClient]);

  const tags = (data.tags ?? []) as PostTag[];
  const tagIds = tags.map((tag) => tag.id);
  const tagsByType = tags.reduce<Record<string, PostTag[]>>(
    (acc, tag: PostTag) => {
      acc[tag.type] = [...(acc[tag.type] ?? []), tag];
      return acc;
    },
    {}
  );

  const media = data.post.media ?? [];

  return (
    <div className="container mx-auto space-y-10 px-4 py-10">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={data.post.isPublic ? "default" : "outline"}>
              {data.post.isPublic ? "Public" : "Private"}
            </Badge>
            <span className="text-muted-foreground text-sm tabular-nums">
              {new Date(data.post.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-balance font-semibold text-3xl">{heading}</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <LikeButton
              liked={data.liked}
              onLikeChange={handleLikeChange}
              postId={data.post.id}
            />
            <span className="font-semibold tabular-nums">
              {data.post.likes}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="i-hugeicons-view size-5" />
            <span className="font-semibold tabular-nums">
              {data.post.visits}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left: Media Gallery */}
        <div className="min-w-0 flex-1">
          <MediaGallery media={media} />
        </div>

        {/* Right: Details */}
        <aside className="w-full space-y-6 lg:w-90 lg:shrink-0">
          <PostAuthorCard author={data.author} />

          {postPrompt && (
            <div className="space-y-2">
              <h2 className="font-medium text-muted-foreground text-xs uppercase">
                Prompt
              </h2>
              <PostPromptBlock value={postPrompt} />
            </div>
          )}

          {postComment && (
            <div className="space-y-2">
              <h2 className="font-medium text-muted-foreground text-xs uppercase">
                Comment
              </h2>
              <p className="whitespace-pre-line text-pretty text-base">
                {postComment}
              </p>
            </div>
          )}

          {Object.keys(tagsByType).length > 0 && (
            <div className="space-y-4">
              <h2 className="font-medium text-muted-foreground text-xs uppercase">
                Tags
              </h2>
              {Object.entries(tagsByType).map(([type, typeTags]) => (
                <div key={type}>
                  <p className="mb-2 text-muted-foreground text-xs capitalize">
                    {type}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {typeTags.map((tag) => (
                      <Badge key={tag.id} variant="outline">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* Similar Posts */}
      <SimilarPostsSection postId={data.post.id} tagIds={tagIds} />
    </div>
  );
}
