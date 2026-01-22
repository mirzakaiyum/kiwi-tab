import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface VisualTabOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface VisualTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  options: VisualTabOption[];
  className?: string;
}

export function VisualTabs({
  value,
  onValueChange,
  options,
  className,
}: VisualTabsProps) {
  return (
    <div className={cn("flex flex-row gap-3 justify-center w-full", className)}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onValueChange(option.value)}
            className="group flex flex-col items-center gap-2 outline-none"
            type="button"
          >
            {/* Icon Container */}
            <div
              className={cn(
                "rounded-xl p-2 flex items-center justify-center transition-all duration-200",
                isSelected ? "bg-primary/5" : "bg-background",
              )}
            >
              <div
                className={cn(
                  "transition-colors duration-200 [&_svg]:w-[80px] [&_svg]:h-[53px]",
                  isSelected
                    ? "text-primary"
                    : "text-muted-foreground/50 group-hover:text-foreground/60",
                )}
              >
                {option.icon}
              </div>
            </div>

            {/* Label */}
            <span
              className={cn(
                "text-xs font-medium transition-colors",
                isSelected ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {option.label}
            </span>

            {/* Selection Indicator (Radio/Check) */}
            <div
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
                isSelected
                  ? "bg-primary shadow-sm"
                  : "border border-muted-foreground/30 bg-transparent group-hover:border-muted-foreground/50",
              )}
            >
              {isSelected && <Check className="w-3 h-3 text-white stroke-3" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}
