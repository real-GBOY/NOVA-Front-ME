/** @format */

import { useEffect, useRef, ReactNode, useState } from "react";
import Button from "@/designSystem/Button";
import { SortDescending } from "@/Icons";
import { useLanguage } from "@/hooks/useLanguage";
import Drawer from "@/designSystem/Drawer";

type FilterModalProps = {
   isOpen: boolean;
   onClose: () => void;
   onApply: () => void;
   onResetAll: () => void;
   triggerLabel: string;
   title: string;
   resetAllLabel: string;
   cancelLabel: string;
   applyLabel: string;
   applyDisabled?: boolean;
   children: ReactNode;
   className?: string;
   triggerClassName?: string;
};

function FilterModal({
   isOpen,
   onClose,
   onApply,
   onResetAll,
   triggerLabel,
   title,
   resetAllLabel,
   cancelLabel,
   applyLabel,
   applyDisabled = false,
   children,
   className = "",
   triggerClassName = "",
}: FilterModalProps) {
   const { isRTL } = useLanguage();
   const dropdownRef = useRef<HTMLDivElement>(null);
   const buttonRef = useRef<HTMLButtonElement>(null);
   const [isMobile, setIsMobile] = useState(false);

   useEffect(() => {
      const checkMobile = () => {
         setIsMobile(window.innerWidth < 768);
      };
      
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
   }, []);

   const handleApply = () => {
      if (applyDisabled) {
         return;
      }
      onApply();
      onClose();
   };

   const handleCancel = () => {
      onClose();
   };

   useEffect(() => {
      // Only attach click outside listener on desktop
      if (isMobile) return;

      const handleClickOutside = (event: MouseEvent) => {
         const target = event.target as Node;
         if (
            target instanceof Element &&
            target.closest("[data-datepicker-portal='true']")
         ) {
            return;
         }

         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(target) &&
            buttonRef.current &&
            !buttonRef.current.contains(target)
         ) {
            onClose();
         }
      };

      const handleEscape = (event: KeyboardEvent) => {
         if (event.key === "Escape") {
            onClose();
         }
      };

      if (isOpen) {
         document.addEventListener("mousedown", handleClickOutside);
         document.addEventListener("keydown", handleEscape);
      }

      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
         document.removeEventListener("keydown", handleEscape);
      };
   }, [isOpen, onClose, isMobile]);

   const renderContent = () => (
      <>
         {/* Header */}
         <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <p className="text-sm font-medium text-text-strong tracking-tight">
               {title}
            </p>
            <button
               onClick={onResetAll}
               className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
               {resetAllLabel}
            </button>
         </div>

         {/* Content */}
         <div className={`flex flex-col gap-6 p-4 overflow-y-auto ${isMobile ? 'flex-1' : 'max-h-[65vh]'}`}>
            {children}
         </div>

         {/* Footer */}
         <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border mt-auto shrink-0">
            <Button variant="secondary" onClick={handleCancel}>
               {cancelLabel}
            </Button>
            <Button onClick={handleApply} disabled={applyDisabled}>
               {applyLabel}
            </Button>
         </div>
      </>
   );

   return (
      <>
         <div className={`relative ${className}`}>
            <button
               ref={buttonRef}
               type="button"
               onClick={() => onClose()}
               className={`flex items-center gap-2 ps-2.5 pe-2 py-2 text-sm font-medium text-text-sub border border-border rounded-lg bg-background hover:bg-bg-weak transition-colors ${triggerClassName} ${
                  isOpen ? "bg-bg-weak" : ""
               }`}
               aria-expanded={isOpen}>
               <SortDescending isRTL={isRTL} />
               {triggerLabel}
            </button>

            {isOpen && !isMobile && (
               <div
                  ref={dropdownRef}
                  className="absolute top-full mt-2 w-[400px] bg-background border border-border rounded-3xl shadow-lg z-50 end-0">
                  {renderContent()}
               </div>
            )}
         </div>

         {/* Mobile Drawer */}
         {isMobile && (
            <Drawer
               isOpen={isOpen}
               onClose={onClose}
               side={isRTL ? "left" : "right"}
               width="w-full sm:w-[400px]"
            >
               {renderContent()}
            </Drawer>
         )}
      </>
   );
}

export default FilterModal;
