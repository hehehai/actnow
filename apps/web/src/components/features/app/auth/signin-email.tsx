import { type SignInEmailFormData, signInEmailSchema } from "@actnow/common";
import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface SigninEmailProps {
  onSubmit: (data: SignInEmailFormData) => void;
  children?: React.ReactNode;
}

export const SigninEmail = ({ onSubmit, children }: SigninEmailProps) => {
  const form = useForm({
    validators: {
      onSubmit: signInEmailSchema,
    },
    defaultValues: {
      email: "",
    },
    onSubmit: ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="email">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel className="sr-only">Email</FieldLabel>
              <Input
                aria-invalid={isInvalid}
                autoComplete="off"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Email"
                type="email"
                value={field.state.value}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>
      {children}
    </form>
  );
};
