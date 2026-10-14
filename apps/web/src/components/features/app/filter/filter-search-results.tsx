import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/formatters";

interface FilterSearchResultsProps {
  posts: Array<{
    id: string;
    title: string;
    description: string;
    createdAt: Date | string;
    authorId?: string | null;
  }>;
  users: Array<{ id: string; name: string | null; image: string | null }>;
  onPostClick: (params: { postId: string; userId: string | null }) => void;
  onUserClick: (userId: string) => void;
}

export function FilterSearchResults({
  posts,
  users,
  onPostClick,
  onUserClick,
}: FilterSearchResultsProps) {
  return (
    <div className="space-y-8">
      {posts.length > 0 && (
        <section>
          <h3 className="mb-2 font-medium text-sm">Content</h3>
          <div className="space-y-2">
            {posts.map((post) => (
              <button
                className="w-full rounded-2xl border px-4 py-3 text-left transition hover:border-brand"
                disabled={!post.authorId}
                key={post.id}
                onClick={() =>
                  onPostClick({
                    postId: post.id,
                    userId: post.authorId ?? null,
                  })
                }
                type="button"
              >
                <p className="line-clamp-2 font-medium">{post.title}</p>
                {post.description && (
                  <p className="mt-1 line-clamp-1 text-muted-foreground text-sm">
                    {post.description}
                  </p>
                )}
                <p className="mt-2 text-muted-foreground text-xs tabular-nums">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
      {users.length > 0 && (
        <section>
          <h3 className="mb-2 font-medium text-sm">People</h3>
          <div className="space-y-2">
            {users.map((user) => (
              <button
                className="flex w-full items-center gap-2 rounded-2xl border px-4 py-3 text-left transition hover:border-brand"
                key={user.id}
                onClick={() => onUserClick(user.id)}
                type="button"
              >
                <Avatar className="size-8">
                  {user.image && (
                    <AvatarImage alt={user.name ?? ""} src={user.image} />
                  )}
                  <AvatarFallback>
                    {getInitials(user.name, { fallback: "AN" })}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{user.name ?? "Anonymous"}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
