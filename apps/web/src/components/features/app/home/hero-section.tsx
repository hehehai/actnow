import { PostFeedSort, type PostFeedSortType, site } from "@actnow/common";
import { Link, useNavigate } from "@tanstack/react-router";
import { TagSelect } from "@/components/features/common/tag/tag-select";
import { BadgeLinearGradient } from "@/components/shared/badge-linear-gradient";
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
    <section className="w-full">
      <div className="container mx-auto flex flex-col gap-8 px-4 pt-12 pb-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-6">
          <Link to="/weekly">
            <BadgeLinearGradient>
              <span className="text-balance">Weekly Highlights</span>
              <span className="i-hugeicons-arrow-right-01" />
            </BadgeLinearGradient>
          </Link>
          <div className="mt-8">
            <h2 className="text-balance font-semibold text-3xl leading-tight md:text-3xl lg:text-4xl">
              {primaryTagline}
            </h2>
            {secondaryTagline && (
              <h2 className="mt-4 text-balance font-semibold text-3xl leading-tight md:text-3xl lg:text-4xl">
                {secondaryTagline}
              </h2>
            )}
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Tabs onValueChange={handleSortChange} value={sort}>
              <TabsList>
                <TabsTrigger className="px-4" value={PostFeedSort.LATEST}>
                  Latest
                </TabsTrigger>
                <TabsTrigger className="px-4" value={PostFeedSort.POPULAR}>
                  Popular
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {!!currentTagSlugs?.length && (
              <TagSelect
                className="w-60"
                onChange={handleTagChange}
                placeholder="Filter by tags..."
                value={currentTagSlugs ?? []}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
