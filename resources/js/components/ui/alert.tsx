import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border",

        // --- SUCCESS ---
        success: `
          bg-[var(--success)]
          text-[var(--success-foreground)]
          border-[var(--success)]
          [&>svg]:text-[var(--success-foreground)]
        `,

        // --- ERROR ---
        destructive: `
          bg-[var(--destructive)]
          text-[var(--destructive-foreground)]
          border-[var(--destructive)]
          [&>svg]:text-[var(--destructive-foreground)]
        `,

        // --- WARNING ---
        warning: `
          bg-[var(--warning)]
          text-[var(--warning-foreground)]
          border-[var(--warning)]
          [&>svg]:text-[var(--warning-foreground)]
        `,

        // --- INFO ---
        info: `
          bg-[var(--info)]
          text-[var(--info-foreground)]
          border-[var(--info)]
          [&>svg]:text-[var(--info-foreground)]
        `,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)


function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-[hsl(var(--foreground))] col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
