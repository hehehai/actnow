import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { format } from "date-fns";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { PostCard } from "@/components/features/app/post/post-card";
import { confirmDialog } from "@/components/shared/confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { client, orpc } from "@/lib/orpc";
import { authQueryOptions } from "@/lib/queries";
import { createPageMeta } from "@/lib/seo";
import { postFormDialog } from "@/stores/handlers";

const userProfileMeta = createPageMeta({
  title: "Creator profile",
  description:
    "Discover ideas and creative work shared by the Actnow community.",
});

export const Route = createFileRoute("/(app)/$userSlug/")({
  head: () => ({
    meta: userProfileMeta.meta,
    links: userProfileMeta.links,
  }),
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.ensureQueryData(authQueryOptions());
      await context.queryClient.ensureQueryData(
        orpc.app.user.publicProfile.queryOptions({
          input: { id: params.userSlug },
        })
      );
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("NOT_FOUND") ||
          error.message.toLowerCase().includes("not found"))
      ) {
        throw notFound();
      }
      throw error;
    }
  },
  component: UserProfilePage,
});

function UserProfilePage() {
  const params = Route.useParams();
  const queryClient = useQueryClient();
  const { data: sessionUser } = useSuspenseQuery(authQueryOptions());
  const { data } = useSuspenseQuery(
    orpc.app.user.publicProfile.queryOptions({
      input: { id: params.userSlug },
    })
  );
  const isOwnProfile = sessionUser?.id === params.userSlug;

  const totalLikes = useMemo(
    () => data.posts.reduce((sum, item) => sum + item.post.likes, 0),
    [data.posts]
  );

  const initials =
    data.user.name
      ?.split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? data.user.id.slice(0, 2).toUpperCase();

  const joinedDate = data.user.createdAt
    ? format(new Date(data.user.createdAt), "MMMM d, yyyy")
    : null;
  const socialLinks = data.user.socialLinks ?? [];

  const handleLikeChange = useCallback(
    (postId: string, liked: boolean) => {
      queryClient.setQueryData(
        orpc.app.user.publicProfile.queryKey({
          input: { id: params.userSlug },
        }),
        (oldData) => {
          if (!oldData) return oldData;
          const delta = liked ? 1 : -1;
          return {
            ...oldData,
            posts: oldData.posts.map((item) =>
              item.post.id === postId
                ? {
                    ...item,
                    post: {
                      ...item.post,
                      likes: Math.max(item.post.likes + delta, 0),
                    },
                  }
                : item
            ),
          };
        }
      );
    },
    [params.userSlug, queryClient]
  );

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => client.app.post.delete({ id: postId }),
    onSuccess: (_, postId) => {
      queryClient.setQueryData(
        orpc.app.user.publicProfile.queryKey({
          input: { id: params.userSlug },
        }),
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            posts: oldData.posts.filter((item) => item.post.id !== postId),
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: orpc.app.post.list.key() });
      queryClient.invalidateQueries({ queryKey: orpc.app.post.trending.key() });
      toast.success("Post deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete post");
    },
  });

  return (
    <div className="container mx-auto max-w-7xl space-y-12 px-4 py-8 sm:py-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/65 bg-card p-6 shadow-[0_16px_48px_-38px_rgba(83,54,32,0.42)] sm:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-24 size-72 rounded-full bg-accent/75 blur-3xl"
        />
        <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-20 rounded-[1.5rem] border-4 border-background text-2xl shadow-sm">
              {data.user.image && (
                <AvatarImage alt={data.user.name ?? ""} src={data.user.image} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="mb-2 text-xs font-semibold tracking-[0.15em] text-primary uppercase">
                A member of Actnow
              </p>
              <h1 className="text-balance font-semibold text-3xl tracking-[-0.045em] sm:text-4xl">
                {data.user.name ?? "Anonymous creator"}
              </h1>
              {joinedDate && (
                <p className="text-pretty text-muted-foreground">
                  Joined {joinedDate}
                </p>
              )}
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto">
            <ProfileStat
              label={isOwnProfile ? "All posts" : "Public posts"}
              value={data.posts.length}
            />
            <ProfileStat label="Total likes" value={totalLikes} />
          </div>
        </div>

        {(data.user.bio || socialLinks.length > 0) && (
          <div className="relative mt-7 border-t border-border/70 pt-6">
            {data.user.bio && (
              <p className="text-pretty text-muted-foreground text-sm">
                {data.user.bio}
              </p>
            )}

            {socialLinks.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {socialLinks.map((item) => (
                  <a
                    className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted"
                    href={item.url}
                    key={`${item.platform}-${item.url}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className={getSocialIcon(item.platform)} />
                    {getSocialLabel(item.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
              From the studio
            </p>
            <h2 className="text-balance font-semibold text-3xl tracking-[-0.04em]">
              {isOwnProfile
                ? "Your ideas"
                : `${data.user.name ?? "Their"}’s ideas`}
            </h2>
            <p className="text-pretty text-muted-foreground">
              {isOwnProfile
                ? "Your public posts and private drafts, all in one place."
                : `Ideas and commitments shared by ${
                    data.user.name ?? "this creator"
                  }.`}
            </p>
          </div>
          {isOwnProfile && (
            <Button
              className="rounded-full"
              onClick={() => postFormDialog.openWithPayload({ mode: "create" })}
            >
              <span className="i-hugeicons-plus-sign size-4" /> Share an idea
            </Button>
          )}
        </div>

        {data.posts.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.posts.map((item) => (
              <div className="relative" key={item.post.id}>
                <PostCard
                  author={item.author}
                  hideAuthor
                  onLikeChange={(next) => handleLikeChange(item.post.id, next)}
                  post={item.post}
                  tags={item.tags}
                />
                {isOwnProfile && (
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            aria-label="Post actions"
                            size="icon-sm"
                            variant="outline"
                          >
                            <span className="i-hugeicons-more-horizontal size-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            postFormDialog.openWithPayload({
                              mode: "edit",
                              post: {
                                id: item.post.id,
                                prompt: item.post.prompt ?? "",
                                comment: item.post.comment ?? "",
                                media: item.post.media ?? [],
                                isPublic: item.post.isPublic,
                                tagIds: item.tags.map((tag) => tag.id),
                              },
                            })
                          }
                        >
                          <span className="i-hugeicons-pencil-edit-01" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            confirmDialog.openWithPayload({
                              title: "Delete Post",
                              description: (
                                <>
                                  Delete{" "}
                                  <strong>
                                    {item.post.comment ??
                                      item.post.prompt ??
                                      "this post"}
                                  </strong>
                                  ? This action cannot be undone.
                                </>
                              ),
                              confirmText: "Delete",
                              variant: "destructive",
                              onConfirm: async () => {
                                await deleteMutation.mutateAsync(item.post.id);
                              },
                            });
                          }}
                          variant="destructive"
                        >
                          <span className="i-hugeicons-delete-03" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-border bg-card/60 p-10 text-center text-muted-foreground">
            <span className="i-hugeicons-checklist text-4xl" />
            <p className="mt-4 text-balance font-medium text-lg">
              {isOwnProfile ? "No posts yet" : "No public posts yet"}
            </p>
            <p className="text-pretty">
              {isOwnProfile
                ? "Create your first post to get started."
                : "Check back soon to see what they are working on."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-32 rounded-2xl border border-border/70 bg-background/80 px-6 py-4 text-left shadow-sm">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="mt-1 font-semibold text-3xl tabular-nums tracking-[-0.04em]">
        {value}
      </p>
    </div>
  );
}

function getSocialLabel(platform: string): string {
  if (platform === "x") return "X";
  if (platform === "website") return "Website";
  if (platform === "facebook") return "Facebook";
  if (platform === "instagram") return "Instagram";
  return platform;
}

function getSocialIcon(platform: string): string {
  if (platform === "x") return "i-hugeicons-new-twitter-rectangle";
  if (platform === "website") return "i-hugeicons-link-01";
  if (platform === "facebook") return "i-hugeicons-facebook-02";
  if (platform === "instagram") return "i-hugeicons-instagram";
  return "i-hugeicons-link-01";
}
