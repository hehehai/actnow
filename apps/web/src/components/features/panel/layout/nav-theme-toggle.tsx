import { useTheme } from "@/components/shared/theme-provider";
import { Button } from "@/components/ui/button";

const themeIconMap: Record<string, string> = {
  light: "i-hugeicons-sun-01",
  dark: "i-hugeicons-moon-01",
  system: "i-hugeicons-computer-phone-sync",
};

export const NavThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const handleChange = () => {
    const nextTheme =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(nextTheme);
  };

  return (
    <Button
      className="bg-accent/60 text-base"
      onClick={handleChange}
      size="icon"
      variant="ghost"
    >
      <span className={themeIconMap[theme || "system"]} />
    </Button>
  );
};
