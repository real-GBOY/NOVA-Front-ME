/** @format */

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Trash, Edit } from "@/Icons";
import { cn } from "@/utilities/index";
import { motion } from "framer-motion";
import type { ExpenseType } from "../types";

interface ExpenseTypesFloatingActionBarProps {
   selectedCount: number;
   selectedRows: ExpenseType[];
   onDelete: (expenseTypes: ExpenseType[]) => void;
   onEdit: (expenseType: ExpenseType) => void;
   resetSignal?: unknown;
}

interface ActionButton {
   id: string;
   label: string;
   icon: React.ReactNode;
   onClick: () => void;
   variant: "default" | "danger";
}

function ActionButtons({
   actions,
   showCount,
}: {
   actions: ActionButton[];
   showCount: boolean;
}) {
   return (
      <div className="flex items-center">
         {actions.map((action, index) => (
            <div
               key={action.id}
               className={cn(
                  (showCount || index > 0) && "border-s border-border"
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
      </div>
   );
}

function ExpenseTypesFloatingActionBar({
   selectedCount,
   selectedRows,
   onDelete,
   onEdit,
   resetSignal,
}: ExpenseTypesFloatingActionBarProps) {
   const { t } = useTranslation("settings");
   const [isVisible, setIsVisible] = useState(false);
   const [shouldRender, setShouldRender] = useState(false);
   const [activeMode, setActiveMode] = useState<"single" | "multi">("single");
   const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

   // Store the last valid state to preserve during exit animation
   const lastStateRef = useRef<{
      count: number;
      rows: ExpenseType[];
      mode: "single" | "multi";
   }>({
      count: 0,
      rows: [],
      mode: "single",
   });

   const currentMode: "single" | "multi" =
      selectedCount === 1 ? "single" : "multi";

   // Handle visibility (enter/exit)
   useEffect(() => {
      if (selectedCount > 0) {
         if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
         }

         // Update mode and state
         setActiveMode(currentMode);
         lastStateRef.current = {
            count: selectedCount,
            rows: selectedRows,
            mode: currentMode,
         };

         setShouldRender(true);
         requestAnimationFrame(() => {
            requestAnimationFrame(() => {
               setIsVisible(true);
            });
         });
      } else {
         setIsVisible(false);
         timeoutRef.current = setTimeout(() => {
            setShouldRender(false);
         }, 300);
      }

      return () => {
         if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
   }, [selectedCount, currentMode, selectedRows]);

   useEffect(() => {
      if (resetSignal === undefined) return;
      if (selectedCount > 0) return;

      setIsVisible(false);
      if (timeoutRef.current) {
         clearTimeout(timeoutRef.current);
         timeoutRef.current = null;
      }

      timeoutRef.current = setTimeout(() => {
         setShouldRender(false);
         lastStateRef.current = {
            count: 0,
            rows: [],
            mode: "single",
         };
      }, 200);
   }, [resetSignal, selectedCount]);

   const displayRows =
      selectedCount > 0 ? selectedRows : lastStateRef.current.rows;
   const displayCount =
      selectedCount > 0 ? selectedCount : lastStateRef.current.count;
   const displayMode =
      selectedCount > 0 ? activeMode : lastStateRef.current.mode;

   if (!shouldRender) return null;

   const singleActions: ActionButton[] = [
      {
         id: "delete",
         label: t("expenseTypes.floatingBar.delete"),
         icon: <Trash size={20} className="fill-danger" />,
         onClick: () => onDelete(displayRows),
         variant: "danger",
      },
      {
         id: "edit",
         label: t("expenseTypes.floatingBar.edit"),
         icon: <Edit size={20} />,
         onClick: () => onEdit(displayRows[0]),
         variant: "default",
      },
   ];

   const multiActions: ActionButton[] = [
      {
         id: "delete",
         label: t("expenseTypes.floatingBar.deleteMultiple"),
         icon: <Trash size={20} className="fill-danger" />,
         onClick: () => onDelete(displayRows),
         variant: "danger",
      },
   ];

   const isSingle = displayMode === "single";

   return (
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex items-center justify-center py-4 pe-13 z-10 pointer-events-none">
         <motion.div
            layout
            className={cn(
               "pointer-events-auto bg-background rounded-xl overflow-hidden origin-center",
               "shadow-[0px_0px_0px_1px_rgba(51,51,51,0.04),0px_1px_1px_0.5px_rgba(51,51,51,0.04),0px_3px_3px_-1.5px_rgba(51,51,51,0.02),0px_6px_6px_-3px_rgba(51,51,51,0.04),0px_12px_12px_-6px_rgba(51,51,51,0.04),0px_24px_24px_-12px_rgba(51,51,51,0.04)]"
            )}
            initial={{ opacity: 0, y: 16 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{
               opacity: { duration: 0.18, ease: [0.32, 0.72, 0, 1] },
               y: { duration: 0.24, ease: [0.32, 0.72, 0, 1] },
               layout: {
                  type: "spring",
                  stiffness: 320,
                  damping: 26,
                  mass: 0.9,
               },
            }}>
            {/* Crossfade container */}
            <div className="relative">
               {/* Single selection view */}
               <div
                  className={cn(
                     "flex items-center transition-all duration-200 ease-out",
                     isSingle
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-full absolute inset-0 pointer-events-none"
                  )}>
                  <ActionButtons actions={singleActions} showCount={false} />
               </div>

               {/* Multi selection view */}
               <div
                  className={cn(
                     "flex items-center transition-all duration-200 ease-out",
                     !isSingle
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-full absolute inset-0 pointer-events-none"
                  )}>
                  <div className="flex items-center gap-2 px-3 py-2">
                     <p className="text-sm text-text-strong whitespace-nowrap">
                        ({displayCount}){" "}
                        {t("expenseTypes.floatingBar.selected")}
                     </p>
                  </div>
                  <ActionButtons actions={multiActions} showCount={true} />
               </div>
            </div>
         </motion.div>
      </div>
   );
}

export default ExpenseTypesFloatingActionBar;
