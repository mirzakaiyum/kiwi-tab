import * as React from "react";
import { lazy } from "react";
import { SunIcon, MoonIcon, Sunrise, Sunset, CloudSun } from "lucide-react";

import {
  Widget,
  WidgetContent,
  WidgetHeader,
} from "@/components/ui/widget";
import { Label } from "@/components/ui/label";
import { registerWidget } from "@/lib/widgets/registry";
import { getSolunaData, type SolunaResponse, type CalculationMethodId } from "@/lib/services/soluna";
import { RadialChart } from "@/components/charts/radial-chart";
import type { SolunaSettings, SolunaDisplayMode } from "@/lib/widgets/types";

interface SolunaWidgetProps {
  displayMode?: SolunaDisplayMode;
  location?: string;
  autoDetect?: boolean;
  calculationMethod?: string;
  preview?: boolean;
}

// Format time from "HH:MM (TZ)" to "h:mm A"
function formatTime(time: string): string {
  if (!time) return "--:--";
  // Handle format like "05:23 (BST)" - extract just the time part
  const timePart = time.split(" ")[0];
  const [hours, minutes] = timePart.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return "--:--";
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// Parse time string to minutes since midnight
function parseTimeToMinutes(time: string): number {
  if (!time) return -1;
  const timePart = time.split(" ")[0];
  const [hours, minutes] = timePart.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return -1;
  return hours * 60 + minutes;
}

// Calculate time remaining until a prayer
function getTimeRemaining(targetTime: string): string {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const targetMinutes = parseTimeToMinutes(targetTime);
  
  if (targetMinutes < 0) return "";
  
  let diffMinutes = targetMinutes - currentMinutes;
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60; // Next day
  }
  
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  if (hours > 0) {
    return `In ${hours} hr, ${minutes} min`;
  }
  return `In ${minutes} min`;
}

// Get current and next prayer from timings
function getCurrentAndNextPrayer(timings: SolunaResponse["prayer"]): {
  current: { name: string; time: string } | null;
  next: { name: string; time: string } | null;
} {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const prayers = [
    { name: "Fajr", time: timings.Fajr },
    { name: "Dhuhr", time: timings.Dhuhr },
    { name: "Asr", time: timings.Asr },
    { name: "Maghrib", time: timings.Maghrib },
    { name: "Isha", time: timings.Isha },
  ];

  // Find current prayer (the one we're in) and next prayer
  let currentPrayer = null;
  let nextPrayer = null;

  for (let i = 0; i < prayers.length; i++) {
    const prayerMinutes = parseTimeToMinutes(prayers[i].time);
    const nextPrayerMinutes = i < prayers.length - 1 
      ? parseTimeToMinutes(prayers[i + 1].time) 
      : parseTimeToMinutes(prayers[0].time) + 24 * 60; // Fajr next day

    if (currentMinutes >= prayerMinutes && currentMinutes < nextPrayerMinutes) {
      currentPrayer = prayers[i];
      nextPrayer = prayers[(i + 1) % prayers.length];
      break;
    }
  }

  // If no current prayer found (before Fajr), current is Isha (from yesterday)
  if (!currentPrayer) {
    currentPrayer = prayers[prayers.length - 1]; // Isha
    nextPrayer = prayers[0]; // Fajr
  }

  return { current: currentPrayer, next: nextPrayer };
}

// Get icon component for current prayer
function getPrayerIcon(prayerName: string): React.ReactNode {
  const iconClass = "size-4";
  switch (prayerName) {
    case "Fajr":
      return <Sunrise className={iconClass} />;
    case "Dhuhr":
      return <SunIcon className={iconClass} />;
    case "Asr":
      return <CloudSun className={iconClass} />;
    case "Maghrib":
      return <Sunset className={iconClass} />;
    case "Isha":
      return <MoonIcon className={iconClass} />;
    default:
      return <SunIcon className={iconClass} />;
  }
}

// Calculate progress percentage between current and next prayer
function getProgressPercentage(
  currentPrayerTime: string,
  nextPrayerTime: string
): number {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  let startMinutes = parseTimeToMinutes(currentPrayerTime);
  let endMinutes = parseTimeToMinutes(nextPrayerTime);
  
  if (startMinutes < 0 || endMinutes < 0) return 0;
  
  // Handle next day wrap-around (e.g., Isha -> Fajr)
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }
  
  // Adjust current time if it's before start (next day scenario)
  let adjustedCurrent = currentMinutes;
  if (currentMinutes < startMinutes) {
    adjustedCurrent += 24 * 60;
  }
  
  const totalDuration = endMinutes - startMinutes;
  const elapsed = adjustedCurrent - startMinutes;
  
  if (totalDuration <= 0) return 0;
  
  return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
}

// Moon phase icon based on phase name
function getMoonPhaseIcon(phase: string): string {
  const phaseIcons: Record<string, string> = {
    "New Moon": "🌑",
    "First Quarter": "🌓",
    "Full Moon": "🌕",
    "Last Quarter": "🌗",
  };
  return phaseIcons[phase] || "🌙";
}

async function getCurrentPosition(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}

