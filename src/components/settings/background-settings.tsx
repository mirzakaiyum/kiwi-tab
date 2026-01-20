import { useEffect, useRef, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { SettingsGroup, SettingsItem } from "@/components/settings/settings";
import { Plus, Trash2 } from "lucide-react";
import type { CustomFileDisplay } from "@/lib/custom-files-db";
import {
    addCustomFile,
    getCustomFilesForDisplay,
    deleteCustomFile,
} from "@/lib/custom-files-db";

export type BackgroundType = "images" | "videos" | "custom";
export type BackgroundFrequency = "tab" | "1hour" | "1day" | "1week";

const BACKGROUND_ENABLED_KEY = "kiwi-background-enabled";
const BACKGROUND_TYPE_KEY = "kiwi-background-type";
const BACKGROUND_FREQUENCY_KEY = "kiwi-background-frequency";
const BACKGROUND_BLUR_KEY = "kiwi-background-blur";
const BACKGROUND_BRIGHTNESS_KEY = "kiwi-background-brightness";

export function BackgroundSettings() {
    // State
    const [backgroundEnabled, setBackgroundEnabled] = useState<boolean>(
        () => localStorage.getItem(BACKGROUND_ENABLED_KEY) !== "false",
    );
    const [backgroundType, setBackgroundType] = useState<BackgroundType>(
        () =>
            (localStorage.getItem(BACKGROUND_TYPE_KEY) as BackgroundType) ||
            "videos",
    );
    const [backgroundFrequency, setBackgroundFrequency] =
        useState<BackgroundFrequency>(
            () =>
                (localStorage.getItem(
                    BACKGROUND_FREQUENCY_KEY,
                ) as BackgroundFrequency) || "tab",
        );
    const [blur, setBlur] = useState<number>(() =>
        parseInt(localStorage.getItem(BACKGROUND_BLUR_KEY) || "0"),
    );
    const [brightness, setBrightness] = useState<number>(() =>
        parseInt(localStorage.getItem(BACKGROUND_BRIGHTNESS_KEY) || "50"),
    );
    const [customFiles, setCustomFiles] = useState<CustomFileDisplay[]>([]);
    const [customFilesLoaded, setCustomFilesLoaded] = useState(false);

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

    // Load custom files only when needed (when custom type is selected)
    useEffect(() => {
        if (backgroundType === "custom" && !customFilesLoaded) {
            getCustomFilesForDisplay().then((files) => {
                setCustomFiles(files);
                setCustomFilesLoaded(true);
            });
        }
    }, [backgroundType, customFilesLoaded]);

    // Persist background enabled changes
    useEffect(() => {
        if (isInitialMount.current) return;
        localStorage.setItem(BACKGROUND_ENABLED_KEY, String(backgroundEnabled));
        window.dispatchEvent(new Event("kiwi-background-changed"));
    }, [backgroundEnabled]);

    // Persist background type changes
    useEffect(() => {
        if (isInitialMount.current) return;
        localStorage.setItem(BACKGROUND_TYPE_KEY, backgroundType);
        window.dispatchEvent(new Event("kiwi-background-changed"));
    }, [backgroundType]);

    // Persist background frequency changes
    useEffect(() => {
        if (isInitialMount.current) return;
        localStorage.setItem(BACKGROUND_FREQUENCY_KEY, backgroundFrequency);
    }, [backgroundFrequency]);

    // Persist blur changes
    useEffect(() => {
        if (isInitialMount.current) return;
        localStorage.setItem(BACKGROUND_BLUR_KEY, String(blur));
        window.dispatchEvent(new Event("kiwi-background-style-changed"));
    }, [blur]);

    // Persist brightness changes
    useEffect(() => {
        if (isInitialMount.current) return;
        localStorage.setItem(BACKGROUND_BRIGHTNESS_KEY, String(brightness));
        window.dispatchEvent(new Event("kiwi-background-style-changed"));
    }, [brightness]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        Array.from(files).forEach(async (file) => {
            // Check file size (50MB limit)
            if (file.size > 50 * 1024 * 1024) {
                alert(`File ${file.name} is too large. Maximum size is 50MB.`);
                return;
            }

            try {
                const newFile = {
                    id: Date.now().toString() + Math.random(),
                    name: file.name,
                    type: file.type.startsWith("image/")
                        ? ("image" as const)
                        : ("video" as const),
                    blob: file,
                };

                // Save to IndexedDB
                try {
                    await addCustomFile(newFile);

                    // Reload files to update UI
                    const updatedFiles = await getCustomFilesForDisplay();
                    setCustomFiles(updatedFiles);

                    // Trigger background change to show the newly uploaded file
                    setTimeout(() => {
                        window.dispatchEvent(
                            new Event("kiwi-background-changed"),
                        );
                    }, 100);
                } catch (storageError) {
                    console.error("Storage error:", storageError);
                    alert(`Failed to save ${file.name}. Please try again.`);
                }
            } catch (error) {
                console.error("File processing error:", error);
                alert(`Failed to process ${file.name}. Please try again.`);
            }
        });

        // Reset input
        event.target.value = "";
    };

    const handleDeleteFile = async (id: string) => {
        try {
            await deleteCustomFile(id);

            // Reload files to update UI
            const updatedFiles = await getCustomFilesForDisplay();
            setCustomFiles(updatedFiles);

            // Trigger background change
            window.dispatchEvent(new Event("kiwi-background-changed"));
        } catch (error) {
            console.error("Error deleting file:", error);
            alert("Failed to delete file. Please try again.");
        }
    };

    return (
        <SettingsGroup title="Background">
            {/* Enable Background Switch */}
            <SettingsItem label="Enable Background">
                <Switch
                    checked={backgroundEnabled}
                    onCheckedChange={setBackgroundEnabled}
                />
            </SettingsItem>

            {/* Background Type - only show when enabled */}
            {backgroundEnabled && (
                <SettingsItem label="Background type">
                    <Select
                        value={backgroundType}
                        onValueChange={(v) =>
                            setBackgroundType(v as BackgroundType)
                        }
                    >
                        <SelectTrigger className="w-40 h-8 text-xs">
                            <SelectValue>
                                {backgroundType === "images"
                                    ? "Images"
                                    : backgroundType === "videos"
                                      ? "Videos"
                                      : "Custom"}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="images">Images</SelectItem>
                            <SelectItem value="videos">Videos</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                    </Select>
                </SettingsItem>
            )}

            {/* Custom Files Upload - only show when custom is selected */}
            {backgroundEnabled && backgroundType === "custom" && (
                <div className="flex flex-col gap-3 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                            My files (images or videos)
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-2"
                            onClick={() =>
                                document.getElementById("file-upload")?.click()
                            }
                        >
                            <Plus className="h-4 w-4" />
                            Add new
                        </Button>
                        <input
                            id="file-upload"
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.webm,.mp4"
                            multiple
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Use the button above to import files from your device
                        and set them as backgrounds.
                    </p>
                    {customFiles.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-2">
                            {customFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="relative aspect-video rounded-lg overflow-hidden bg-muted group cursor-pointer"
                                >
                                    {file.type === "image" ? (
                                        <img
                                            src={file.url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <video
                                            src={file.url}
                                            className="w-full h-full object-cover"
                                            muted
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="h-8 w-8 p-0"
                                            onClick={() =>
                                                handleDeleteFile(file.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Frequency - hide when custom is selected */}
            {backgroundEnabled && backgroundType !== "custom" && (
                <SettingsItem label="Shuffle">
                    <Select
                        value={backgroundFrequency}
                        onValueChange={(v) =>
                            setBackgroundFrequency(v as BackgroundFrequency)
                        }
                    >
                        <SelectTrigger className="w-40 h-8 text-xs">
                            <SelectValue>
                                {backgroundFrequency === "tab"
                                    ? "Every Tab"
                                    : backgroundFrequency === "1hour"
                                      ? "Every Hour"
                                      : backgroundFrequency === "1day"
                                        ? "Every Day"
                                        : "Every Week"}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="tab">Every Tab</SelectItem>
                            <SelectItem value="1hour">Every Hour</SelectItem>
                            <SelectItem value="1day">Every Day</SelectItem>
                            <SelectItem value="1week">Every Week</SelectItem>
                        </SelectContent>
                    </Select>
                </SettingsItem>
            )}

            {/* Blur Intensity */}
            {backgroundEnabled && (
                <SettingsItem label="Blur Intensity">
                    <Slider
                        value={[blur]}
                        onValueChange={(values) => setBlur(values[0])}
                        min={0}
                        max={35}
                        step={5}
                        className="w-full"
                    />
                </SettingsItem>
            )}

            {/* Brightness */}
            {backgroundEnabled && (
                <SettingsItem label="Brightness">
                    <Slider
                        value={[brightness]}
                        onValueChange={(value) => setBrightness(value[0])}
                        min={0}
                        max={50}
                        step={5}
                        className="w-full"
                    />
                </SettingsItem>
            )}
        </SettingsGroup>
    );
}
