import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/login")({
  component: RouteComponent,
});

function RouteComponent() {
  // Redirect to the proper signin page
  return <Navigate to="/signin" />;
}
