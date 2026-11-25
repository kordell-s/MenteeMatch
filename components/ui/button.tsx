import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-semibold tracking-[-0.005em] transition-[background-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-tape-blue focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-ink text-chalk shadow-[0_1px_0_rgb(0_0_0/0.2)] hover:bg-gray-700",
        tape:
          "bg-tape-yellow text-ink shadow-[inset_0_-2px_0_rgb(0_0_0/0.12)] hover:bg-[#ffdb63]",
        destructive:
          "bg-tape-red text-white hover:bg-red-700",
        outline:
          "border border-ink/15 bg-card text-ink hover:border-ink/30 hover:bg-chalk",
        secondary:
          "bg-gray-100 text-ink hover:bg-gray-200",
        ghost:
          "text-ink-soft hover:bg-ink/5 hover:text-ink",
        link: "text-ink underline decoration-ink/30 decoration-2 underline-offset-4 hover:decoration-ink",
      },
      size: {
        default: "h-10 px-4 has-[>svg]:px-3.5",
        sm: "h-8 gap-1.5 px-3 text-[13px] has-[>svg]:px-2.5",
        lg: "h-12 px-6 text-base has-[>svg]:px-5",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }
>(function Button({ className, variant, size, asChild = false, ...props }, ref) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});

export { Button, buttonVariants };
