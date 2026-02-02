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
import { authClient } from "@/lib/auth-client";
import { verifyEmailDialog } from "@/stores/handlers";

export function VerifyEmailDialog() {
  return (
    <Dialog<{ email: string }> handle={verifyEmailDialog}>
      {({ payload }) => payload && <VerifyEmailContent email={payload.email} />}
    </Dialog>
  );
}

function VerifyEmailContent({ email }: { email: string }) {
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendVerification = async () => {
    if (!email) {
      toast.error("Email address not found");
      return;
    }

    setIsSending(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/",
      });

      if (error) {
        toast.error(error.message || "Failed to send verification email");
      } else {
        setEmailSent(true);
        toast.success("Verification email sent");
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
    verifyEmailDialog.close();
    setEmailSent(false);
  };

  if (emailSent) {
    return (
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Check Your Email</DialogTitle>
          <DialogDescription>
            We've sent a verification link to <strong>{email}</strong>. Please
            click the link in the email to verify your address.
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
        <DialogTitle>Verify Your Email</DialogTitle>
        <DialogDescription>
          Your email address <strong>{email}</strong> is not verified. Click the
          button below to receive a verification link.
        </DialogDescription>
      </DialogHeader>
      <div className="flex items-center justify-center py-6">
        <div className="flex size-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
          <span className="i-hugeicons-mail-02 size-8 text-yellow-600 dark:text-yellow-400" />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleClose} type="button" variant="outline">
          Cancel
        </Button>
        <Button disabled={isSending} onClick={handleSendVerification}>
          {isSending ? "Sending..." : "Send Verification Email"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
