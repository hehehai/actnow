import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { orpc } from "@/lib/orpc";
import type { ClientOutputs } from "@/lib/orpc-types";
import { filterDialog, postFormDialog } from "@/stores/handlers";
import { FilterBrowseTabs } from "./filter-browse-tabs";
import { FilterEmptyResults } from "./filter-empty-results";
import { FilterRecentSearches } from "./filter-recent-searches";
import { FilterSearchInput } from "./filter-search-input";
import { FilterSearchResults } from "./filter-search-results";

const RECENT_SEARCHES_KEY = "filter-recent-searches";
const MAX_RECENT_SEARCHES = 5;
const DEBOUNCE_MS = 300;

type FilterPayload =
  | {
      initialQuery?: string;
      initialTags?: string[];
    }
  | undefined;

export function FilterDialog() {
  return (
    <Dialog<FilterPayload> handle={filterDialog}>
      {({ payload }) => (
        <DialogContent
          className="flex h-[50vh] max-h-150 flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-2xl"
          showCloseButton={false}
        >
          <FilterDialogContent payload={payload} />
        </DialogContent>
      )}
    </Dialog>
  );
}

interface FilterDialogContentProps {
  payload: FilterPayload | undefined;
}

function FilterDialogContent({ payload }: FilterDialogContentProps) {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState(payload?.initialQuery ?? "");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  // Initialize with payload
  useEffect(() => {
    if (payload?.initialQuery) {
      setSearchValue(payload.initialQuery);
      setDebouncedValue(payload.initialQuery);
    }
  }, [payload?.initialQuery]);

  // Debounce updates
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(searchValue), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const hasSearchValue = debouncedValue.trim().length > 0;

  const { data: searchResults, isLoading } = useQuery<
    ClientOutputs["app"]["post"]["search"]
  >({
    ...orpc.app.post.search.queryOptions({
      input: { q: debouncedValue, limit: 10 },
    }),
    enabled: hasSearchValue,
  });

  const saveRecentSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item !== trimmed);
      const next = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeRecentSearch = useCallback((query: string) => {
    setRecentSearches((prev) => {
      const next = prev.filter((item) => item !== query);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleTagClick = useCallback(
    (tagSlug: string) => {
      if (searchValue) {
        saveRecentSearch(searchValue);
      }
      filterDialog.close();
      navigate({
        to: "/",
        search: (prev) => ({ ...prev, tag: tagSlug }),
      });
    },
    [navigate, saveRecentSearch, searchValue]
  );

  const handlePostClick = useCallback(
    ({ postId, userId }: { postId: string; userId: string | null }) => {
      if (!userId) {
        return;
      }
      if (searchValue) {
        saveRecentSearch(searchValue);
      }
      filterDialog.close();
      navigate({
        to: "/$userSlug/$postSlug",
        params: { userSlug: userId, postSlug: postId },
      });
    },
    [navigate, saveRecentSearch, searchValue]
  );

  const handleCreatePost = () => {
    filterDialog.close();
    postFormDialog.openWithPayload({ mode: "create" });
  };

  const hasResults = useMemo(
    () =>
      !!searchResults &&
      (searchResults.posts.length > 0 ||
        searchResults.tags.length > 0 ||
        searchResults.users.length > 0),
    [searchResults]
  );

  const handleUserClick = useCallback(
    (userId: string) => {
      if (searchValue) {
        saveRecentSearch(searchValue);
      }
      filterDialog.close();
      navigate({
        to: "/$userSlug",
        params: { userSlug: userId },
      });
    },
    [navigate, saveRecentSearch, searchValue]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b p-4">
        <FilterSearchInput
          onChange={setSearchValue}
          onSubmit={() => saveRecentSearch(searchValue)}
          value={searchValue}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {hasSearchValue ? (
          <ScrollArea className="h-full">
            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <span className="i-hugeicons-loading-01 size-6 animate-spin text-muted-foreground" />
                </div>
              ) : hasResults ? (
                <FilterSearchResults
                  onPostClick={handlePostClick}
                  onTagClick={handleTagClick}
                  onUserClick={handleUserClick}
                  posts={searchResults?.posts ?? []}
                  query={debouncedValue}
                  tags={searchResults?.tags ?? []}
                  users={searchResults?.users ?? []}
                />
              ) : (
                <FilterEmptyResults onCreatePost={handleCreatePost} />
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-full flex-col p-4">
            <FilterRecentSearches
              className="shrink-0"
              onRemove={removeRecentSearch}
              onSelect={(value) => {
                setSearchValue(value);
                setDebouncedValue(value);
              }}
              searches={recentSearches}
            />

            <FilterBrowseTabs
              className="min-h-0 flex-1"
              onTagClick={handleTagClick}
              onUserClick={handleUserClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}
