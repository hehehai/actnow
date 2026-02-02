import { userFormSchema } from "@actnow/common";
import { useForm } from "@tanstack/react-form";
import type { ReactElement } from "react";
import { useEffect } from "react";
import { ImageUpload } from "@/components/features/common/media/image-upload";
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
import type { UserRow } from "./columns";

interface UserFormDialogProps {
  mode: "create" | "edit";
  user?: UserRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    email: string;
    password?: string;
    role: "ADMIN" | "USER";
    image?: string | null;
  }) => Promise<void>;
  trigger?: ReactElement<Record<string, unknown>>;
}

export function UserFormDialog({
  mode,
  user,
  open,
  onOpenChange,
  onSubmit,
  trigger,
}: UserFormDialogProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER" as "ADMIN" | "USER",
      image: null as string | null,
      mode,
    },
    validators: {
      onSubmit: userFormSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        name: value.name,
        email: value.email,
        password: value.password || undefined,
        role: value.role,
        image: value.image,
      });
      onOpenChange(false);
    },
  });

  // Reset form when dialog opens or user changes
  useEffect(() => {
    if (open) {
      form.reset();
      form.setFieldValue("mode", mode);
      if (user) {
        form.setFieldValue("name", user.name ?? "");
        form.setFieldValue("email", user.email);
        form.setFieldValue("role", user.role as "ADMIN" | "USER");
        form.setFieldValue("image", user.image ?? null);
        form.setFieldValue("password", "");
      }
    }
  }, [open, user, mode, form]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent overlayProps={{ forceRender: true }}>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create User" : "Edit User"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new user to the system."
              : "Update user information."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          id="user-form"
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
                  disabled={form.state.isSubmitting}
                  fallback={form.getFieldValue("name")?.charAt(0) || "?"}
                  onChange={(value) => field.handleChange(value)}
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
                    disabled={form.state.isSubmitting}
                    id="name"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter name"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Email */}
          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    disabled={mode === "edit" || form.state.isSubmitting}
                    id="email"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter email"
                    type="email"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Password */}
          <form.Field name="password">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field>
                  <FieldLabel htmlFor="password">
                    Password
                    {mode === "edit" && (
                      <span className="ml-1 font-normal text-muted-foreground">
                        (leave blank to keep current)
                      </span>
                    )}
                  </FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    disabled={form.state.isSubmitting}
                    id="password"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={
                      mode === "create" ? "Enter password" : "New password"
                    }
                    type="password"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Role */}
          <form.Field name="role">
            {(field) => (
              <Field>
                <FieldLabel>Role</FieldLabel>
                <Select
                  disabled={form.state.isSubmitting}
                  onValueChange={(v) =>
                    field.handleChange(v as "ADMIN" | "USER")
                  }
                  value={field.state.value}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
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
            form="user-form"
            type="submit"
          >
            {form.state.isSubmitting
              ? "Saving..."
              : mode === "create"
                ? "Create"
                : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
