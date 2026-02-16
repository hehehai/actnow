import { useForm } from "@tanstack/react-form";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import slugify from "slug";
import { MediaUpload } from "@/components/features/common/media/media-upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TagRow } from "./columns";
import { useTagActions } from "./use-tag-actions";

interface TagFormDialogProps {
  tag?: TagRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: ReactElement<Record<string, unknown>>;
}

const TAG_TYPES = [
  { value: "platform", label: "Platform" },
  { value: "model", label: "Model" },
  { value: "style", label: "Style" },
] as const;

export function TagFormDialog({
  tag,
  open,
  onOpenChange,
  trigger,
}: TagFormDialogProps) {
  const actions = useTagActions();
  const isEdit = !!tag;
  const [lastAutoSlug, setLastAutoSlug] = useState("");

  const form = useForm({
    defaultValues: {
      name: "",
      value: "",
      type: "platform" as "platform" | "model" | "style",
      description: null as string | null,
      tipMedia: null as string | null,
    },
    onSubmit: async ({ value }) => {
      await actions.upsert.mutateAsync({
        id: tag?.id,
        name: value.name,
        value: value.value,
        type: value.type,
        description: value.description || null,
        tipMedia: value.tipMedia || null,
      });
      onOpenChange(false);
    },
  });

  // Reset form when dialog opens or tag changes
  useEffect(() => {
    if (open) {
      form.reset();
      if (tag) {
        form.setFieldValue("name", tag.name);
        form.setFieldValue("value", tag.value);
        form.setFieldValue("type", tag.type);
        form.setFieldValue("description", tag.description ?? "");
        form.setFieldValue("tipMedia", tag.tipMedia ?? null);
        setLastAutoSlug("");
      } else {
        setLastAutoSlug("");
      }
    }
  }, [open, tag, form]);

  // Auto-generate slug from name
  const handleNameChange = (
    value: string,
    field: { handleChange: (value: string) => void }
  ) => {
    field.handleChange(value);

    const currentSlug = form.getFieldValue("value");
    if (!currentSlug || currentSlug === lastAutoSlug) {
      const newSlug = slugify(value, { lower: true });
      form.setFieldValue("value", newSlug);
      setLastAutoSlug(newSlug);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Tag" : "Create Tag"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update tag information."
              : "Add a new tag to the system."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          id="tag-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
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
                    disabled={form.state.isSubmitting}
                    id="name"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => handleNameChange(e.target.value, field)}
                    placeholder="Enter tag name"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Value (slug) */}
          <form.Field name="value">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field>
                  <FieldLabel htmlFor="value">Value (Slug)</FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    disabled={form.state.isSubmitting}
                    id="value"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      setLastAutoSlug("");
                    }}
                    placeholder="tag-slug"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Type */}
          <form.Field name="type">
            {(field) => (
              <Field>
                <FieldLabel>Type</FieldLabel>
                <Select
                  disabled={form.state.isSubmitting}
                  onValueChange={(value: TagRow["type"] | null) =>
                    field.handleChange(value ?? field.state.value)
                  }
                  value={field.state.value}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAG_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          </form.Field>

          {/* Description */}
          <form.Field name="description">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="description">
                  Description
                  <span className="ml-1 font-normal text-muted-foreground">
                    (optional)
                  </span>
                </FieldLabel>
                <Textarea
                  disabled={form.state.isSubmitting}
                  id="description"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter description"
                  rows={2}
                  value={field.state.value ?? ""}
                />
              </Field>
            )}
          </form.Field>

          {/* Tip Media */}
          <form.Field name="tipMedia">
            {(field) => (
              <MediaUpload
                aspectRatio="cover"
                disabled={form.state.isSubmitting}
                label="Tip Media (optional)"
                mediaType="image"
                onChange={(value) => field.handleChange(value)}
                uploadType="admin"
                value={field.state.value}
              />
            )}
          </form.Field>
        </form>

        <DialogFooter className="py-2">
          <Button
            disabled={form.state.isSubmitting}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={form.state.isSubmitting}
            form="tag-form"
            type="submit"
          >
            {form.state.isSubmitting ? "Saving..." : isEdit ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
