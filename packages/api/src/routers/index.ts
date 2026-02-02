import type { RouterClient } from "@orpc/server";
import { protectedProcedure, publicProcedure } from "../index";
import { appRouter as appFeatureRouter } from "./app";
import { authRouter } from "./auth";
import { commonRouter } from "./common";
import { featuresRouter } from "./features";
import { panelRouter } from "./panel";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => "OK"),
  privateData: protectedProcedure.handler(({ context }) => ({
    message: "This is private",
    user: context.session?.user,
  })),
  auth: authRouter,
  common: commonRouter,
  panel: panelRouter,
  app: appFeatureRouter,
  features: featuresRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
