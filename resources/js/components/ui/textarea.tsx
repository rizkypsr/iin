import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-blue-100 selection:text-blue-900 border-gray-300 flex min-h-16 w-full border bg-white px-3 py-2 text-base transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus:border-blue-500 focus:ring-blue-500",
        "aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
