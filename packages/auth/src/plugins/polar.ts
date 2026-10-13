import {
  getPolarPlanByProductIdMap,
  getSnapshotFromSubscriptions,
} from "@actnow/auth/subscription-snapshot";
import { getEnvValue } from "@actnow/common/runtime-env";
import { createDb, eq } from "@actnow/db";
import { user } from "@actnow/db/schema/auth";
import { checkout, polar, portal, webhooks } from "@polar-sh/better-auth";
import { createPolarCore } from "@polar-sh/sdk/2026-10";

type PolarEnvKey =
  | "BETTER_AUTH_URL"
  | "POLAR_ACCESS_TOKEN"
  | "POLAR_WEBHOOK_SECRET"
  | "POLAR_ENVIRONMENT"
  | "POLAR_PRODUCT_PRO_MONTHLY_ID"
  | "POLAR_PRODUCT_PRO_YEARLY_ID"
  | "POLAR_PRODUCT_PRO_PLUS_MONTHLY_ID"
  | "POLAR_PRODUCT_PRO_PLUS_YEARLY_ID";

function getPolarEnv(key: PolarEnvKey): string {
  return getEnvValue(key);
}

export function createPolarPlugin() {
  const authBaseUrl = getPolarEnv("BETTER_AUTH_URL");
  const accessToken = getPolarEnv("POLAR_ACCESS_TOKEN");
  const webhookSecret = getPolarEnv("POLAR_WEBHOOK_SECRET");
  const polarEnvironment = getPolarEnv("POLAR_ENVIRONMENT");
  const proMonthlyProductId = getPolarEnv("POLAR_PRODUCT_PRO_MONTHLY_ID");
  const proYearlyProductId = getPolarEnv("POLAR_PRODUCT_PRO_YEARLY_ID");
  const proPlusMonthlyProductId = getPolarEnv(
    "POLAR_PRODUCT_PRO_PLUS_MONTHLY_ID"
  );
  const proPlusYearlyProductId = getPolarEnv(
    "POLAR_PRODUCT_PRO_PLUS_YEARLY_ID"
  );

  const planByProductId = getPolarPlanByProductIdMap();

  if (!URL.canParse(authBaseUrl)) {
    throw new Error("BETTER_AUTH_URL must be an absolute URL for Polar plugin");
  }

  const pricesUrl = new URL("/prices", authBaseUrl).toString();

  const checkoutProducts = [
    {
      productId: proMonthlyProductId,
      slug: "pro-monthly",
    },
    {
      productId: proYearlyProductId,
      slug: "pro-yearly",
    },
    {
      productId: proPlusMonthlyProductId,
      slug: "pro-plus-monthly",
    },
    {
      productId: proPlusYearlyProductId,
      slug: "pro-plus-yearly",
    },
  ].filter((item): item is { productId: string; slug: string } =>
    Boolean(item.productId)
  );

  const polarClient = createPolarCore({
    accessToken,
    environment: polarEnvironment === "production" ? "production" : "sandbox",
  });

  return polar({
    client: polarClient,
    createCustomerOnSignUp: true,
    use: [
      checkout({
        products: checkoutProducts,
        authenticatedUsersOnly: true,
        successUrl: `${pricesUrl}?checkout_id={CHECKOUT_ID}`,
        returnUrl: pricesUrl,
      }),
      portal({
        returnUrl: pricesUrl,
      }),
      webhooks({
        secret: webhookSecret,
        onCustomerStateChanged: async (payload) => {
          const externalUserId = payload.data.external_id;
          const activeSubscriptions = payload.data.active_subscriptions;

          if (!externalUserId) {
            return;
          }

          const snapshot = getSnapshotFromSubscriptions(
            activeSubscriptions,
            planByProductId
          );

          const db = createDb();
          const [updated] = await db
            .update(user)
            .set({
              polarCustomerId: payload.data.id,
              subscriptionPlan: snapshot.plan,
              subscriptionStatus: snapshot.status,
              subscriptionCycle: snapshot.cycle,
              subscriptionCurrentPeriodEnd: snapshot.currentPeriodEnd,
              subscriptionUpdatedAt: new Date(payload.timestamp),
              updatedAt: new Date(),
            })
            .where(eq(user.id, externalUserId))
            .returning({
              id: user.id,
              subscriptionPlan: user.subscriptionPlan,
              subscriptionStatus: user.subscriptionStatus,
            });
          if (!updated) return;
        },
      }),
    ],
  });
}
