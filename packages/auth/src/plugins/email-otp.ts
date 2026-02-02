import { getBaseUrl, site } from "@actnow/common";
import { createDb } from "@actnow/db";
import { user } from "@actnow/db/schema/auth";
import { emailOTP } from "better-auth/plugins/email-otp";
import { eq } from "drizzle-orm";

export function createEmailOtpPlugin() {
  return emailOTP({
    async sendVerificationOTP({ email, otp, type }) {
      try {
        const db = createDb();

        // Check if user exists
        const existingUser = await db.query.user.findFirst({
          where: eq(user.email, email),
          columns: { emailVerified: true, name: true },
        });

        // For new users, verify email MX records (lazy load to reduce bundle size)
        if (!existingUser) {
          const { verifyEmail } = await import("@devmehq/email-validator-js");
          const { validFormat, validMx } = await verifyEmail({
            emailAddress: email,
            verifyMx: true,
            timeout: 10_000,
          });

          if (!(validFormat && validMx)) {
            throw new Error("Invalid email address");
          }
        }

        const isPasswordReset = type === "forget-password";
        const [name = email] = email.split("@");
        const userName = existingUser?.name || name;

        if (process.env.NODE_ENV === "development") {
          console.info("sendVerificationOTP", {
            email,
            otp,
            type,
          });
        }

        // Lazy load email dependencies to reduce initial bundle size
        const { sendEmail } = await import("@actnow/email");
        const { ResetPasswordEmail, VerificationEmail } = await import(
          "@actnow/email/templates/auth"
        );

        if (isPasswordReset) {
          // Password reset email
          const verifyUrl = `${getBaseUrl()}/reset-password?email=${encodeURIComponent(email)}&token=${otp}`;

          await sendEmail({
            to: email,
            subject: `${site.name} | Reset your password`,
            renderData: ResetPasswordEmail({
              name: userName,
              verifyUrl,
              verifyCode: otp,
              baseUrl: getBaseUrl(),
            }),
          });
        } else {
          // Verification email (sign-in, sign-up, email-verification)
          const sendTitle = existingUser ? "Sign in" : "Sign up";
          const verifyUrl = `${getBaseUrl()}/verify-email?email=${encodeURIComponent(email)}&token=${otp}`;

          await sendEmail({
            to: email,
            subject: `${site.name} ${sendTitle} | Verify your email`,
            renderData: VerificationEmail({
              name: userName,
              verifyUrl,
              verifyCode: otp,
              baseUrl: getBaseUrl(),
            }),
          });
        }
      } catch (err) {
        console.error("[Email] Error sending OTP:", err);
        throw new Error("Error sending verification email");
      }
    },
    otpLength: 6,
    expiresIn: 600, // 10 minutes
    sendVerificationOnSignUp: true,
  });
}

// Default export for backward compatibility
export const emailOtpPlugin = createEmailOtpPlugin();
