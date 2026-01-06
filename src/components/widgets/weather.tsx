import * as React from "react";
import { lazy } from "react";
import { CloudIcon, Loader2Icon } from "lucide-react";

import {
  Widget,
  WidgetContent,
  WidgetHeader,
} from "@/components/ui/widget";
import { Label } from "@/components/ui/label";
import { registerWidget } from "@/lib/widgets/registry";
import type { WeatherSettings } from "@/lib/widgets/types";

// Global settings keys - REMOVED

interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  high: number;
  low: number;
}

interface WeatherWidgetProps {
  city?: string;
  unit?: "C" | "F";
  autoDetect?: boolean;
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

async function fetchWeather(city: string, unit: "C" | "F" = "C", autoDetect = false, coords?: { lat: number; lon: number }): Promise<WeatherData> {
  // If coordinates provided, use them. Else if autoDetect, use IP fallback (though logic below prefers coords). Steps:
  // 1. If coords: query = "lat,lon"
  // 2. Else if autoDetect: query = "auto:ip"
  // 3. Else: query = city
  
  let query = city;
  if (coords) {
    query = `${coords.lat},${coords.lon}`;
  } else if (autoDetect) {
    query = "auto:ip";
  }

  const url = `https://kiwi-weather.makfissh.workers.dev/?query=${encodeURIComponent(query)}&provider=auto&data=simple&lang=en&unit=${unit}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }
  
  const data = await response.json();
  
  // Capitalize city name
  const locationName = data.geo?.city 
    ? data.geo.city.charAt(0).toUpperCase() + data.geo.city.slice(1)
    : city;
  
  return {
    location: locationName,
    temperature: Math.round(data.now?.temp ?? 0),
    feelsLike: Math.round(data.now?.feels ?? 0),
    condition: data.now?.description || "Unknown",
    high: Math.round(data.daily?.[0]?.high ?? 0),
    low: Math.round(data.daily?.[0]?.low ?? 0),
  };
}

export default function WeatherWidget({ city = "Dhaka", unit = "C", autoDetect = false }: WeatherWidgetProps) {
  const [weather, setWeather] = React.useState<WeatherData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function loadWeather() {
      try {
        setLoading(true);
        setError(null);
        
        let coords: { lat: number; lon: number } | undefined;
        
        if (autoDetect) {
           try {
             // Try to get precise location
             coords = await getCurrentPosition();
           } catch {
             // Fallback to IP-based if geolocation fails/denied
             console.warn("Geolocation failed, falling back to IP");
           }
        }
        
        const data = await fetchWeather(city, unit, autoDetect, coords);
        if (mounted) {
          setWeather(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load weather");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadWeather();

    // Refresh weather every 30 minutes
    const interval = setInterval(loadWeather, 30 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [city, unit, autoDetect]);

  if (loading) {
    return (
      <Widget>
        <WidgetContent className="items-center justify-center">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </WidgetContent>
      </Widget>
    );
  }

  if (error || !weather) {
    return (
      <Widget>
        <WidgetHeader className="flex-col gap-3">
          <Label className="text-sm">{city}</Label>
        </WidgetHeader>
        <WidgetContent className="items-center justify-center">
          <Label className="text-sm text-muted-foreground">
            {error || "No data available"}
          </Label>
        </WidgetContent>
      </Widget>
    );
  }

  return (
    <Widget>
      <WidgetHeader className="flex-col gap-3">
        <div className="flex justify-between w-full">
          <div className="flex flex-col gap-x-2">
            <Label className="font-light text-xs">{weather.location}</Label>
            <Label className="text-4xl font-light">{weather.temperature}&deg;</Label>
          </div>
          <Label className="text-xs text-muted-foreground text-end">
            Feels Like <br/>{weather.feelsLike}&deg;
          </Label>
        </div>
      </WidgetHeader>
      <WidgetContent className="items-end">
        <div className="flex w-full flex-col gap-1">
          <CloudIcon className="size-5" />
          <Label className="font-light">{weather.condition}</Label>
          <div className="flex h-max w-full items-center gap-2 justify-start text-xs text-muted-foreground">
            <span>H:{weather.high}&deg;</span>
            <span>L:{weather.low}&deg;</span>
          </div>
        </div>
      </WidgetContent>
    </Widget>
  );
}

// Self-registration
registerWidget<WeatherSettings>({
  metadata: {
    id: "weather",
    name: "Weather",
    description: "Display current weather",
    defaultVariant: "default",
    hasSettings: true,
  },
  component: WeatherWidget,
  componentLazy: lazy(() => import("./weather")),
});
