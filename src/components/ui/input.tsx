import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex h-9 w-full rounded-md px-3 py-1 text-base shadow-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default: "border border-input bg-transparent placeholder:text-muted-foreground",
        glass: "glass-input border-0 placeholder:glass-text-muted rounded-lg focus:ring-2 focus:ring-purple-500/20",
        "glass-subtle": "glass-card-subtle border-0 placeholder:glass-text-muted glass-text-primary rounded-lg focus:ring-2 focus:ring-purple-500/20",
        "glass-purple": "glass-purple border-0 placeholder:glass-text-muted glass-text-primary rounded-lg focus:ring-2 focus:ring-purple-500/30",
        "glass-blue": "glass-blue border-0 placeholder:glass-text-muted glass-text-primary rounded-lg focus:ring-2 focus:ring-blue-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
