import { useTheme } from "@/components/shared/theme-provider";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", icon: "i-hugeicons-sun-01", label: "Light" },
  { value: "dark", icon: "i-hugeicons-moon-01", label: "Dark" },
  { value: "system", icon: "i-hugeicons-computer-phone-sync", label: "System" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
      {themes.map(({ value, icon, label }) => (
        <button
          aria-label={label}
          className={cn(
            "flex size-5 items-center justify-center rounded-md text-sm transition-colors",
            theme === value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          key={value}
          onClick={() => setTheme(value)}
          type="button"
        >
          <span className={icon} />
        </button>
      ))}
    </div>
  );
}
