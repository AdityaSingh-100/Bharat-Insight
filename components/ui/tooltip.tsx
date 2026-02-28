"use client";
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { clsx } from "clsx";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={clsx(
      "z-50 rounded-md px-2.5 py-1.5 text-xs text-white/90 shadow-xl animate-in fade-in-0 zoom-in-95",
      className,
    )}
    style={{
      background: "hsl(224 71% 10%)",
      border: "1px solid var(--color-border)",
    }}
    {...props}
  />
));
TooltipContent.displayName = "TooltipContent";
