import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orpc } from "@/lib/orpc";
import type { ClientOutputs, TrendingOutput } from "@/lib/orpc-types";
import { cn } from "@/lib/utils";
import type { FilterTag } from "./filter-tags-tab";
import { FilterTagsTab } from "./filter-tags-tab";
import { FilterTrendingTab } from "./filter-trending-tab";

type TabValue = "trending" | "platform" | "model" | "style";

const TABS: { value: TabValue; label: string; icon: string }[] = [
  {
    value: "trending",
    label: "Trending",
    icon: "i-hugeicons-chart-breakout-square",
  },
  { value: "platform", label: "Platforms", icon: "i-hugeicons-folder-01" },
  { value: "model", label: "Models", icon: "i-hugeicons-ai-book" },
  { value: "style", label: "Styles", icon: "i-hugeicons-ai-idea" },
];

interface FilterBrowseTabsProps {
  onTagClick: (tagSlug: string) => void;
  onUserClick: (userId: string) => void;
  className?: string;
}

export function FilterBrowseTabs({
  onTagClick,
  onUserClick,
  className,
}: FilterBrowseTabsProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("trending");
  const [hoveredTag, setHoveredTag] = useState<Pick<
    FilterTag,
    "id" | "name" | "tipMedia"
  > | null>(null);

  const { data: trendingData } = useQuery<TrendingOutput>(
    orpc.app.post.trending.queryOptions({
      input: { postsLimit: 6, tagsLimit: 18 },
    })
  );

  const { data: popularUsers } = useQuery<
    ClientOutputs["app"]["user"]["popular"]
  >(orpc.app.user.popular.queryOptions({ input: { limit: 3 } }));

  const { data: tagsByType, isLoading } = useQuery<
    ClientOutputs["app"]["post"]["tagsByType"]
  >({
    ...orpc.app.post.tagsByType.queryOptions({
      input: { type: activeTab as "platform" | "model" | "style" },
    }),
    enabled: activeTab !== "trending",
  });

  const tagsList = (tagsByType ?? []) as FilterTag[];

  const previewMedia = hoveredTag?.tipMedia ?? null;

  return (
    <Tabs
      className={cn("flex gap-6", className)}
      onValueChange={(value) => {
        setActiveTab(value as TabValue);
        setHoveredTag(null);
      }}
      orientation="vertical"
      value={activeTab}
    >
      <div className="flex w-36 shrink-0 flex-col">
        <TabsList className="flex h-auto w-full shrink-0 flex-col items-stretch gap-1 bg-transparent p-0">
          {TABS.map((tab) => (
            <TabsTrigger
              className="justify-start gap-2 px-3 py-2 text-foreground hover:bg-muted data-active:bg-muted group-data-[variant=default]/tabs-list:data-active:shadow-none"
              key={tab.value}
              value={tab.value}
            >
              <span className={cn(tab.icon, "size-4")} />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-auto space-y-3">
          {previewMedia && (
            <div className="rounded-2xl border">
              <img
                alt={hoveredTag?.name ?? "Tag preview"}
                className="h-28 w-full rounded-2xl object-cover"
                src={previewMedia}
              />
            </div>
          )}
          <KbdGroup>
            <Kbd>
              <span className="i-hugeicons-keyboard size-4" />
            </Kbd>
            <Kbd>⌘ + K</Kbd>
          </KbdGroup>
        </div>
      </div>

      <ScrollArea className="h-80 min-h-0 flex-1">
        <TabsContent className="mt-0" value="trending">
          <FilterTrendingTab
            onTagClick={onTagClick}
            onUserClick={onUserClick}
            tags={trendingData?.tags}
            users={popularUsers}
          />
        </TabsContent>

        {TABS.filter((tab) => tab.value !== "trending").map((tab) => (
          <TabsContent className="mt-0" key={tab.value} value={tab.value}>
            <FilterTagsTab
              isLoading={isLoading}
              onTagClick={onTagClick}
              onTagHover={(tag) => setHoveredTag(tag)}
              tags={tagsList}
              type={tab.value as "platform" | "model" | "style"}
            />
          </TabsContent>
        ))}
      </ScrollArea>
    </Tabs>
  );
}
