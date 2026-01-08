import type { WidgetInstance } from "@/lib/widgets";

// Default widgets shown on first load (before user customization)
export const DEFAULT_WIDGETS: WidgetInstance[] = [
  { id: "analogClock-1", type: "analogClock", variant: "default" },
  { id: "calendar-1", type: "calendar", variant: "compact" },
  { id: "weather-1", type: "weather", variant: "default" },
  { id: "sports-1", type: "sports", variant: "default" },
];
