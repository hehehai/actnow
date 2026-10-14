import { site } from "@actnow/common";
import { createFileRoute } from "@tanstack/react-router";
import { createPageMeta } from "@/lib/seo";

const aboutMeta = createPageMeta({
  title: "About",
  description:
    "Actnow is a platform for sharing and discovering creative inspiration. Capture fleeting ideas before they fade.",
  url: "/about",
});

export const Route = createFileRoute("/(app)/about")({
  component: AboutComponent,
  head: () => ({
    meta: aboutMeta.meta,
    links: aboutMeta.links,
  }),
});

function AboutComponent() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-bold text-3xl">About Actnow</h1>

      <div className="mt-8 space-y-6 text-muted-foreground">
        <p>
          Actnow is a platform for sharing and discovering creative inspiration.
          We believe that inspiration is fleeting - capture it before it fades.
        </p>

        <p>
          Actnow is a simple home for useful writing and ideas. Our team
          publishes clear, considered content so readers can find what they need
          and come back to it later.
        </p>

        <h2 className="font-semibold text-foreground text-xl">Features</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>Browse a focused library of published content</li>
          <li>Find articles by title or description</li>
          <li>Read clean, distraction-free post pages</li>
          <li>Manage drafts and publishing from the admin workspace</li>
        </ul>

        <h2 className="font-semibold text-foreground text-xl">Contact</h2>
        <p>Have questions or suggestions? Feel free to reach out to us.</p>

        <div className="flex gap-4">
          <a
            className="flex items-center gap-2 text-foreground hover:underline"
            href={site.authorUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="i-hugeicons-user" />
            {site.author}
          </a>
          <a
            className="flex items-center gap-2 text-foreground hover:underline"
            href={site.githubUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="i-hugeicons-github" />
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
