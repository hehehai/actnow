import type { SocialLink } from "@actnow/common";
import { z } from "zod";

export const SOCIAL_PLATFORMS = [
  "x",
  "website",
  "facebook",
  "instagram",
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_PLATFORM_OPTIONS: Array<{
  value: SocialPlatform;
  label: string;
  placeholder: string;
}> = [
  { value: "x", label: "X", placeholder: "https://x.com/username" },
  { value: "website", label: "Website", placeholder: "https://your-site.com" },
  {
    value: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/username",
  },
  {
    value: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/username",
  },
];

export const socialPlatformSchema = z.enum(SOCIAL_PLATFORMS);
export const socialLinkFormItemSchema = z.object({
  platform: socialPlatformSchema,
  url: z
    .string()
    .trim()
    .min(1, "Link is required")
    .refine((value) => z.url().safeParse(value).success, {
      message: "Invalid URL",
    }),
});

export type SocialLinkFormItem = z.infer<typeof socialLinkFormItemSchema>;

export function normalizeSocialLinks(socialLinks: SocialLink[] = []) {
  return SOCIAL_PLATFORM_OPTIONS.map((option) => {
    const existing = socialLinks.find(
      (item) => item.platform === option.value && item.url.trim().length > 0
    );
    if (!existing) {
      return null;
    }

    return {
      platform: option.value,
      url: existing.url.trim(),
    };
  }).filter((item): item is SocialLinkFormItem => Boolean(item));
}

export function getNextSocialPlatform(
  socialLinks: Array<{ platform: SocialPlatform }>
) {
  const used = new Set(socialLinks.map((item) => item.platform));
  return (
    SOCIAL_PLATFORM_OPTIONS.find((option) => !used.has(option.value))?.value ??
    SOCIAL_PLATFORM_OPTIONS[0].value
  );
}

export function getSocialPlatformLabel(platform: SocialPlatform) {
  return (
    SOCIAL_PLATFORM_OPTIONS.find((option) => option.value === platform)
      ?.label ?? platform
  );
}

export function getSocialPlatformPlaceholder(platform: SocialPlatform) {
  return (
    SOCIAL_PLATFORM_OPTIONS.find((option) => option.value === platform)
      ?.placeholder ?? "https://"
  );
}