export default function SolunaWidget({
  displayMode = "prayer",
  location = "London",
  autoDetect = false,
  calculationMethod = "1",
  preview = false,
}: SolunaWidgetProps) {
  const [data, setData] = React.useState<SolunaResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [, forceUpdate] = React.useReducer(x => x + 1, 0); // For live countdown

  // Preview data
  const previewData: SolunaResponse = React.useMemo(
    () => ({
      meta: { 
        latitude: 23.8, 
        longitude: 90.4, 
        timezone: "Asia/Dhaka",
        method: { id: 1, name: "Karachi", params: {} }
      },
      date: {
        readable: "14 Jan 2026",
        timestamp: String(Date.now()),
        hijri: { date: "15-06-1447", day: "15", month: { number: 6, en: "Jumada al-Thani", ar: "" }, year: "1447" },
        gregorian: { date: "14-01-2026", day: "14", month: { number: 1, en: "January" }, year: "2026" },
      },
      prayer: {
        Fajr: "05:23",
        Sunrise: "06:42",
        Dhuhr: "12:05",
        Asr: "15:32",
        Sunset: "17:28",
        Maghrib: "17:28",
        Isha: "18:47",
        Imsak: "05:13",
        Midnight: "23:35",
        Firstthird: "21:53",
        Lastthird: "01:18",
      },
      sun: {
        sunrise: "06:42",
        sunset: "17:28",
        solarnoon: "12:05",
        daylength: "10:46",
      },
      moon: { phase: "Full Moon", hijriDay: 15 },
    }),
    []
  );

  React.useEffect(() => {
    if (preview) return;

    let mounted = true;

    async function loadData() {
      try {
        let address = location;

        if (autoDetect) {
          try {
            const coords = await getCurrentPosition();
            address = `${coords.lat},${coords.lon}`;
          } catch {
            console.warn("Geolocation failed, using location name");
          }
        }

        const result = await getSolunaData(
          address,
          Number(calculationMethod) as CalculationMethodId
        );
        
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      }
    }

    loadData();

    // Refresh every 30 minutes
    const refreshInterval = setInterval(loadData, 30 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(refreshInterval);
    };
  }, [location, calculationMethod, autoDetect, preview]);

  // Update countdown every minute
  React.useEffect(() => {
    if (preview || displayMode !== "prayer") return;
    
    const interval = setInterval(forceUpdate, 60 * 1000);
    return () => clearInterval(interval);
  }, [preview, displayMode]);

  const displayData = preview ? previewData : data;

  if (error && !data) {
    return (
      <Widget>
        <WidgetContent className="items-center justify-center">
          <Label className="text-sm text-muted-foreground">
            {error}
          </Label>
        </WidgetContent>
      </Widget>
    );
  }

  if (!displayData) {
    return (
      <Widget>
        <WidgetContent className="items-center justify-center">
          <Label className="text-sm text-muted-foreground">Loading...</Label>
        </WidgetContent>
      </Widget>
    );
  }

  // Prayer Times Mode - current prayer at top, countdown with chart at bottom
  if (displayMode === "prayer") {
    const { current, next } = getCurrentAndNextPrayer(displayData.prayer);
    const timeUntilNext = next ? getTimeRemaining(next.time) : "";
    const progress = current && next 
      ? getProgressPercentage(current.time, next.time) 
      : 0;
    
    return (
      <Widget>
        <WidgetHeader className="justify-between">
          <div className="flex flex-col">
            <Label className="text-xs text-muted-foreground">{current?.name}</Label>
            <Label className="text-2xl text-primary">{current ? formatTime(current.time) : "--:--"}</Label>
          </div>
          {current && getPrayerIcon(current.name)}
        </WidgetHeader>
        <WidgetContent className="items-end justify-start gap-1">
            <RadialChart progress={progress} />
          <div className="flex flex-col">
            <Label className="text-sm">{next?.name}, {next ? formatTime(next.time) : "--:--"}</Label>
            <Label className="text-xs text-muted-foreground">{timeUntilNext}</Label>
          </div>
        </WidgetContent>
      </Widget>
    );
  }

  // Sun Mode (Sunrise/Sunset)
  if (displayMode === "sun") {
    return (
      <Widget>
        <WidgetHeader className="flex-col gap-3">
          <div className="flex justify-between w-full">
            <div className="flex flex-col gap-x-2">
              <Label className="font-light text-xs text-muted-foreground">Daylight</Label>
              <Label className="text-xl font-light">{displayData.sun.daylength}</Label>
            </div>
            <SunIcon className="size-5 text-amber-400" />
          </div>
        </WidgetHeader>
        <WidgetContent className="items-end">
          <div className="flex w-full justify-between text-sm">
            <div className="flex flex-col">
              <Label className="text-xs text-muted-foreground">Sunrise</Label>
              <Label className="text-md font-light">{formatTime(displayData.sun.sunrise)}</Label>
            </div>
            <div className="flex flex-col text-right">
              <Label className="text-xs text-muted-foreground">Sunset</Label>
              <Label className="text-md font-light">{formatTime(displayData.sun.sunset)}</Label>
            </div>
          </div>
        </WidgetContent>
      </Widget>
    );
  }

  // Moon Mode
  if (displayMode === "moon") {
    const moonPhase = displayData.moon?.phase || "Unknown";
    return (
      <Widget>
        <WidgetContent className="flex-col">
          <div className="flex justify-between w-full">
            <div className="flex flex-col gap-x-2 items-center w-full">
            <div className="text-3xl mb-2">{getMoonPhaseIcon(moonPhase)}</div>
              <Label className="text-xl font-light">{moonPhase}</Label>
              <Label className="font-light text-xs text-muted-foreground">Moon Phase</Label>
            </div>
          </div>
        </WidgetContent>
      </Widget>
    );
  }

  return null;
}

// Self-registration
registerWidget<SolunaSettings>({
  metadata: {
    id: "soluna",
    name: "Soluna",
    description: "Prayer times, sunrise/sunset, and moon phases",
    defaultVariant: "default",
    hasSettings: true,
  },
  component: SolunaWidget,
  componentLazy: lazy(() => import("./soluna")),
  defaultSettings: {
    displayMode: "moon",
    location: "Dhaka",
    autoDetect: false,
    calculationMethod: "1",
  },
});
