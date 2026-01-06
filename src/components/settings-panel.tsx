import { useState, useEffect } from "react";
import { Settings, CircleHelp, MonitorCog, Sun, MoonStar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/components/theme-provider";

const GREETING_STORAGE_KEY = "kiwi-greeting";
const NAME_STORAGE_KEY = "kiwi-name";
const BACKGROUND_TYPE_KEY = "kiwi-background-type";
const BACKGROUND_FREQUENCY_KEY = "kiwi-background-frequency";

type BackgroundFrequency = "1hour" | "1day" | "1week" | "never";

export function SettingsButton() {
    const { theme, setTheme } = useTheme();
    const [customGreeting, setCustomGreeting] = useState(() => 
        localStorage.getItem(GREETING_STORAGE_KEY) || ""
    );
    const [customName, setCustomName] = useState(() => 
        localStorage.getItem(NAME_STORAGE_KEY) || ""
    );
    const [backgroundType, setBackgroundType] = useState<"minimal" | "alive">(() => 
        (localStorage.getItem(BACKGROUND_TYPE_KEY) as "minimal" | "alive") || "minimal"
    );
    const [backgroundFrequency, setBackgroundFrequency] = useState<BackgroundFrequency>(() => 
        (localStorage.getItem(BACKGROUND_FREQUENCY_KEY) as BackgroundFrequency) || "never"
    );


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

    // Persist background type changes
    useEffect(() => {
        localStorage.setItem(BACKGROUND_TYPE_KEY, backgroundType);
        // Dispatch event so App can update background
        window.dispatchEvent(new Event("kiwi-background-changed"));
    }, [backgroundType]);

    // Persist background frequency changes
    useEffect(() => {
        localStorage.setItem(BACKGROUND_FREQUENCY_KEY, backgroundFrequency);
        // Dispatch event so App can update background shuffle
        window.dispatchEvent(new Event("kiwi-background-changed"));
    }, [backgroundFrequency]);



    return (
        <TooltipProvider>
            <Drawer direction="right">
                <DrawerTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="fixed bottom-4 right-4 rounded-full bg-background/10 backdrop-blur-xl border border-border hover:bg-input"
                    >
                        <Settings className="size-3" />
                        <span className="sr-only">Settings</span>
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="flex flex-col max-h-screen">
                            <DrawerHeader>
                                <DrawerTitle>Settings</DrawerTitle>
                                <DrawerDescription>
                                    Customize your Kiwi Tab experience.
                                </DrawerDescription>
                            </DrawerHeader>
                            
                            <div className="p-4 space-y-6 overflow-y-auto flex-1">
                                {/* General */}
                                <div className="space-y-2">
                                    <h3 className="text-xs opacity-50 uppercase tracking-widest">General</h3>
                                    <div className="divide-y divide-border/50 bg-foreground/5 rounded-lg">
                                        {/* Language */}
                                        <div className="flex items-center justify-between p-3">
                                            <span className="text-sm">Language</span>
                                            <span className="text-sm px-3 py-1.5 rounded-md bg-background text-muted-foreground">English</span>
                                        </div>

                                        {/* Theme */}
                                        <div className="flex items-center justify-between p-3">
                                            <span className="text-sm">Dark mode</span>
                                            <div className="bg-background inline-flex items-center overflow-hidden rounded-md p-0.5">
                                                {[
                                                    { icon: "monitor", value: "system" as const, label: "System" },
                                                    { icon: "sun", value: "light" as const, label: "Light" },
                                                    { icon: "moon", value: "dark" as const, label: "Dark" },
                                                ].map((option) => {
                                                    // Disable non-dark themes when Alive background is selected
                                                    const isDisabled = backgroundType === "alive" && option.value !== "dark";
                                                    return (
                                                        <button
                                                            key={option.value}
                                                            disabled={isDisabled}
                                                            className={cn(
                                                                "relative flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-all",
                                                                isDisabled
                                                                    ? "opacity-40 cursor-not-allowed"
                                                                    : "cursor-pointer",
                                                                theme === option.value
                                                                    ? "text-foreground bg-muted border"
                                                                    : "text-muted-foreground border border-transparent hover:text-foreground"
                                                            )}
                                                            onClick={() => !isDisabled && setTheme(option.value)}
                                                            aria-label={`Switch to ${option.value} theme`}
                                                        >
                                                            {option.icon === "monitor" && <MonitorCog className="size-3" />}
                                                            {option.icon === "sun" && <Sun className="size-3" />}
                                                            {option.icon === "moon" && <MoonStar className="size-3" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Personalization */}
                                <div className="space-y-2">
                                    <h3 className="text-xs opacity-50 uppercase tracking-widest">Personalization</h3>
                                    <div className="divide-y divide-border/50 bg-foreground/5 rounded-lg">
                                        {/* Greeting Customization */}
                                        <div className="flex items-center justify-between gap-4 p-3">
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <span>Greeting</span>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <CircleHelp className="size-3.5 text-muted-foreground cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="border border-border bg-background">
                                                        <p>Leave empty for time-based greeting</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <Input
                                                value={customGreeting}
                                                onChange={(e) => setCustomGreeting(e.target.value)}
                                                placeholder="Good Morning"
                                                className="bg-background border-transparent w-40 text-sm"
                                            />
                                        </div>

                                        {/* Name Customization */}
                                        <div className="flex items-center justify-between gap-4 p-3">
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <span>Name</span>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <CircleHelp className="size-3.5 text-muted-foreground cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="border border-border bg-background">
                                                        <p>Leave empty to show "there"</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <Input
                                                value={customName}
                                                onChange={(e) => setCustomName(e.target.value)}
                                                placeholder="there"
                                                className="bg-background border-transparent w-40 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>



                                {/* Background */}
                                <div className="space-y-2">
                                    <h3 className="text-xs opacity-50 uppercase tracking-widest">Background</h3>
                                    <div className="divide-y divide-border/50 bg-foreground/5 rounded-lg">
                                        {/* Background Type */}
                                        <div className="flex items-center justify-between p-3">
                                            <span className="text-sm">Background type</span>
                                            <div className="bg-background inline-flex items-center overflow-hidden rounded-md p-0.5">
                                                {[
                                                    { value: "minimal" as const, label: "Minimal" },
                                                    { value: "alive" as const, label: "Alive" },
                                                ].map((option) => (
                                                    <button
                                                        key={option.value}
                                                        className={cn(
                                                            "relative flex items-center gap-1.5 px-2.5 py-1 text-xs cursor-pointer rounded transition-all",
                                                            backgroundType === option.value
                                                                ? "text-foreground bg-muted border"
                                                                : "text-muted-foreground border border-transparent hover:text-foreground"
                                                        )}
                                                        onClick={() => {
                                                            setBackgroundType(option.value);
                                                            // Alive mode requires dark theme
                                                            if (option.value === "alive") {
                                                                setTheme("dark");
                                                            }
                                                        }}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Frequency - only show when Alive is selected */}
                                        {backgroundType === "alive" && (
                                            <div className="flex items-center justify-between p-3">
                                                <span className="text-sm">Frequency</span>
                                                <div className="bg-background inline-flex items-center overflow-hidden rounded-md p-0.5">
                                                    {[
                                                        { value: "1hour" as const, label: "1h" },
                                                        { value: "1day" as const, label: "1d" },
                                                        { value: "1week" as const, label: "1w" },
                                                        { value: "never" as const, label: "Never" },
                                                    ].map((option) => (
                                                        <button
                                                            key={option.value}
                                                            className={cn(
                                                                "relative flex items-center gap-1.5 px-2 py-1 text-xs cursor-pointer rounded transition-all",
                                                                backgroundFrequency === option.value
                                                                    ? "text-foreground bg-muted border"
                                                                    : "text-muted-foreground border border-transparent hover:text-foreground"
                                                            )}
                                                            onClick={() => setBackgroundFrequency(option.value)}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Acknowledgment */}
                                <div className="text-center pt-4 space-y-1">
                                    <p className="text-xs text-muted-foreground/60">Kiwi Tab v0.0.2-alpha</p>
                                    <p className="text-xs text-muted-foreground/60">Made with ❤️ in Bangladesh!</p>
                                    <p className="text-xs text-muted-foreground/60">By Kaiyum Mirza.</p>
                                </div>
                            </div>

                            <DrawerFooter>
                                <DrawerClose asChild>
                                    <Button variant="outline">Close</Button>
                                </DrawerClose>
                            </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </TooltipProvider>
    );
}

export default SettingsButton;
