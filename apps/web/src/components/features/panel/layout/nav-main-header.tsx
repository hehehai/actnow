import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { NavThemeToggle } from "./nav-theme-toggle";

interface NavMainHeaderProps
  extends Omit<React.HTMLAttributes<HTMLHeadElement>, "title"> {
  left?: React.ReactNode;
  right?: React.ReactNode;
  tabLeft?: React.ReactNode;
  tabRight?: React.ReactNode;
  tabItems?: string[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

export const NavMainHeader = ({
  left,
  right,
  tabLeft,
  tabRight,
  tabItems,
  activeTab,
  onTabChange,
  children,
  className,
  ...props
}: NavMainHeaderProps) => (
  <div
    className={cn(
      "w-full space-y-3.5 border-border border-b pt-3.5 pb-3.5",
      className
    )}
    {...props}
  >
    <header
      className={cn("flex shrink-0 items-center justify-between gap-2 px-4")}
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 size-8 bg-accent/60" />
        {left}
      </div>
      {children}
      <div className="flex items-center justify-end gap-2">
        {right}
        <NavThemeToggle />
      </div>
    </header>
    {!tabItems?.length && tabLeft && tabRight && (
      <div className="flex items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2">
          {!tabItems?.length && (
            <Tabs onValueChange={onTabChange} value={activeTab}>
              <TabsList className="bg-muted/50">
                {tabItems?.map((item) => (
                  <TabsTrigger
                    className="px-2.5 text-sm"
                    key={item}
                    value={item.toUpperCase()}
                  >
                    {item}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
          {tabLeft}
        </div>
        {tabRight}
      </div>
    )}
  </div>
);
