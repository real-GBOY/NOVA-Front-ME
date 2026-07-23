/** @format */

import { Dot } from "@/Icons";
import { ReactNode } from "react";

export type BadgeTagVariant = "success" | "warning" | "error" | "info";

export interface BadgeTagProps {
   label: string;
   variant?: BadgeTagVariant;
   size?: "sm" | "md";
   icon?: ReactNode;
   className?: string;
}

const variantStyles: Record<BadgeTagVariant, string> = {
   success: "bg-success/10 text-success border-success/15",
   warning: "bg-warning/10 text-warning border-warning/15",
   error: "bg-error/10 text-error border-error/15",
   info: "bg-information/10 text-information border-information/15",
};

const dotColorMap: Record<BadgeTagVariant, string> = {
   success: "fill-success",
   warning: "fill-warning",
   error: "fill-error",
   info: "fill-information",
};

const sizeStyles = {
   sm: "ps-0.5 pe-2 py-0.5",
   md: "ps-0.5 pe-2 py-1",
};

function BadgeTag({
   label,
   variant = "info",
   size = "md",
   icon,
   className = "",
}: BadgeTagProps) {
   return (
      <div
         className={`inline-flex items-center rounded-md font-medium border transition-colors whitespace-nowrap w-fit ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
         <Dot className={dotColorMap[variant]} size={16} />
         {icon}
         <p className="text-xs leading-4">{label}</p>
      </div>
   );
}

export default BadgeTag;
