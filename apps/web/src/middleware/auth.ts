import { getAuth } from "@actnow/auth";
import { UserRole } from "@actnow/common";
import { notFound, redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await getAuth().api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      setResponseStatus(401);
      throw new Error("Unauthorized");
    }

    return next({
      context: { session },
    });
  }
);

export const authInterceptor = createMiddleware().server(
  async ({ next, request }) => {
    const session = await getAuth().api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      throw redirect({ to: "/signin" });
    }

    return next({
      context: { session },
    });
  }
);

export const adminInterceptor = createMiddleware().server(
  async ({ next, request }) => {
    const session = await getAuth().api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      throw redirect({ to: "/signin" });
    }

    if (session.user.role !== UserRole.ADMIN) {
      throw notFound();
    }

    return next({
      context: { session },
    });
  }
);
