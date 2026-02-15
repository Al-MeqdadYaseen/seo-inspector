import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

interface StatusBadgeProps {
  type: "success" | "warning" | "error" | "info";
  text?: string;
  className?: string;
}

export function StatusBadge({ type, text, className }: StatusBadgeProps) {
  const config = {
    success: {
      icon: CheckCircle2,
      bg: "bg-emerald-500/15",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-500/20",
      defaultText: "Optimized",
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-amber-500/15",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-500/20",
      defaultText: "Warning",
    },
    error: {
      icon: AlertTriangle,
      bg: "bg-red-500/15",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-500/20",
      defaultText: "Critical Issue",
    },
    info: {
      icon: Info,
      bg: "bg-blue-500/15",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-500/20",
      defaultText: "Info",
    },
  };

  const { icon: Icon, bg, text: textColor, border, defaultText } = config[type];

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
      bg,
      textColor,
      border,
      className
    )}>
      <Icon className="w-3.5 h-3.5" />
      {text || defaultText}
    </span>
  );
}
