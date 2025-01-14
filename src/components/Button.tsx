import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { Slot } from "@radix-ui/react-slot";

type ButtonProps = HTMLMotionProps<"button"> & {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "gradient";
  asChild?: boolean;
};

const Button = ({ children, className, variant = "primary", asChild = false, ...props }: ButtonProps) => {
  const Comp = asChild ? Slot : motion.button;
  
  return (
    <Comp
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
    </Comp>
  );
};

export default Button;