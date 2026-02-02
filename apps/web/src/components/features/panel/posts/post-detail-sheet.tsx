import { useQuery } from "@tanstack/react-query";
import { MediaGrid } from "@/components/features/common/media/media-grid";
import { PostPromptBlock } from "@/components/features/common/post/post-prompt-block";
import { confirmDialog } from "@/components/shared/confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatDateTime, getInitials } from "@/lib/formatters";
import { orpc } from "@/lib/orpc";
import type { ClientOutputs } from "@/lib/orpc-types";
import {
  panelPostFormDialog,
  postDetailSheet,
  userDetailSheet,
} from "@/stores/handlers";
import { usePostActions } from "./use-post-actions";

type PostDetail = ClientOutputs["panel"]["post"]["getById"];

export function PostDetailSheet() {
  return (
    <Sheet<{ postId: string }> handle={postDetailSheet}>
      {({ payload }) =>
        payload && <PostDetailContent postId={payload.postId} />
      }
    </Sheet>
  );
}

function PostDetailContent({ postId }: { postId: string }) {
  const actions = usePostActions();
  const { data: post, isLoading } = useQuery(
    orpc.panel.post.getById.queryOptions({
      input: { id: postId },
    })
  );

  const handleDelete = (detail: PostDetail) => {
    const title = detail.post.comment ?? detail.post.prompt ?? "this post";
    confirmDialog.openWithPayload({
      title: "Delete Post",
      description: (
        <>
          Are you sure you want to delete <strong>{title}</strong>? This action
          cannot be undone.
        </>
      ),
      confirmText: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        await actions.remove.mutateAsync({ id: detail.post.id });
        postDetailSheet.close();
      },
    });
  };

  const createdAt = formatDateTime(post?.post.createdAt);
  const updatedAt = formatDateTime(post?.post.updatedAt);
  const authorInitials = getInitials(post?.author?.name);

  return (
    <SheetContent
      className="h-full border-none bg-transparent p-3 shadow-none data-[side=right]:max-w-3xl data-[side=right]:sm:max-w-3xl"
      showCloseButton={false}
      side="right"
    >
      <div className="flex h-full w-full flex-col gap-4 rounded-xl bg-background shadow-lg">
        {isLoading || !post ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : (
          <>
            <div className="shrink-0">
              <SheetHeader className="flex-row items-start justify-between">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                  <Button
                    className="h-auto justify-start gap-3 px-2 py-1"
                    disabled={!post.author?.id}
                    onClick={() => {
                      if (post.author?.id) {
                        userDetailSheet.openWithPayload({
                          userId: post.author.id,
                        });
                      }
                    }}
                    type="button"
                    variant="ghost"
                  >
                    <Avatar className="size-9">
                      {post.author?.image && (
                        <AvatarImage
                          alt={post.author.name ?? "User"}
                          src={post.author.image}
                        />
                      )}
                      <AvatarFallback className="text-xs">
                        {authorInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col items-start gap-1">
                      <SheetTitle className="text-balance text-base">
                        {post.author?.name ?? "Unknown user"}
                      </SheetTitle>
                      {post.author?.email && (
                        <SheetDescription className="text-xs">
                          {post.author.email}
                        </SheetDescription>
                      )}
                    </div>
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() =>
                      panelPostFormDialog.openWithPayload({
                        mode: "edit",
                        post: {
                          id: post.post.id,
                          prompt: post.post.prompt ?? null,
                          comment: post.post.comment ?? null,
                          media: post.post.media ?? [],
                          isPublic: post.post.isPublic,
                          tagIds: post.tags.map((tag) => tag.id),
                        },
                      })
                    }
                    size="sm"
                    variant="outline"
                  >
                    <span className="i-hugeicons-pencil-edit-01 size-3.5" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(post)}
                    size="sm"
                    variant="destructive"
                  >
                    <span className="i-hugeicons-delete-03 size-3.5" />
                    Delete
                  </Button>
                  <SheetClose
                    className={buttonVariants({
                      size: "icon-sm",
                      variant: "outline",
                    })}
                  >
                    <span className="i-hugeicons-cancel-01 text-lg" />
                  </SheetClose>
                </div>
              </SheetHeader>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-4">
              <section className="space-y-2">
                <h4 className="font-medium text-muted-foreground text-xs uppercase">
                  Prompt
                </h4>
                <PostPromptBlock value={post.post.prompt} />
              </section>

              <section className="space-y-2">
                <h4 className="font-medium text-muted-foreground text-xs uppercase">
                  Comment
                </h4>
                <p className="whitespace-pre-line text-pretty text-sm">
                  {post.post.comment ?? "Untitled post"}
                </p>
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="font-medium text-muted-foreground text-xs uppercase">
                    Visits
                  </h4>
                  <p className="font-semibold text-lg tabular-nums">
                    {post.post.visits.toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground text-xs uppercase">
                    Visibility
                  </h4>
                  <Badge
                    className="mt-2 w-fit"
                    variant={post.post.isPublic ? "default" : "outline"}
                  >
                    {post.post.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground text-xs uppercase">
                    Likes
                  </h4>
                  <p className="font-semibold text-lg tabular-nums">
                    {post.post.likes.toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground text-xs uppercase">
                    Created
                  </h4>
                  <p className="text-muted-foreground text-sm tabular-nums">
                    {createdAt}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground text-xs uppercase">
                    Updated
                  </h4>
                  <p className="text-muted-foreground text-sm tabular-nums">
                    {updatedAt}
                  </p>
                </div>
              </section>

              <section className="space-y-2">
                <h4 className="font-medium text-muted-foreground text-xs uppercase">
                  Tags
                </h4>
                {post.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No tags</p>
                )}
              </section>

              <section className="space-y-2">
                <h4 className="font-medium text-muted-foreground text-xs uppercase">
                  Media
                </h4>
                <MediaGrid
                  media={post.post.media}
                  previewAlt="Post media"
                  previewMode="hover"
                  previewTitle="Post media"
                />
              </section>
            </div>
          </>
        )}
      </div>
    </SheetContent>
  );
}
