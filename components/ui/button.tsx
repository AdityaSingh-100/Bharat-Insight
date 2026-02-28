"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "default", size = "md", asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-org-primary)] disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-[var(--color-org-primary)] text-black hover:opacity-90":
              variant === "default",
            "hover:bg-white/5 text-white/70 hover:text-white":
              variant === "ghost",
            "border border-[var(--color-border)] bg-transparent text-white/70 hover:text-white hover:border-white/30":
              variant === "outline",
            "bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20":
              variant === "destructive",
          },
          {
            "h-7 px-2.5 text-xs": size === "sm",
            "h-9 px-4 text-sm": size === "md",
            "h-10 px-5 text-sm": size === "lg",
            "h-8 w-8 p-0": size === "icon",
          },
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
