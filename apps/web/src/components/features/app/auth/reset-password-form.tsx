import type { ResetPasswordSetFormData } from "@actnow/common";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { ForgotPasswordSet } from "./forgot-password-set";

interface ResetPasswordFormProps {
  email: string;
  token: string;
}

export const ResetPasswordForm = ({ email, token }: ResetPasswordFormProps) => {
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  const handleSubmit = async (data: ResetPasswordSetFormData) => {
    setIsPending(true);

    try {
      // Use emailOtp.resetPassword which validates OTP and resets password together
      const { error } = await authClient.emailOtp.resetPassword({
        email,
        otp: token,
        password: data.password,
      });

      if (error) {
        // Check if it's an invalid/expired OTP error
        if (error.code === "INVALID_OTP" || error.code === "OTP_EXPIRED") {
          setIsInvalid(true);
        } else {
          toast.error(error.message || "Failed to reset password");
        }
      } else {
        setIsSuccess(true);
        toast.success("Password reset successfully");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to reset password"
      );
    } finally {
      setIsPending(false);
    }
  };

  // Invalid/expired token state
  if (isInvalid) {
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
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
        </header>
        <Button
          className="w-full"
          onClick={() => navigate({ to: "/forget-password" })}
        >
          Request New Link
        </Button>
        <footer className="mt-10">
          <p className="text-secondary-foreground text-sm">
            Remember your password?{" "}
            <Link className="text-foreground hover:underline" to="/signin">
              Sign in
            </Link>
          </p>
        </footer>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
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
          <h1 className="mb-1 text-2xl">Password Reset Successfully</h1>
          <p className="mb-8 text-secondary-foreground">
            Your password has been reset. You can now sign in with your new
            password.
          </p>
        </header>
        <Button className="w-full" onClick={() => navigate({ to: "/signin" })}>
          Go to Sign In
        </Button>
      </div>
    );
  }

  // Reset password form
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
        <h1 className="mb-1 text-2xl">Set New Password</h1>
        <p className="mb-8 text-secondary-foreground">
          Enter your new password for {email}
        </p>
      </header>
      <ForgotPasswordSet onSubmit={handleSubmit}>
        <Button className="w-full" disabled={isPending} type="submit">
          {isPending ? "Resetting..." : "Reset Password"}
        </Button>
      </ForgotPasswordSet>
      <footer className="mt-10">
        <p className="text-secondary-foreground text-sm">
          Remember your password?{" "}
          <Link className="text-foreground hover:underline" to="/signin">
            Sign in
          </Link>
        </p>
      </footer>
    </div>
  );
};
