import * as React from "react";
import { cn } from "@/lib/utils";

// Settings Group - Container for a group of settings with a heading
interface SettingsGroupProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsGroup({ title, children }: SettingsGroupProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs opacity-50 uppercase tracking-widest">
        {title}
      </h3>
      <div className="divide-y divide-border/50 bg-foreground/5 rounded-lg">
        {children}
      </div>
    </div>
  );
}

// Settings Item - Individual setting row
interface SettingsItemProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsItem({
  label,
  description,
  children,
  className,
}: SettingsItemProps) {
  return (
    <div className={cn("flex items-center justify-between p-3", className)}>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm">{label}</span>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      {children}
    </div>
  );
}

// Settings Item with Input - For settings that have input fields
interface SettingsItemWithInputProps {
  label: string;
  tooltip?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsItemWithInput({
  label,
  tooltip,
  children,
  className,
}: SettingsItemWithInputProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-3",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-sm">
        <span>{label}</span>
        {tooltip && (
          <div className="inline-flex">
            {tooltip}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
