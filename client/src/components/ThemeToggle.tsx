import { Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled
      aria-disabled="true"
      title="Light mode is enforced"
      className="w-10 h-10 opacity-50 cursor-not-allowed"
      data-testid="button-theme-toggle"
    >
      <Sun className="w-5 h-5" />
      <span className="sr-only">Theme is locked to light</span>
    </Button>
  );
}
