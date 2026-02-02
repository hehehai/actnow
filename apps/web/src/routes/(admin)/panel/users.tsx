import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { z } from "zod";
import { NavMainHeader } from "@/components/features/panel/layout/nav-main-header";
import { UserDataTable } from "@/components/features/panel/users/data-table";
import { useUserActions } from "@/components/features/panel/users/use-user-actions";
import { UserFormDialog } from "@/components/features/panel/users/user-form-dialog";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { DateRangeFilter } from "@/components/shared/data-table/date-range-filter";
import { StatusFilterSelect } from "@/components/shared/data-table/status-filter";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc";
import { createPageMeta } from "@/lib/seo";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "normal", label: "Normal" },
  { value: "ban", label: "Banned" },
] as const;

const PAGE_SIZE = 10;

const searchSchema = z.object({
  search: z.string().catch(""),
  role: z.enum(["ALL", "ADMIN", "USER"]).catch("ALL"),
  status: z.enum(["all", "normal", "ban"]).catch("all"),
  dateFrom: z.coerce.date().optional().catch(undefined),
  dateTo: z.coerce.date().optional().catch(undefined),
  sortOrder: z.enum(["asc", "desc"]).catch("desc"),
  page: z.number().int().positive().catch(1),
});

type SearchParams = z.infer<typeof searchSchema>;

const usersMeta = createPageMeta({
  title: "Manage Users",
  description: "Manage users on Refto.",
  url: "/panel/users",
  noIndex: true,
});

export const Route = createFileRoute("/(admin)/panel/users")({
  component: RouteComponent,
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: usersMeta.meta,
    links: usersMeta.links,
  }),
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const actions = useUserActions();

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);

  // Update search params
  const updateSearch = (updates: Partial<SearchParams>) => {
    navigate({
      search: (prev: SearchParams) => ({ ...prev, ...updates }),
    });
  };

  // Query
  const { data, isLoading } = useQuery(
    orpc.panel.user.list.queryOptions({
      input: {
        search: search.search || undefined,
        role: search.role === "ALL" ? undefined : search.role,
        status: search.status === "all" ? undefined : search.status,
        dateFrom: search.dateFrom,
        dateTo: search.dateTo,
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

  const handleRoleChange = (value: string) => {
    updateSearch({ role: value as "ALL" | "ADMIN" | "USER", page: 1 });
  };

  const handleStatusChange = (value: "all" | "normal" | "ban" | null) => {
    updateSearch({ status: value ?? "all", page: 1 });
  };

  const handleDateRangeChange = (value: DateRange | undefined) => {
    updateSearch({ dateFrom: value?.from, dateTo: value?.to, page: 1 });
  };

  const handleSortChange = (order: "asc" | "desc") => {
    updateSearch({ sortOrder: order, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateSearch({ page });
  };

  const handleCreate = async (formData: {
    name: string;
    email: string;
    password?: string;
    role: "ADMIN" | "USER";
    image?: string | null;
  }) => {
    await actions.create.mutateAsync({
      name: formData.name,
      email: formData.email,
      password: formData.password!,
      role: formData.role,
      image: formData.image ?? undefined,
    });
  };

  // Convert search params to DateRange for the filter
  const dateRange: DateRange | undefined =
    search.dateFrom || search.dateTo
      ? { from: search.dateFrom, to: search.dateTo }
      : undefined;

  return (
    <div className="w-full">
      <NavMainHeader
        activeTab={search.role}
        className="justify-between"
        left={
          <div className="flex flex-1 items-center gap-3">
            <h2 className="font-semibold">Users</h2>
            <DataTableToolbar
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search by email or name..."
              searchValue={search.search}
            >
              <StatusFilterSelect
                items={[...STATUS_OPTIONS]}
                onChange={handleStatusChange}
                value={search.status}
              />
              <DateRangeFilter
                onChange={handleDateRangeChange}
                value={dateRange}
              />
            </DataTableToolbar>
          </div>
        }
        onTabChange={handleRoleChange}
        right={
          <Button onClick={() => setCreateOpen(true)}>
            <span className="i-hugeicons-plus-sign size-3.5" />
            Create User
          </Button>
        }
        tabItems={["All", "User", "Admin"]}
      />

      {/* Data Table */}
      <div className="p-4">
        <UserDataTable
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
          sortOrder={search.sortOrder}
        />
      </div>

      {/* Create Dialog */}
      <UserFormDialog
        mode="create"
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        open={createOpen}
      />
    </div>
  );
}
