import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import {
  createJsonLdScript,
  createOrganizationSchema,
  createWebSiteSchema,
} from "@/lib/json-ld";
import type { orpc } from "@/lib/orpc";
import { createPageMeta } from "@/lib/seo";
import appCss from "../index.css?url";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}

const defaultMeta = createPageMeta();
const organizationSchema = createOrganizationSchema();
const websiteSchema = createWebSiteSchema();

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...defaultMeta.meta,
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      ...defaultMeta.links,
    ],
    scripts: [
      createJsonLdScript(organizationSchema),
      createJsonLdScript(websiteSchema),
    ],
  }),

  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Outlet />
          <Toaster richColors />
        </ThemeProvider>

        <Scripts />
      </body>
    </html>
  );
}
