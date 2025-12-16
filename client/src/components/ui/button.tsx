import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0" +
  // Native-like interaction animations
  " relative overflow-hidden hover-elevate active-elevate-2 transition-[transform,box-shadow] duration-150 active:scale-[0.96] transform-gpu",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border border-primary-border",
        destructive:
          "bg-destructive text-destructive-foreground border border-destructive-border",
        outline:
          // Outline buttons inherit container background but show primary-colored border & text.
          " text-primary border [border-color:var(--button-outline)] shadow-xs active:shadow-none ",
        secondary: "border bg-secondary text-secondary-foreground border border-secondary-border ",
        // Add a transparent border so that when someone toggles a border on later, it doesn't shift layout/size.
        ghost: "border border-transparent",
      },
      // Heights are set as "min" heights, because sometimes Ai will place large amount of content
      // inside buttons. With a min-height they will look appropriate with small amounts of content,
      // but will expand to fit large amounts of content.
      size: {
        default: "min-h-9 px-4 py-2",
        sm: "min-h-8 px-3 text-xs",
        lg: "min-h-10 px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
      // Call user-provided handler first to preserve behavior
      props.onPointerDown?.(e)
      try {
        const button = e.currentTarget
        const rect = button.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height) * 1.5
        const ripple = document.createElement("span")
        ripple.className = "ui-ripple"
        ripple.style.width = `${size}px`
        ripple.style.height = `${size}px`
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`
        button.appendChild(ripple)
        ripple.addEventListener("animationend", () => ripple.remove(), { once: true })
      } catch {
        // No-op: if anything goes wrong, avoid crashing the interaction
      }
    }
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        data-variant={variant ?? "default"}
        onPointerDown={handlePointerDown}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
