import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsGroup, SettingsItem } from "@/components/settings/settings";

type BackgroundType = "none" | "images" | "videos";
type BackgroundFrequency = "tab" | "1hour" | "1day" | "1week";

const BACKGROUND_TYPE_KEY = "kiwi-background-type";
const BACKGROUND_FREQUENCY_KEY = "kiwi-background-frequency";

export function BackgroundSettings() {
  const [backgroundType, setBackgroundType] = useState<BackgroundType>(() =>
    (localStorage.getItem(BACKGROUND_TYPE_KEY) as BackgroundType) || "videos"
  );
  const [backgroundFrequency, setBackgroundFrequency] = useState<
    BackgroundFrequency
  >(() =>
    (localStorage.getItem(BACKGROUND_FREQUENCY_KEY) as BackgroundFrequency) ||
    "tab"
  );

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
    <SettingsGroup title="Background">
      {/* Background Type */}
      <SettingsItem label="Background type">
        <Select
          value={backgroundType}
          onValueChange={(v) => setBackgroundType(v as BackgroundType)}
        >
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue>
              {backgroundType === "none"
                ? "None"
                : backgroundType === "images"
                ? "Images"
                : "Videos"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="images">Images</SelectItem>
            <SelectItem value="videos">Videos</SelectItem>
          </SelectContent>
        </Select>
      </SettingsItem>

      {/* Frequency - only show when Images or Videos is selected */}
      {(backgroundType === "images" || backgroundType === "videos") && (
        <SettingsItem label="Shuffle">
          <Select
            value={backgroundFrequency}
            onValueChange={(v) =>
              setBackgroundFrequency(v as BackgroundFrequency)}
          >
            <SelectTrigger className="w-32 h-8 text-xs">
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
    </SettingsGroup>
  );
}
