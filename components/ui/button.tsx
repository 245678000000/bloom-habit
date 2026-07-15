import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-sage to-[#96c0ad] text-[#1d2c25] shadow-soft hover:brightness-[1.03] dark:from-[#80a894] dark:to-[#719b88] dark:text-white",
        secondary:
          "bg-white/70 text-[#50635a] shadow-soft hover:bg-white dark:bg-[#2a322e] dark:text-[#d2ded7]",
        ghost: "bg-transparent text-[#5c6d64] hover:bg-white/55 dark:text-[#cad8d0] dark:hover:bg-white/10",
        destructive:
          "bg-[#e79e8a] text-white shadow-soft hover:bg-[#dc8f7b] dark:bg-[#cf7b67] dark:hover:bg-[#bb6e5b]"
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-xl px-3 text-xs",
        lg: "h-12 rounded-2xl px-6",
        icon: "h-11 w-11"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
