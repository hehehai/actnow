import { site } from "@actnow/common";
import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const linkClassName =
  "text-muted-foreground text-sm transition hover:text-foreground";
const currentYear = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="border-t border-footer-border bg-footer">
      <div className="container mx-auto max-w-7xl px-4 pt-12 pb-[max(3rem,env(safe-area-inset-bottom))] md:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link className="inline-flex items-center gap-2.5" to="/">
              <img alt="" className="size-8" src="/images/logo.svg" />
              <span className="font-medium text-base">{site.siteName}</span>
            </Link>
            <p className="mt-3 max-w-sm text-muted-foreground text-sm leading-relaxed">
              A simple home for useful writing and ideas, published by the
              Actnow team.
            </p>
          </div>
          <FooterColumn title="Explore">
            <Link className={linkClassName} to="/">
              Latest posts
            </Link>
            <Link className={linkClassName} to="/prices">
              Pricing
            </Link>
          </FooterColumn>
          <FooterColumn title="Community">
            <Link className={linkClassName} to="/about">
              About Actnow
            </Link>
            <Link className={linkClassName} to="/feedback">
              Feedback
            </Link>
            <a
              className={linkClassName}
              href={site.githubUrl}
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </FooterColumn>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-t border-footer-border pt-6 text-muted-foreground text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <ThemeToggle />
            <p>
              © {currentYear} {site.siteName}. All rights reserved.
            </p>
          </div>
          <a
            className="hover:text-foreground"
            href={site.authorUrl}
            rel="noreferrer"
            target="_blank"
          >
            Built by {site.author}
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  children,
  title,
}: React.PropsWithChildren<{ title: string }>) {
  return (
    <nav aria-label={title}>
      <p className="font-medium text-sm">{title}</p>
      <ul className="mt-3 space-y-2">
        {Array.isArray(children) ? (
          children.map((child, index) => <li key={index}>{child}</li>)
        ) : (
          <li>{children}</li>
        )}
      </ul>
    </nav>
  );
}
