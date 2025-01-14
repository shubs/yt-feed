import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Slot } from "@radix-ui/react-slot";
import { forwardRef } from "react";

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "gradient";
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = "primary", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const MotionComp = motion(Comp);
    
    return (
      <MotionComp
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
      </MotionComp>
    );
  }
);

Button.displayName = "Button";

export default Button;