import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { changeEmailDialog } from "@/stores/handlers";

export function ChangeEmailDialog() {
  return (
    <Dialog<{ currentEmail: string }> handle={changeEmailDialog}>
      {({ payload }) => payload && <ChangeEmailContent />}
    </Dialog>
  );
}

function ChangeEmailContent() {
  const [newEmail, setNewEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendVerification = async () => {
    if (!newEmail) {
      toast.error("Please enter a new email address");
      return;
    }

    setIsSending(true);
    try {
      const { error } = await authClient.changeEmail({
        newEmail,
        callbackURL: "/",
      });

      if (error) {
        toast.error(error.message || "Failed to send verification email");
      } else {
        setEmailSent(true);
        toast.success("Verification email sent to your new address");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send verification email"
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    changeEmailDialog.close();
    setNewEmail("");
    setEmailSent(false);
  };

  if (emailSent) {
    return (
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Check Your Email</DialogTitle>
          <DialogDescription>
            We've sent a verification link to <strong>{newEmail}</strong>.
            Please click the link in the email to confirm your new email
            address.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-6">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <span className="i-hugeicons-mail-send-01 size-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Change Email Address</DialogTitle>
        <DialogDescription>
          Enter your new email address. We'll send a verification link to
          confirm the change.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <Field>
          <FieldLabel htmlFor="new-email">New Email Address</FieldLabel>
          <Input
            autoComplete="email"
            id="new-email"
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter new email address"
            type="email"
            value={newEmail}
          />
        </Field>
      </div>
      <DialogFooter>
        <Button onClick={handleClose} type="button" variant="outline">
          Cancel
        </Button>
        <Button
          disabled={!newEmail || isSending}
          onClick={handleSendVerification}
        >
          {isSending ? "Sending..." : "Send Verification"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
