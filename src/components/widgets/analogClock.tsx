"use client";

import * as React from "react";
import { Widget, WidgetContent } from "@/components/ui/widget";
import { Label } from "@/components/ui/label";

interface AnalogClockProps {
  timezone?: string;
  useCurrentLocation?: boolean;
  variant?: string;
}

export default function AnalogClock({ 
  timezone: propTimezone,
  useCurrentLocation = true,
}: AnalogClockProps) {
  const [time, setTime] = React.useState(new Date());

  // Determine which timezone to use
  const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezone = useCurrentLocation ? currentTimezone : (propTimezone || currentTimezone);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Get hours, minutes, seconds for the specified timezone
  const getTimeInTimezone = () => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    };
    const timeStr = time.toLocaleString("en-US", options);
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    return { hours: hours % 12, minutes, seconds };
  };

  const { hours, minutes, seconds } = getTimeInTimezone();

  const hoursDegrees = ((hours + minutes / 60) / 12) * 360;
  const minutesDegrees = ((minutes + seconds / 60) / 60) * 360;
  const secondsDegrees = (seconds / 60) * 360;

  // Get city name from timezone
  const city = timezone.split("/").pop()?.replace(/_/g, " ") || timezone;

  return (
    <Widget>
      <WidgetContent className="flex-col gap-5 justify-center items-center">
        <div className="relative flex items-center justify-center mt-1.5">
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => {
            const hour = i + 1;
            const angle = (hour / 12) * 360;
            const radians = (angle * Math.PI) / 180;
            const x = Math.sin(radians) * 55;
            const y = -Math.cos(radians) * 55;
            return (
              <div
                key={hour}
                className="absolute text-xs font-semibold text-foreground/60"
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
              >
                {hour}
              </div>
            );
          })}
          {/* Clock hands */}
          <div className="relative size-24">
            <div
              className="absolute bottom-1/2 left-1/2 h-8 w-0.5 origin-bottom rounded-full bg-foreground"
              style={{
                transform: `translateX(-50%) rotate(${hoursDegrees}deg)`,
              }}
            />
            <div
              className="absolute bottom-1/2 left-1/2 h-10 w-0.5 origin-bottom rounded-full bg-foreground/70"
              style={{
                transform: `translateX(-50%) rotate(${minutesDegrees}deg)`,
              }}
            />
            <div
              className="absolute bottom-1/2 left-1/2 h-11 w-px origin-bottom rounded-full bg-destructive"
              style={{
                transform: `translateX(-50%) rotate(${secondsDegrees}deg)`,
              }}
            />
            <div className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" />
          </div>
        </div>
        <Label className="text-xs">{city}</Label>
      </WidgetContent>
    </Widget>
  );
}

