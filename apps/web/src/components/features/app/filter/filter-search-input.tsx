import { useCallback, useEffect, useRef } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

interface FilterSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function FilterSearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Users, Posts, Platforms, Models or Styles...",
  className,
  autoFocus = true,
}: FilterSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSubmit) {
        onSubmit();
      }
    },
    [onSubmit]
  );

  return (
    <InputGroup className={cn("h-10", className)}>
      <InputGroupAddon align="inline-start">
        <InputGroupText>
          <span className="i-hugeicons-search-01 size-4" />
        </InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        ref={inputRef}
        value={value}
      />
      <InputGroupAddon align="inline-end">
        {value ? (
          <InputGroupButton
            onClick={() => onChange("")}
            size="icon-xs"
            variant="ghost"
          >
            <span className="i-hugeicons-cancel-01 size-4" />
          </InputGroupButton>
        ) : (
          <Kbd>ESC</Kbd>
        )}
      </InputGroupAddon>
    </InputGroup>
  );
}
