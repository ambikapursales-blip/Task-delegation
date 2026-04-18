import * as React from "react";

const buttonVariants = {
  base: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  variants: {
    variant: {
      default: "bg-[#C1533A] text-white hover:bg-[#a03f2a]",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline:
        "border border-[#C1533A] bg-background text-[#C1533A] hover:bg-[#faeae6]",
      ghost: "hover:bg-[#faeae6] text-[#C1533A]",
      link: "text-[#C1533A] underline-offset-4 hover:underline",
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3 text-xs",
      lg: "h-11 px-8",
      icon: "h-10 w-10",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
};

function getButtonClass(variant = "default", size = "default") {
  let classes = buttonVariants.base;
  classes += " " + buttonVariants.variants.variant[variant];
  classes += " " + buttonVariants.variants.size[size];
  return classes;
}

const Button = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={
        getButtonClass(variant, size) + (className ? " " + className : "")
      }
      ref={ref}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
