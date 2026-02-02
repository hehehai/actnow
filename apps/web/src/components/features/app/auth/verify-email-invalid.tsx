import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface VerifyEmailInvalidProps {
  email?: string;
}

export const VerifyEmailInvalid = ({ email }: VerifyEmailInvalidProps) => {
  const [isPending, setIsPending] = useState(false);
  const [isResent, setIsResent] = useState(false);

  const handleResend = async () => {
    if (!email) return;

    setIsPending(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      if (error) {
        toast.error(error.message || "Failed to resend verification email");
      } else {
        setIsResent(true);
        toast.success("Verification email sent");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to resend verification email"
      );
    } finally {
      setIsPending(false);
    }
  };

  if (isResent) {
    return (
      <div className="w-full max-w-sm">
        <header>
          <img
            alt="Logo"
            className="mb-3 size-10"
            height={60}
            src="/images/logo.svg"
            width={60}
          />
          <h1 className="mb-1 text-2xl">Check Your Email</h1>
          <p className="mb-8 text-secondary-foreground">
            We've sent a new verification link to {email}. Please check your
            inbox.
          </p>
        </header>
        <footer className="mt-10">
          <p className="text-secondary-foreground text-sm">
            Already verified?{" "}
            <Link className="text-foreground hover:underline" to="/signin">
              Sign in
            </Link>
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <header>
        <img
          alt="Logo"
          className="mb-3 size-10"
          height={60}
          src="/images/logo.svg"
          width={60}
        />
        <h1 className="mb-1 text-2xl">Invalid or Expired Link</h1>
        <p className="mb-8 text-secondary-foreground">
          This verification link is invalid or has expired. Please request a new
          one.
        </p>
      </header>
      {email && (
        <Button className="w-full" disabled={isPending} onClick={handleResend}>
          {isPending ? "Sending..." : "Resend Verification Email"}
        </Button>
      )}
      <footer className="mt-10">
        <p className="text-secondary-foreground text-sm">
          Already verified?{" "}
          <Link className="text-foreground hover:underline" to="/signin">
            Sign in
          </Link>
        </p>
      </footer>
    </div>
  );
};
