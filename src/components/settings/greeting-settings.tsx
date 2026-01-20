import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SettingsGroup, SettingsItem } from "@/components/settings/settings";

const GREETING_ENABLED_KEY = "kiwi-greeting-enabled";
const GREETING_STORAGE_KEY = "kiwi-greeting";
const NAME_STORAGE_KEY = "kiwi-name";

export function GreetingSettings() {
    // State
    const [greetingEnabled, setGreetingEnabled] = useState(
        () => localStorage.getItem(GREETING_ENABLED_KEY) !== "false",
    );
    const [customGreeting, setCustomGreeting] = useState(
        () => localStorage.getItem(GREETING_STORAGE_KEY) || "",
    );
    const [customName, setCustomName] = useState(
        () => localStorage.getItem(NAME_STORAGE_KEY) || "",
    );

    // Persist greeting enabled state
    useEffect(() => {
        localStorage.setItem(GREETING_ENABLED_KEY, String(greetingEnabled));
        window.dispatchEvent(new Event("kiwi-settings-changed"));
    }, [greetingEnabled]);

    // Persist greeting changes
    useEffect(() => {
        if (customGreeting) {
            localStorage.setItem(GREETING_STORAGE_KEY, customGreeting);
        } else {
            localStorage.removeItem(GREETING_STORAGE_KEY);
        }
        window.dispatchEvent(new Event("kiwi-settings-changed"));
    }, [customGreeting]);

    // Persist name changes
    useEffect(() => {
        if (customName) {
            localStorage.setItem(NAME_STORAGE_KEY, customName);
        } else {
            localStorage.removeItem(NAME_STORAGE_KEY);
        }
        window.dispatchEvent(new Event("kiwi-settings-changed"));
    }, [customName]);

    return (
        <SettingsGroup title="Greeting">
            {/* Enable Greetings Switch */}
            <SettingsItem label="Enable Greetings">
                <Switch
                    checked={greetingEnabled}
                    onCheckedChange={setGreetingEnabled}
                />
            </SettingsItem>

            {/* Greeting and Name Customization - only show if enabled */}
            {greetingEnabled && (
                <SettingsItem label="Greeting">
                    <Input
                        value={customGreeting}
                        onChange={(e) => setCustomGreeting(e.target.value)}
                        placeholder="Bonjour"
                        className="w-40 text-sm"
                    />
                </SettingsItem>
            )}
            {greetingEnabled && (
                <SettingsItem label="Name">
                    <Input
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="there"
                        className="w-40 text-sm"
                    />
                </SettingsItem>
            )}
        </SettingsGroup>
    );
}
