import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeOverflow } from "@/components/shared/badge-overflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";

type TagType = "platform" | "model" | "style";
type FilterType = "all" | TagType;

interface TagSelectProps {
  value: string[];
  onChange: (values: string[]) => void;
  type?: TagType;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  /**
   * Match tags by "id" or "value" field.
   * - Use "value" for URL params (e.g., ?tag=hero,footer) - DEFAULT
   * - Use "id" for database operations (e.g., panel forms)
   */
  matchBy?: "id" | "value";
}

const TAG_TYPE_LABELS: Record<TagType, string> = {
  platform: "Platform",
  model: "Model",
  style: "Style",
};

const TAG_TYPE_VARIANTS: Record<TagType, "default" | "secondary" | "outline"> =
  {
    platform: "default",
    model: "secondary",
    style: "outline",
  };

const FILTER_TABS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "platform", label: "Platform" },
  { value: "model", label: "Model" },
  { value: "style", label: "Style" },
];

export function TagSelect({
  value,
  onChange,
  type,
  disabled = false,
  placeholder = "Select tags...",
  className,
  matchBy = "value",
}: TagSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  // Use prop type if provided, otherwise use filterType state
  const queryType = type ?? (filterType === "all" ? undefined : filterType);

  const { data: tags, isLoading } = useQuery(
    orpc.panel.tag.listForSelect.queryOptions({
      input: { search: search || undefined, type: queryType, limit: 100 },
    })
  );

  // Helper to get the match key from a tag
  const getMatchKey = (tag: { id: string; value: string }) =>
    matchBy === "value" ? tag.value : tag.id;

  // Get selected tags info
  const selectedTags = useMemo(() => {
    if (!tags) return [];
    return tags.filter((tag) => value.includes(getMatchKey(tag)));
  }, [tags, value, matchBy]);

  // Group tags by type (only used when filterType is "all" and no type prop)
  const groupedTags = useMemo(() => {
    if (!tags) return { platform: [], model: [], style: [] };
    const groups: Record<TagType, typeof tags> = {
      platform: [],
      model: [],
      style: [],
    };
    for (const tag of tags) {
      groups[tag.type].push(tag);
    }
    return groups;
  }, [tags]);

  // Focus input when popover opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleToggle = (tag: { id: string; value: string }) => {
    const key = getMatchKey(tag);
    if (value.includes(key)) {
      onChange(value.filter((v) => v !== key));
    } else {
      onChange([...value, key]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const handleRemoveTag = (
    e: React.MouseEvent,
    tag: { id: string; value: string }
  ) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== getMatchKey(tag)));
  };

  // Show tabs only when type prop is not provided
  const showTabs = !type;

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            aria-expanded={open}
            className={cn(
              "relative h-auto min-h-9 w-full justify-between px-2 py-1.5",
              className
            )}
            disabled={disabled}
            role="combobox"
            variant="outline"
          >
            <div className="relative flex w-48 flex-1 items-center">
              {selectedTags.length > 0 ? (
                <BadgeOverflow
                  className="min-w-0 flex-1 gap-1"
                  getBadgeLabel={(tag) => tag.name}
                  items={selectedTags}
                  lineCount={1}
                  renderBadge={(tag) => (
                    <Badge
                      className="gap-1 pr-1"
                      key={tag.id}
                      variant={TAG_TYPE_VARIANTS[tag.type]}
                    >
                      {tag.name}
                      <span
                        className="i-hugeicons-cancel-01 size-3 cursor-pointer opacity-50 hover:opacity-100"
                        onClick={(e) => handleRemoveTag(e, tag)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleRemoveTag(
                              e as unknown as React.MouseEvent,
                              tag
                            );
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      />
                    </Badge>
                  )}
                  renderOverflow={(count) => (
                    <Badge className="gap-1 pr-1" variant="outline">
                      +{count}
                    </Badge>
                  )}
                />
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            {value.length > 0 && (
              <span
                className="i-hugeicons-cancel-01 absolute top-1/2 right-2 size-4 shrink-0 -translate-y-1/2 opacity-50 hover:opacity-100"
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleClear(e as unknown as React.MouseEvent);
                  }
                }}
                role="button"
                tabIndex={0}
              />
            )}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-72 gap-0 p-0">
        {/* Search Input */}
        <InputGroup className="rounded-none border-x-0 border-t-0 has-[[data-slot=input-group-control]:focus-visible]:border-border has-[[data-slot=input-group-control]:focus-visible]:ring-0">
          <InputGroupAddon align="inline-start">
            <InputGroupText>
              <span className="i-hugeicons-search-01 size-4" />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags..."
            ref={inputRef}
            value={search}
          />
        </InputGroup>

        {/* Filter Tabs */}
        {showTabs && (
          <div className="flex gap-1 border-b p-1">
            {FILTER_TABS.map((tab) => (
              <button
                className={cn(
                  "flex-1 rounded-md px-2 py-1 font-medium text-xs transition-colors",
                  filterType === tab.value
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                )}
                key={tab.value}
                onClick={() => setFilterType(tab.value)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* List */}
        <ScrollArea className="h-72 overflow-hidden">
          <div className="p-1">
            {/* Loading state */}
            {isLoading && (
              <div className="py-6 text-center text-muted-foreground text-sm">
                Loading...
              </div>
            )}

            {/* Empty state */}
            {!isLoading && (!tags || tags.length === 0) && (
              <div className="py-6 text-center text-muted-foreground text-sm">
                No tags found.
              </div>
            )}

            {/* Tag list */}
            {!isLoading &&
              tags &&
              tags.length > 0 &&
              (queryType
                ? // If type is specified (via prop or filter), show flat list
                  tags.map((tag) => (
                    <TagItem
                      isSelected={value.includes(getMatchKey(tag))}
                      key={tag.id}
                      onToggle={() => handleToggle(tag)}
                      tag={tag}
                    />
                  ))
                : // Otherwise show grouped list (only when filterType is "all")
                  (["platform", "model", "style"] as TagType[]).map(
                    (tagType) =>
                      groupedTags[tagType]?.length > 0 && (
                        <div key={tagType}>
                          <div className="px-2 py-1.5 font-medium text-muted-foreground text-xs">
                            {TAG_TYPE_LABELS[tagType]}
                          </div>
                          {groupedTags[tagType].map((tag) => (
                            <TagItem
                              isSelected={value.includes(getMatchKey(tag))}
                              key={tag.id}
                              onToggle={() => handleToggle(tag)}
                              tag={tag}
                            />
                          ))}
                        </div>
                      )
                  ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

interface TagItemProps {
  tag: {
    id: string;
    name: string;
    value: string;
    type: TagType;
    description: string | null;
    tipMedia: string | null;
  };
  isSelected: boolean;
  onToggle: () => void;
}

function TagItem({ tag, isSelected, onToggle }: TagItemProps) {
  return (
    <button
      className={cn(
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent/50"
      )}
      onClick={onToggle}
      type="button"
    >
      <Checkbox checked={isSelected} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-1">
          <span className="truncate text-sm">{tag.name}</span>
          {tag.tipMedia && (
            <Tooltip>
              <TooltipTrigger className="flex items-center">
                <span className="i-hugeicons-image-02 size-4 shrink-0 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="right">
                {tag.tipMedia.includes("video") ? (
                  <video
                    className="max-h-32 max-w-48 rounded"
                    controls
                    src={tag.tipMedia}
                  />
                ) : (
                  <img
                    alt="Tip"
                    className="max-h-32 max-w-48 rounded"
                    src={tag.tipMedia}
                  />
                )}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        {tag.description && (
          <span className="line-clamp-1 text-muted-foreground text-xs">
            {tag.description}
          </span>
        )}
      </div>
    </button>
  );
}
