import { getBaseUrl, site } from "@actnow/common";
import { createDb } from "@actnow/db";
import * as schema from "@actnow/db/schema/auth";
import { feedbacks } from "@actnow/db/schema/feedback";
import { postLikes, posts } from "@actnow/db/schema/posts";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { createAuthPlugins } from "./plugins";

type AuthEnvKey =
  | "BETTER_AUTH_URL"
  | "BETTER_AUTH_SECRET"
  | "CORS_ORIGIN"
  | "GITHUB_CLIENT_ID"
  | "GITHUB_CLIENT_SECRET"
  | "GOOGLE_CLIENT_ID"
  | "GOOGLE_CLIENT_SECRET";

function getEnvValue(key: AuthEnvKey): string {
  return process.env[key] ?? "";
}

export function createAuth() {
  const database = createDb();

  return betterAuth({
    database: drizzleAdapter(database, {
      provider: "pg",
      schema,
    }),

    baseURL: getEnvValue("BETTER_AUTH_URL"),
    secret: getEnvValue("BETTER_AUTH_SECRET"),
    trustedOrigins: [getEnvValue("CORS_ORIGIN")].filter(Boolean),

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },

    emailVerification: {
      sendVerificationEmail: async ({ user, url, token }) => {
        const [name = user.email] = user.email.split("@");
        const userName = user.name || name;

        if (process.env.NODE_ENV === "development") {
          console.info("sendVerificationEmail", {
            email: user.email,
            url,
            token,
          });
        }

        // Lazy load email dependencies to reduce initial bundle size
        const { sendEmail } = await import("@actnow/email");
        const { VerificationEmail } = await import(
          "@actnow/email/templates/auth"
        );

        await sendEmail({
          to: user.email,
          subject: `${site.name} | Verify your email`,
          renderData: VerificationEmail({
            name: userName,
            verifyUrl: url,
            verifyCode: token,
            baseUrl: getBaseUrl(),
          }),
        });
      },
      sendOnSignUp: false,
      autoSignInAfterVerification: true,
    },

    socialProviders: {
      github: {
        clientId: getEnvValue("GITHUB_CLIENT_ID"),
        clientSecret: getEnvValue("GITHUB_CLIENT_SECRET"),
      },
      google: {
        clientId: getEnvValue("GOOGLE_CLIENT_ID"),
        clientSecret: getEnvValue("GOOGLE_CLIENT_SECRET"),
      },
    },

    user: {
      changeEmail: {
        enabled: true,
      },
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "USER",
          input: false,
        },
        polarCustomerId: {
          type: "string",
          input: false,
        },
        subscriptionPlan: {
          type: "string",
          defaultValue: "FREE",
          input: false,
        },
        subscriptionStatus: {
          type: "string",
          defaultValue: "FREE",
          input: false,
        },
        subscriptionCycle: {
          type: "string",
          required: false,
          input: false,
        },
        subscriptionCurrentPeriodEnd: {
          type: "date",
          required: false,
          input: false,
        },
        subscriptionUpdatedAt: {
          type: "date",
          required: false,
          input: false,
        },
      },
      modelName: "user",
      deleteUser: {
        enabled: true,
        beforeDelete: async (user) => {
          const reqDb = createDb();

          // Delete all user likes
          await reqDb.delete(postLikes).where(eq(postLikes.userId, user.id));

          // Soft delete all user feedback
          await reqDb
            .update(feedbacks)
            .set({ deletedAt: new Date() })
            .where(eq(feedbacks.createdById, user.id));

          // Soft delete user posts
          await reqDb
            .update(posts)
            .set({ deletedAt: new Date() })
            .where(eq(posts.createdById, user.id));
        },
      },
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
    },

    account: {
      modelName: "account",
    },

    plugins: createAuthPlugins(),
  });
}

// Default auth instance for CLI/build time
export const auth = createAuth();

// Export type for auth instance
export type Auth = ReturnType<typeof createAuth>;
