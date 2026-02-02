import { queryOptions } from "@tanstack/react-query";
import { getUser } from "@/functions/get-user";

export const authQueryOptions = () =>
  queryOptions({
    queryKey: ["user"],
    queryFn: ({ signal }) => getUser({ signal }),
  });

export type AuthQueryResult = Awaited<ReturnType<typeof getUser>>;
