import { z } from "zod";
import {
  emailSchema,
  nameSchema,
  passwordSchema,
  simplePasswordSchema,
} from "./common";

// Legacy: User auth schema for old UserAuthForm component
export const userAuthSchema = z.object({
  email: emailSchema,
});

// Sign in with email (magic link)
export const signInEmailSchema = z.object({
  email: emailSchema,
});

export type SignInEmailFormData = z.infer<typeof signInEmailSchema>;

// Sign in with email and password
export const signInPasswordSchema = z.object({
  email: emailSchema,
  password: simplePasswordSchema,
});

export type SignInPasswordFormData = z.infer<typeof signInPasswordSchema>;

// Sign in with email OTP
export const signInOtpSchema = z.object({
  email: emailSchema,
  otp: z.string(),
});

export type SignInOtpFormData = z.infer<typeof signInOtpSchema>;

// Sign up
export const signUpSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    passwordConfirmation: z.string().min(1, "Please confirm your password"),
    image: z.string().nullable(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

// Forgot password / Reset password email
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Alias for forgot-password-email component
export const resetPasswordEmailSchema = forgotPasswordSchema;
export type ResetPasswordEmailFormData = ForgotPasswordFormData;

// Reset password / Set new password
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    passwordConfirmation: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Alias for forgot-password-set component
export const resetPasswordSetSchema = resetPasswordSchema;
export type ResetPasswordSetFormData = ResetPasswordFormData;
