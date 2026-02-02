import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { FeedbackDataTable } from "@/components/features/panel/feedback";
import { NavMainHeader } from "@/components/features/panel/layout/nav-main-header";
import { UserFilterSelect } from "@/components/features/panel/users/user-filter-select";
import {
  DataTableToolbar,
  StatusFilterSelect,
} from "@/components/shared/data-table";
import { orpc } from "@/lib/orpc";
import { createPageMeta } from "@/lib/seo";

const STATUS_OPTIONS = [
  { value: "ALL" as const, label: "All" },
  { value: "PENDING" as const, label: "Pending" },
  { value: "REPLIED" as const, label: "Replied" },
];

const PAGE_SIZE = 10;

const searchSchema = z.object({
  search: z.string().catch(""),
  status: z.enum(["ALL", "PENDING", "REPLIED"]).catch("PENDING"),
  userId: z.string().optional().catch(undefined),
  sortBy: z.enum(["createdAt", "updatedAt"]).catch("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).catch("desc"),
  page: z.number().int().positive().catch(1),
});

type SearchParams = z.infer<typeof searchSchema>;

const feedbackMeta = createPageMeta({
  title: "Manage Feedback",
  description: "Review and reply to user feedback",
  url: "/panel/feedback",
  noIndex: true,
});

export const Route = createFileRoute("/(admin)/panel/feedback")({
  component: RouteComponent,
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: feedbackMeta.meta,
    links: feedbackMeta.links,
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
    orpc.panel.feedback.list.queryOptions({
      input: {
        search: search.search || undefined,
        status: search.status,
        userId: search.userId,
        sortBy: search.sortBy,
        sortOrder: search.sortOrder,
        page: search.page,
        pageSize: PAGE_SIZE,
      },
    })
  );

  const handleSearchChange = (value: string) => {
    updateSearch({ search: value, page: 1 });
  };

  const handleStatusChange = (value: SearchParams["status"] | null) => {
    updateSearch({ status: value ?? "ALL", page: 1 });
  };

  const handleUserChange = (value: string | null) => {
    updateSearch({ userId: value ?? undefined, page: 1 });
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
            <h2 className="font-semibold">Feedback</h2>
            <DataTableToolbar
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search by title or content..."
              searchValue={search.search}
            >
              <StatusFilterSelect
                items={STATUS_OPTIONS}
                onChange={handleStatusChange}
                value={search.status}
              />
              <UserFilterSelect
                onChange={handleUserChange}
                value={search.userId ?? null}
              />
            </DataTableToolbar>
          </div>
        }
        right={null}
      />

      <div className="p-4">
        <FeedbackDataTable
          data={data?.items ?? []}
          isLoading={isLoading}
          onPageChange={handlePageChange}
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
        />
      </div>
    </div>
  );
}
