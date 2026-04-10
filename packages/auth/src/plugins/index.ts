import { UserRole } from "@actnow/common";
import { admin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { createEmailOtpPlugin } from "./email-otp";
import { createMagicLinkPlugin } from "./magic-link";
import { createPolarPlugin } from "./polar";

export function createAuthPlugins() {
  return [
    createEmailOtpPlugin(),
    createMagicLinkPlugin(),
    createPolarPlugin(),
    admin({
      defaultRole: UserRole.USER,
      adminRoles: [UserRole.ADMIN],
    }),
    // Must be last plugin
    tanstackStartCookies(),
  ];
}
