import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { client, orpc } from "@/lib/orpc";
import { setPasswordDialog } from "@/stores/handlers";

const setPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function SetPasswordDialog() {
  return (
    <Dialog handle={setPasswordDialog}>
      <DialogContent className="sm:max-w-md">
        <SetPasswordContent />
      </DialogContent>
    </Dialog>
  );
}

function SetPasswordContent() {
  const queryClient = useQueryClient();

  const setPasswordMutation = useMutation({
    mutationFn: (data: { newPassword: string }) =>
      client.app.user.setPassword(data),
    onSuccess: () => {
      toast.success("Password set successfully");
      queryClient.invalidateQueries({
        queryKey: orpc.app.user.getProfile.key(),
      });
      setPasswordDialog.close();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to set password");
    },
  });

  const form = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: setPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      await setPasswordMutation.mutateAsync({
        newPassword: value.newPassword,
      });
    },
  });

  const handleClose = () => {
    setPasswordDialog.close();
    form.reset();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Set Password</DialogTitle>
        <DialogDescription>
          Create a password to enable email/password login for your account.
        </DialogDescription>
      </DialogHeader>
      <form
        className="space-y-4 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.Field name="newPassword">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field>
                <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  autoComplete="new-password"
                  id="new-password"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter new password"
                  type="password"
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="confirmPassword">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm Password
                </FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  autoComplete="new-password"
                  id="confirm-password"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Confirm new password"
                  type="password"
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <DialogFooter className="pt-2">
          <Button onClick={handleClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={form.state.isSubmitting} type="submit">
            {form.state.isSubmitting ? "Setting..." : "Set Password"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
