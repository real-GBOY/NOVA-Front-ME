/** @format */

import { Dot } from "@/Icons";
import { ReactNode } from "react";

export interface PermissionTagProps {
   label: string;
   isOverride?: boolean;
   size?: "sm" | "md";
   icon?: ReactNode;
   className?: string;
}

const styleMap = {
   default: "bg-information/10 text-information  border-information/15",
   override: "bg-warning/10 text-warning  border-warning/15",
};

const sizeStyles = {
   sm: "ps-0.5 pe-2 py-0.5",
   md: "ps-0.5 pe-2 py-1",
};

function PermissionTag({
   label,
   isOverride = false,
   size = "md",
   icon,
   className = "",
}: PermissionTagProps) {
   const variant = isOverride ? "override" : "default";
   const dotColor = isOverride ? "fill-warning" : "fill-information";
   return (
      <div
         className={`inline-flex items-center rounded-md font-medium border transition-colors whitespace-nowrap w-fit ${styleMap[variant]} ${sizeStyles[size]} ${className}`}>
         <Dot className={dotColor} size={16} />
         {icon}
         <p className="text-xs leading-4">{label}</p>
      </div>
   );
}

export default PermissionTag;
