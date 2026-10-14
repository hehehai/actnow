import FilterIcon from "@/components/shared/icons/filter";
import { Button } from "@/components/ui/button";
import { filterDialog } from "@/stores/handlers";

export function SiteFilterButton() {
  const handleFilterClick = () => {
    filterDialog.openWithPayload(undefined);
  };

  return (
    <Button
      className="min-w-24 justify-between rounded-full pr-1.5! hover:border-primary max-sm:size-9 max-sm:min-w-9 max-sm:justify-center max-sm:p-0!"
      onClick={handleFilterClick}
      variant="outline"
    >
      <span className="max-sm:hidden">Filter</span>
      <span className="flex items-center justify-center rounded-full bg-primary p-1 max-sm:bg-transparent max-sm:p-0">
        <FilterIcon className="text-background" />
      </span>
    </Button>
  );
}
