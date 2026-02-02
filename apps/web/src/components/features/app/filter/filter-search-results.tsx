import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/formatters";

interface FilterSearchResultsProps {
  query: string;
  posts: Array<{
    id: string;
    comment: string | null;
    prompt: string | null;
    createdAt: Date | string;
    authorId?: string | null;
  }>;
  tags: Array<{ id: string; name: string; type: string; value: string }>;
  users: Array<{ id: string; name: string | null; image: string | null }>;
  onPostClick: (params: { postId: string; userId: string | null }) => void;
  onTagClick: (tagSlug: string) => void;
  onUserClick: (userId: string) => void;
}

export function FilterSearchResults({
  query,
  posts,
  tags,
  users,
  onPostClick,
  onTagClick,
  onUserClick,
}: FilterSearchResultsProps) {
  const normalizedQuery = query.trim().toLowerCase();

  const scoreMatch = (value: string | null | undefined) => {
    if (!(value && normalizedQuery)) return 0;
    const normalizedValue = value.toLowerCase();
    if (normalizedValue === normalizedQuery) return 100;
    if (normalizedValue.startsWith(normalizedQuery)) return 80;
    if (normalizedValue.includes(normalizedQuery)) return 60;
    return 0;
  };

  const scoredUsers = users
    .map((user) => ({
      user,
      score: scoreMatch(user.name ?? ""),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const scoredPosts = posts
    .map((post) => ({
      post,
      score: Math.max(scoreMatch(post.comment), scoreMatch(post.prompt)),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const scoredTags = tags
    .map((tag) => ({
      tag,
      score: Math.max(scoreMatch(tag.name), scoreMatch(tag.value)),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const sections = [
    {
      key: "users",
      label: "Users",
      score: scoredUsers[0]?.score ?? 0,
      visible: scoredUsers.length > 0,
    },
    {
      key: "posts",
      label: "Posts",
      score: scoredPosts[0]?.score ?? 0,
      visible: scoredPosts.length > 0,
    },
    {
      key: "tags",
      label: "Tags",
      score: scoredTags[0]?.score ?? 0,
      visible: scoredTags.length > 0,
    },
  ]
    .filter((section) => section.visible)
    .sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-8">
      {sections.map((section) => {
        if (section.key === "users") {
          return (
            <section key={section.key}>
              <h3 className="mb-2 text-balance text-muted-foreground text-sm">
                {section.label}
              </h3>
              <div className="space-y-2">
                {scoredUsers.map(({ user }) => (
                  <button
                    className="flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition hover:border-primary"
                    key={user.id}
                    onClick={() => onUserClick(user.id)}
                    type="button"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar className="size-7">
                        {user.image && (
                          <AvatarImage alt={user.name ?? ""} src={user.image} />
                        )}
                        <AvatarFallback className="text-xs">
                          {getInitials(user.name, { fallback: "AN" })}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-pretty font-medium">
                        {user.name ?? "Anonymous"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          );
        }

        if (section.key === "posts") {
          return (
            <section key={section.key}>
              <h3 className="mb-2 text-balance text-muted-foreground text-sm">
                {section.label}
              </h3>
              <div className="space-y-2">
                {scoredPosts.map(({ post }) => (
                  <button
                    className="w-full rounded-2xl border px-4 py-3 text-left transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-70"
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
                    <p className="line-clamp-2 text-pretty font-medium">
                      {post.comment ?? post.prompt ?? "Untitled post"}
                    </p>
                    <p className="text-muted-foreground text-xs tabular-nums">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          );
        }

        return (
          <section key={section.key}>
            <h3 className="mb-2 text-balance text-muted-foreground text-sm">
              {section.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {scoredTags.map(({ tag }) => (
                <Button
                  key={tag.id}
                  onClick={() => onTagClick(tag.value)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Badge className="mr-2" variant="outline">
                    {tag.type}
                  </Badge>
                  {tag.name}
                </Button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
