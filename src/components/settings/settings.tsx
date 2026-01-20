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
            <div className="divide-y divide-border/50 bg-foreground/10 rounded-2xl">
                {children}
            </div>
        </div>
    );
}

// Settings Item - Individual setting row
interface SettingsItemProps {
    label: string;
    description?: string;
    tooltip?: string;
    children: React.ReactNode;
    className?: string;
}

export function SettingsItem({
    label,
    description,
    tooltip,
    children,
    className,
}: SettingsItemProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-between py-3 p-4 min-h-[62px]",
                className,
            )}
        >
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm">{label}</span>
                    {tooltip && (
                        <div className="inline-flex text-muted-foreground">
                            {tooltip}
                        </div>
                    )}
                </div>
                {description && (
                    <span className="text-xs text-muted-foreground">
                        {description}
                    </span>
                )}
            </div>
            <div className="w-40 flex justify-end">{children}</div>
        </div>
    );
}
