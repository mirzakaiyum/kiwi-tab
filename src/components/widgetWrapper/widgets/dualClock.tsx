"use client";
import * as React from "react";
import {
  Widget,
  WidgetContent,
  WidgetTitle,
} from "@/components/widgetWrapper/widget";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { registerWidget } from "@/lib/widgets/registry";
import type { DualClockSettings } from "@/lib/widgets/types";

interface DualClockProps {
  timezone1?: string;
  timezone2?: string;
}

export default function DualClock({
  timezone1 = "Europe/London",
  timezone2 = "America/New_York",
}: DualClockProps) {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (tz: string) => {
    return time.toLocaleTimeString("en-US", {
      timeZone: tz,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getCity = (tz: string) => {
    return tz.split("/").pop()?.replace(/_/g, " ") || tz;
  };

  return (
    <Widget>
      <WidgetContent className="flex-col justify-between gap-3">
        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              {getCity(timezone1)}
            </Label>
          </div>
          <WidgetTitle className="text-xl font-medium tracking-tight">
            {formatTime(timezone1)}
          </WidgetTitle>
        </div>
        <Separator className="opacity-50" />
        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              {getCity(timezone2)}
            </Label>
          </div>
          <WidgetTitle className="text-xl font-medium tracking-tight">
            {formatTime(timezone2)}
          </WidgetTitle>
        </div>
      </WidgetContent>
    </Widget>
  );
}

// Self-registration
registerWidget<DualClockSettings>({
  metadata: {
    id: "dualClock",
    name: "Dual Clock",
    description: "Display two timezone clocks",
    defaultVariant: "default",
    hasSettings: true,
  },
  component: DualClock,
  componentLazy: React.lazy(() => import("./dualClock")),
  defaultSettings: {
    timezone1: "Europe/London",
    timezone2: "America/New_York",
  },
});
