/** @format */

import { useEffect } from "react";
import { createPortal } from "react-dom";
import IconContainer from "./IconContainer";
import Button from "./Button";
import CloseLine from "@/Icons/close-line";

type ModalProps = {
   isOpen: boolean;
   onClose: () => void;
   title?: string;
   children: React.ReactNode;
   size?: "default" | "large" | "medium";
   showCloseButton?: boolean;
   footer?: React.ReactNode;
   width?: string;
   contentClassName?: string;
   showHeaderDivider?: boolean;
   zIndex?: string;
   overflow?: "auto" | "visible";
};

function Modal({
   isOpen,
   onClose,
   title,
   children,
   size = "default",
   showCloseButton = true,
   footer,
   width,
   contentClassName = "",
   showHeaderDivider = false,
   zIndex,
   overflow = "auto",
}: ModalProps) {
   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "";
      }

      return () => {
         document.body.style.overflow = "";
      };
   }, [isOpen]);

   useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
         if (e.key === "Escape") {
            onClose();
         }
      };

      if (isOpen) {
         document.addEventListener("keydown", handleEscape);
      }

      return () => {
         document.removeEventListener("keydown", handleEscape);
      };
   }, [isOpen, onClose]);

   if (!isOpen || typeof document === "undefined") return null;

   // Determine width classes
   const getWidthClass = () => {
      if (width) return width;
      if (size === "large") return "w-[98vw] xl:min-w-[98vw]";
      if (size === "medium") return "r-modal-w-md xl:w-[30rem]";
      return "r-modal-w xl:max-w-lg";
   };

   // Determine height classes
   const getHeightClass = () => {
      if (size === "large") return "r-modal-h-lg xl:h-[98vh]";
      return "r-modal-h xl:max-h-[90vh]";
   };

   // Determine content padding
   const getContentPadding = () => {
      if (size === "medium" && title) return "px-3 md:px-4 xl:px-4 py-3 md:py-4 xl:py-4";
      if (title && size !== "large") return "p-3 md:p-4 xl:p-4";
      return "";
   };

   return createPortal(
      <div
         className={`fixed inset-0 ${
            zIndex || "z-60"
         } flex items-center justify-center p-2 md:p-3 xl:p-4 bg-overlay/50 backdrop-blur-sm `}
         onClick={onClose}>
         {/* Modal Content */}
         <div
            className={`relative ${getWidthClass()} ${getHeightClass()} opacity-100 rounded-xl md:rounded-2xl xl:rounded-2xl border border-border rotate-0 bg-background flex flex-col ${
               !title && !footer ? "p-3 md:p-5 xl:p-6" : ""
            }`}
            onClick={(e) => e.stopPropagation()}>
            {title && (
               <>
                  <div className="flex items-center justify-between px-4 md:px-5 xl:px-5 py-3 md:py-4 xl:py-4 border-b border-border">
                     <h2
                        className={`${
                           size === "large" ? "text-lg" : "text-sm"
                        } font-medium text-text-strong tracking-tight`}>
                        {title}
                     </h2>
                     {showCloseButton && (
                        <button
                           onClick={onClose}
                           className="p-0.5 hover:bg-bg-weak rounded-md transition-colors cursor-pointer"
                           aria-label="Close">
                           <CloseLine size={20} className="fill-text-strong" />
                        </button>
                     )}
                  </div>
                  {showHeaderDivider && (
                     <div className="mx-4 md:mx-5 xl:mx-5 h-px bg-border"></div>
                  )}
               </>
            )}
            {!title && showCloseButton && (
               <div className="absolute top-3 end-3 md:top-4 md:end-4 xl:top-4 xl:end-4 z-20">
                  <Button
                     variant="secondary"
                     onClick={onClose}
                     className="p-2 rounded-lg text-text-soft hover:bg-bg-weak hover:text-text-strong transition-colors border-0 bg-transparent shadow-none">
                     <IconContainer
                        Icon={() => (
                           <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round">
                              <path d="M18 6L6 18M6 6l12 12" />
                           </svg>
                        )}
                        className="border-0 bg-transparent shadow-none p-0"
                     />
                  </Button>
               </div>
            )}

            {/* Content */}
            <div
               className={`flex-1 ${
                  size === "large" || size === "medium"
                     ? overflow === "visible"
                        ? "overflow-visible"
                        : "overflow-y-auto scrollbar-hide"
                     : ""
               } ${getContentPadding()} ${contentClassName}`}>
               {children}
            </div>

            {/* Footer */}
            {footer && (
               <div className="px-4 md:px-5 xl:px-5 py-3 md:py-4 xl:py-4 border-t border-border">{footer}</div>
            )}
         </div>
      </div>,
      document.body
   );
}

export default Modal;
