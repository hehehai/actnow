import { PostFeedSort, type PostFeedSortType, site } from "@actnow/common";
import { useNavigate } from "@tanstack/react-router";
import { TagSelect } from "@/components/features/common/tag/tag-select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HeroSectionProps {
  sort: PostFeedSortType;
  currentTagSlugs?: string[];
}

export function HeroSection({ sort, currentTagSlugs }: HeroSectionProps) {
  const navigate = useNavigate();
  const [primaryTagline, secondaryTagline] = site.tagline;

  const handleSortChange = (value: string) => {
    navigate({
      to: "/",
      search: (prev) => ({ ...prev, sort: value as PostFeedSortType }),
    });
  };

  const handleTagChange = (tagSlugs: string[]) => {
    navigate({
      to: "/",
      search: (prev) => ({
        ...prev,
        tag: tagSlugs.length > 0 ? tagSlugs.join(",") : undefined,
      }),
    });
  };

  return (
    <section
      aria-labelledby="home-title"
      className="container mx-auto max-w-7xl px-4 pt-8 pb-6 sm:pt-10"
    >
      <div className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div className="max-w-2xl">
          <p className="font-medium text-[11px] text-brand uppercase tracking-[0.16em]">
            A community for creative work
          </p>
          <h1
            className="mt-2 text-balance font-medium text-3xl leading-tight tracking-tight md:text-4xl"
            id="home-title"
          >
            {primaryTagline}
            <br className="hidden sm:block" /> {secondaryTagline}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground text-sm leading-relaxed sm:text-base">
            Discover the ideas people are saving, making, and sharing right now.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Tabs onValueChange={handleSortChange} value={sort}>
            <TabsList
              aria-label="Sort posts"
              className="h-11 gap-1 rounded-full bg-muted/70 p-1"
            >
              <TabsTrigger
                className="rounded-full px-4"
                value={PostFeedSort.LATEST}
              >
                Latest
              </TabsTrigger>
              <TabsTrigger
                className="rounded-full px-4"
                value={PostFeedSort.POPULAR}
              >
                Popular
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {currentTagSlugs?.length ? (
            <TagSelect
              className="w-56"
              onChange={handleTagChange}
              placeholder="Filter by topics…"
              value={currentTagSlugs}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
