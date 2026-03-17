// src/components/ui/Button.jsx
import { cn } from "../../lib/utils";

export function Button({ children, className, variant = "primary", ...props }) {
  const baseStyles = "w-full py-3 px-4 rounded-xl font-semibold transition transform active:scale-95 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/50 border-none",
    secondary: "bg-gray-800/50 hover:bg-gray-700/80 text-white border border-gray-600",
    outline: "border border-orange-500 text-orange-500 hover:bg-orange-500/10",
    ghost: "bg-transparent text-gray-400 hover:text-white",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}