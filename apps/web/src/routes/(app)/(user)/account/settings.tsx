import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AccountTab } from "@/components/features/app/profile/account-tab";
import { AppearanceTab } from "@/components/features/app/profile/appearance-tab";
import { DataManagementTab } from "@/components/features/app/profile/data-management-tab";
import { SessionTab } from "@/components/features/app/profile/session-tab";
import { SubscriptionTab } from "@/components/features/app/profile/subscription-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/(app)/(user)/account/settings")({
  component: AccountSettingsPage,
});

const tabs = [
  { value: "profile", label: "Profile", icon: "i-hugeicons-user-account" },
  { value: "security", label: "Security", icon: "i-hugeicons-shield-01" },
  {
    value: "appearance",
    label: "Appearance",
    icon: "i-hugeicons-paint-brush-01",
  },
  {
    value: "subscription",
    label: "Subscription",
    icon: "i-hugeicons-credit-card",
  },
  { value: "data", label: "Data", icon: "i-hugeicons-database" },
] as const;

function AccountSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  return (
    <div className="space-y-6">
      <header>
        <p className="font-medium text-[11px] text-brand uppercase tracking-[0.16em]">
          Account
        </p>
        <h1 className="mt-2 text-balance font-medium text-3xl tracking-tight">
          Settings
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Manage your profile, security, appearance, and data.
        </p>
      </header>
      <Tabs
        className="min-w-0 gap-5 sm:flex-row"
        onValueChange={setActiveTab}
        orientation="vertical"
        value={activeTab}
      >
        <TabsList className="h-fit w-full shrink-0 flex-row overflow-x-auto rounded-xl bg-transparent p-0 sm:w-44 sm:flex-col sm:items-stretch sm:gap-1">
          {tabs.map((tab) => (
            <TabsTrigger
              className="min-h-10 flex-none justify-start gap-2 rounded-xl px-3 py-2 text-foreground hover:bg-card/70 data-active:bg-card data-active:shadow-xs sm:w-full"
              key={tab.value}
              value={tab.value}
            >
              <span className={`${tab.icon} size-4 shrink-0`} />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="min-w-0 flex-1">
          <TabsContent className="m-0" value="profile">
            <AccountTab />
          </TabsContent>
          <TabsContent className="m-0" value="security">
            <SessionTab />
          </TabsContent>
          <TabsContent className="m-0" value="appearance">
            <AppearanceTab />
          </TabsContent>
          <TabsContent className="m-0" value="subscription">
            <SubscriptionTab />
          </TabsContent>
          <TabsContent className="m-0" value="data">
            <DataManagementTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
