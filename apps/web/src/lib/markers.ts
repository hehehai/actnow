import slug from "slug";
import { formatTimeShortWithMs } from "@/lib/time";

const slugify = (value?: string | null) =>
  value ? slug(value, { lower: true }) : "";

export interface MarkerSummary {
  id: string;
  time: number;
  text: string | null;
}

export interface MarkerSlugEntry extends MarkerSummary {
  slug: string;
  position: number;
  title: string;
}

export function sortMarkers(markers: MarkerSummary[]): MarkerSummary[] {
  return [...markers].sort((a, b) => {
    if (a.time !== b.time) return a.time - b.time;
    return a.id.localeCompare(b.id);
  });
}

export function createMarkerSlugEntries(
  markers: MarkerSummary[],
  options?: { preSorted?: boolean }
): MarkerSlugEntry[] {
  const ordered = options?.preSorted ? markers : sortMarkers(markers);
  const seen = new Map<string, number>();

  return ordered.map((marker, index) => {
    const markerNumber = index + 1;
    const normalizedBase =
      slugify(marker.text?.trim()) || `marker-${markerNumber}`;
    const duplicateCount = (seen.get(normalizedBase) ?? 0) + 1;
    seen.set(normalizedBase, duplicateCount);
    const slugValue =
      duplicateCount > 1
        ? `${normalizedBase}-${duplicateCount}`
        : normalizedBase;

    return {
      ...marker,
      slug: slugValue,
      position: markerNumber,
      title: marker.text?.trim() || `Marker ${markerNumber}`,
    };
  });
}

export function buildMarkerFilename({
  markerNumber,
  markerTime,
  markerTitle,
  siteTitle,
  pageTitle,
}: {
  markerNumber: number;
  markerTime: number;
  markerTitle?: string | null;
  siteTitle?: string | null;
  pageTitle?: string | null;
}) {
  const markerLabel = markerTitle?.trim()
    ? markerTitle
    : `marker-${markerNumber}`;
  const parts = [
    slugify(siteTitle),
    slugify(pageTitle),
    slugify(markerLabel) || `marker-${markerNumber}`,
  ].filter(Boolean) as string[];
  const timePart = formatTimeShortWithMs(markerTime).replace(/[:.]/g, "-");
  return `${[...parts, `t${timePart}`].join("__")}.jpg`;
}
