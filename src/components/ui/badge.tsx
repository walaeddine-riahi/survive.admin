import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-[var(--radius-full)] border px-2 py-0.5 text-[12px] font-medium w-fit whitespace-nowrap shrink-0 transition-[var(--transition)]",
  {
    variants: {
      variant: {
        default:
          "border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
        secondary:
          "border-transparent bg-[var(--bg-hover)] text-[var(--text-primary)]",
        destructive:
          "border-transparent bg-[var(--error)] text-[var(--text-primary)]",
        outline:
          "border-[var(--border)] bg-transparent text-[var(--text-muted)]",
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
