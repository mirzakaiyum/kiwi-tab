import type { ComponentType, LazyExoticComponent } from "react";

// Base props that all widgets receive
export interface BaseWidgetProps {
  variant?: string;
}

// Metadata for a widget (displayed in picker, used for registration)
export interface WidgetMetadata {
  id: string;
  name: string;
  description?: string;
  defaultVariant: string;
  hasSettings: boolean;
}

// Complete widget definition with component and settings
export interface WidgetDefinition<TSettings = unknown> {
  metadata: WidgetMetadata;
  // Direct import for grid rendering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  // Lazy import for picker preview
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  componentLazy: LazyExoticComponent<ComponentType<any>>;
  // Default settings if widget has configuration
  defaultSettings?: TSettings;
}

// Widget instance stored in localStorage
export interface WidgetInstance {
  id: string;
  type: string;
  variant?: string;
  settings?: Record<string, unknown>;
}

// Clock-specific settings
export interface ClockSettings {
  timezone: string;
  useCurrentLocation: boolean;
}

// Dual clock-specific settings
export interface DualClockSettings {
  timezone1: string;
  timezone2: string;
}

// Weather-specific settings
export interface WeatherSettings {
  city: string;
  unit: "C" | "F";
  autoDetect?: boolean;
}

// Sports-specific settings
export interface SportsSettings {
  sport: string;
  league?: string;
  team?: string;
}

// Soluna display modes
export type SolunaDisplayMode = "sun" | "moon" | "prayer";

// Soluna-specific settings (prayer times, sun/moon)
export interface SolunaSettings {
  displayMode: SolunaDisplayMode;
  location: string;
  autoDetect?: boolean;
  calculationMethod?: string;
}


