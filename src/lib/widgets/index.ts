// Re-export types
export type {
  BaseWidgetProps,
  ClockSettings,
  DualClockSettings,
  SportsSettings,
  WeatherSettings,
  WidgetDefinition,
  WidgetInstance,
  WidgetMetadata,
} from "./types";

// Re-export registry functions
export {
  getAllWidgetMetadata,
  getAllWidgets,
  getWidget,
  getWidgetComponent,
  getWidgetDefaultSettings,
  getWidgetLazyComponent,
  hasWidget,
  registerWidget,
} from "./registry";

// Re-export settings manager functions
export {
  createWidgetInstance,
  getWidgetSettings,
  loadWidgets,
  removeWidget,
  saveWidgets,
  updateWidgetSettings,
} from "./settings-manager";

// This file serves as the entry point that initializes the widget system
import "@/components/widgetWrapper/widgets/calendar";
import "@/components/widgetWrapper/widgets/analogClock";
import "@/components/widgetWrapper/widgets/digitalClock";
import "@/components/widgetWrapper/widgets/dualClock";
import "@/components/widgetWrapper/widgets/timer";
import "@/components/widgetWrapper/widgets/weather";
import "@/components/widgetWrapper/widgets/sports";
import "@/components/widgetWrapper/widgets/stickyNote";
import "@/components/widgetWrapper/widgets/soluna";
