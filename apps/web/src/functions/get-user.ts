import { getAuth } from "@actnow/auth";
import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";

export const getUser = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const session = await getAuth().api.getSession({
    headers: request.headers,
    returnHeaders: true,
  });

  // Forward any Set-Cookie headers to the client, e.g. for session/cache refresh
  const cookies = session?.headers?.getSetCookie();
  if (cookies?.length) {
    setResponseHeader("Set-Cookie", cookies);
  }

  return session.response?.user || null;
});
