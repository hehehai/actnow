import { createFileRoute } from "@tanstack/react-router";
import { SettingsPanel } from "@/components/features/app/account/settings-panel";
import { AccountTab } from "@/components/features/app/profile/account-tab";
import { SessionTab } from "@/components/features/app/profile/session-tab";

export const Route = createFileRoute("/(app)/(user)/account/profile")({
  component: AccountProfilePage,
});

function AccountProfilePage() {
  return (
    <div className="space-y-8">
      <SettingsPanel title="Profile & account">
        <AccountTab />
      </SettingsPanel>
      <SettingsPanel title="Security">
        <SessionTab />
      </SettingsPanel>
    </div>
  );
}
