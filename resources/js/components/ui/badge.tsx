import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-all duration-300",
  {
    variants: {
      variant: {
        default:
          "bg-white text-gray-900 border-gray-300 uppercase",
        primary:
          "bg-gradient-primary text-white border-transparent shadow-sm",
        accent:
          "bg-gradient-accent text-white border-transparent shadow-sm",
        secondary:
          "bg-gradient-secondary text-white border-transparent shadow-sm",
        destructive:
          "bg-red-600 text-white border-transparent",
        outline:
          "bg-white text-gray-900 border-gray-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
