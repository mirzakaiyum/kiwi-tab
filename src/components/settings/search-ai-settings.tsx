import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SettingsGroup, SettingsItem } from "@/components/settings/settings";
import CreateExpertDialog from "@/components/dialogs/create-expert-dialog";
import CreateShortcutDialog from "@/components/dialogs/create-shortcut-dialog";
import { type Expert } from "@/defaults/default-prompts";

const SEARCH_AI_ENABLED_KEY = "kiwi-search-ai-enabled";
const QUICK_SUGGESTIONS_ENABLED_KEY = "kiwi-quick-suggestions-enabled";

export function SearchAISettings() {
    const [searchAIEnabled, setSearchAIEnabled] = useState(
        () => localStorage.getItem(SEARCH_AI_ENABLED_KEY) !== "false",
    );
    const [quickSuggestionsEnabled, setQuickSuggestionsEnabled] = useState(
        () => localStorage.getItem(QUICK_SUGGESTIONS_ENABLED_KEY) !== "false",
    );
    const [expertDialogOpen, setExpertDialogOpen] = useState(false);
    const [shortcutDialogOpen, setShortcutDialogOpen] = useState(false);

    // Persist enabled state
    useEffect(() => {
        localStorage.setItem(SEARCH_AI_ENABLED_KEY, String(searchAIEnabled));
        window.dispatchEvent(new Event("kiwi-settings-changed"));
    }, [searchAIEnabled]);

    // Persist quick suggestions state
    useEffect(() => {
        localStorage.setItem(
            QUICK_SUGGESTIONS_ENABLED_KEY,
            String(quickSuggestionsEnabled),
        );
        window.dispatchEvent(new Event("kiwi-settings-changed"));
    }, [quickSuggestionsEnabled]);

    const handleSaveExpert = (expert: Expert) => {
        // TODO: Implement expert saving logic
        console.log("Saving expert:", expert);
    };

    const handleSaveShortcut = (
        shortcut: { id: string; name: string; prompt: string },
    ) => {
        // TODO: Implement shortcut saving logic
        console.log("Saving shortcut:", shortcut);
    };

    return (
        <>
            <SettingsGroup title="Search & AI">
                <SettingsItem label="Enable Search & AI">
                    <Switch
                        checked={searchAIEnabled}
                        onCheckedChange={setSearchAIEnabled}
                    />
                </SettingsItem>
                <SettingsItem label="Manage Experts">
                    <Button
                        className="text-xs font-semibold"
                        variant="secondary"
                        size="xs"
                        onClick={() => setExpertDialogOpen(true)}
                    >
                        Experts
                    </Button>
                </SettingsItem>
                <SettingsItem label="Manage Shortcuts">
                    <Button
                        className="text-xs font-semibold"
                        variant="secondary"
                        size="xs"
                        onClick={() => setShortcutDialogOpen(true)}
                    >
                        Shortcuts
                    </Button>
                </SettingsItem>
                <SettingsItem label="Quick Suggestions">
                    <Switch
                        checked={quickSuggestionsEnabled}
                        onCheckedChange={setQuickSuggestionsEnabled}
                    />
                </SettingsItem>
            </SettingsGroup>

            <CreateExpertDialog
                open={expertDialogOpen}
                onOpenChange={setExpertDialogOpen}
                onSave={handleSaveExpert}
            />

            <CreateShortcutDialog
                open={shortcutDialogOpen}
                onOpenChange={setShortcutDialogOpen}
                onSave={handleSaveShortcut}
            />
        </>
    );
}
