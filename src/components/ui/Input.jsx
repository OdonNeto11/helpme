// src/components/ui/Input.jsx
import { cn } from "../../lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white placeholder-gray-500",
        className
      )}
      {...props}
    />
  );
}