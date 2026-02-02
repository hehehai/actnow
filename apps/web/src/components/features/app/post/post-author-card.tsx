import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/formatters";

interface PostAuthorCardProps {
  author: {
    id: string | null;
    name: string | null;
    image: string | null;
  } | null;
}

export function PostAuthorCard({ author }: PostAuthorCardProps) {
  const initials = getInitials(author?.name, { fallback: "AN" });
  const authorName = author?.name ?? "Anonymous";

  if (!author?.id) {
    return (
      <div className="flex items-center gap-3">
        <Avatar className="size-10">
          {author?.image && <AvatarImage alt={authorName} src={author.image} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="font-medium">{authorName}</span>
      </div>
    );
  }

  return (
    <Link
      className="flex items-center gap-3 transition-opacity hover:opacity-80"
      params={{ userSlug: author.id }}
      to="/$userSlug"
    >
      <Avatar className="size-10">
        {author.image && <AvatarImage alt={authorName} src={author.image} />}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <span className="font-medium">{authorName}</span>
    </Link>
  );
}
