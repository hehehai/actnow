import type { Auth } from "@actnow/auth";
import { polarClient } from "@polar-sh/better-auth/client";
import {
  adminClient,
  emailOTPClient,
  inferAdditionalFields,
  magicLinkClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [
    emailOTPClient(),
    magicLinkClient(),
    adminClient(),
    polarClient(),
    inferAdditionalFields<Auth>(),
  ],
});
