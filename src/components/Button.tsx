import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { Slot } from "@radix-ui/react-slot";
import { forwardRef } from "react";

type ButtonBaseProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "gradient";
  asChild?: boolean;
};

type ButtonProps = ButtonBaseProps & 
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof HTMLMotionProps<"button">> & 
  HTMLMotionProps<"button">;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = "primary", asChild = false, ...props }, ref) => {
    if (asChild) {
      return (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Slot
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              variant === "primary" && "bg-accent text-white hover:bg-accent/90",
              variant === "secondary" && "bg-gray-100 text-gray-900 hover:bg-gray-200",
              variant === "gradient" && "bg-gradient-to-r from-red-500 to-red-600 text-white hover:opacity-90",
              className
            )}
            ref={ref}
            {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
          >
            {children}
          </Slot>
        </motion.div>
      );
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "px-4 py-2 rounded-lg font-medium transition-colors",
          variant === "primary" && "bg-accent text-white hover:bg-accent/90",
          variant === "secondary" && "bg-gray-100 text-gray-900 hover:bg-gray-200",
          variant === "gradient" && "bg-gradient-to-r from-red-500 to-red-600 text-white hover:opacity-90",
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;