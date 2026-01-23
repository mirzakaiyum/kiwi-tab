import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Languages, Tv } from "lucide-react";

const QUICK_SUGGESTIONS = [
  { label: "Translate", icon: Languages },
  { label: "Net Worth", icon: DollarSign },
  { label: "What to watch", icon: Tv },
  { label: "Upcoming Events", icon: Calendar },
];

const QUICK_SUGGESTIONS_ENABLED_KEY = "kiwi-quick-suggestions-enabled";

export interface QuickSuggestionsProps {
  onSelect: (suggestion: string) => void;
}

export function QuickSuggestions({ onSelect }: QuickSuggestionsProps) {
  const [enabled, setEnabled] = React.useState(
    () => localStorage.getItem(QUICK_SUGGESTIONS_ENABLED_KEY) !== "false",
  );

  React.useEffect(() => {
    const handleSettingsChange = () => {
      setEnabled(
        localStorage.getItem(QUICK_SUGGESTIONS_ENABLED_KEY) !== "false",
      );
    };
    window.addEventListener("kiwi-settings-changed", handleSettingsChange);
    return () =>
      window.removeEventListener(
        "kiwi-settings-changed",
        handleSettingsChange,
      );
  }, []);

  if (!enabled) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2 px-1 pt-4">
      {QUICK_SUGGESTIONS.map((s) => {
        const Icon = s.icon;
        return (
          <Button
            key={s.label}
            variant="ghost"
            onClick={() => onSelect(s.label)}
            className="cursor-pointer border border-border text-muted-foreground dark:bg-foreground/10 dark:hover:bg-foreground/20 rounded-full px-3 py-1 text-sm gap-1.5"
          >
            <Icon className="size-3.5" />
            {s.label}
          </Button>
        );
      })}
    </div>
  );
}
