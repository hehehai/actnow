import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/formatters";
import type { PostRow } from "./columns";

export function PostRowContent({ post }: { post: PostRow }) {
  return (
    <div className="grid gap-6 rounded-b-lg bg-muted/30 p-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="space-y-5">
        <div>
          <p className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Description
          </p>
          <p className="whitespace-pre-line text-sm">
            {post.post.description || "No description"}
          </p>
        </div>
        <div>
          <p className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Content
          </p>
          <p className="line-clamp-8 whitespace-pre-line text-sm leading-relaxed">
            {post.post.content}
          </p>
        </div>
      </div>
      <aside className="space-y-4">
        {post.post.cover ? (
          <img
            alt=""
            className="aspect-[4/3] w-full rounded-xl object-cover"
            src={post.post.cover}
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-placeholder-gradient text-placeholder-text">
            <span className="i-hugeicons-image-01 size-8" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Status</p>
            <Badge
              className="mt-1"
              variant={post.post.status === "published" ? "default" : "outline"}
            >
              {post.post.status === "published" ? "Published" : "Draft"}
            </Badge>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Created</p>
            <p className="mt-1 tabular-nums">
              {formatDateTime(post.post.createdAt)}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground text-xs">Published</p>
            <p className="mt-1 tabular-nums">
              {formatDateTime(post.post.publishedAt) ?? "Not published"}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
