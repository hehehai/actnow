import { ReasonDialog } from "@/components/shared/reason-dialog";
import type { UserRow } from "./columns";

interface BanDialogProps {
  user: UserRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (userId: string, reason: string) => Promise<void>;
}

export function BanDialog({
  user,
  open,
  onOpenChange,
  onConfirm,
}: BanDialogProps) {
  if (!user) return null;

  return (
    <ReasonDialog
      confirmingText="Banning..."
      confirmText="Ban User"
      description={
        <>
          You are about to ban <strong>{user.name || user.email}</strong>.
          Please provide a reason.
        </>
      }
      label="Reason"
      onConfirm={(reason) => onConfirm(user.id, reason)}
      onOpenChange={onOpenChange}
      open={open}
      overlayProps={{ forceRender: true }}
      placeholder="Enter the reason for banning this user..."
      title="Ban User"
    />
  );
}
