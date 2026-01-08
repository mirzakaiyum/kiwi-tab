// Re-export types
export type {
  BaseWidgetProps,
  WidgetMetadata,
  WidgetDefinition,
  WidgetInstance,
  ClockSettings,
  DualClockSettings,
  WeatherSettings,
  SportsSettings,
} from "./types";

// Re-export registry functions
export {
  registerWidget,
  getWidget,
  getAllWidgets,
  getAllWidgetMetadata,
  hasWidget,
  getWidgetComponent,
  getWidgetLazyComponent,
  getWidgetDefaultSettings,
} from "./registry";

// Re-export settings manager functions
export {
  loadWidgets,
  saveWidgets,
  createWidgetInstance,
  updateWidgetSettings,
  removeWidget,
  getWidgetSettings,
} from "./settings-manager";

// This file serves as the entry point that initializes the widget system
import "@/components/widgets/calendar";
import "@/components/widgets/analogClock";
import "@/components/widgets/digitalClock";
import "@/components/widgets/dualClock";
import "@/components/widgets/timer";
import "@/components/widgets/weather";
import "@/components/widgets/sports";
import "@/components/widgets/stickyNote";
