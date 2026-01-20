import { useEffect, useState } from "react";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GeneralSettings } from "@/components/settings/general-settings";
import { GreetingSettings } from "@/components/settings/greeting-settings";
import { BackgroundSettings } from "@/components/settings/background-settings";

const GREETING_ENABLED_KEY = "kiwi-greeting-enabled";
const GREETING_STORAGE_KEY = "kiwi-greeting";
const NAME_STORAGE_KEY = "kiwi-name";

export function SettingsButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [greetingEnabled, setGreetingEnabled] = useState(() =>
        localStorage.getItem(GREETING_ENABLED_KEY) !== "false"
    );
    const [customGreeting, setCustomGreeting] = useState(() =>
        localStorage.getItem(GREETING_STORAGE_KEY) || ""
    );
    const [customName, setCustomName] = useState(() =>
        localStorage.getItem(NAME_STORAGE_KEY) || ""
    );

    // Listen for event to open settings from dock
    useEffect(() => {
        const handleOpenSettings = () => setIsOpen(true);
        window.addEventListener("kiwi-open-settings", handleOpenSettings);
        return () =>
            window.removeEventListener(
                "kiwi-open-settings",
                handleOpenSettings,
            );
    }, []);

    // Persist greeting enabled state
    useEffect(() => {
        localStorage.setItem(GREETING_ENABLED_KEY, String(greetingEnabled));
        // Dispatch event so chatbox can update
        window.dispatchEvent(new Event("kiwi-settings-changed"));
    }, [greetingEnabled]);

    // Persist greeting changes
    useEffect(() => {
        if (customGreeting) {
            localStorage.setItem(GREETING_STORAGE_KEY, customGreeting);
        } else {
            localStorage.removeItem(GREETING_STORAGE_KEY);
        }
        // Dispatch event so chatbox can update
        window.dispatchEvent(new Event("kiwi-settings-changed"));
    }, [customGreeting]);

    // Persist name changes
    useEffect(() => {
        if (customName) {
            localStorage.setItem(NAME_STORAGE_KEY, customName);
        } else {
            localStorage.removeItem(NAME_STORAGE_KEY);
        }
        // Dispatch event so chatbox can update
        window.dispatchEvent(new Event("kiwi-settings-changed"));
    }, [customName]);

    return (
        <TooltipProvider>
            <Sheet modal={false} open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent
                    side="right"
                    className="flex flex-col overflow-hidden"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <SheetHeader>
                        <SheetTitle>Settings</SheetTitle>
                        <SheetDescription>
                            Customize your Kiwi Tab experience.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="px-4 space-y-6 overflow-y-auto flex-1">
                        <GeneralSettings />

                        <GreetingSettings
                            greetingEnabled={greetingEnabled}
                            onGreetingEnabledChange={setGreetingEnabled}
                            customGreeting={customGreeting}
                            onCustomGreetingChange={setCustomGreeting}
                            customName={customName}
                            onCustomNameChange={setCustomName}
                        />

                        <BackgroundSettings />

                        {/* Acknowledgment */}
                        <div className="text-center pt-4 space-y-1">
                            <p className="text-xs text-muted-foreground/60">
                                Kiwi Tab v{__APP_VERSION__}
                            </p>
                            <p className="text-xs text-muted-foreground/60">
                                Made with ❤️ in Bangladesh!
                            </p>
                            <p className="text-xs text-muted-foreground/60">
                                By Kaiyum Mirza.
                            </p>
                            <button
                                onClick={() => {
                                    if (
                                        confirm(
                                            "This will reset all settings and reload the page. Continue?",
                                        )
                                    ) {
                                        localStorage.clear();
                                        window.location.reload();
                                    }
                                }}
                                className="text-xs text-primary hover:text-foreground mt-2 cursor-pointer"
                            >
                                Reset Settings
                            </button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </TooltipProvider>
    );
}

export default SettingsButton;
