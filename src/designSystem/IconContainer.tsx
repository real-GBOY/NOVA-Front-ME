/** @format */

import React from "react";

function IconContainer({
   Icon,
   className = "",
   onClick,
   isRTL,
}: {
   Icon: React.ElementType;
   className?: string;
   onClick?: () => void;
   isRTL?: boolean;
}) {
   const defaultClasses =
      "rounded-sm p-0.5 bg-background border-border border shadow-subtle cursor-pointer";
   return (
      <div
         className={`${defaultClasses} ${className}`}
         onClick={onClick}
         role={onClick ? "button" : undefined}
         tabIndex={onClick ? 0 : undefined}
         onKeyDown={
            onClick
               ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                       e.preventDefault();
                       onClick();
                    }
                 }
               : undefined
         }>
         <Icon isRTL={isRTL} />
      </div>
   );
}

export default IconContainer;
