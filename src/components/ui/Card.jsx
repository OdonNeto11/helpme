// src/components/ui/Card.jsx
import { cn } from "../../lib/utils";

export function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        "bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-5",
        hover && "hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10 transition duration-300 group",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}