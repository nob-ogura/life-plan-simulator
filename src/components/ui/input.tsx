import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<"input">;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm " +
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring " +
          "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";

export { Input };
