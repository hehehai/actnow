import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { ImageUpload } from "@/components/features/common/media/image-upload";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/lib/orpc";

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().nullable(),
});

interface ProfileFormProps {
  profile: {
    name?: string;
    image?: string | null;
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name?: string; image?: string | null }) => {
      const result = await authClient.updateUser(data);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      // Invalidate profile query to sync with getProfile data
      queryClient.invalidateQueries({
        queryKey: orpc.app.user.getProfile.key(),
      });
      // authClient.updateUser automatically updates session, no need to refetch
    },
  });

  const form = useForm({
    defaultValues: {
      name: profile.name || "",
      image: profile.image ?? null,
    },
    validators: {
      onSubmit: profileFormSchema,
    },
    onSubmit: async ({ value }) => {
      const updates: { name?: string; image?: string | null } = {};
      if (value.name !== profile.name) updates.name = value.name;
      if (value.image !== profile.image) updates.image = value.image;
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
      {/* Avatar */}
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

      {/* Name */}
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

      <Button disabled={isPending} size="sm" type="submit">
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
