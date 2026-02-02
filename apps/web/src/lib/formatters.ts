interface InitialsOptions {
  maxLength?: number;
  fallback?: string;
}

const initialsSplitRegex = /\s+/;

export function getInitials(
  name?: string | null,
  { maxLength = 2, fallback = "?" }: InitialsOptions = {}
): string {
  const trimmed = name?.trim();
  if (!trimmed) return fallback;

  const initials = trimmed
    .split(initialsSplitRegex)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, maxLength)
    .toUpperCase();

  return initials || fallback;
}

export function formatDateTime(
  value?: string | number | Date | null,
  fallback = ""
): string {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString();
}
