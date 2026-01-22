import { useEffect, useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { SettingsGroup, SettingsItem } from "@/components/settings/settings";

const WIDGETS_ENABLED_KEY = "kiwi-widgets-enabled";

export function WidgetSettings() {
  // State
  const [widgetsEnabled, setWidgetsEnabled] = useState<boolean>(
    () => localStorage.getItem(WIDGETS_ENABLED_KEY) !== "false",
  );

  // Track if this is the initial mount to prevent unnecessary events
  const isInitialMount = useRef(true);

  // Mark initial mount complete synchronously before other effects
  useEffect(() => {
    // Use a microtask to ensure this runs after the initial render effects
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Persist widgets enabled changes
  useEffect(() => {
    if (isInitialMount.current) return;
    localStorage.setItem(WIDGETS_ENABLED_KEY, String(widgetsEnabled));
    window.dispatchEvent(new Event("kiwi-widgets-changed"));
  }, [widgetsEnabled]);

  return (
    <SettingsGroup title="Widgets">
      {/* Enable Widgets Switch */}
      <SettingsItem label="Enable Widgets">
        <Switch
          checked={widgetsEnabled}
          onCheckedChange={setWidgetsEnabled}
        />
      </SettingsItem>
    </SettingsGroup>
  );
}
