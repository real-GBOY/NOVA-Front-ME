/** @format */

import { ReactNode, useEffect, useState, useRef } from "react";
import { cn } from "@/utilities/index";
import { motion } from "framer-motion";

interface ActionButton {
   id: string;
   label: string;
   icon: ReactNode;
   onClick: () => void;
   variant?: "default" | "danger";
}

interface FloatingActionBarProps {
   selectedCount: number;
   selectedLabel: string;
   actions: ActionButton[];
   className?: string;
   showCount?: boolean;
}

function FloatingActionBar({
   selectedCount,
   selectedLabel,
   actions,
   className,
   showCount = true,
}: FloatingActionBarProps) {
   const [shouldRender, setShouldRender] = useState(false);
   const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

   useEffect(() => {
      if (selectedCount > 0) {
         if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
         }
         setShouldRender(true);
      } else {
         // Remove from DOM after animation completes
         timeoutRef.current = setTimeout(() => {
            setShouldRender(false);
         }, 300);
      }

      return () => {
         if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
         }
      };
   }, [selectedCount]);

   if (!shouldRender) return null;

   return (
      <div
         className={cn(
            "absolute left-1/2 -translate-x-1/2 bottom-0 flex items-center justify-center py-4 pe-13 z-10 pointer-events-none",
            className
         )}>
         {/* Floating bar container */}
         <motion.div
            key={`floating-bar-${selectedCount}`}
            className={cn(
               "pointer-events-auto flex items-center bg-background rounded-xl shadow-[0px_0px_0px_1px_rgba(51,51,51,0.04),0px_1px_1px_0.5px_rgba(51,51,51,0.04),0px_3px_3px_-1.5px_rgba(51,51,51,0.02),0px_6px_6px_-3px_rgba(51,51,51,0.04),0px_12px_12px_-6px_rgba(51,51,51,0.04),0px_24px_24px_-12px_rgba(51,51,51,0.04)] overflow-hidden"
            )}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{
               opacity: { duration: 0.18, ease: [0.32, 0.72, 0, 1] },
               y: { duration: 0.24, ease: [0.32, 0.72, 0, 1] },
            }}>
            {/* Selected count */}
            {showCount && (
               <div className="flex items-center gap-2 px-3 py-2">
                  <p className="text-sm text-text-strong whitespace-nowrap">
                     ({selectedCount > 0 ? selectedCount : 1}) {selectedLabel}
                  </p>
               </div>
            )}

            {actions.map((action, index) => (
               <div
                  key={action.id}
                  className={cn(
                     showCount || index > 0 ? "border-s border-border" : ""
                  )}>
                  <button
                     onClick={action.onClick}
                     className={cn(
                        "flex items-center gap-1 px-3 py-2 transition-colors hover:bg-bg-weak",
                        action.variant === "danger"
                           ? "text-danger"
                           : "text-text-strong"
                     )}>
                     {action.icon}
                     <span className="text-sm font-medium whitespace-nowrap">
                        {action.label}
                     </span>
                  </button>
               </div>
            ))}
         </motion.div>
      </div>
   );
}

export default FloatingActionBar;
