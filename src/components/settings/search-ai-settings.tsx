import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SettingsGroup, SettingsItem } from "@/components/settings/settings";
import CreateExpertDialog from "@/components/dialogs/create-expert-dialog";
import CreateShortcutDialog from "@/components/dialogs/create-shortcut-dialog";
import {
    type Expert,
    DEFAULT_EXPERTS,
    type UserShortcut,
    DEFAULT_SHORTCUTS,
} from "@/defaults/default-prompts";

const SEARCH_AI_ENABLED_KEY = "kiwi-search-ai-enabled";
const QUICK_SUGGESTIONS_ENABLED_KEY = "kiwi-quick-suggestions-enabled";
const EXPERTS_LIST_KEY = "kiwi-experts";
const SHORTCUTS_LIST_KEY = "kiwi-user-shortcuts";

// Load experts from localStorage
function getExperts(): Expert[] {
    try {
        const saved = localStorage.getItem(EXPERTS_LIST_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Ensure all experts have an icon (for backwards compatibility)
            return parsed.map((e: Expert) => ({
                ...e,
                icon:
                    e.icon ||
                    DEFAULT_EXPERTS.find((d) => d.id === e.id)?.icon ||
                    "Sparkles",
            }));
        }
    } catch {}
    return DEFAULT_EXPERTS;
}

// Load shortcuts from localStorage
function getShortcuts(): UserShortcut[] {
    try {
        const saved = localStorage.getItem(SHORTCUTS_LIST_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch {}
    return DEFAULT_SHORTCUTS;
}

export function SearchAISettings() {
    const [searchAIEnabled, setSearchAIEnabled] = useState(
        () => localStorage.getItem(SEARCH_AI_ENABLED_KEY) !== "false",
    );
    const [quickSuggestionsEnabled, setQuickSuggestionsEnabled] = useState(
        () => localStorage.getItem(QUICK_SUGGESTIONS_ENABLED_KEY) !== "false",
    );
    const [expertDialogOpen, setExpertDialogOpen] = useState(false);
    const [shortcutDialogOpen, setShortcutDialogOpen] = useState(false);
    const [experts, setExperts] = useState<Expert[]>(getExperts);
    const [shortcuts, setShortcuts] = useState<UserShortcut[]>(getShortcuts);

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

    // Persist experts list
    useEffect(() => {
        localStorage.setItem(EXPERTS_LIST_KEY, JSON.stringify(experts));
        window.dispatchEvent(new Event("kiwi-settings-changed"));
    }, [experts]);

    // Persist shortcuts list
    useEffect(() => {
        localStorage.setItem(SHORTCUTS_LIST_KEY, JSON.stringify(shortcuts));
        window.dispatchEvent(new Event("kiwi-settings-changed"));
    }, [shortcuts]);

    const handleSaveExpert = (expert: Expert, isEdit: boolean) => {
        if (isEdit) {
            // Update existing expert
            const updatedExperts = experts.map((e) =>
                e.id === expert.id ? expert : e,
            );
            setExperts(updatedExperts);
        } else {
            // Add new expert
            const exists = experts.findIndex((e) => e.id === expert.id);
            let next: Expert[];
            if (exists >= 0) {
                const copy = experts.slice();
                copy.splice(exists, 1);
                next = [expert, ...copy].slice(0, 10);
            } else {
                next = [expert, ...experts].slice(0, 10);
            }
            setExperts(next);
        }
    };

    const handleDeleteExpert = (id: string) => {
        const filtered = experts.filter((e) => e.id !== id);
        setExperts(filtered);
    };

    const handleSaveShortcut = (shortcut: UserShortcut, isEdit: boolean) => {
        if (isEdit) {
            // Update existing shortcut
            const updatedShortcuts = shortcuts.map((s) =>
                s.id === shortcut.id ? shortcut : s,
            );
            setShortcuts(updatedShortcuts);
        } else {
            // Add new shortcut
            const exists = shortcuts.findIndex((s) => s.id === shortcut.id);
            let next: UserShortcut[];
            if (exists >= 0) {
                const copy = shortcuts.slice();
                copy.splice(exists, 1);
                next = [shortcut, ...copy].slice(0, 6);
            } else {
                next = [shortcut, ...shortcuts].slice(0, 6);
            }
            setShortcuts(next);
        }
    };

    const handleDeleteShortcut = (id: string) => {
        const filtered = shortcuts.filter((s) => s.id !== id);
        setShortcuts(filtered);
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
                onDelete={handleDeleteExpert}
                experts={experts}
                maxReached={experts.length >= 10}
            />

            <CreateShortcutDialog
                open={shortcutDialogOpen}
                onOpenChange={setShortcutDialogOpen}
                onSave={handleSaveShortcut}
                onDelete={handleDeleteShortcut}
                shortcuts={shortcuts}
                maxReached={shortcuts.length >= 6}
            />
        </>
    );
}
