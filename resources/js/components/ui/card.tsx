import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const cardVariants = cva(
  "flex flex-col gap-6 py-6 shadow-sm border transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-white text-gray-900 border-gray-200",
        gradient: "bg-gradient-accent text-white border-transparent shadow-lg",
        outline: "bg-white text-gray-900 border-2 border-gray-300 hover:border-gray-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Card({ 
  className, 
  variant,
  ...props 
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
}

function CardHeader({ 
  className, 
  variant, 
  ...props 
}: React.ComponentProps<"div"> & { variant?: "default" | "gradient" }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 border-b pb-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        variant === "gradient" ? "border-white/20" : "border-gray-200",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, variant, ...props }: React.ComponentProps<"div"> & { variant?: "default" | "gradient" }) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "leading-none font-semibold",
        variant === "gradient" ? "text-white" : "text-gray-900",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, variant, ...props }: React.ComponentProps<"div"> & { variant?: "default" | "gradient" }) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-sm",
        variant === "gradient" ? "text-white/80" : "text-gray-600",
        className
      )}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, variant, ...props }: React.ComponentProps<"div"> & { variant?: "default" | "gradient" }) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center px-6 border-t pt-6",
        variant === "gradient" ? "border-white/20" : "border-gray-200",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
