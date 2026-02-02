import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const AuthLayout = ({ children }: React.PropsWithChildren) => (
  <div className="min-h-screen w-full bg-background">
    <main className="flex w-full flex-col p-4">
      <header className="flex shrink-0 items-center justify-between">
        <Button
          render={
            <Link to="/">
              <span className="i-hugeicons-arrow-left-01 mr-2 size-4" /> Back
            </Link>
          }
          variant="ghost"
        />
      </header>
      <div className="flex grow items-center justify-center">{children}</div>
    </main>
  </div>
);
