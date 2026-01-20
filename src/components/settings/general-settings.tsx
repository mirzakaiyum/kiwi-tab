import { SettingsGroup, SettingsItem } from "@/components/settings/settings";

export function GeneralSettings() {
  return (
    <SettingsGroup title="General">
      <SettingsItem label="Language">
        <span className="text-sm px-3 py-1.5 rounded-md bg-background text-muted-foreground">
          English
        </span>
      </SettingsItem>
    </SettingsGroup>
  );
}
