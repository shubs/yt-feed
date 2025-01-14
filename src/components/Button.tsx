import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

type ButtonProps = HTMLMotionProps<"button"> & {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
};

const Button = ({ children, className, variant = "primary", ...props }: ButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-colors",
        variant === "primary" && "bg-accent text-white hover:bg-accent/90",
        variant === "secondary" && "bg-gray-100 text-gray-900 hover:bg-gray-200",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;