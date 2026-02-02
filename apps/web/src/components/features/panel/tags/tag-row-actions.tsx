import { useState } from "react";
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
import type { TagRow } from "./columns";
import { TagFormDialog } from "./tag-form-dialog";
import { useTagActions } from "./use-tag-actions";

interface TagRowActionsProps {
  tag: TagRow;
}

export function TagRowActions({ tag }: TagRowActionsProps) {
  const actions = useTagActions();
  const { copy } = useCopy();
  const [editOpen, setEditOpen] = useState(false);

  const handleCopyTagId = async () => {
    const success = await copy(tag.id);
    if (success) {
      toast.success("Tag ID copied to clipboard");
    }
  };

  const handleCopyValue = async () => {
    const success = await copy(tag.value);
    if (success) {
      toast.success("Tag value copied to clipboard");
    }
  };

  const handleDelete = () => {
    confirmDialog.openWithPayload({
      title: "Delete Tag",
      description: (
        <>
          Are you sure you want to delete <strong>{tag.name}</strong>? This
          action cannot be undone.
        </>
      ),
      confirmText: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        await actions.remove.mutateAsync({ id: tag.id });
      },
    });
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        <Button onClick={() => setEditOpen(true)} size="sm" variant="outline">
          <span className="i-hugeicons-edit-01 size-3.5" />
          Edit
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="icon-sm" variant="outline">
                <span className="i-hugeicons-more-horizontal size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopyTagId}>
              <span className="i-hugeicons-copy-01 size-4" />
              Copy Tag ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyValue}>
              <span className="i-hugeicons-copy-01 size-4" />
              Copy Value
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} variant="destructive">
              <span className="i-hugeicons-delete-03 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <TagFormDialog onOpenChange={setEditOpen} open={editOpen} tag={tag} />
    </>
  );
}
