import { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#e9f4ee] text-[#3f5a4f] dark:bg-[#2f3f37] dark:text-[#b8d2c5]",
        peach: "border-transparent bg-[#fde9d6] text-[#8e5e44] dark:bg-[#5f4334] dark:text-[#f5cfaf]",
        lavender:
          "border-transparent bg-[#efe7fa] text-[#6b567f] dark:bg-[#443654] dark:text-[#d5c5eb]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

function Badge({ className, variant, ...props }: HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
