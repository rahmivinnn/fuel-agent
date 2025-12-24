import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface MobileContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "none";
}

export const MobileContainer = forwardRef<HTMLDivElement, MobileContainerProps>(
  ({ className, maxWidth = "md", children, ...props }, ref) => {
    const maxWidthClasses = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      none: "",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "w-full mx-auto px-4 py-6 transition-all duration-300 ease-out",
          maxWidth !== "none" && maxWidthClasses[maxWidth],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MobileContainer.displayName = "MobileContainer";