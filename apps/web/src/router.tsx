import { createRouter } from "@tanstack/react-router";
import Loader from "./components/shared/loader";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { orpc, queryClient } from "./lib/orpc";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    context: { orpc, queryClient },
    defaultPendingMs: 5000,
    defaultPendingComponent: () => (
      <div className="flex h-full w-full items-center justify-center">
        <Loader />
      </div>
    ),
    defaultNotFoundComponent: () => <div>Not Found</div>,
    Wrap: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
