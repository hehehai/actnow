import type { SocialLink } from "@actnow/common";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { ImageUpload } from "@/components/features/common/media/image-upload";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { client, orpc } from "@/lib/orpc";
import {
  normalizeSocialLinks,
  socialLinkFormItemSchema,
} from "./profile-social-links";
import { SocialLinksField } from "./social-links-field";

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().nullable(),
  bio: z.string().max(500, "Bio must be at most 500 characters"),
  socialLinks: z
    .array(socialLinkFormItemSchema)
    .max(4, "At most 4 social links are allowed")
    .refine(
      (links) =>
        new Set(links.map((link) => link.platform)).size === links.length,
      "Social platforms must be unique"
    ),
});

interface ProfileFormProps {
  profile: {
    name?: string;
    image?: string | null;
    bio?: string | null;
    socialLinks?: SocialLink[];
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const queryClient = useQueryClient();
  const normalizedProfileSocialLinks = normalizeSocialLinks(
    profile.socialLinks ?? []
  );

  const updateProfileMutation = useMutation({
    mutationFn: (data: {
      name?: string;
      image?: string | null;
      bio?: string;
      socialLinks?: SocialLink[];
    }) => client.app.user.updateProfile(data),
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({
        queryKey: orpc.app.user.getProfile.key(),
      });
    },
  });

  const form = useForm({
    defaultValues: {
      name: profile.name || "",
      image: profile.image ?? null,
      bio: profile.bio ?? "",
      socialLinks: normalizedProfileSocialLinks,
    },
    validators: {
      onSubmit: profileFormSchema,
    },
    onSubmit: async ({ value }) => {
      const nextSocialLinks = normalizeSocialLinks(value.socialLinks);
      const currentSocialLinks = normalizedProfileSocialLinks;

      const updates: {
        name?: string;
        image?: string | null;
        bio?: string;
        socialLinks?: SocialLink[];
      } = {};

      if (value.name !== profile.name) updates.name = value.name;
      if (value.image !== profile.image) updates.image = value.image;

      const nextBio = value.bio.trim();
      const currentBio = profile.bio ?? "";
      if (nextBio !== currentBio) updates.bio = nextBio;

      if (
        JSON.stringify(nextSocialLinks) !== JSON.stringify(currentSocialLinks)
      ) {
        updates.socialLinks = nextSocialLinks as SocialLink[];
      }

      if (Object.keys(updates).length > 0) {
        await updateProfileMutation.mutateAsync(updates);
      }
    },
  });

  const isPending = updateProfileMutation.isPending;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="image">
        {(field) => (
          <div className="flex justify-center">
            <ImageUpload
              disabled={isPending}
              fallback={form.getFieldValue("name")?.charAt(0) || "?"}
              onChange={(value) => field.handleChange(value)}
              uploadType="user"
              value={field.state.value}
              variant="avatar"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="name">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                aria-invalid={isInvalid}
                disabled={isPending}
                id="name"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter your name"
                value={field.state.value}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="bio">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field>
              <FieldLabel htmlFor="bio">Bio</FieldLabel>
              <Textarea
                aria-invalid={isInvalid}
                disabled={isPending}
                id="bio"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Tell others about yourself"
                value={field.state.value}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <div className="grid gap-3">
        <form.Field name="socialLinks">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <SocialLinksField
                errors={
                  field.state.meta.errors as Array<
                    { message?: string } | undefined
                  >
                }
                isInvalid={isInvalid}
                isPending={isPending}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                value={field.state.value ?? []}
              />
            );
          }}
        </form.Field>
      </div>

      <Button disabled={isPending} size="sm" type="submit">
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
