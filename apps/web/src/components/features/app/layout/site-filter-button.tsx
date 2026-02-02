import FilterIcon from "@/components/shared/icons/filter";
import { Button } from "@/components/ui/button";
import { filterDialog } from "@/stores/handlers";

export function SiteFilterButton() {
  const handleFilterClick = () => {
    filterDialog.openWithPayload(undefined);
  };

  return (
    <Button
      className="min-w-24 justify-between rounded-full pr-1.5! hover:border-primary"
      onClick={handleFilterClick}
      variant="outline"
    >
      <span>Filter</span>
      <span className="flex items-center justify-center rounded-full bg-primary p-1">
        <FilterIcon className="text-background" />
      </span>
    </Button>
  );
}
