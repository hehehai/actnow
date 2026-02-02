import type {
  InfiniteData,
  QueryClient,
  QueryKey,
} from "@tanstack/react-query";

interface WithId {
  id: string;
}

/**
 * Infinite query page structure
 */
interface InfinitePage<T> {
  items: T[];
  nextCursor?: string | null;
  hasMore?: boolean;
}

/**
 * Add a new item to query data array
 */
export function addQueryData<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  newItem: T,
  options?: {
    prepend?: boolean;
  }
): void {
  queryClient.setQueryData<T[]>(queryKey, (old) => {
    if (!old) return [newItem];
    return options?.prepend ? [newItem, ...old] : [...old, newItem];
  });
}

/**
 * Update an existing item in query data array by id
 */
export function updateQueryData<T extends WithId>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updatedItem: T
): void {
  queryClient.setQueryData<T[]>(queryKey, (old) =>
    old?.map((item) => (item.id === updatedItem.id ? updatedItem : item))
  );
}

/**
 * Update an existing item in query data array with sorting
 */
export function updateQueryDataWithSort<T extends WithId>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updatedItem: T,
  sortFn: (a: T, b: T) => number
): void {
  queryClient.setQueryData<T[]>(queryKey, (old) => {
    const updated = old?.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    return updated?.sort(sortFn);
  });
}

/**
 * Delete an item from query data array by id
 */
export function deleteQueryData<T extends WithId>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  id: string
): void {
  queryClient.setQueryData<T[]>(queryKey, (old) =>
    old?.filter((item) => item.id !== id)
  );
}

/**
 * Merge update into existing query data object
 */
export function mergeQueryData<T extends object>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updates: Partial<T>
): void {
  queryClient.setQueryData<T>(queryKey, (old) =>
    old ? { ...old, ...updates } : old
  );
}

/**
 * Update an item in infinite query data by id
 * Works with paginated data structure: { pages: [{ items: [...] }] }
 */
export function updateInfiniteQueryItem<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  id: string,
  updater: (item: T) => T,
  getId: (item: T) => string
): void {
  queryClient.setQueryData<InfiniteData<InfinitePage<T>>>(queryKey, (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map((item) =>
          getId(item) === id ? updater(item) : item
        ),
      })),
    };
  });
}

/**
 * Delete an item from infinite query data by id
 */
export function deleteInfiniteQueryItem<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  id: string,
  getId: (item: T) => string
): void {
  queryClient.setQueryData<InfiniteData<InfinitePage<T>>>(queryKey, (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.filter((item) => getId(item) !== id),
      })),
    };
  });
}

/**
 * Add an item to infinite query data
 */
export function addInfiniteQueryItem<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  newItem: T,
  options?: {
    prepend?: boolean;
    pageIndex?: number;
  }
): void {
  queryClient.setQueryData<InfiniteData<InfinitePage<T>>>(queryKey, (old) => {
    if (!old || old.pages.length === 0) return old;

    const pageIndex = options?.pageIndex ?? 0;
    const targetPage = options?.prepend ? 0 : pageIndex;

    return {
      ...old,
      pages: old.pages.map((page, index) => {
        if (index !== targetPage) return page;
        return {
          ...page,
          items: options?.prepend
            ? [newItem, ...page.items]
            : [...page.items, newItem],
        };
      }),
    };
  });
}
