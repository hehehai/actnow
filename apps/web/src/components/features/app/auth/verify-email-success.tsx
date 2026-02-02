import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const VerifyEmailSuccess = () => {
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
        <h1 className="mb-1 text-2xl">Email Verified</h1>
        <p className="mb-8 text-secondary-foreground">
          Your email has been verified successfully. You can now sign in to your
          account.
        </p>
      </header>
      <Button className="w-full" onClick={() => navigate({ to: "/signin" })}>
        Go to Sign In
      </Button>
    </div>
  );
};
