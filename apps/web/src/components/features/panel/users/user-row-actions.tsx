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
import { userDetailSheet } from "@/stores/handlers";
import { BanDialog } from "./ban-dialog";
import type { UserRow } from "./columns";
import { useUserActions } from "./use-user-actions";
import { UserFormDialog } from "./user-form-dialog";

interface UserRowActionsProps {
  user: UserRow;
}

export function UserRowActions({ user }: UserRowActionsProps) {
  const actions = useUserActions();
  const { copy } = useCopy();
  const [editOpen, setEditOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);

  const handleCopyUserId = async () => {
    const success = await copy(user.id);
    if (success) {
      toast.success("User ID copied to clipboard");
    }
  };

  const handleUpdate = async (data: {
    name: string;
    email: string;
    password?: string;
    role: "ADMIN" | "USER";
    image?: string | null;
  }) => {
    await actions.update.mutateAsync({
      id: user.id,
      name: data.name,
      role: data.role,
      image: data.image,
      password: data.password,
    });
  };

  const handleBan = async (userId: string, reason: string) => {
    await actions.ban.mutateAsync({ id: userId, reason });
    setBanOpen(false);
  };

  const handleUnban = async () => {
    await actions.unban.mutateAsync({ id: user.id });
  };

  const handleDelete = () => {
    confirmDialog.openWithPayload({
      title: "Delete User",
      description: (
        <>
          Are you sure you want to delete{" "}
          <strong>{user.name || user.email}</strong>? This action cannot be
          undone.
        </>
      ),
      confirmText: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        await actions.remove.mutateAsync({ id: user.id });
      },
    });
  };

  const isAdmin = user.role === "ADMIN";

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        <Button onClick={() => setEditOpen(true)} size="sm" variant="outline">
          <span className="i-hugeicons-user-edit-01 size-3.5" />
          Edit
        </Button>
        <Button
          onClick={() => userDetailSheet.openWithPayload({ userId: user.id })}
          size="sm"
          variant="outline"
        >
          <span className="i-hugeicons-user-account size-3.5" />
          Detail
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
            <DropdownMenuItem onClick={handleCopyUserId}>
              <span className="i-hugeicons-copy-01 size-4" />
              Copy UserId
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user.banned ? (
              <DropdownMenuItem
                disabled={actions.unban.isPending}
                onClick={handleUnban}
                variant="destructive"
              >
                <span className="i-hugeicons-lock-key size-4" />
                {actions.unban.isPending ? "Unbanning..." : "Unban"}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => setBanOpen(true)}
                variant="destructive"
              >
                <span className="i-hugeicons-lock-password size-4" />
                Ban
              </DropdownMenuItem>
            )}
            {!isAdmin && (
              <DropdownMenuItem onClick={handleDelete} variant="destructive">
                <span className="i-hugeicons-delete-03 size-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <UserFormDialog
        mode="edit"
        onOpenChange={setEditOpen}
        onSubmit={handleUpdate}
        open={editOpen}
        user={user}
      />

      <BanDialog
        onConfirm={handleBan}
        onOpenChange={setBanOpen}
        open={banOpen}
        user={user}
      />
    </>
  );
}
