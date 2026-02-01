"use client";

import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as React from "react";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-300 ease-in-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-green-600 data-[state=checked]:border-green-600 data-[state=checked]:shadow-lg data-[state=checked]:shadow-green-500/30",
      "data-[state=unchecked]:bg-gradient-to-r data-[state=unchecked]:from-slate-200 data-[state=unchecked]:to-slate-300 data-[state=unchecked]:border-slate-300",
      "hover:data-[state=checked]:shadow-xl hover:data-[state=checked]:shadow-green-500/40 hover:data-[state=checked]:scale-105",
      "hover:data-[state=unchecked]:border-slate-400",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-all duration-300 ease-in-out",
        "data-[state=checked]:translate-x-5 data-[state=checked]:shadow-xl data-[state=checked]:scale-110",
        "data-[state=unchecked]:translate-x-0 data-[state=unchecked]:shadow-md"
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
