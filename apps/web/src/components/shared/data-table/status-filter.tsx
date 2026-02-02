import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface StatusFilterItem<T extends string = string> {
  value: T;
  label: string;
}

interface StatusFilterProps<T extends string = string> {
  value: T | null;
  onChange: (value: T | null) => void;
  items: StatusFilterItem<T>[];
  className?: string;
}

export function StatusFilterSelect<T extends string = string>({
  value,
  onChange,
  items,
  className = "w-32.5",
}: StatusFilterProps<T>) {
  return (
    <Select items={items} onValueChange={onChange} value={value}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
