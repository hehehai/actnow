import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommandGroup, CommandItem } from "@/components/ui/command";
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
    <>
      {posts.length > 0 && (
        <CommandGroup heading="Posts">
          {posts.map((post) => (
            <CommandItem
              className="items-start py-2.5"
              key={post.id}
              onSelect={() =>
                onPostClick({ postId: post.id, userId: post.authorId ?? null })
              }
              value={`post:${post.title}:${post.id}`}
            >
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-subtle/45 text-brand-strong">
                <span className="i-hugeicons-news-01 size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{post.title}</span>
                {post.description && (
                  <span className="mt-0.5 block truncate text-muted-foreground text-sm">
                    {post.description}
                  </span>
                )}
                <span className="mt-1 block text-muted-foreground text-xs tabular-nums">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
      {users.length > 0 && (
        <CommandGroup heading="People">
          {users.map((user) => (
            <CommandItem
              key={user.id}
              onSelect={() => onUserClick(user.id)}
              value={`user:${user.name ?? "Anonymous"}:${user.id}`}
            >
              <Avatar className="size-8">
                {user.image && (
                  <AvatarImage alt={user.name ?? ""} src={user.image} />
                )}
                <AvatarFallback>
                  {getInitials(user.name, { fallback: "AN" })}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 truncate font-medium">
                {user.name ?? "Anonymous"}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </>
  );
}
