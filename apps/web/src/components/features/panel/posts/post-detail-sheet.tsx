import { useQuery } from "@tanstack/react-query";
import { confirmDialog } from "@/components/shared/confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  panelPostFormDialog,
  postDetailSheet,
  userDetailSheet,
} from "@/stores/handlers";
import { usePostActions } from "./use-post-actions";

type PostDetail = Awaited<
  ReturnType<typeof import("@/lib/orpc").client.panel.post.getById>
>;

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
  const { data: row, isLoading } = useQuery(
    orpc.panel.post.getById.queryOptions({ input: { id: postId } })
  );

  const handleDelete = (detail: PostDetail) => {
    confirmDialog.openWithPayload({
      title: "Delete content?",
      description: (
        <>
          Delete <strong>{detail.post.title}</strong>? This cannot be undone.
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

  return (
    <SheetContent
      className="h-full border-none bg-transparent p-3 shadow-none data-[side=right]:max-w-3xl data-[side=right]:sm:max-w-3xl"
      showCloseButton={false}
      side="right"
    >
      <div className="flex h-full w-full flex-col rounded-2xl bg-background shadow-lg">
        {isLoading || !row ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Loading…
          </div>
        ) : (
          <>
            <SheetHeader className="flex-row items-start justify-between border-b border-border px-5 py-4">
              <Button
                className="h-auto justify-start gap-3 px-0 py-1"
                disabled={!row.author?.id}
                onClick={() =>
                  row.author?.id &&
                  userDetailSheet.openWithPayload({ userId: row.author.id })
                }
                type="button"
                variant="ghost"
              >
                <Avatar className="size-9">
                  {row.author?.image && (
                    <AvatarImage
                      alt={row.author.name ?? ""}
                      src={row.author.image}
                    />
                  )}
                  <AvatarFallback>
                    {getInitials(row.author?.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-left">
                  <SheetTitle className="text-sm">
                    {row.author?.name ?? "Unknown author"}
                  </SheetTitle>
                  <SheetDescription className="text-xs">
                    Created {formatDateTime(row.post.createdAt)}
                  </SheetDescription>
                </span>
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() =>
                    panelPostFormDialog.openWithPayload({
                      mode: "edit",
                      post: row.post,
                    })
                  }
                  size="sm"
                  variant="outline"
                >
                  <span className="i-hugeicons-pencil-edit-01 size-4" /> Edit
                </Button>
                <Button
                  onClick={() => handleDelete(row)}
                  size="sm"
                  variant="destructive"
                >
                  <span className="i-hugeicons-delete-03 size-4" /> Delete
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
            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">Status</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs ${row.post.status === "published" ? "bg-brand-muted text-brand-strong" : "bg-muted text-muted-foreground"}`}
                >
                  {row.post.status === "published" ? "Published" : "Draft"}
                </span>
              </div>
              <h1 className="text-balance font-medium text-3xl tracking-tight">
                {row.post.title}
              </h1>
              {row.post.description && (
                <p className="text-pretty text-muted-foreground">
                  {row.post.description}
                </p>
              )}
              {row.post.cover && (
                <img
                  alt=""
                  className="max-h-[28rem] w-full rounded-2xl object-cover"
                  src={row.post.cover}
                />
              )}
              <article className="whitespace-pre-wrap text-pretty text-base leading-8">
                {row.post.content}
              </article>
              <dl className="grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground text-xs">Created</dt>
                  <dd className="mt-1">{formatDateTime(row.post.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Published</dt>
                  <dd className="mt-1">
                    {formatDateTime(row.post.publishedAt, "Not published")}
                  </dd>
                </div>
              </dl>
            </div>
          </>
        )}
      </div>
    </SheetContent>
  );
}
