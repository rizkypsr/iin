import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none border-2",
  {
    variants: {
      variant: {
        default:
          "bg-white text-gray-900 border-gray-300 hover:border-gray-400 hover:bg-gray-50",
        primary:
          "bg-gradient-primary text-white border-transparent hover:shadow-lg transform hover:scale-105",
        accent:
          "bg-gradient-accent text-white border-transparent hover:shadow-lg transform hover:scale-105",
        secondary:
          "bg-gradient-secondary text-white border-transparent hover:shadow-lg transform hover:scale-105",
        destructive:
          "bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700",
        outline:
          "border-gray-300 bg-white text-gray-900 hover:border-blue-600 hover:text-blue-600",
        ghost:
          "border-transparent hover:border-gray-200 hover:bg-gray-50",
        link: "text-blue-600 underline-offset-4 hover:underline border-transparent hover:text-blue-700",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 px-6 has-[>svg]:px-4",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
