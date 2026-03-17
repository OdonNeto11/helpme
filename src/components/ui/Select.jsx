// src/components/ui/Select.jsx
import { cn } from "../../lib/utils";

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white appearance-none text-sm font-medium",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}