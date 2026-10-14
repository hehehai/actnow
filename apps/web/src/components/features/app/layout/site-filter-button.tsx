import { Button } from "@/components/ui/button";

export function SiteFilterButton({
  onOpen,
  onFocus,
  onPointerEnter,
}: {
  onOpen: () => void;
  onFocus: () => void;
  onPointerEnter: () => void;
}) {
  return (
    <Button
      aria-keyshortcuts="Meta+K Control+K"
      className="h-9 w-35 flex-none justify-start rounded-full bg-muted/60 px-3 text-muted-foreground shadow-none hover:bg-muted hover:text-foreground max-sm:size-9 max-sm:justify-center max-sm:px-0"
      onClick={onOpen}
      onFocus={onFocus}
      onPointerEnter={onPointerEnter}
      variant="ghost"
    >
      <span aria-hidden="true" className="i-hugeicons-search-01 size-4" />
      <span className="hidden truncate sm:inline lg:max-xl:hidden">Search</span>
      <kbd className="ml-auto hidden shrink-0 rounded-full border border-border/70 bg-background/70 px-2 py-0.5 font-sans text-[10px] text-muted-foreground sm:inline-flex lg:max-xl:hidden">
        ⌘ K
      </kbd>
    </Button>
  );
}
