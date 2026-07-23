/** @format */

import { AlertFill } from "@/Icons";

interface RoleTagProps {
   label: string;
   showWarning?: boolean;
   size?: "sm" | "md";
   className?: string;
}

function RoleTag({
   label,
   showWarning = false,
   size = "md",
   className = "",
}: RoleTagProps) {
   const isSmall = size === "sm";

   return (
      <div
         className={`flex items-center gap-1 rounded-lg ${className} border border-border w-fit ${
            isSmall
               ? showWarning
                  ? "ps-1 pe-2 py-0.5"
                  : "px-2 py-0.5"
               : showWarning
               ? "ps-1 pe-2 py-1"
               : "px-2 py-1"
         }`}>
         {showWarning && <AlertFill size={16} className="fill-warning" />}
         <span
            className={`${
               isSmall ? "text-xs leading-4" : "text-sm"
            } text-text-sub truncate`}>
            {label}
         </span>
      </div>
   );
}

export default RoleTag;
