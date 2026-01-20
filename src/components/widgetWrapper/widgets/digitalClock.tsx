"use client";

import * as React from "react";
import { lazy } from "react";

import {
  Widget,
  WidgetContent,
  WidgetTitle,
} from "@/components/widgetWrapper/widget";
import { Label } from "@/components/ui/label";
import { registerWidget } from "@/lib/widgets";
import type { ClockSettings } from "@/lib/widgets/types";

interface DigitalClockProps {
  timezone?: string;
  useCurrentLocation?: boolean;
}

export default function DigitalClock({
  timezone: propTimezone,
  useCurrentLocation = true,
}: DigitalClockProps) {
  const [time, setTime] = React.useState(new Date());

  // Determine which timezone to use
  const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezone = useCurrentLocation
    ? currentTimezone
    : (propTimezone || currentTimezone);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Get day, hours, minutes for the specified timezone
  const getTimeInTimezone = () => {
    const dayOptions: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      weekday: "long",
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    const hour24Options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    };
    const day = time.toLocaleString("en-US", dayOptions);
    const timeStr = time.toLocaleString("en-US", timeOptions);
    const hour24Str = time.toLocaleString("en-US", hour24Options);
    const [timePart] = timeStr.split(" ");
    const [hours, minutes] = timePart.split(":");
    return {
      day,
      hours: parseInt(hours),
      minutes,
      hour24: parseInt(hour24Str),
    };
  };

  const { day, hours, minutes, hour24 } = getTimeInTimezone();

  // Get time of day based on hour
  const getTimeOfDay = (hour: number): string => {
    if (hour >= 5 && hour < 12) return "Morning";
    if (hour === 12) return "Noon";
    if (hour >= 12 && hour < 17) return "Afternoon";
    if (hour >= 17 && hour < 21) return "Evening";
    return "Night";
  };

  const timeOfDay = getTimeOfDay(hour24);

  return (
    <Widget>
      <WidgetContent className="flex-col gap-2">
        <WidgetTitle className="text-2xl">{day}</WidgetTitle>
        <WidgetTitle className="text-5xl tracking-widest">
          {hours}:{minutes}
        </WidgetTitle>
        <Label className="text-xs font-light opacity-80">{timeOfDay}</Label>
      </WidgetContent>
    </Widget>
  );
}

// Self-registration
registerWidget<ClockSettings>({
  metadata: {
    id: "digitalClock",
    name: "Digital Clock",
    description: "Display time with digital clock face",
    defaultVariant: "default",
    hasSettings: true,
  },
  component: DigitalClock,
  componentLazy: lazy(() => import("./digitalClock")),
  defaultSettings: {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    useCurrentLocation: true,
  },
});
