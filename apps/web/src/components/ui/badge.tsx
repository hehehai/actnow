import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "relative inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap font-medium text-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[1.5px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      shape: {
        simple: "rounded-full border px-2 py-0.5",
        bar: "before:-translate-y-1/2 rounded-[7px] border border-transparent py-1 pr-1.5 pl-3.5 before:absolute before:top-1/2 before:left-1.5 before:h-[55%] before:w-0.75 before:rounded-full before:bg-current",
        dot: "before:-translate-y-1/2 rounded-[7px] border border-transparent py-1 pr-1.5 pl-4.5 before:absolute before:top-1/2 before:left-1.5 before:size-2 before:rounded-full before:bg-current",
      },
      variant: {
        default: "",
        destructive: "",
        secondary: "",
        outline: "",
      },
    },
    defaultVariants: {
      shape: "simple",
      variant: "default",
    },
    compoundVariants: [
      // Simple
      {
        shape: "simple",
        variant: "default",
        class:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
      },
      {
        shape: "simple",
        variant: "destructive",
        class:
          "border-transparent bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
      },
      {
        shape: "simple",
        variant: "secondary",
        class:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
      },
      {
        shape: "simple",
        variant: "outline",
        class:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },

      // Bar
      {
        shape: "bar",
        variant: "default",
        class:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
      },
      {
        shape: "bar",
        variant: "destructive",
        class:
          "border-transparent bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
      },
      {
        shape: "bar",
        variant: "secondary",
        class:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
      },
      {
        shape: "bar",
        variant: "outline",
        class:
          "border-foreground/50 text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },

      // Dot
      {
        shape: "dot",
        variant: "default",
        class:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
      },
      {
        shape: "dot",
        variant: "destructive",
        class:
          "border-transparent bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
      },
      {
        shape: "dot",
        variant: "secondary",
        class:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
      },
      {
        shape: "dot",
        variant: "outline",
        class:
          "border-foreground/50 text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    ],
  }
);

function Badge({
  className,
  shape = "simple",
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  const defaultProps = {
    className: cn(badgeVariants({ className, shape, variant })),
    "data-slot": "badge",
  };

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(defaultProps, props),
    render,
  });
}
export { Badge, badgeVariants };
