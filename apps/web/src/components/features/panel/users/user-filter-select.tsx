import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInitials } from "@/lib/formatters";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";

interface UserFilterSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}

export function UserFilterSelect({
  value,
  onChange,
  className,
}: UserFilterSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: users, isLoading } = useQuery(
    orpc.panel.user.listForFilter.queryOptions({
      input: { search: search || undefined, limit: 20 },
      enabled: open,
    })
  );

  const selectedUser = users?.find((u) => u.id === value);

  // Focus input when popover opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure popover is rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSelect = (userId: string | null) => {
    onChange(userId);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            aria-expanded={open}
            className={cn("w-48 justify-between", className)}
            role="combobox"
            variant="outline"
          >
            {selectedUser ? (
              <div className="flex items-center gap-2 truncate">
                <Avatar className="size-5">
                  <AvatarImage src={selectedUser.image ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(selectedUser.name, { fallback: "?" })}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{selectedUser.name}</span>
              </div>
            ) : (
              "All Users"
            )}
            {value ? (
              <span
                className="i-hugeicons-cancel-01 ml-2 size-4 shrink-0 opacity-50 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    onChange(null);
                  }
                }}
                role="button"
                tabIndex={0}
              />
            ) : (
              <span
                className={cn(
                  "i-hugeicons-unfold-more ml-2 size-4 shrink-0 opacity-50"
                )}
              />
            )}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-fit gap-0 p-0">
        {/* Search Input */}
        <div className="flex items-center border-b px-3">
          <span className="i-hugeicons-search-01 size-4 shrink-0 opacity-50" />
          <Input
            className="h-9 border-0 px-2 shadow-none focus-visible:ring-0"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            ref={inputRef}
            value={search}
          />
        </div>

        {/* List */}
        <ScrollArea className="h-60 p-1">
          {/* Loading state */}
          {isLoading && (
            <div className="py-6 text-center text-muted-foreground text-sm">
              Loading...
            </div>
          )}

          {/* Empty state */}
          {!isLoading && users?.length === 0 && (
            <div className="py-6 text-center text-muted-foreground text-sm">
              No users found.
            </div>
          )}

          {/* User list */}
          {!isLoading &&
            users?.map((user) => (
              <button
                className={cn(
                  "relative flex w-full cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none hover:bg-accent hover:text-accent-foreground",
                  value === user.id && "bg-accent"
                )}
                key={user.id}
                onClick={() => handleSelect(user.id)}
                type="button"
              >
                <Avatar className="size-8">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {user.name?.charAt(0) ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col overflow-hidden">
                  <span className="truncate text-sm">{user.name}</span>
                  <span className="truncate text-muted-foreground text-xs">
                    {user.email}
                  </span>
                </div>
                {value === user.id && (
                  <span className="i-hugeicons-tick-02 size-4 text-primary" />
                )}
              </button>
            ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
