import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const widgetVariants = cva(
  "relative flex flex-col whitespace-nowrap rounded-4xl gradient-border",
  {
    variants: {
      size: {
        sm: "w-full h-44",
        md: "w-96 h-48",
        lg: "size-96",
      },
      design: {
        default: "p-4",
        tight: "p-4",
      },
      variant: {
        default: "bg-white/10 dark:bg-white/10 backdrop-blur-2xl text-foreground",
        secondary: "bg-secondary text-secondary-foreground",
      },
    },
    defaultVariants: {
      size: "sm",
      design: "default",
      variant: "default",
    },
  },
);

export interface WidgetProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof widgetVariants> {
  asChild?: boolean;
}

const Widget = React.forwardRef<HTMLDivElement, WidgetProps>(
  ({ className, size, design, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(widgetVariants({ size, design, variant, className }))}
      {...props}
    />
  ),
);
Widget.displayName = "Widget";

const WidgetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-semibold flex flex-none items-start justify-between",
      className,
    )}
    {...props}
  />
));
WidgetHeader.displayName = "WidgetHeader";

const WidgetTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("leading-none font-semibold tracking-tight text-xl", className)}
    {...props}
  />
));
WidgetTitle.displayName = "WidgetTitle";

const WidgetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-1 items-center justify-center", className)}
    {...props}
  />
));
WidgetContent.displayName = "WidgetContent";

const WidgetFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-none items-center justify-between", className)}
    {...props}
  />
));
WidgetFooter.displayName = "WidgetFooter";

export {
  Widget,
  WidgetHeader,
  WidgetTitle,
  WidgetContent,
  WidgetFooter,
  widgetVariants,
};
