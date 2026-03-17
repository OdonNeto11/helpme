// src/components/ui/Textarea.jsx
import { cn } from "../../lib/utils";

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white placeholder-gray-500 resize-none min-h-[120px]",
        className
      )}
      {...props}
    />
  );
}