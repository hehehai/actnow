import { Skeleton } from "@/components/ui/skeleton";

export function UserDetailSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between border-b p-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="size-8 rounded" />
      </div>

      <div className="flex flex-col gap-6 p-4">
        {/* Actions bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-20 rounded" />
          <Skeleton className="h-8 w-24 rounded" />
          <Skeleton className="mx-1 h-5 w-px" />
          <Skeleton className="h-8 w-16 rounded" />
          <Skeleton className="h-8 w-14 rounded" />
          <Skeleton className="h-8 w-18 rounded" />
        </div>

        {/* Statistics */}
        <section>
          <Skeleton className="mb-3 h-4 w-16" />
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="mt-1 h-3 w-24" />
            </div>
            <div className="rounded-lg border p-3">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="mt-1 h-3 w-16" />
            </div>
          </div>
        </section>

        {/* User Info */}
        <section>
          <Skeleton className="mb-3 h-4 w-16" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="flex items-center justify-between" key={i}>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </section>

        {/* Accounts */}
        <section>
          <Skeleton className="mb-3 h-4 w-24" />
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </section>

        {/* Sessions */}
        <section>
          <Skeleton className="mb-3 h-4 w-24" />
          <div className="space-y-2">
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="mt-2 h-3 w-32" />
              <Skeleton className="mt-1 h-3 w-full" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
