import { Link } from "@tanstack/react-router";
import type * as React from "react";
import Logo from "@/components/shared/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser, type NavUserProps } from "./nav-user";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/panel",
      icon: "i-hugeicons-analytics-01",
      isActive: true,
    },
    {
      title: "Users",
      url: "/panel/users",
      icon: "i-hugeicons-user-settings-01",
    },
    {
      title: "Posts",
      url: "/panel/posts",
      icon: "i-hugeicons-task-daily-02",
    },
    {
      title: "Tags",
      url: "/panel/tags",
      icon: "i-hugeicons-tags",
    },
    {
      title: "Feedback",
      url: "/panel/feedback",
      icon: "i-hugeicons-chat-feedback-01",
    },
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: NavUserProps["initialUser"] | null;
}) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="[&_svg]:size-9"
              render={
                <Link to="/">
                  <Logo />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Refto</span>
                    <span className="truncate text-xs">Admin Panel</span>
                  </div>
                </Link>
              }
              size="lg"
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser initialUser={user} />}</SidebarFooter>
    </Sidebar>
  );
}
