import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";
import type { ClientOutputs } from "@/lib/orpc-types";
import { FilterLatestPosts } from "./filter-latest-posts";
import { FilterSearchResults } from "./filter-search-results";

const DEBOUNCE_MS = 250;

export function FilterDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [query, setQuery] = useState("");
  const searching = value.trim().length > 0;

  useEffect(() => {
    const timer = setTimeout(() => setQuery(value.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    if (!open) {
      setValue("");
      setQuery("");
    }
  }, [open]);

  const { data: latestPosts, isPending: latestPending } = useQuery({
    ...orpc.app.post.list.queryOptions({
      input: { limit: 3, sort: "latest" },
    }),
    enabled: open && !searching,
  });
  const { data: searchResults, isPending: searchPending } = useQuery<
    ClientOutputs["app"]["post"]["search"]
  >({
    ...orpc.app.post.search.queryOptions({
      input: { q: query, limit: 10 },
    }),
    enabled: open && query.length > 0,
  });

  // Include the debounce window so a previous query never flashes under new text.
  const loading = searching && (value.trim() !== query || searchPending);
  const hasResults = useMemo(
    () =>
      Boolean(
        searchResults &&
        (searchResults.posts.length > 0 || searchResults.users.length > 0)
      ),
    [searchResults]
  );

  const goToPost = useCallback(
    ({ postId, userId }: { postId: string; userId: string | null }) => {
      if (!userId) return;
      onOpenChange(false);
      void navigate({
        to: "/$userSlug/$postSlug",
        params: { userSlug: userId, postSlug: postId },
      });
    },
    [navigate, onOpenChange]
  );
  const goToUser = useCallback(
    (userId: string) => {
      onOpenChange(false);
      void navigate({ to: "/$userSlug", params: { userSlug: userId } });
    },
    [navigate, onOpenChange]
  );

  return (
    <CommandDialog
      className="flex h-[min(32rem,calc(100dvh-2rem))] max-w-[calc(100%-1.5rem)] flex-col gap-0 rounded-2xl! border-border/80 bg-background/98 p-0 shadow-xl shadow-black/10 backdrop-blur-xl sm:max-w-2xl"
      description="Search published Actnow content and people."
      onOpenChange={onOpenChange}
      open={open}
      title="Search Actnow"
    >
      <Command
        className="min-h-0 flex-1 rounded-none! bg-transparent p-0"
        shouldFilter={false}
      >
        <div className="relative border-border/70 border-b">
          <CommandInput
            aria-label="Search published posts or people"
            autoFocus
            className="pr-14 text-base"
            onValueChange={setValue}
            placeholder="Search published posts or people..."
            ref={inputRef}
            value={value}
          />
          <button
            aria-label="Close search"
            className="absolute top-1/2 right-5 -translate-y-1/2 rounded-md border border-border/80 bg-background px-1.5 py-0.5 font-sans text-muted-foreground text-xs transition-colors hover:border-border hover:text-foreground"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            ESC
          </button>
        </div>

        {!searching ? (
          <CommandList className="max-h-none flex-1 p-2 sm:p-3">
            {latestPending ? (
              <SearchSkeleton />
            ) : latestPosts?.items.length ? (
              <FilterLatestPosts
                onPostClick={goToPost}
                posts={latestPosts.items}
              />
            ) : (
              <CommandEmpty>No published posts yet.</CommandEmpty>
            )}
          </CommandList>
        ) : (
          <CommandList className="max-h-none flex-1 p-1 sm:p-2">
            {query.length > 0 && !loading && !hasResults && (
              <CommandEmpty>No matching posts or people.</CommandEmpty>
            )}
            {loading ? (
              <SearchSkeleton />
            ) : searchResults ? (
              <FilterSearchResults
                onPostClick={goToPost}
                onUserClick={goToUser}
                posts={searchResults.posts}
                users={searchResults.users}
              />
            ) : null}
          </CommandList>
        )}
      </Command>
    </CommandDialog>
  );
}

function SearchSkeleton() {
  return (
    <div aria-busy="true" className="px-2 py-1.5" role="status">
      <span className="sr-only">Searching</span>
      <Skeleton className="mx-1 mt-2 mb-3 h-3 w-32" />
      {[0, 1, 2].map((row) => (
        <div
          aria-hidden="true"
          className="flex items-start gap-3 px-1 py-2.5"
          key={row}
        >
          <Skeleton className="size-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2 pt-0.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className={row % 2 ? "h-3 w-2/5" : "h-3 w-3/5"} />
          </div>
        </div>
      ))}
    </div>
  );
}
