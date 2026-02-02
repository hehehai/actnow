import { type SignUpFormData, signUpSchema } from "@actnow/common";
import { useForm } from "@tanstack/react-form";
import { ImageUpload } from "@/components/features/common/media/image-upload";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface SignupFormProps {
  onSubmit: (data: SignUpFormData) => void;
  children?: React.ReactNode;
}

export const SignupForm = ({ onSubmit, children }: SignupFormProps) => {
  const form = useForm({
    validators: {
      onSubmit: signUpSchema,
    },
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      image: null,
    } as SignUpFormData,
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
      <div className="flex items-center gap-3">
        <form.Field name="image">
          {(field) => (
            <ImageUpload
              fallback="ref"
              onChange={(url) => field.handleChange(url)}
              size="sm"
              uploadType="public"
              value={field.state.value}
              variant="avatar"
            />
          )}
        </form.Field>
        <div className="flex-1">
          <p className="text-muted-foreground text-sm">Upload avatar</p>
          <p className="text-muted-foreground/60 text-xs">Optional</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <form.Field name="firstName">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field>
                <FieldLabel className="sr-only">First name</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="First name"
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="lastName">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field>
                <FieldLabel className="sr-only">Last name</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Last name"
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
      </div>

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

      <form.Field name="password">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel className="sr-only">password</FieldLabel>
              <Input
                aria-invalid={isInvalid}
                autoComplete="off"
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="password"
                type="password"
                value={field.state.value}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="passwordConfirmation">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel className="sr-only">Confirm password</FieldLabel>
              <Input
                aria-invalid={isInvalid}
                autoComplete="off"
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Confirm password"
                type="password"
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
