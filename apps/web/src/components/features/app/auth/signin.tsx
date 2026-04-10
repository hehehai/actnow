import type {
  SignInEmailFormData,
  SignInOtpFormData,
  SignInPasswordFormData,
} from "@actnow/common";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { signInPassword } from "@/functions/sign-in-password";
import { authClient } from "@/lib/auth-client";
import { SigninEmail } from "./signin-email";
import { SigninEmailOtp } from "./signin-email-otp";
import { SigninEmailPassword } from "./signin-email-password";
import { SigninThirdAuth } from "./signin-third-auth";

const signinApi = getRouteApi("/(auth)/signin");

export const SignIn = () => {
  const navigate = useNavigate();
  const { mode, error, error_description } = signinApi.useSearch();
  const [isPending, setIsPending] = useState(false);

  // Handle OAuth callback errors (e.g., banned user)
  useEffect(() => {
    if (error) {
      if (error === "USER_BANNED" || error_description?.includes("banned")) {
        toast.error(
          error_description ||
            "Your account has been banned. Please contact support.",
          { duration: 6000 }
        );
      } else {
        toast.error(error_description || error || "Authentication failed");
      }
      // Clean up URL params
      navigate({ to: "/signin" });
    }
  }, [error, error_description, navigate]);

  const handleEmailSubmit = async (data: SignInEmailFormData) => {
    setIsPending(true);
    try {
      const { error } = await authClient.signIn.magicLink({
        email: data.email,
        callbackURL: "/",
      });
      if (error) {
        toast.error(error.message || "Failed to send magic link");
      } else {
        toast.success("Check your email for the magic link!");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send magic link"
      );
    } finally {
      setIsPending(false);
    }
  };

  const handlePasswordSubmit = async (data: SignInPasswordFormData) => {
    setIsPending(true);
    try {
      const response = await signInPassword({ data });
      if (!response.ok) {
        const errorCode = response.error.code;
        if (errorCode === "USER_BANNED") {
          toast.error("Your account has been banned. Please contact support.", {
            duration: 6000,
          });
          return;
        }
        toast.error(response.error.message || "Invalid email or password");
        return;
      }

      window.location.assign("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsPending(false);
    }
  };

  const handleOtpSubmit = async (data: SignInOtpFormData) => {
    if (data.otp) {
      setIsPending(true);
      try {
        const { error } = await authClient.signIn.emailOtp({
          email: data.email,
          otp: data.otp,
        });
        if (error) {
          // Handle banned user error
          const errorCode = (error as { code?: string })?.code;
          if (errorCode === "USER_BANNED") {
            const banReason = (error as { banReason?: string })?.banReason;
            toast.error(
              banReason
                ? `Your account has been banned: ${banReason}`
                : "Your account has been banned. Please contact support.",
              { duration: 6000 }
            );
            return;
          }
          toast.error(error.message || "Failed to verify OTP");
        } else {
          navigate({ to: "/" });
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to verify OTP"
        );
      } finally {
        setIsPending(false);
      }
    }
  };

  const signinMap = {
    email: {
      label: "Magic Link",
      onSubmit: handleEmailSubmit,
      submitLabel: "Send Magic Link",
    },
    "email-otp": {
      label: "Email OTP",
      onSubmit: handleOtpSubmit,
      submitLabel: "Verify",
    },
    password: {
      label: "Password",
      onSubmit: handlePasswordSubmit,
      submitLabel: "Sign In",
    },
  };

  const activeMode = mode ? signinMap[mode] : signinMap.email;
  const otherModes = (Object.keys(signinMap) as Array<keyof typeof signinMap>)
    .filter((key) => key !== mode)
    .map((key) => ({ key, ...signinMap[key] }));

  const modeButtons = (
    <div className="flex items-center justify-center gap-3">
      {otherModes.map((modeItem) => (
        <Button
          className="grow"
          key={modeItem.key}
          render={
            <Link search={{ mode: modeItem.key }} to="/signin">
              {modeItem.label}
            </Link>
          }
          variant="secondary"
        />
      ))}
    </div>
  );

  const submitButton = (
    <Button className="w-full" disabled={isPending} type="submit">
      {isPending ? "Processing..." : activeMode.submitLabel}
    </Button>
  );

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
        <h1 className="mb-1 text-2xl">Sign In</h1>
        <p className="mb-8 text-secondary-foreground">
          View all website information
        </p>
      </header>

      {mode === "email" && (
        <SigninEmail onSubmit={handleEmailSubmit}>
          {submitButton}
          {modeButtons}
        </SigninEmail>
      )}

      {mode === "email-otp" && (
        <SigninEmailOtp
          modeButtons={modeButtons}
          onSubmit={handleOtpSubmit}
          submitButton={submitButton}
        />
      )}

      {mode === "password" && (
        <SigninEmailPassword onSubmit={handlePasswordSubmit}>
          {submitButton}
          {modeButtons}
        </SigninEmailPassword>
      )}

      <SigninThirdAuth />
      <footer className="mt-10">
        <p className="mb-2 text-secondary-foreground text-sm">
          <Link
            className="text-foreground hover:underline"
            to="/forget-password"
          >
            Forget password?
          </Link>
        </p>
        <p className="text-secondary-foreground text-sm">
          Don&apos;t have an account?{" "}
          <Link className="text-foreground hover:underline" to="/signup">
            Sign up
          </Link>
        </p>
      </footer>
    </div>
  );
};
