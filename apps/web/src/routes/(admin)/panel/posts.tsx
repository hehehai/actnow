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

const STATUS_OPTIONS = [
  { value: "all" as const, label: "All content" },
  { value: "draft" as const, label: "Drafts" },
  { value: "published" as const, label: "Published" },
];

const PAGE_SIZE = 10;

const searchSchema = z.object({
  search: z.string().catch(""),
  status: z.enum(["all", "draft", "published"]).catch("all"),
  createdById: z.string().optional().catch(undefined),
  sortBy: z.enum(["createdAt", "publishedAt"]).catch("createdAt"),
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
        status: search.status,
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

  const handleUserChange = (value: string | null) => {
    updateSearch({ createdById: value ?? undefined, page: 1 });
  };

  const handleSortChange = (
    sortBy: "createdAt" | "publishedAt",
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
          <div className="flex min-w-0 flex-1 items-center">
            <DataTableToolbar
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search title or description..."
              searchValue={search.search}
            >
              <StatusFilterSelect
                className="w-32"
                items={STATUS_OPTIONS}
                onChange={(value) =>
                  updateSearch({
                    status: value as SearchParams["status"],
                    page: 1,
                  })
                }
                value={search.status}
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
            New content
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
