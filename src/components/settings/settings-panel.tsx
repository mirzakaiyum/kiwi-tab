import { useEffect, useState } from "react";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GeneralSettings } from "@/components/settings/general-settings";
import { GreetingSettings } from "@/components/settings/greeting-settings";
import { BackgroundSettings } from "@/components/settings/background-settings";
import { SearchAISettings } from "@/components/settings/search-ai-settings";
import { WidgetSettings } from "@/components/settings/widget-settings";
import { DockSettings } from "@/components/settings/dock-settings";
import { FooterSettings } from "./footer-settings";

export function SettingsButton() {
    const [isOpen, setIsOpen] = useState(false);

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

    return (
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

                <ScrollArea className="flex-1">
                    <div className="px-4 space-y-6">
                        <GeneralSettings />
                        <GreetingSettings />
                        <SearchAISettings />
                        <BackgroundSettings />
                        <WidgetSettings />
                        <DockSettings />
                        <FooterSettings />
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}

export default SettingsButton;
