import { createFileRoute } from "@tanstack/react-router";
import { SettingsPanel } from "@/components/features/app/account/settings-panel";
import { SubscriptionTab } from "@/components/features/app/profile/subscription-tab";

export const Route = createFileRoute("/(app)/(user)/account/subscription")({
  component: AccountSubscriptionPage,
});

function AccountSubscriptionPage() {
  return (
    <SettingsPanel title="Subscription">
      <SubscriptionTab />
    </SettingsPanel>
  );
}
