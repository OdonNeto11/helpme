// src/components/ui/Typography.jsx
import { cn } from "../../lib/utils";

export function Heading({ children, className, level = 1, ...props }) {
  const Tag = `h${level}`;
  const sizes = {
    1: "text-4xl font-bold text-white",
    2: "text-3xl font-bold text-white",
    3: "text-2xl font-bold text-white",
    4: "text-xl font-bold text-white",
    5: "text-lg font-bold text-white",
    6: "text-base font-bold text-white",
  };
  
  return (
    <Tag className={cn(sizes[level], className)} {...props}>
      {children}
    </Tag>
  );
}

export function Text({ children, className, variant = "base", ...props }) {
  const variants = {
    base: "text-base text-gray-300",
    sm: "text-sm text-gray-400",
    xs: "text-xs text-gray-500",
  };
  
  return (
    <p className={cn(variants[variant], className)} {...props}>
      {children}
    </p>
  );
}