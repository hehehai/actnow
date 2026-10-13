import { getEnvValue } from "@actnow/common/runtime-env";
import { createPolar } from "@polar-sh/sdk/2026-10";

type PolarEnvKey = "POLAR_ACCESS_TOKEN" | "POLAR_ENVIRONMENT";

function getPolarEnv(key: PolarEnvKey): string {
  return getEnvValue(key);
}

function createPolarClient() {
  const accessToken = getPolarEnv("POLAR_ACCESS_TOKEN");
  const environment = getPolarEnv("POLAR_ENVIRONMENT");

  return createPolar({
    accessToken,
    environment: environment === "production" ? "production" : "sandbox",
  });
}

export async function getPolarCustomerStateByExternalId(externalId: string) {
  const polar = createPolarClient();
  return await polar.customers.getStateExternal(externalId);
}

function isMissingCustomerError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as {
    statusCode?: number;
    status?: number;
    message?: string;
  };

  if (maybeError.statusCode === 404 || maybeError.status === 404) {
    return true;
  }

  return maybeError.message?.toLowerCase().includes("not found") ?? false;
}

export async function ensurePolarCustomerForUser(input: {
  externalId: string;
  email: string;
  name: string;
}) {
  const polar = createPolarClient();

  let customer;

  try {
    customer = await polar.customers.getExternal(input.externalId);
  } catch (error) {
    if (!isMissingCustomerError(error)) {
      throw error;
    }
  }

  if (!customer) {
    try {
      customer = await polar.customers.create({
        external_id: input.externalId,
        email: input.email,
        name: input.name,
      });
    } catch {
      const existingCustomers = await polar.customers.list({
        email: input.email,
        limit: 1,
      });

      const existingCustomer = existingCustomers.items[0];
      if (!existingCustomer) {
        throw new Error("Failed to create Polar customer");
      }

      customer = await polar.customers.update(existingCustomer.id, {
        external_id: input.externalId,
        email: input.email,
        name: input.name,
      });
    }
  }

  if (!customer) {
    throw new Error("Failed to resolve Polar customer");
  }

  const emailChanged = customer.email !== input.email;
  const nameChanged = (customer.name ?? "") !== input.name;

  if (emailChanged || nameChanged) {
    customer = await polar.customers.update(customer.id, {
      email: input.email,
      name: input.name,
    });
  }

  return customer;
}
