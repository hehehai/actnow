import { type SignInOtpFormData, signInOtpSchema } from "@actnow/common";
import { useForm } from "@tanstack/react-form";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";

interface SigninEmailOtpProps {
  onSubmit: (data: SignInOtpFormData) => void;
  submitButton?: React.ReactNode;
  modeButtons?: React.ReactNode;
}

export const SigninEmailOtp = ({
  onSubmit,
  submitButton,
  modeButtons,
}: SigninEmailOtpProps) => {
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);

  const form = useForm({
    validators: {
      onSubmit: signInOtpSchema,
    },
    defaultValues: {
      email: "",
      otp: "",
    },
    onSubmit: ({ value }) => {
      onSubmit(value);
    },
  });

  const handleSendOtp = async () => {
    const email = form.getFieldValue("email");
    if (!email) {
      toast.error("Please enter your email first");
      return;
    }

    setSending(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      if (error) {
        toast.error(error.message || "Failed to send verification code");
      } else {
        setOtpSent(true);
        toast.success("Verification code sent to your email");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send verification code"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(onSubmit);
      }}
    >
      <FieldGroup>
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

        {otpSent ? (
          <>
            <form.Field name="otp">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className="sr-only">
                      Verification Code
                    </FieldLabel>
                    <InputOTP
                      aria-invalid={isInvalid}
                      disabled={field.state.value === ""}
                      maxLength={6}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={field.handleChange}
                      pattern={REGEXP_ONLY_DIGITS}
                      render={({ slots }) => (
                        <>
                          <InputOTPGroup className="grow">
                            {slots[0] && (
                              <InputOTPSlot
                                className="grow"
                                index={0}
                                {...slots[0]}
                              />
                            )}
                            {slots[1] && (
                              <InputOTPSlot
                                className="grow"
                                index={1}
                                {...slots[1]}
                              />
                            )}
                            {slots[2] && (
                              <InputOTPSlot
                                className="grow"
                                index={2}
                                {...slots[2]}
                              />
                            )}
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup className="grow">
                            {slots[3] && (
                              <InputOTPSlot
                                className="grow"
                                index={3}
                                {...slots[3]}
                              />
                            )}
                            {slots[4] && (
                              <InputOTPSlot
                                className="grow"
                                index={4}
                                {...slots[4]}
                              />
                            )}
                            {slots[5] && (
                              <InputOTPSlot
                                className="grow"
                                index={5}
                                {...slots[5]}
                              />
                            )}
                          </InputOTPGroup>
                        </>
                      )}
                      value={field.state.value}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            {submitButton}
          </>
        ) : (
          <form.Subscribe<string> selector={(state) => state.values.email}>
            {(email) => (
              <Button
                className="w-full"
                disabled={!email || sending}
                onClick={handleSendOtp}
                type="button"
                variant="outline"
              >
                {sending ? "Sending..." : "Send Verification Code"}
              </Button>
            )}
          </form.Subscribe>
        )}
      </FieldGroup>

      {modeButtons}
    </form>
  );
};
