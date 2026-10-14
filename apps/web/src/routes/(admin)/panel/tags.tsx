import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useState } from "react";
import { z } from "zod";
import { NavMainHeader } from "@/components/features/panel/layout/nav-main-header";
import { TagDataTable } from "@/components/features/panel/tags/data-table";
import { TagFormDialog } from "@/components/features/panel/tags/tag-form-dialog";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { StatusFilterSelect } from "@/components/shared/data-table/status-filter";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc";
import { createPageMeta } from "@/lib/seo";

const TAG_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "platform", label: "Platform" },
  { value: "model", label: "Model" },
  { value: "style", label: "Style" },
] as const;

const PAGE_SIZE = 10;

const searchSchema = z.object({
  search: z.string().catch(""),
  type: z.enum(["all", "platform", "model", "style"]).catch("all"),
  sortBy: z.enum(["createdAt", "name"]).catch("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).catch("desc"),
  page: z.number().int().positive().catch(1),
});

type SearchParams = z.infer<typeof searchSchema>;

const tagsMeta = createPageMeta({
  title: "Manage Tags",
  description: "Organize topics used across Actnow posts.",
  url: "/panel/tags",
  noIndex: true,
});

export const Route = createFileRoute("/(admin)/panel/tags")({
  component: RouteComponent,
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: tagsMeta.meta,
    links: tagsMeta.links,
  }),
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);

  // Update search params
  const updateSearch = (updates: Partial<SearchParams>) => {
    navigate({
      search: (prev: SearchParams) => ({ ...prev, ...updates }),
    });
  };

  // Convert type filter
  const typeValue = search.type === "all" ? undefined : search.type;

  // Query
  const { data, isLoading } = useQuery(
    orpc.panel.tag.list.queryOptions({
      input: {
        search: search.search || undefined,
        type: typeValue,
        sortBy: search.sortBy,
        sortOrder: search.sortOrder,
        page: search.page,
        limit: PAGE_SIZE,
      },
    })
  );

  // Handlers
  const handleSearchChange = (value: string) => {
    updateSearch({ search: value, page: 1 });
  };

  const handleTypeChange = (
    value: "all" | "platform" | "model" | "style" | null
  ) => {
    updateSearch({ type: value ?? "all", page: 1 });
  };

  const handleSortChange = (
    sortBy: "createdAt" | "name",
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
            <h2 className="font-semibold">Tags</h2>
            <DataTableToolbar
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search by name or value..."
              searchValue={search.search}
            >
              <StatusFilterSelect
                items={[...TAG_TYPE_OPTIONS]}
                onChange={handleTypeChange}
                value={search.type}
              />
            </DataTableToolbar>
          </div>
        }
        right={
          <Button onClick={() => setCreateOpen(true)}>
            <span className="i-hugeicons-plus-sign size-3.5" />
            Create Tag
          </Button>
        }
      />

      {/* Data Table */}
      <div className="p-4">
        <TagDataTable
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

      {/* Create Dialog */}
      <TagFormDialog onOpenChange={setCreateOpen} open={createOpen} />
    </div>
  );
}
