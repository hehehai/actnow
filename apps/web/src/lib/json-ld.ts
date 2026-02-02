import { site } from "@actnow/common";
import type { MarkerSlugEntry } from "@/lib/markers";

interface ScriptTag {
  type: string;
  children: string;
}

/**
 * Organization schema for the website
 */
export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.siteName,
    url: site.url,
    logo: {
      "@type": "ImageObject",
      url: `${site.url}/images/logo.png`,
    },
    sameAs: [site.githubUrl],
  };
}

/**
 * WebSite schema with search action
 */
export function createWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.siteName,
    url: site.url,
    description: site.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${site.url}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

interface ArticleSchemaParams {
  title: string;
  description: string;
  image: string;
  url: string;
  datePublished?: Date;
  dateModified?: Date;
  tags?: string[];
}

/**
 * Article/CreativeWork schema for site detail pages
 */
export function createSiteArticleSchema(params: ArticleSchemaParams) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: params.title,
    headline: params.title,
    description: params.description,
    image: params.image.startsWith("http")
      ? params.image
      : `${site.url}${params.image}`,
    url: `${site.url}${params.url}`,
    publisher: {
      "@type": "Organization",
      name: site.siteName,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}/images/logo.png`,
      },
    },
    datePublished: params.datePublished?.toISOString(),
    dateModified: params.dateModified?.toISOString(),
    keywords: params.tags?.join(", "),
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * BreadcrumbList schema
 */
export function createBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${site.url}${item.url}`,
    })),
  };
}

/**
 * Helper to create script tag for head config
 */
export function createJsonLdScript(schema: object): ScriptTag {
  return {
    type: "application/ld+json",
    children: JSON.stringify(schema),
  };
}

interface MarkerListSchemaParams {
  title: string;
  url: string;
  markers: MarkerSlugEntry[];
}

export function createMarkerListSchema(params: MarkerListSchemaParams) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${params.title} markers`,
    url: `${site.url}${params.url}`,
    itemListElement: params.markers.map((marker) => ({
      "@type": "ListItem",
      position: marker.position,
      name: marker.title,
      url: `${site.url}${params.url}#${marker.slug}`,
    })),
  };
}

interface MarkerVideoSchemaParams {
  title: string;
  description: string;
  coverImage?: string | null;
  videoUrl?: string | null;
  url: string;
  markers: MarkerSlugEntry[];
  datePublished?: Date;
}

export function createMarkerVideoSchema(params: MarkerVideoSchemaParams) {
  if (!(params.markers.length && params.videoUrl)) {
    return null;
  }

  const thumbnailUrl = params.coverImage
    ? params.coverImage.startsWith("http")
      ? params.coverImage
      : `${site.url}${params.coverImage}`
    : `${site.url}/images/og.jpg`;
  const videoUrl = params.videoUrl.startsWith("http")
    ? params.videoUrl
    : `${site.url}${params.videoUrl}`;

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: params.title,
    description: params.description,
    thumbnailUrl,
    uploadDate: params.datePublished?.toISOString(),
    contentUrl: videoUrl,
    embedUrl: videoUrl,
    publisher: {
      "@type": "Organization",
      name: site.siteName,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}/images/logo.png`,
      },
    },
    hasPart: params.markers.map((marker) => ({
      "@type": "Clip",
      name: marker.title,
      url: `${site.url}${params.url}#${marker.slug}`,
      startOffset: Number(marker.time.toFixed(3)),
      position: marker.position,
    })),
  };
}
