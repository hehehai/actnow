import { createFileRoute } from "@tanstack/react-router";
import { SettingsPanel } from "@/components/features/app/account/settings-panel";
import { AppearanceTab } from "@/components/features/app/profile/appearance-tab";
import { DataManagementTab } from "@/components/features/app/profile/data-management-tab";

export const Route = createFileRoute("/(app)/(user)/account/settings")({
  component: AccountSettingsPage,
});

function AccountSettingsPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="font-medium text-[11px] text-brand uppercase tracking-[0.16em]">
          Account
        </p>
        <h1 className="mt-2 text-balance font-medium text-3xl tracking-tight">
          Settings
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Manage your appearance and account data.
        </p>
      </header>
      <SettingsPanel title="Appearance">
        <AppearanceTab />
      </SettingsPanel>
      <SettingsPanel title="Data">
        <DataManagementTab />
      </SettingsPanel>
    </div>
  );
}
