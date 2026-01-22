import { useEffect, useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { VisualTabs } from "@/components/ui/visual-tabs";
import { SettingsGroup, SettingsItem } from "@/components/settings/settings";

const DOCK_ENABLED_KEY = "kiwi-dock-enabled";
const DOCK_POSITION_KEY = "kiwi-dock-position";

export type DockPosition = "left" | "bottom" | "right";

// Icons for Visual Tabs
const RightDockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="80"
    height="53"
    viewBox="0 0 80 53"
    fill="none"
    className="stroke-current"
  >
    <rect
      x="62"
      y="8"
      width="8"
      height="37"
      rx="4"
      fill="currentColor"
      fill-opacity="0.2"
      stroke="currentColor"
      stroke-width="2"
    />
    <rect
      x="1"
      y="1"
      width="78"
      height="51"
      rx="11"
      stroke="currentColor"
      stroke-width="2"
    />
  </svg>
);

const BottomDockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="80"
    height="53"
    viewBox="0 0 80 53"
    fill="none"
    className="stroke-current"
  >
    <rect
      x="1"
      y="1"
      width="78"
      height="51"
      rx="11"
      stroke="currentColor"
      stroke-width="2"
    />
    <rect
      x="72"
      y="35"
      width="8"
      height="64"
      rx="4"
      transform="rotate(90 72 35)"
      fill="currentColor"
      fill-opacity="0.2"
      stroke="currentColor"
      stroke-width="2"
    />
  </svg>
);

const LeftDockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="80"
    height="53"
    viewBox="0 0 80 53"
    fill="none"
    className="stroke-current"
  >
    <rect
      x="10"
      y="8"
      width="8"
      height="37"
      rx="4"
      fill="currentColor"
      fill-opacity="0.2"
      stroke="currentColor"
      stroke-width="2"
    />
    <rect
      x="1"
      y="1"
      width="78"
      height="51"
      rx="11"
      stroke="currentColor"
      stroke-width="2"
    />
  </svg>
);

export function DockSettings() {
  // State
  const [dockEnabled, setDockEnabled] = useState<boolean>(
    () => localStorage.getItem(DOCK_ENABLED_KEY) !== "false",
  );
  const [dockPosition, setDockPosition] = useState<DockPosition>(
    () => (localStorage.getItem(DOCK_POSITION_KEY) as DockPosition) || "bottom",
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

  // Persist dock enabled changes
  useEffect(() => {
    if (isInitialMount.current) return;
    localStorage.setItem(DOCK_ENABLED_KEY, String(dockEnabled));
    window.dispatchEvent(new Event("kiwi-dock-changed"));
  }, [dockEnabled]);

  // Persist dock position changes
  useEffect(() => {
    if (isInitialMount.current) return;
    localStorage.setItem(DOCK_POSITION_KEY, dockPosition);
    window.dispatchEvent(new Event("kiwi-dock-changed"));
  }, [dockPosition]);

  return (
    <SettingsGroup title="Dock">
      {/* Enable Dock Switch */}
      <SettingsItem label="Enable Dock">
        <Switch
          checked={dockEnabled}
          onCheckedChange={setDockEnabled}
        />
      </SettingsItem>

      {/* Dock Position - only show when enabled */}
      {dockEnabled && (
        <div className="px-4 pb-4 pt-2">
          <span className="text-sm font-medium mb-4 block">Dock Position</span>
          <VisualTabs
            value={dockPosition}
            onValueChange={(v) => setDockPosition(v as DockPosition)}
            options={[
              { value: "left", label: "Left", icon: <LeftDockIcon /> },
              { value: "bottom", label: "Bottom", icon: <BottomDockIcon /> },
              { value: "right", label: "Right", icon: <RightDockIcon /> },
            ]}
          />
        </div>
      )}
    </SettingsGroup>
  );
}
