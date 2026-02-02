import { createFileRoute } from "@tanstack/react-router";
import { createPageMeta } from "@/lib/seo";

const notFoundMeta = createPageMeta({
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
  noIndex: true,
});

export const Route = createFileRoute("/(app)/404")({
  component: RouteComponent,
  head: () => ({
    meta: notFoundMeta.meta,
    links: notFoundMeta.links,
  }),
});

function RouteComponent() {
  return <div>Hello "/(app)/404"!</div>;
}
