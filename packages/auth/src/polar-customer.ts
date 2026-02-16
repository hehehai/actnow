import { Polar } from "@polar-sh/sdk";

type PolarEnvKey = "POLAR_ACCESS_TOKEN" | "POLAR_ENVIRONMENT";

function getPolarEnv(key: PolarEnvKey): string {
  return process.env[key] ?? "";
}

function createPolarClient() {
  const accessToken = getPolarEnv("POLAR_ACCESS_TOKEN");
  const environment = getPolarEnv("POLAR_ENVIRONMENT");

  return new Polar({
    accessToken,
    server: environment === "production" ? "production" : "sandbox",
  });
}

export async function getPolarCustomerStateByExternalId(externalId: string) {
  const polar = createPolarClient();
  return await polar.customers.getStateExternal({ externalId });
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

  let customer:
    | {
        id: string;
        email: string;
        name: string | null;
        externalId: string | null;
      }
    | undefined;

  try {
    customer = await polar.customers.getExternal({
      externalId: input.externalId,
    });
  } catch (error) {
    if (!isMissingCustomerError(error)) {
      throw error;
    }
  }

  if (!customer) {
    try {
      customer = await polar.customers.create({
        externalId: input.externalId,
        email: input.email,
        name: input.name,
      });
    } catch {
      const { result: existingCustomers } = await polar.customers.list({
        email: input.email,
        limit: 1,
      });

      const existingCustomer = existingCustomers.items[0];
      if (!existingCustomer) {
        throw new Error("Failed to create Polar customer");
      }

      customer = await polar.customers.update({
        id: existingCustomer.id,
        customerUpdate: {
          externalId: input.externalId,
          email: input.email,
          name: input.name,
        },
      });
    }
  }

  const emailChanged = customer.email !== input.email;
  const nameChanged = (customer.name ?? "") !== input.name;

  if (emailChanged || nameChanged) {
    customer = await polar.customers.update({
      id: customer.id,
      customerUpdate: {
        email: input.email,
        name: input.name,
      },
    });
  }

  return customer;
}
