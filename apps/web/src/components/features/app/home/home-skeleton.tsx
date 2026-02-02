import { Skeleton } from "@/components/ui/skeleton";

export function HomeSkeleton() {
  return (
    <div className="flex flex-col">
      <section className="w-full">
        <div className="container mx-auto px-4 pt-20 pb-10">
          <div className="flex items-end justify-between gap-32">
            <div className="w-1/2 space-y-4">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-16 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-36" />
                <Skeleton className="h-10 w-48" />
              </div>
            </div>
            <div className="grid w-1/2 grid-cols-2 gap-8">
              <div className="flex flex-col justify-end">
                <Skeleton className="aspect-video w-full rounded-xl" />
              </div>
              <div className="flex flex-col justify-end gap-8">
                {[0, 1].map((i) => (
                  <Skeleton
                    className="aspect-video w-full rounded-xl"
                    key={i}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div className="space-y-3 rounded-2xl bg-muted p-3" key={idx}>
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
