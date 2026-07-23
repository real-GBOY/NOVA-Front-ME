/** @format */

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Trash, Edit } from "@/Icons";
import { cn } from "@/utilities/index";
import { motion } from "framer-motion";
import { Service } from "./types";

interface ServicesFloatingActionBarProps {
   selectedCount: number;
   selectedRows: Service[];
   onDelete: (services: Service[]) => void;
   onEdit: (service: Service) => void;
   resetSignal?: unknown;
   canEdit?: boolean;
   canDelete?: boolean;
}

function ServicesFloatingActionBar({
   selectedCount,
   selectedRows,
   onEdit,
   onDelete,
   resetSignal,
   canEdit = true,
   canDelete = true,
}: ServicesFloatingActionBarProps) {
   const { t } = useTranslation("settings");
   const [isVisible, setIsVisible] = useState(false);
   const [shouldRender, setShouldRender] = useState(false);
   const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

   // Store the last valid state to preserve during exit animation
   const lastStateRef = useRef<{
      count: number;
      mode: "single" | "multi";
   }>({
      count: 0,
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

         // Update state
         lastStateRef.current = {
            count: selectedCount,
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
   }, [selectedCount, currentMode]);

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
            mode: "single",
         };
      }, 200);
   }, [resetSignal, selectedCount]);

   const displayCount =
      selectedCount > 0 ? selectedCount : lastStateRef.current.count;
   const displayMode =
      selectedCount > 0 ? currentMode : lastStateRef.current.mode;

   if (!shouldRender || (!canEdit && !canDelete)) return null;

   const isSingle = displayMode === "single";

   return (
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center py-4 pe-13">
         <motion.div
            layout
            className={cn(
               "pointer-events-auto origin-center overflow-hidden rounded-xl bg-background",
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
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none absolute inset-0 -translate-y-full opacity-0"
                  )}>
                  {canEdit && (
                     <button
                        onClick={() => onEdit(selectedRows[0])}
                        className="flex items-center gap-1 px-3 py-2 text-text-strong transition-colors hover:bg-bg-weak cursor-pointer">
                        <Edit size={20} />
                        <span className="whitespace-nowrap text-sm font-medium">
                           {t("serviceCatalog.floatingBar.editService")}
                        </span>
                     </button>
                  )}
                  {canDelete && (
                     <div className={cn(canEdit ? "border-s border-border" : "")}>
                        <button
                           onClick={() => onDelete(selectedRows)}
                           className="flex items-center gap-1 px-3 py-2 text-danger transition-colors hover:bg-bg-weak cursor-pointer">
                           <Trash size={20} className="fill-danger" />
                           <span className="whitespace-nowrap text-sm font-medium">
                              {t("serviceCatalog.floatingBar.deleteService")}
                           </span>
                        </button>
                     </div>
                  )}
               </div>

               {/* Multi selection view */}
               <div
                  className={cn(
                     "flex items-center transition-all duration-200 ease-out",
                     !isSingle
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none absolute inset-0 translate-y-full opacity-0"
                  )}>
                  <div className="flex items-center gap-2 px-3 py-2">
                     <p className="whitespace-nowrap text-sm text-text-strong">
                        ({displayCount}){" "}
                        {t("serviceCatalog.floatingBar.servicesSelected")}
                     </p>
                  </div>
                  {canDelete && (
                     <div className="border-s border-border">
                        <button
                           onClick={() => onDelete(selectedRows)}
                           className="flex items-center gap-1 px-3 py-2 text-danger transition-colors hover:bg-bg-weak cursor-pointer">
                           <Trash size={20} className="fill-danger" />
                           <span className="whitespace-nowrap text-sm font-medium">
                              {t("serviceCatalog.floatingBar.deleteServices")}
                           </span>
                        </button>
                     </div>
                  )}
               </div>
            </div>
         </motion.div>
      </div>
   );
}

export default ServicesFloatingActionBar;
