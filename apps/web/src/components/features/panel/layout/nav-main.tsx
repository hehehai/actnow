import { Link, useLocation } from "@tanstack/react-router";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavMainProps {
  items: {
    title: string;
    url: string;
    icon: string;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}

export function NavMain({ items }: NavMainProps) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0;
          const isSubItemActive = item.items?.some(
            (subItem) => pathname === subItem.url
          );
          // 有子菜单时用前缀匹配，无子菜单时用精确匹配
          const isItemActive = hasSubItems
            ? pathname === item.url || pathname.startsWith(`${item.url}/`)
            : pathname === item.url;
          const isActive = isItemActive || isSubItemActive;

          return (
            <Collapsible
              defaultOpen={isActive}
              key={item.title}
              render={
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isItemActive && !isSubItemActive}
                    render={
                      <Link to={item.url}>
                        <span className={cn("text-base", item.icon)} />
                        <span>{item.title}</span>
                      </Link>
                    }
                  />

                  {item.items?.length ? (
                    <>
                      <CollapsibleTrigger
                        render={
                          <SidebarMenuAction className="data-[state=open]:rotate-90">
                            <span className="i-hugeicons-arrow-right-01" />
                            <span className="sr-only">Toggle</span>
                          </SidebarMenuAction>
                        }
                      />
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                isActive={pathname === subItem.url}
                                render={
                                  <Link to={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                }
                              />
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </>
                  ) : null}
                </SidebarMenuItem>
              }
            />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
