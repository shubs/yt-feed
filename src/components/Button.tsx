import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const Button = ({ children, className, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        "px-8 py-3 border-2 border-black rounded-full text-lg font-medium",
        "hover:bg-black hover:text-white transition-colors duration-200",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;