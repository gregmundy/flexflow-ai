import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-xl border text-card-foreground shadow transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card border-border",
        glass: "glass-card glass-text-primary border-0 shadow-lg hover:shadow-xl",
        "glass-elevated": "glass-card-elevated glass-text-primary border-0 shadow-2xl",
        "glass-subtle": "glass-card-subtle glass-text-primary border-0 shadow-sm",
        "glass-purple": "glass-purple glass-text-primary border-0",
        "glass-blue": "glass-blue glass-text-primary border-0",
        "glass-interactive": "glass-card glass-interactive glass-text-primary border-0 cursor-pointer hover:scale-[1.02]",
      },
      animation: {
        none: "",
        "fade-in": "glass-fade-in",
        "slide-up": "glass-slide-up",
      }
    },
    defaultVariants: {
      variant: "default",
      animation: "none",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, animation, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, animation, className }))}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "glass" | "glass-accent"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "font-semibold leading-none tracking-tight",
      {
        "glass-text-primary": variant === "glass",
        "glass-text-purple": variant === "glass-accent",
      },
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "glass" | "glass-muted"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-sm",
      {
        "text-muted-foreground": variant === "default",
        "glass-text-secondary": variant === "glass",
        "glass-text-muted": variant === "glass-muted",
      },
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }
