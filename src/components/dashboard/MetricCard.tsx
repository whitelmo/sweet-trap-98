import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "threat" | "warning" | "success";
}

const variantStyles = {
  default: "border-border",
  threat: "border-destructive/50 glow-destructive",
  warning: "border-warning/50 glow-warning",
  success: "border-success/50 glow-success",
};

const iconVariantStyles = {
  default: "text-primary",
  threat: "text-destructive",
  warning: "text-warning",
  success: "text-success",
};

export function MetricCard({ title, value, icon: Icon, trend, variant = "default" }: MetricCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg border bg-card p-6 transition-all hover:bg-card/80",
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold font-mono tracking-tight">{value}</p>
          {trend && (
            <p className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last hour
            </p>
          )}
        </div>
        <div className={cn(
          "rounded-lg bg-secondary p-3",
          iconVariantStyles[variant]
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      {/* Decorative corner accent */}
      <div className={cn(
        "absolute -bottom-1 -right-1 h-16 w-16 rounded-tl-full opacity-10",
        variant === "threat" && "bg-destructive",
        variant === "warning" && "bg-warning",
        variant === "success" && "bg-success",
        variant === "default" && "bg-primary"
      )} />
    </div>
  );
}
