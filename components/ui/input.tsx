import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2 text-sm text-[#3b4c45] shadow-[inset_0_1px_2px_rgba(255,255,255,0.55)] transition placeholder:text-[#9baea3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8caba] dark:border-white/12 dark:bg-[#24302a]/80 dark:text-[#d7e4dc] dark:placeholder:text-[#7f9488] dark:focus-visible:ring-[#88b7a1]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
