import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { NavMainHeader } from "@/components/features/panel/layout/nav-main-header";
import { PostDataTable } from "@/components/features/panel/posts";
import { UserFilterSelect } from "@/components/features/panel/users/user-filter-select";
import {
  DataTableToolbar,
  StatusFilterSelect,
} from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc";
import { createPageMeta } from "@/lib/seo";
import { panelPostFormDialog } from "@/stores/handlers";

const VISIBILITY_OPTIONS = [
  { value: "all" as const, label: "All Visibility" },
  { value: "public" as const, label: "Public Only" },
];

const PAGE_SIZE = 10;

const searchSchema = z.object({
  search: z.string().catch(""),
  visibility: z.enum(["all", "public"]).catch("all"),
  createdById: z.string().optional().catch(undefined),
  sortBy: z
    .enum(["createdAt", "updatedAt", "likes", "visits"])
    .catch("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).catch("desc"),
  page: z.number().int().positive().catch(1),
});

type SearchParams = z.infer<typeof searchSchema>;

const postsMeta = createPageMeta({
  title: "Manage Posts",
  description: "Review and manage user posts.",
  url: "/panel/posts",
  noIndex: true,
});

export const Route = createFileRoute("/(admin)/panel/posts")({
  component: RouteComponent,
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: postsMeta.meta,
    links: postsMeta.links,
  }),
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const updateSearch = (updates: Partial<SearchParams>) => {
    navigate({
      search: (prev: SearchParams) => ({ ...prev, ...updates }),
    });
  };

  const { data, isLoading } = useQuery(
    orpc.panel.post.list.queryOptions({
      input: {
        search: search.search || undefined,
        visibility: search.visibility === "public" ? "public" : "all",
        createdById: search.createdById,
        sortBy: search.sortBy,
        sortOrder: search.sortOrder,
        page: search.page,
        limit: PAGE_SIZE,
      },
    })
  );

  const handleSearchChange = (value: string) => {
    updateSearch({ search: value, page: 1 });
  };

  const handleVisibilityChange = (value: SearchParams["visibility"] | null) => {
    updateSearch({ visibility: value ?? "all", page: 1 });
  };

  const handleUserChange = (value: string | null) => {
    updateSearch({ createdById: value ?? undefined, page: 1 });
  };

  const handleSortChange = (
    sortBy: "createdAt" | "updatedAt" | "likes" | "visits",
    order: "asc" | "desc"
  ) => {
    updateSearch({ sortBy, sortOrder: order, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateSearch({ page });
  };

  return (
    <div className="w-full">
      <NavMainHeader
        className="justify-between"
        left={
          <div className="flex flex-1 items-center gap-3">
            <h2 className="text-balance font-semibold">Posts</h2>
            <DataTableToolbar
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search by prompt or comment..."
              searchValue={search.search}
            >
              <StatusFilterSelect
                className="w-32"
                items={VISIBILITY_OPTIONS}
                onChange={handleVisibilityChange}
                value={search.visibility}
              />
              <UserFilterSelect
                onChange={handleUserChange}
                value={search.createdById ?? null}
              />
            </DataTableToolbar>
          </div>
        }
        right={
          <Button
            onClick={() =>
              panelPostFormDialog.openWithPayload({ mode: "create" })
            }
          >
            <span className="i-hugeicons-plus-sign size-3.5" />
            New Post
          </Button>
        }
      />

      <div className="p-4">
        <PostDataTable
          data={data?.items ?? []}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
          pagination={
            data
              ? {
                  total: data.total,
                  totalPages: data.totalPages,
                  page: data.page,
                  pageSize: data.pageSize,
                }
              : undefined
          }
          sortBy={search.sortBy}
          sortOrder={search.sortOrder}
        />
      </div>
    </div>
  );
}
