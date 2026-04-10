import { SubscriptionPlan, SubscriptionStatus, UserRole } from "@actnow/common";
import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { CURRENT_TIMESTAMP_MS, jsonText, timestampMs } from "./helpers";

export type SocialLinkPlatform = "x" | "website" | "facebook" | "instagram";

export type SocialLink = {
  platform: SocialLinkPlatform;
  url: string;
};

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  polarCustomerId: text("polar_customer_id").unique(),
  subscriptionPlan: text("subscription_plan")
    .default(SubscriptionPlan.FREE)
    .notNull(),
  subscriptionStatus: text("subscription_status")
    .default(SubscriptionStatus.FREE)
    .notNull(),
  subscriptionCycle: text("subscription_cycle"),
  subscriptionCurrentPeriodEnd: timestampMs("subscription_current_period_end"),
  subscriptionUpdatedAt: timestampMs("subscription_updated_at"),
  bio: text("bio"),
  socialLinks: jsonText<SocialLink[]>("social_links")
    .default(sql`'[]'`)
    .notNull(),
  createdAt: timestampMs("created_at").default(CURRENT_TIMESTAMP_MS).notNull(),
  updatedAt: timestampMs("updated_at")
    .default(CURRENT_TIMESTAMP_MS)
    .$onUpdate(() => new Date())
    .notNull(),
  role: text("role").default(UserRole.USER),
  banned: integer("banned", { mode: "boolean" }).default(false),
  banReason: text("ban_reason"),
  banExpires: timestampMs("ban_expires"),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestampMs("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestampMs("created_at")
      .default(CURRENT_TIMESTAMP_MS)
      .notNull(),
    updatedAt: timestampMs("updated_at")
      .default(CURRENT_TIMESTAMP_MS)
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestampMs("access_token_expires_at"),
    refreshTokenExpiresAt: timestampMs("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestampMs("created_at")
      .default(CURRENT_TIMESTAMP_MS)
      .notNull(),
    updatedAt: timestampMs("updated_at")
      .default(CURRENT_TIMESTAMP_MS)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestampMs("expires_at").notNull(),
    createdAt: timestampMs("created_at")
      .default(CURRENT_TIMESTAMP_MS)
      .notNull(),
    updatedAt: timestampMs("updated_at")
      .default(CURRENT_TIMESTAMP_MS)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
