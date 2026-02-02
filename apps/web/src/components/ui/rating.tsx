import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  createContext,
  type KeyboardEvent,
  useCallback,
  useContext,
  useState,
} from "react";

import { cn } from "@/lib/utils";

interface RatingContextValue {
  value: number;
  hoverValue: number | null;
  max: number;
  disabled: boolean;
  readOnly: boolean;
  allowClear: boolean;
  onValueChange: (value: number) => void;
  onHover: (value: number | null) => void;
}

const RatingContext = createContext<RatingContextValue | null>(null);

function useRatingContext() {
  const context = useContext(RatingContext);
  if (!context) {
    throw new Error("RatingItem must be used within a Rating component");
  }
  return context;
}

interface RatingProps {
  value?: number;
  defaultValue?: number;
  max?: number;
  disabled?: boolean;
  readOnly?: boolean;
  onValueChange?: (value: number) => void;
  orientation?: "horizontal" | "vertical";
  allowClear?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function Rating({
  value: controlledValue,
  defaultValue = 0,
  max = 5,
  disabled = false,
  readOnly = false,
  onValueChange,
  orientation = "horizontal",
  allowClear = false,
  className,
  children,
}: RatingProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = useCallback(
    (newValue: number) => {
      if (disabled || readOnly) return;

      const finalValue = allowClear && newValue === value ? 0 : newValue;

      if (!isControlled) {
        setUncontrolledValue(finalValue);
      }
      onValueChange?.(finalValue);
    },
    [disabled, readOnly, allowClear, value, isControlled, onValueChange]
  );

  const handleHover = useCallback(
    (newHoverValue: number | null) => {
      if (disabled || readOnly) return;
      setHoverValue(newHoverValue);
    },
    [disabled, readOnly]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled || readOnly) return;

      const isHorizontal = orientation === "horizontal";
      const increment = isHorizontal ? "ArrowRight" : "ArrowDown";
      const decrement = isHorizontal ? "ArrowLeft" : "ArrowUp";

      switch (e.key) {
        case increment:
          e.preventDefault();
          handleValueChange(Math.min(value + 1, max));
          break;
        case decrement:
          e.preventDefault();
          handleValueChange(Math.max(value - 1, allowClear ? 0 : 1));
          break;
        case "Home":
          e.preventDefault();
          handleValueChange(allowClear ? 0 : 1);
          break;
        case "End":
          e.preventDefault();
          handleValueChange(max);
          break;
        case "Escape":
          if (allowClear) {
            e.preventDefault();
            handleValueChange(0);
          }
          break;
        default:
          break;
      }
    },
    [disabled, readOnly, orientation, value, max, allowClear, handleValueChange]
  );

  const contextValue: RatingContextValue = {
    value,
    hoverValue,
    max,
    disabled,
    readOnly,
    allowClear,
    onValueChange: handleValueChange,
    onHover: handleHover,
  };

  // Generate default items if no children provided
  const items =
    children ??
    Array.from({ length: max }, (_, i) => <RatingItem index={i + 1} key={i} />);

  return (
    <RatingContext.Provider value={contextValue}>
      <div
        aria-disabled={disabled}
        aria-label="Rating"
        className={cn(
          "inline-flex items-center gap-0.5 rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          orientation === "vertical" && "flex-col",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        data-disabled={disabled ? "" : undefined}
        data-orientation={orientation}
        data-readonly={readOnly ? "" : undefined}
        data-slot="rating"
        onKeyDown={handleKeyDown}
        onMouseLeave={() => handleHover(null)}
        role="radiogroup"
        tabIndex={disabled ? -1 : 0}
      >
        {items}
      </div>
    </RatingContext.Provider>
  );
}

interface RatingItemProps {
  index: number;
  className?: string;
}

function RatingItem({ index, className }: RatingItemProps) {
  const { value, hoverValue, disabled, readOnly, onValueChange, onHover } =
    useRatingContext();

  const displayValue = hoverValue ?? value;
  const isFilled = index <= displayValue;
  const isHovered = hoverValue !== null && index <= hoverValue;

  const handleClick = () => {
    if (disabled || readOnly) return;
    onValueChange(index);
  };

  const handleMouseEnter = () => {
    onHover(index);
  };

  return (
    <button
      aria-checked={index <= value}
      aria-disabled={disabled}
      aria-label={`${index} star`}
      className={cn(
        "inline-flex items-center justify-center outline-none transition-colors",
        "text-muted-foreground/40",
        "data-[state=full]:text-primary",
        !(disabled || readOnly) &&
          "cursor-pointer hover:scale-110 active:scale-95",
        disabled && "cursor-not-allowed",
        readOnly && "cursor-default",
        "[&_svg]:size-5 [&_svg]:shrink-0",
        className
      )}
      data-disabled={disabled ? "" : undefined}
      data-hovered={isHovered ? "" : undefined}
      data-slot="rating-item"
      data-state={isFilled ? "full" : "empty"}
      disabled={disabled}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      role="radio"
      tabIndex={-1}
      type="button"
    >
      <HugeiconsIcon
        fill={isFilled ? "currentColor" : "none"}
        icon={StarIcon}
        strokeWidth={1.5}
      />
    </button>
  );
}

export { Rating, RatingItem, type RatingProps, type RatingItemProps };
