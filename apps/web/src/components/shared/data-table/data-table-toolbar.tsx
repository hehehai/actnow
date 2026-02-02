import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  children,
}: DataTableToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <InputGroup className="w-xs">
        <InputGroupInput
          autoComplete="false"
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          value={searchValue}
        />
        {!!searchValue.length && (
          <InputGroupAddon align="inline-end">
            <Button
              onClick={() => onSearchChange("")}
              size="icon-xs"
              variant="ghost"
            >
              <span className="i-hugeicons-cancel-01" />
            </Button>
          </InputGroupAddon>
        )}
      </InputGroup>
      {children}
    </div>
  );
}
