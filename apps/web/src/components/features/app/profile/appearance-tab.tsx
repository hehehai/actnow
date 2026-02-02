import { useTheme } from "@/components/shared/theme-provider";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", icon: "i-hugeicons-sun-01", label: "Light" },
  { value: "dark", icon: "i-hugeicons-moon-01", label: "Dark" },
  {
    value: "system",
    icon: "i-hugeicons-computer-phone-sync",
    label: "System",
  },
] as const;

export function AppearanceTab() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div>
          <h3 className="font-medium">Theme</h3>
          <p className="text-muted-foreground text-sm">
            Select your preferred theme for the interface.
          </p>
        </div>
        <div className="flex gap-3">
          {themes.map(({ value, icon, label }) => (
            <button
              className={cn(
                "flex flex-1 flex-col items-center gap-2 rounded-lg border p-4 transition-colors",
                theme === value
                  ? "border-primary/10 bg-muted"
                  : "hover:border-foreground/20"
              )}
              key={value}
              onClick={() => setTheme(value)}
              type="button"
            >
              <span className={cn(icon, "size-6")} />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
