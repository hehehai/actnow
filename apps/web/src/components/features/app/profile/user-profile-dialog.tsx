import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userProfileDialog } from "@/stores/handlers";
import { AccountTab } from "./account-tab";
import { AppearanceTab } from "./appearance-tab";
import { DataManagementTab } from "./data-management-tab";
import { SessionTab } from "./session-tab";
import { SubscriptionTab } from "./subscription-tab";

const TABS = [
  { value: "profile", label: "Profile", icon: "i-hugeicons-user-account" },
  { value: "session", label: "Security", icon: "i-hugeicons-clock-01" },
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

export function UserProfileDialog() {
  return (
    <Dialog handle={userProfileDialog}>
      <DialogContent className="max-w-3xl gap-0 rounded-2xl p-1 sm:max-w-3xl">
        <UserProfileContent />
      </DialogContent>
    </Dialog>
  );
}

function UserProfileContent() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="min-h-120">
      <DialogHeader className="p-4">
        <DialogTitle>Settings</DialogTitle>
      </DialogHeader>
      <Tabs
        onValueChange={setActiveTab}
        orientation="vertical"
        value={activeTab}
      >
        {/* Left sidebar with tabs */}
        <TabsList className="w-40 gap-2 bg-transparent p-2">
          {TABS.map((tab) => (
            <TabsTrigger
              className="justify-start gap-2 px-3 py-2 text-foreground hover:bg-muted data-active:bg-muted group-data-[variant=default]/tabs-list:data-active:shadow-none"
              key={tab.value}
              value={tab.value}
            >
              <span className={tab.icon} />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Right content area */}
        <div className="flex-1 overflow-auto">
          <TabsContent
            className="m-0 h-160 overflow-y-auto py-4 pr-6 pl-4"
            value="profile"
          >
            <AccountTab />
          </TabsContent>
          <TabsContent
            className="m-0 h-160 overflow-y-auto py-4 pr-6 pl-4"
            value="session"
          >
            <SessionTab />
          </TabsContent>
          <TabsContent
            className="m-0 h-160 overflow-y-auto py-4 pr-6 pl-4"
            value="appearance"
          >
            <AppearanceTab />
          </TabsContent>
          <TabsContent
            className="m-0 h-160 overflow-y-auto py-4 pr-6 pl-4"
            value="subscription"
          >
            <SubscriptionTab />
          </TabsContent>
          <TabsContent
            className="m-0 h-160 overflow-y-auto py-4 pr-6 pl-4"
            value="data"
          >
            <DataManagementTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
