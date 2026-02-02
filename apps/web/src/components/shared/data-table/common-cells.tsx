import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userDetailSheet } from "@/stores/handlers";

export function CreatorCell({
  createdById,
  creatorName,
  creatorImage,
}: {
  createdById: string;
  creatorName: string | null;
  creatorImage: string | null;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    userDetailSheet.openWithPayload({ userId: createdById });
  };

  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-6 cursor-pointer" onClick={handleClick}>
        <AvatarImage alt={creatorName ?? ""} src={creatorImage ?? undefined} />
        <AvatarFallback className="text-xs">
          {creatorName?.charAt(0) ?? "?"}
        </AvatarFallback>
      </Avatar>
      <span
        className="max-w-40 cursor-pointer truncate text-sm hover:underline"
        onClick={handleClick}
      >
        {creatorName}
      </span>
    </div>
  );
}
