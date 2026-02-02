import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const ResetPasswordInvalid = () => {
  const navigate = useNavigate();

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
};
