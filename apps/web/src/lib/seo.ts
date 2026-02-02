import { site } from "@actnow/common";
import {
  type BreadcrumbItem,
  createBreadcrumbSchema,
  createJsonLdScript,
  createMarkerListSchema,
  createMarkerVideoSchema,
  createSiteArticleSchema,
} from "./json-ld";
import { createMarkerSlugEntries, type MarkerSummary } from "./markers";

const SITE_NAME = site.siteName;
const DEFAULT_TITLE_SUFFIX = site.description;
const DEFAULT_DESCRIPTION = site.description;
const DEFAULT_OG_IMAGE = site.ogImage ?? "/images/og.jpg";
const SITE_URL = site.url;
const DEFAULT_KEYWORDS = site.keywords ?? [];

interface PageMetaOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  /** If true, format as "SiteName - Title" instead of "Title - SiteName" */
  siteNameFirst?: boolean;
}

interface MetaTag {
  title?: string;
  name?: string;
  property?: string;
  content?: string;
}

interface LinkTag {
  rel: string;
  href: string;
}

interface HeadConfig {
  meta: MetaTag[];
  links: LinkTag[];
}

export function createPageMeta(options: PageMetaOptions = {}): HeadConfig {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    keywords = DEFAULT_KEYWORDS,
    image = DEFAULT_OG_IMAGE,
    url,
    type = "website",
    noIndex = false,
    siteNameFirst = false,
  } = options;

  let fullTitle: string;
  if (!title) {
    fullTitle = `${SITE_NAME} - ${DEFAULT_TITLE_SUFFIX}`;
  } else if (siteNameFirst) {
    fullTitle = `${SITE_NAME} - ${title}`;
  } else {
    fullTitle = `${title} - ${SITE_NAME}`;
  }

  const fullImageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  const canonicalUrl = url ? `${SITE_URL}${url}` : undefined;

  const meta: MetaTag[] = [
    { title: fullTitle },
    { name: "description", content: description },
    { name: "keywords", content: keywords.join(", ") },

    // Open Graph
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:image", content: fullImageUrl },
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE_NAME },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: fullImageUrl },
  ];

  if (canonicalUrl) {
    meta.push({ property: "og:url", content: canonicalUrl });
  }

  if (noIndex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  }

  const links: LinkTag[] = [];
  if (canonicalUrl) {
    links.push({ rel: "canonical", href: canonicalUrl });
  }

  return { meta, links };
}

export function createDetailPageMeta(
  siteName: string,
  siteDescription?: string | null,
  coverImage?: string | null,
  pageVersionId?: string,
  options?: { keywords?: string[] }
): HeadConfig {
  const extraKeywords = options?.keywords
    ?.map((keyword) => keyword.trim())
    .filter((keyword): keyword is string => Boolean(keyword));
  const keywords =
    extraKeywords && extraKeywords.length > 0
      ? Array.from(new Set([...DEFAULT_KEYWORDS, ...extraKeywords]))
      : undefined;

  return createPageMeta({
    title: siteName,
    description:
      siteDescription ||
      `Explore ${siteName} design on Refto. ${DEFAULT_DESCRIPTION}`,
    image: coverImage || DEFAULT_OG_IMAGE,
    url: pageVersionId ? `/${pageVersionId}` : undefined,
    type: "article",
    keywords,
  });
}

interface SiteDetailHeadParams {
  pageTitle: string;
  url: string;
  siteTitle: string;
  siteDescription?: string | null;
  siteTags?: Array<{ name?: string | null }>;
  currentVersion: {
    webCover?: string | null;
    webRecord?: string | null;
    createdAt: Date;
  };
  markers?: MarkerSummary[];
  breadcrumbs: BreadcrumbItem[];
}

export function createSiteDetailHead({
  pageTitle,
  url,
  siteTitle,
  siteDescription,
  siteTags,
  currentVersion,
  markers = [],
  breadcrumbs,
}: SiteDetailHeadParams) {
  const description =
    siteDescription || `Explore ${siteTitle} design on Refto.`;
  const tagKeywords =
    siteTags
      ?.map((tag) => tag?.name)
      .filter((name): name is string => Boolean(name)) ?? [];
  const markerEntries = markers.length ? createMarkerSlugEntries(markers) : [];
  const markerKeywords = markerEntries.map((entry) => entry.title);
  const keywords = Array.from(new Set([...tagKeywords, ...markerKeywords]));
  const meta = createDetailPageMeta(
    pageTitle,
    siteDescription,
    currentVersion.webCover,
    url,
    keywords.length ? { keywords } : undefined
  );

  const articleSchema = createSiteArticleSchema({
    title: pageTitle,
    description,
    image: currentVersion.webCover || "/images/og.jpg",
    url,
    datePublished: currentVersion.createdAt,
    dateModified: currentVersion.createdAt,
    tags: tagKeywords,
  });

  const breadcrumbSchema = createBreadcrumbSchema(breadcrumbs);

  const scripts = [
    createJsonLdScript(articleSchema),
    createJsonLdScript(breadcrumbSchema),
  ];

  if (markerEntries.length) {
    const markerListSchema = createMarkerListSchema({
      title: pageTitle,
      url,
      markers: markerEntries,
    });
    scripts.push(createJsonLdScript(markerListSchema));
    const markerVideoSchema = createMarkerVideoSchema({
      title: pageTitle,
      description,
      coverImage: currentVersion.webCover,
      videoUrl: currentVersion.webRecord ?? undefined,
      url,
      markers: markerEntries,
      datePublished: currentVersion.createdAt,
    });
    if (markerVideoSchema) {
      scripts.push(createJsonLdScript(markerVideoSchema));
    }
  }

  return {
    meta: meta.meta,
    links: meta.links,
    scripts,
  };
}
