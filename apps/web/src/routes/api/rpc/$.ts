import { createContext } from "@actnow/api/context";
import { appRouter } from "@actnow/api/routers/index";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ORPCError, onError, ValidationError } from "@orpc/server";
import type { FetchHandlerPlugin } from "@orpc/server/fetch";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { createFileRoute } from "@tanstack/react-router";
import * as z from "zod";

function handleValidationError(error: unknown) {
  if (
    error instanceof ORPCError &&
    error.code === "BAD_REQUEST" &&
    error.cause instanceof ValidationError
  ) {
    const zodError = new z.ZodError(error.cause.issues as z.core.$ZodIssue[]);
    throw new ORPCError("BAD_REQUEST", {
      status: 400,
      message: z.prettifyError(zodError).replaceAll("✖", ""),
      data: z.flattenError(zodError),
      cause: error.cause,
    });
  }
}

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
  clientInterceptors: [onError(handleValidationError)],
});

const referencePlugin = new OpenAPIReferencePlugin({
  schemaConverters: [new ZodToJsonSchemaConverter()],
}) as unknown as FetchHandlerPlugin<Awaited<ReturnType<typeof createContext>>>;

const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [referencePlugin],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
  clientInterceptors: [onError(handleValidationError)],
});

async function handle({ request }: { request: Request }) {
  const rpcResult = await rpcHandler.handle(request, {
    prefix: "/api/rpc",
    context: await createContext({ req: request }),
  });
  if (rpcResult.response) return rpcResult.response;

  const apiResult = await apiHandler.handle(request, {
    prefix: "/api/rpc/api-reference",
    context: await createContext({ req: request }),
  });
  if (apiResult.response) return apiResult.response;

  return new Response("Not found", { status: 404 });
}

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      ANY: handle,
    },
  },
});
