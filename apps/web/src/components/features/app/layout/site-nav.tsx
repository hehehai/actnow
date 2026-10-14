import { Link } from "@tanstack/react-router";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SiteNav() {
  return (
    <nav
      aria-label="Main navigation"
      className="hidden items-center gap-1 lg:flex"
    >
      <Link
        className="rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:bg-background/80 hover:text-foreground"
        to="/"
      >
        Latest
      </Link>
      <Link
        className="rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:bg-background/80 hover:text-foreground"
        to="/about"
      >
        About
      </Link>
      <Link
        className="rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:bg-background/80 hover:text-foreground"
        to="/prices"
      >
        Pricing
      </Link>
    </nav>
  );
}

export function SiteMobileNav({ user }: { user: boolean }) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            aria-label="Open navigation"
            className="inline-flex size-10 items-center justify-center rounded-full text-foreground transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            type="button"
          />
        }
      >
        <span aria-hidden="true" className="i-hugeicons-menu-01 size-5" />
      </SheetTrigger>
      <SheetContent
        className="w-[min(22rem,100vw)] gap-0 overflow-hidden border-border/80 bg-app p-0 lg:hidden"
        side="left"
      >
        <SheetHeader className="border-b border-border/80 px-5 py-4 pr-14">
          <SheetTitle className="flex items-center gap-2.5 text-left font-medium">
            <img alt="" className="size-7" src="/images/logo.svg" />
            Actnow
          </SheetTitle>
          <SheetDescription className="sr-only">
            Explore ideas and creative work shared by the Actnow community.
          </SheetDescription>
        </SheetHeader>
        <nav
          aria-label="Mobile navigation"
          className="flex flex-col gap-7 overflow-y-auto px-4 py-5 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <MobileSection label="Discover">
            <MobileLink label="Latest posts" />
            <MobileLink href="/about" label="About Actnow" />
            <MobileLink href="/prices" label="Plans and pricing" />
          </MobileSection>
          {user ? (
            <MobileSection label="Your space">
              <MobileLink href="/account" label="Account overview" />
              <MobileLink href="/feedback" label="Feedback" />
            </MobileSection>
          ) : (
            <MobileSection label="Your space">
              <MobileLink href="/signin" label="Sign in" />
              <MobileLink href="/signup" label="Create an account" />
            </MobileSection>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function MobileSection({
  children,
  label,
}: React.PropsWithChildren<{ label: string }>) {
  return (
    <section className="flex flex-col gap-1">
      <p className="px-2.5 pb-1.5 font-medium text-[11px] text-brand uppercase tracking-[0.16em]">
        {label}
      </p>
      {children}
    </section>
  );
}

function MobileLink({
  href,
  label,
}: {
  href?:
    | "/about"
    | "/prices"
    | "/account"
    | "/feedback"
    | "/signin"
    | "/signup";
  label: string;
}) {
  return (
    <SheetClose
      render={
        <Link
          className="flex min-h-11 items-center rounded-2xl px-2.5 py-2 text-sm font-medium transition hover:bg-background/80 focus-visible:bg-background focus-visible:outline-none"
          to={href ?? "/"}
        />
      }
    >
      {label}
    </SheetClose>
  );
}
