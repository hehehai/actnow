import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/formatters";
import type { ClientOutputs } from "@/lib/orpc-types";
import { cn } from "@/lib/utils";

type PopularUser = ClientOutputs["app"]["user"]["popular"][number];

interface PopularUsersRowProps {
  users: PopularUser[];
  onUserClick: (userId: string) => void;
  className?: string;
}

export function PopularUsersRow({
  users,
  onUserClick,
  className,
}: PopularUsersRowProps) {
  const topUsers = users.slice(0, 3);

  if (topUsers.length === 0) {
    return (
      <p className={cn("text-pretty text-muted-foreground text-sm", className)}>
        No trending users yet.
      </p>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {topUsers.map((user) => {
        const initials = getInitials(user.name, { fallback: "AN" });

        return (
          <Button
            className="h-8 w-32 justify-start gap-2 rounded-full bg-card/50 px-2.5 text-left"
            key={user.id}
            onClick={() => onUserClick(user.id)}
            size="sm"
            type="button"
            variant="outline"
          >
            <Avatar className="size-5">
              {user.image && (
                <AvatarImage alt={user.name ?? ""} src={user.image} />
              )}
              <AvatarFallback className="text-[10px]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-pretty font-medium">
              {user.name ?? "Anonymous"}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
