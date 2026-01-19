import { useState, useEffect } from "react";
import { CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";


const GREETING_STORAGE_KEY = "kiwi-greeting";
const NAME_STORAGE_KEY = "kiwi-name";
const BACKGROUND_TYPE_KEY = "kiwi-background-type";
const BACKGROUND_FREQUENCY_KEY = "kiwi-background-frequency";

type BackgroundFrequency = "1hour" | "1day" | "1week" | "never";

export function SettingsButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [customGreeting, setCustomGreeting] = useState(() => 
        localStorage.getItem(GREETING_STORAGE_KEY) || ""
    );
    const [customName, setCustomName] = useState(() => 
        localStorage.getItem(NAME_STORAGE_KEY) || ""
    );
    const [backgroundType, setBackgroundType] = useState<"none" | "images" | "videos">(() => 
        (localStorage.getItem(BACKGROUND_TYPE_KEY) as "none" | "images" | "videos") || "videos"
    );
    const [backgroundFrequency, setBackgroundFrequency] = useState<BackgroundFrequency>(() => 
        (localStorage.getItem(BACKGROUND_FREQUENCY_KEY) as BackgroundFrequency) || "never"
    );

    // Listen for event to open settings from dock
    useEffect(() => {
        const handleOpenSettings = () => setIsOpen(true);
        window.addEventListener("kiwi-open-settings", handleOpenSettings);
        return () => window.removeEventListener("kiwi-open-settings", handleOpenSettings);
    }, []);

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
                                {/* General */}
                                <div className="space-y-2">
                                    <h3 className="text-xs opacity-50 uppercase tracking-widest">General</h3>
                                    <div className="divide-y divide-border/50 bg-foreground/5 rounded-lg">
                                        {/* Language */}
                                        <div className="flex items-center justify-between p-3">
                                            <span className="text-sm">Language</span>
                                            <span className="text-sm px-3 py-1.5 rounded-md bg-background text-muted-foreground">English</span>
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
                                                    <TooltipTrigger asChild>
                                                        <button className="outline-none">
                                                            <CircleHelp className="size-3.5 text-muted-foreground cursor-help" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="border border-border bg-background text-foreground">
                                                        <p>Leave empty for time-based greeting</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <Input
                                                value={customGreeting}
                                                onChange={(e) => setCustomGreeting(e.target.value)}
                                                placeholder="Bonjour"
                                                className="bg-background border-transparent w-40 text-sm"
                                            />
                                        </div>

                                        {/* Name Customization */}
                                        <div className="flex items-center justify-between gap-4 p-3">
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <span>Name</span>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button className="outline-none">
                                                            <CircleHelp className="size-3.5 text-muted-foreground cursor-help" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="border border-border bg-background text-foreground">
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
                                            <Select
                                                value={backgroundType}
                                                onValueChange={(v) => setBackgroundType(v as "none" | "images" | "videos")}
                                            >
                                                <SelectTrigger className="w-32 h-8 text-xs bg-background">
                                                    <SelectValue>
                                                        {backgroundType === "none" ? "None" : backgroundType === "images" ? "Images" : "Videos"}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    <SelectItem value="images">Images</SelectItem>
                                                    <SelectItem value="videos">Videos</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Frequency - only show when Images or Videos is selected */}
                                        {(backgroundType === "images" || backgroundType === "videos") && (
                                            <div className="flex items-center justify-between p-3">
                                                <span className="text-sm">Shuffle</span>
                                                <div className="bg-background inline-flex items-center overflow-hidden rounded-md p-0.5">
                                                    {[
                                                        { value: "1hour" as const, label: "1h" },
                                                        { value: "1day" as const, label: "1d" },
                                                        { value: "1week" as const, label: "1w" },
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
                                    <p className="text-xs text-muted-foreground/60">Kiwi Tab v{__APP_VERSION__}</p>
                                    <p className="text-xs text-muted-foreground/60">Made with ❤️ in Bangladesh!</p>
                                    <p className="text-xs text-muted-foreground/60">By Kaiyum Mirza.</p>
                                    <button
                                        onClick={() => {
                                            if (confirm("This will reset all settings and reload the page. Continue?")) {
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
