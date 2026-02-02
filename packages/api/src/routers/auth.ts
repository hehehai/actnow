import { auth } from "@actnow/auth";
import { z } from "zod";
import { publicProcedure } from "../index";

export const authRouter = {
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .handler(async ({ input }) =>
      auth.api.verifyEmail({ query: { token: input.token } })
    ),
};
