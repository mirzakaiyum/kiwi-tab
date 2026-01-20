import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onMouseDown, onKeyDown, onBlur, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement>(null);

    // Use forwarded ref or inner ref
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || innerRef;

    const handleMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
      // Mark that focus came from mouse
      e.currentTarget.dataset.focusSource = "mouse";
      onMouseDown?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // If Tab key, mark keyboard navigation
      if (e.key === "Tab") {
        const target = e.currentTarget;
        target.dataset.focusSource = "keyboard";
      }
      onKeyDown?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Clear focus source on blur
      e.currentTarget.dataset.focusSource = "";
      onBlur?.(e);
    };

    return (
      <input
        type={type}
        className={cn(
          "border-border bg-background placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 flex h-9 w-full rounded-xl border px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={inputRef}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
