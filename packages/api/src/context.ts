import { getAuth } from "@actnow/auth";
import { createDb } from "@actnow/db";

export async function createContext({ req }: { req: Request }) {
  const session = await getAuth().api.getSession({
    headers: req.headers,
  });

  return {
    session,
    db: createDb(),
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
