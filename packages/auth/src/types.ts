import type { auth } from "./index";

export type Session = typeof auth.$Infer.Session & {
  user: typeof auth.$Infer.Session.user & {
    role?: string;
    subscriptionPlan?: string;
    subscriptionStatus?: string;
    subscriptionCycle?: string | null;
    subscriptionCurrentPeriodEnd?: Date | null;
    subscriptionUpdatedAt?: Date | null;
  };
};

export type User = Session["user"];
