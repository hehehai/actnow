import { MediaGrid } from "@/components/features/common/media/media-grid";
import { PostPromptBlock } from "@/components/features/common/post/post-prompt-block";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/formatters";
import type { PostRow } from "./columns";

export function PostRowContent({ post }: { post: PostRow }) {
  const createdAt = formatDateTime(post.post.createdAt);
  const updatedAt = formatDateTime(post.post.updatedAt);

  return (
    <div className="grid gap-6 rounded-b-lg bg-muted/30 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <h4 className="font-medium text-muted-foreground text-xs uppercase">
            Prompt
          </h4>
          <PostPromptBlock value={post.post.prompt} />
        </div>

        <div className="space-y-1.5">
          <h4 className="font-medium text-muted-foreground text-xs uppercase">
            Comment
          </h4>
          <p className="whitespace-pre-line text-pretty text-sm">
            {post.post.comment ?? "Untitled post"}
          </p>
        </div>

        {post.tags.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="font-medium text-muted-foreground text-xs uppercase">
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag.id} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <h4 className="font-medium text-muted-foreground text-xs uppercase">
              Visits
            </h4>
            <p className="font-semibold text-lg tabular-nums">
              {post.post.visits.toLocaleString()}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-muted-foreground text-xs uppercase">
              Likes
            </h4>
            <p className="font-semibold text-lg tabular-nums">
              {post.post.likes.toLocaleString()}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-muted-foreground text-xs uppercase">
              Visibility
            </h4>
            <Badge variant={post.post.isPublic ? "default" : "outline"}>
              {post.post.isPublic ? "Public" : "Private"}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="font-medium text-muted-foreground text-xs uppercase">
              Created
            </h4>
            <p className="text-muted-foreground text-sm tabular-nums">
              {createdAt}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-muted-foreground text-xs uppercase">
              Updated
            </h4>
            <p className="text-muted-foreground text-sm tabular-nums">
              {updatedAt}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-muted-foreground text-xs uppercase">
          Media
        </h4>
        <MediaGrid
          columns={2}
          media={post.post.media}
          previewAlt="Post media"
          previewMode="hover"
          previewTitle="Post media"
        />
      </div>
    </div>
  );
}
