import { getAuth } from "@actnow/auth";
import { signInPasswordSchema } from "@actnow/common";
import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";

type PasswordSignInError = {
  code: string;
  message: string;
  status: number;
};

type PasswordSignInResult =
  | {
      ok: true;
    }
  | {
      error: PasswordSignInError;
      ok: false;
    };

type BetterAuthApiError = {
  body?: {
    code?: string;
    message?: string;
  };
  message?: string;
  status?: number | string;
  statusCode?: number;
};

const ERROR_STATUS_CODES: Record<string, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

function toPasswordSignInError(error: unknown): PasswordSignInError | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const authError = error as BetterAuthApiError;
  const status =
    typeof authError.statusCode === "number"
      ? authError.statusCode
      : typeof authError.status === "number"
        ? authError.status
        : typeof authError.status === "string"
          ? (ERROR_STATUS_CODES[authError.status] ?? 500)
          : 500;

  return {
    code: authError.body?.code ?? "AUTH_ERROR",
    message:
      authError.body?.message ?? authError.message ?? "Authentication failed",
    status,
  };
}

export const signInPassword = createServerFn({ method: "POST" })
  .validator(signInPasswordSchema)
  .handler(async ({ data }): Promise<PasswordSignInResult> => {
    const request = getRequest();

    try {
      const result = await getAuth().api.signInEmail({
        body: data,
        headers: request.headers,
        returnHeaders: true,
      });

      const cookies = result.headers?.getSetCookie();
      if (cookies?.length) {
        setResponseHeader("Set-Cookie", cookies);
      }

      return { ok: true };
    } catch (error) {
      const authError = toPasswordSignInError(error);
      if (authError) {
        return {
          ok: false,
          error:
            authError.status === 401
              ? {
                  ...authError,
                  code: "INVALID_EMAIL_OR_PASSWORD",
                  message: "Invalid email or password",
                }
              : authError,
        };
      }

      throw error;
    }
  });
