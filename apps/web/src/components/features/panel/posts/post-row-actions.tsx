import { toast } from "sonner";
import { confirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCopy } from "@/hooks/use-copy";
import { panelPostFormDialog, postDetailSheet } from "@/stores/handlers";
import type { PostRow } from "./columns";
import { usePostActions } from "./use-post-actions";

interface PostRowActionsProps {
  post: PostRow;
}

export function PostRowActions({ post }: PostRowActionsProps) {
  const actions = usePostActions();
  const { copy } = useCopy();

  const handleCopyId = async () => {
    const success = await copy(post.post.id);
    if (success) {
      toast.success("Post ID copied to clipboard");
    }
  };

  const handleDelete = () => {
    const title = post.post.comment ?? post.post.prompt ?? "this post";
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
        await actions.remove.mutateAsync({ id: post.post.id });
      },
    });
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        onClick={() =>
          postDetailSheet.openWithPayload({ postId: post.post.id })
        }
        size="sm"
        variant="outline"
      >
        <span className="i-hugeicons-information-circle size-3.5" />
        Detail
      </Button>
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
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button aria-label="Open actions" size="icon-sm" variant="outline">
              <span className="i-hugeicons-more-horizontal size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopyId}>
            <span className="i-hugeicons-copy-01 size-4" />
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} variant="destructive">
            <span className="i-hugeicons-delete-03 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
