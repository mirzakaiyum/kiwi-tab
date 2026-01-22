"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Command as CommandPrimitive } from "cmdk";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import { ChevronDown, X } from "lucide-react";

// Combobox Root - uses Popover
const Combobox = PopoverPrimitive.Root;

// Combobox Input with integrated trigger
function ComboboxInput({
    className,
    children,
    disabled = false,
    showTrigger = true,
    showClear = false,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
    showTrigger?: boolean;
    showClear?: boolean;
}) {
    const [value, setValue] = React.useState("");

    return (
        <InputGroup className={cn("w-auto", className)}>
            <InputGroupInput
                disabled={disabled}
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    props.onChange?.(e);
                }}
                {...props}
            />
            <InputGroupAddon align="inline-end">
                {showTrigger && (
                    <PopoverPrimitive.Trigger asChild>
                        <InputGroupButton
                            size="icon-xs"
                            variant="ghost"
                            data-slot="input-group-button"
                            disabled={disabled}
                        >
                            <ChevronDown className="text-muted-foreground size-4 pointer-events-none" />
                        </InputGroupButton>
                    </PopoverPrimitive.Trigger>
                )}
                {showClear && value && (
                    <InputGroupButton
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => setValue("")}
                        disabled={disabled}
                        data-slot="combobox-clear"
                    >
                        <X className="pointer-events-none size-4" />
                    </InputGroupButton>
                )}
            </InputGroupAddon>
            {children}
        </InputGroup>
    );
}

// Combobox Trigger (for button trigger mode)
function ComboboxTrigger({
    className,
    children,
    ...props
}: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>) {
    return (
        <PopoverPrimitive.Trigger
            data-slot="combobox-trigger"
            className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
            {...props}
        >
            {children}
            <ChevronDown className="text-muted-foreground size-4 pointer-events-none" />
        </PopoverPrimitive.Trigger>
    );
}

// Combobox Content - uses Popover + Command
function ComboboxContent({
    className,
    side = "bottom",
    sideOffset = 6,
    align = "start",
    alignOffset = 0,
    ...props
}: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>) {
    return (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
                data-slot="combobox-content"
                side={side}
                sideOffset={sideOffset}
                align={align}
                alignOffset={alignOffset}
                className={cn(
                    "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/5 max-h-72 min-w-36 overflow-hidden rounded-2xl shadow-2xl ring-1 duration-100 group/combobox-content relative w-(--radix-popover-trigger-width) max-w-(--radix-popover-content-available-width)",
                    className,
                )}
                {...props}
            />
        </PopoverPrimitive.Portal>
    );
}

// Combobox List - uses Command
function ComboboxList({
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive>) {
    return (
        <CommandPrimitive
            data-slot="combobox-list"
            className={cn(
                "no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto p-1 data-empty:p-0 overscroll-contain",
                className,
            )}
            {...props}
        />
    );
}

// Combobox Item - uses Command.Item
function ComboboxItem({
    className,
    children,
    ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>) {
    return (
        <CommandPrimitive.Item
            data-slot="combobox-item"
            className={cn(
                "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground gap-2.5 rounded-xl py-2 pr-8 pl-3 text-sm [&_svg:not([class*='size-'])]:size-4 relative flex w-full cursor-default items-center outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
                className,
            )}
            {...props}
        >
            {children}
        </CommandPrimitive.Item>
    );
}

// Combobox Group
function ComboboxGroup({
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>) {
    return (
        <CommandPrimitive.Group
            data-slot="combobox-group"
            className={cn(className)}
            {...props}
        />
    );
}

// Combobox Label
function ComboboxLabel({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    return (
        <div
            data-slot="combobox-label"
            className={cn(
                "text-muted-foreground px-3.5 py-2.5 text-xs font-semibold",
                className,
            )}
            {...props}
        />
    );
}

// Combobox Empty
function ComboboxEmpty({
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>) {
    return (
        <CommandPrimitive.Empty
            data-slot="combobox-empty"
            className={cn(
                "text-muted-foreground py-6 text-center text-sm",
                className,
            )}
            {...props}
        />
    );
}

// Combobox Separator
function ComboboxSeparator({
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>) {
    return (
        <CommandPrimitive.Separator
            data-slot="combobox-separator"
            className={cn("bg-border/50 -mx-1 my-1 h-px", className)}
            {...props}
        />
    );
}

// Combobox Chips Container (for multi-select)
function ComboboxChips({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    return (
        <div
            data-slot="combobox-chips"
            className={cn(
                "bg-input/30 border-input focus-within:border-ring focus-within:ring-ring/50 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive dark:has-aria-invalid:border-destructive/50 flex min-h-9 flex-wrap items-center gap-1.5 rounded-4xl border bg-clip-padding px-2.5 py-1.5 text-sm transition-colors focus-within:ring-[3px] has-aria-invalid:ring-[3px] has-data-[slot=combobox-chip]:px-1.5",
                className,
            )}
            {...props}
        />
    );
}

// Combobox Chip (individual chip in multi-select)
const ComboboxChip = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<"div"> & {
        showRemove?: boolean;
        onRemove?: () => void;
    }
>(({ className, children, showRemove = true, onRemove, ...props }, ref) => {
    return (
        <div
            ref={ref}
            data-slot="combobox-chip"
            className={cn(
                "bg-muted-foreground/10 text-foreground flex h-[calc(--spacing(5.5))] w-fit items-center justify-center gap-1 rounded-4xl px-2 text-xs font-medium whitespace-nowrap has-data-[slot=combobox-chip-remove]:pr-0 has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50",
                className,
            )}
            {...props}
        >
            {children}
            {showRemove && (
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={onRemove}
                    className="-ml-1 opacity-50 hover:opacity-100"
                    data-slot="combobox-chip-remove"
                >
                    <X className="pointer-events-none size-4" />
                </Button>
            )}
        </div>
    );
});
ComboboxChip.displayName = "ComboboxChip";

// Combobox Chips Input (input within chips container)
function ComboboxChipsInput({
    className,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            data-slot="combobox-chip-input"
            className={cn(
                "min-w-16 flex-1 outline-none bg-transparent",
                className,
            )}
            {...props}
        />
    );
}

// Helper hook for anchor ref
function useComboboxAnchor() {
    return React.useRef<HTMLDivElement | null>(null);
}

// Value component for displaying selected value
function ComboboxValue({ ...props }: React.ComponentPropsWithoutRef<"span">) {
    return <span data-slot="combobox-value" {...props} />;
}

export {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxInput,
    ComboboxItem,
    ComboboxLabel,
    ComboboxList,
    ComboboxSeparator,
    ComboboxTrigger,
    ComboboxValue,
    useComboboxAnchor,
};
