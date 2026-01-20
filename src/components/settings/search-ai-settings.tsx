import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { SettingsGroup, SettingsItem } from "@/components/settings/settings";

const SEARCH_AI_ENABLED_KEY = "kiwi-search-ai-enabled";

export function SearchAISettings() {
    const [searchAIEnabled, setSearchAIEnabled] = useState(
        () => localStorage.getItem(SEARCH_AI_ENABLED_KEY) !== "false",
    );

    // Persist enabled state
    useEffect(() => {
        localStorage.setItem(SEARCH_AI_ENABLED_KEY, String(searchAIEnabled));
        window.dispatchEvent(new Event("kiwi-settings-changed"));
    }, [searchAIEnabled]);

    return (
        <SettingsGroup title="Search & AI">
            <SettingsItem label="Enable Search & AI">
                <Switch
                    checked={searchAIEnabled}
                    onCheckedChange={setSearchAIEnabled}
                />
            </SettingsItem>
        </SettingsGroup>
    );
}
