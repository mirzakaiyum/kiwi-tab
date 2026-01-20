"use client";

import * as React from "react";
import { lazy } from "react";
import {
  MinusIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RotateCcw,
} from "lucide-react";

import {
  Widget,
  WidgetContent,
  WidgetFooter,
  WidgetHeader,
} from "@/components/widgetWrapper/widget";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { registerWidget } from "@/lib/widgets/registry";

type TimeAction = "add" | "subtract";

export default function TimerWidget() {
  const [isCountingDown, setIsCountingDown] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(300);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  const updateTime = React.useCallback((action: TimeAction) => {
    setTimeLeft((prev) => {
      if (action === "add") return Math.min(prev + 300, 1800);
      if (action === "subtract") return Math.max(prev - 300, 300);
      return prev;
    });
  }, []);

  const resetTimer = React.useCallback(() => {
    setIsCountingDown(false);
    setTimeLeft(300);
  }, []);

  const handleToggle = React.useCallback(() => {
    setIsCountingDown((prev) => !prev);
  }, []);

  React.useEffect(() => {
    if (isCountingDown && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }

    if (!isCountingDown) {
      clearInterval(intervalRef.current!);
      intervalRef.current = null;
    }

    return () => {
      clearInterval(intervalRef.current!);
      intervalRef.current = null;
    };
  }, [isCountingDown]);

  return (
    <Widget className="gap-3" design="tight">
      <WidgetHeader className="items-center">
        <Button
          aria-label="Subtract five minutes"
          disabled={isCountingDown || timeLeft <= 300}
          onClick={() => updateTime("subtract")}
          variant="ghost"
          size="icon-sm"
          className="disabled:cursor-not-allowed dark:hover:bg-white/5 rounded-full"
        >
          <MinusIcon />
        </Button>

        <Label className="text-muted-foreground text-base">
          {minutes} Mins
        </Label>
        <Button
          aria-label="Add five minutes"
          disabled={isCountingDown || timeLeft >= 1800}
          onClick={() => updateTime("add")}
          variant="ghost"
          size="icon-sm"
          className="disabled:cursor-not-allowed dark:hover:bg-white/5 rounded-full"
        >
          <PlusIcon />
        </Button>
      </WidgetHeader>
      <WidgetContent>
        <div className="flex h-full w-full items-center justify-center">
          <Label className="text-5xl">
            {minutes}:{seconds}
          </Label>
        </div>
      </WidgetContent>
      <WidgetFooter>
        <Button
          aria-label="Reset timer"
          onClick={resetTimer}
          variant="outline"
          size="icon-sm"
          className="rounded-full bg-transparent! border-border/80! hover:bg-input/10!"
        >
          <RotateCcw />
        </Button>
        <Button
          aria-label={isCountingDown ? "Pause timer" : "Start timer"}
          onClick={handleToggle}
          variant="outline"
          size="icon-sm"
          className="rounded-full bg-transparent! border-border/80! hover:bg-input/10!"
        >
          {isCountingDown
            ? <PauseIcon className="size-4 fill-current stroke-none" />
            : <PlayIcon className="size-4 fill-current stroke-none" />}
        </Button>
      </WidgetFooter>
    </Widget>
  );
}

// Self-registration
registerWidget({
  metadata: {
    id: "timer",
    name: "Timer",
    description: "Countdown timer",
    defaultVariant: "default",
    hasSettings: false,
  },
  component: TimerWidget,
  componentLazy: lazy(() => import("./timer")),
});
