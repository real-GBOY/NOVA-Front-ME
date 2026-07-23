/** @format */

import { ReactNode } from "react";
import {
   SelectBoxCircleFill,
   ForbidFill,
   CheckCircle,
   ExclamationCircle,
   ErrorWarningFill,
} from "@/Icons";

export interface StatusTagProps {
   label: string;
   variant?:
      | "active"
      | "inactive"
      | "pending"
      | "completed"
      | "warning"
      | "error";
   icon?: ReactNode;
   className?: string;
}

const variantStyles = {
   active: {
      text: "text-green-strong",
      icon: SelectBoxCircleFill,
      fill: "fill-green-strong",
   },
   inactive: {
      text: "text-text-sub",
      icon: ForbidFill,
      fill: "fill-faded",
   },
   pending: {
      text: "text-warning",
      icon: ExclamationCircle,
      fill: "fill-warning",
   },
   completed: {
      text: "text-success",
      icon: CheckCircle,
      fill: "fill-success",
   },
   warning: {
      text: "text-warning",
      icon: ErrorWarningFill,
      fill: "fill-warning",
   },
   error: {
      text: "text-danger",
      icon: ExclamationCircle,
      fill: "fill-danger",
   },
};

function StatusTag({
   label,
   variant = "inactive",
   icon,
   className = "",
}: StatusTagProps) {
   const styles = variantStyles[variant] ?? variantStyles.inactive;
   const IconComponent = styles.icon;

   return (
      <div
         className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap w-fit ${styles.text} ${className}`}>
         {icon || <IconComponent size={16} className={styles.fill} />}
         <span className="text-sm">{label}</span>
      </div>
   );
}

export default StatusTag;
