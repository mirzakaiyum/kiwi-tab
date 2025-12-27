import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <InputPrimitive
            type={type}
            data-slot="input"
            className={cn(
                "bg-input/30 border-border/80 focus-visible:border-border aria-invalid:border-destructive/20 dark:aria-invalid:border-destructive/40 h-9 rounded-xl border px-3 py-1 text-base transition-colors file:h-7 file:text-sm file:font-medium focus-visible:border aria-invalid:border md:text-sm file:text-foreground placeholder:text-muted-foreground w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    );
}

export { Input };
