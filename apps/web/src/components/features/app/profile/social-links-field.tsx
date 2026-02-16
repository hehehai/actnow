import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getNextSocialPlatform,
  getSocialPlatformLabel,
  getSocialPlatformPlaceholder,
  SOCIAL_PLATFORM_OPTIONS,
  type SocialLinkFormItem,
  type SocialPlatform,
} from "./profile-social-links";

interface SocialLinksFieldProps {
  value: SocialLinkFormItem[];
  onChange: (next: SocialLinkFormItem[]) => void;
  onBlur: () => void;
  isInvalid: boolean;
  isPending: boolean;
  errors: Array<{ message?: string } | undefined>;
}

export function SocialLinksField({
  value,
  onChange,
  onBlur,
  isInvalid,
  isPending,
  errors,
}: SocialLinksFieldProps) {
  const socialLinks = value ?? [];
  const canAddMore = socialLinks.length < 4;

  return (
    <Field>
      <FieldLabel>Social Links</FieldLabel>
      <div className="space-y-2">
        {socialLinks.map((item, index) => {
          const usedPlatforms = new Set(
            socialLinks
              .filter((_, i) => i !== index)
              .map((link) => link.platform)
          );

          return (
            <div
              className="flex items-center gap-2"
              key={`${item.platform}-${index}`}
            >
              <Select
                disabled={isPending}
                onValueChange={(selectedPlatform) => {
                  const next = [...socialLinks];
                  next[index] = {
                    ...next[index],
                    platform: selectedPlatform as SocialPlatform,
                  };
                  onChange(next);
                }}
                value={item.platform}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {SOCIAL_PLATFORM_OPTIONS.map((option) => (
                    <SelectItem
                      disabled={
                        option.value !== item.platform &&
                        usedPlatforms.has(option.value)
                      }
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                aria-invalid={isInvalid}
                disabled={isPending}
                onBlur={onBlur}
                onChange={(e) => {
                  const next = [...socialLinks];
                  next[index] = {
                    ...next[index],
                    url: e.target.value,
                  };
                  onChange(next);
                }}
                placeholder={getSocialPlatformPlaceholder(item.platform)}
                value={item.url}
              />

              <Button
                aria-label={`Remove ${getSocialPlatformLabel(item.platform)} link`}
                disabled={isPending}
                onClick={() => {
                  onChange(socialLinks.filter((_, i) => i !== index));
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                Remove
              </Button>
            </div>
          );
        })}

        <Button
          disabled={isPending || !canAddMore}
          onClick={() => {
            onChange([
              ...socialLinks,
              { platform: getNextSocialPlatform(socialLinks), url: "" },
            ]);
          }}
          size="sm"
          type="button"
          variant="outline"
        >
          <span className="i-hugeicons-plus-sign size-4" />
          Add Link
        </Button>
      </div>
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}
