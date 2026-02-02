import { useCallback, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import type { SortDirection } from "./sortable-column-header";

interface UseDataTableFiltersOptions<TData> {
  data: TData[];
  searchFields?: (keyof TData)[];
  dateField?: keyof TData;
}

interface UseDataTableFiltersReturn<TData> {
  search: string;
  setSearch: (value: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (value: DateRange | undefined) => void;
  sortDirection: SortDirection;
  setSortDirection: (value: SortDirection) => void;
  filteredData: TData[];
  toggleSort: () => void;
}

export function filterByDateRange<TData extends Record<string, unknown>>(
  data: TData[],
  range: DateRange | undefined,
  dateField: keyof TData = "createdAt" as keyof TData
): TData[] {
  if (!range?.from) {
    return data;
  }

  const fromDate = new Date(range.from);
  fromDate.setHours(0, 0, 0, 0);

  const toDate = range.to ? new Date(range.to) : new Date(range.from);
  toDate.setHours(23, 59, 59, 999);

  return data.filter((item) => {
    const dateValue = item[dateField];
    if (!dateValue) {
      return false;
    }

    const itemDate = new Date(String(dateValue));
    return itemDate >= fromDate && itemDate <= toDate;
  });
}

export function useDataTableFilters<TData extends Record<string, unknown>>({
  data,
  searchFields = [],
  dateField,
}: UseDataTableFiltersOptions<TData>): UseDataTableFiltersReturn<TData> {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const filteredData = useMemo(() => {
    let result = data;

    if (search && searchFields.length > 0) {
      const searchLower = search.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          return (
            typeof value === "string" &&
            value.toLowerCase().includes(searchLower)
          );
        })
      );
    }

    if (dateField && dateRange) {
      result = filterByDateRange(result, dateRange, dateField);
    }

    if (sortDirection && dateField) {
      result = [...result].sort((a, b) => {
        const aDate = String(a[dateField] ?? "");
        const bDate = String(b[dateField] ?? "");
        return sortDirection === "asc"
          ? aDate.localeCompare(bDate)
          : bDate.localeCompare(aDate);
      });
    }

    return result;
  }, [data, search, searchFields, dateRange, dateField, sortDirection]);

  const toggleSort = useCallback(() => {
    setSortDirection((prev) => {
      if (prev === null) {
        return "desc";
      }
      if (prev === "desc") {
        return "asc";
      }
      return null;
    });
  }, []);

  return {
    search,
    setSearch,
    dateRange,
    setDateRange,
    sortDirection,
    setSortDirection,
    filteredData,
    toggleSort,
  };
}
