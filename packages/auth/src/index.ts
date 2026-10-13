import { site } from "@actnow/common";
import {
  getEnvValue,
  getRuntimeEnv,
  isDevelopment,
} from "@actnow/common/runtime-env";
import { createDb } from "@actnow/db";
import * as schema from "@actnow/db/schema/auth";
import { feedbacks } from "@actnow/db/schema/feedback";
import { postLikes, posts } from "@actnow/db/schema/posts";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { getAppBaseUrl } from "./env";
import { createAuthPlugins } from "./plugins";

type AuthEnvKey =
  | "BETTER_AUTH_URL"
  | "BETTER_AUTH_SECRET"
  | "CORS_ORIGIN"
  | "GITHUB_CLIENT_ID"
  | "GITHUB_CLIENT_SECRET"
  | "GOOGLE_CLIENT_ID"
  | "GOOGLE_CLIENT_SECRET";

function getAuthEnvValue(key: AuthEnvKey): string {
  return getEnvValue(key);
}

type Auth = ReturnType<typeof createAuth>;

const authCache = new WeakMap<object, Auth>();

export function createAuth() {
  const database = createDb();

  return betterAuth({
    database: drizzleAdapter(database, {
      provider: "sqlite",
      schema,
    }),

    baseURL: getAuthEnvValue("BETTER_AUTH_URL"),
    secret: getAuthEnvValue("BETTER_AUTH_SECRET"),
    trustedOrigins: [getAuthEnvValue("CORS_ORIGIN")].filter(Boolean),

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },

    emailVerification: {
      sendVerificationEmail: async ({ user, url, token }) => {
        const [name = user.email] = user.email.split("@");
        const userName = user.name || name;

        if (isDevelopment()) {
          console.info("sendVerificationEmail", {
            email: user.email,
            url,
            token,
          });
        }

        const { sendEmail } = await import("@actnow/email");
        const { VerificationEmail } =
          await import("@actnow/email/templates/auth");

        await sendEmail({
          to: user.email,
          subject: `${site.name} | Verify your email`,
          renderData: VerificationEmail({
            name: userName,
            verifyUrl: url,
            verifyCode: token,
            baseUrl: getAppBaseUrl(),
          }),
        });
      },
      sendOnSignUp: false,
      autoSignInAfterVerification: true,
    },

    socialProviders: {
      github: {
        clientId: getAuthEnvValue("GITHUB_CLIENT_ID"),
        clientSecret: getAuthEnvValue("GITHUB_CLIENT_SECRET"),
      },
      google: {
        clientId: getAuthEnvValue("GOOGLE_CLIENT_ID"),
        clientSecret: getAuthEnvValue("GOOGLE_CLIENT_SECRET"),
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

          await reqDb.delete(postLikes).where(eq(postLikes.userId, user.id));

          await reqDb
            .update(feedbacks)
            .set({ deletedAt: new Date() })
            .where(eq(feedbacks.createdById, user.id));

          await reqDb
            .update(posts)
            .set({ deletedAt: new Date() })
            .where(eq(posts.createdById, user.id));
        },
      },
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7,
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },

    account: {
      modelName: "account",
    },

    plugins: createAuthPlugins(),
  });
}

export function getAuth() {
  const env = getRuntimeEnv();
  const cached = authCache.get(env as object);
  if (cached) {
    return cached;
  }

  const auth = createAuth();
  authCache.set(env as object, auth);
  return auth;
}

export const auth = new Proxy({} as Auth, {
  get(_target, property, receiver) {
    return Reflect.get(getAuth(), property, receiver);
  },
});

export type { Auth };
