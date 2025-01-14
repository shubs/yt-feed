import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const Button = ({ children, className, ...props }: ButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "px-8 py-3 border-2 border-primary rounded-full text-lg font-medium",
        "bg-gradient-to-r from-purple-600 to-blue-600 text-white",
        "hover:shadow-lg hover:shadow-primary/20 transition-shadow duration-200",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;