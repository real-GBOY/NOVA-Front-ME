/** @format */

import { useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import ExclamationCircle from "@/Icons/exclamation-circle";
import ExclamationCircleRed from "@/Icons/exclamation-circle-red";
import InfoCircle from "@/Icons/info-circle";
import CheckCircle from "@/Icons/check-circle";
import { useTranslation } from "@/hooks/useTranslation";

type ConfirmModalProps = {
   isOpen: boolean;
   onClose: () => void;
   onConfirm: () => void;
   title: string;
   description: string;
   confirmText?: string;
   cancelText?: string;
   variant?: "error" | "primary";
   icon?: "exclamation" | "info";
   isLoading?: boolean;
   isSuccess?: boolean;
};

function ConfirmModal({
   isOpen,
   onClose,
   onConfirm,
   title,
   description,
   confirmText,
   cancelText,
   variant = "error",
   icon = "exclamation",
   isLoading = false,
   isSuccess = false,
}: ConfirmModalProps) {
   const { t } = useTranslation("common");

   const displayConfirmText = confirmText || t("actions.confirm");
   const displayCancelText = cancelText || t("actions.cancel");
   // Handle body overflow
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

   // Handle escape key
   useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
         if (e.key === "Escape" && isOpen) {
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

   // Determine icon and colors based on variant
   const isError = variant === "error";
   const isSuccessState = isSuccess;
   const iconColor = isSuccessState
      ? "fill-success text-success"
      : isError
      ? "fill-error"
      : "fill-primary";
   const iconBg = isSuccessState
      ? "bg-success/10"
      : isError
      ? "bg-error/10"
      : "bg-primary/10";
   const buttonColor = isError ? "bg-error" : "bg-primary";

   // Select icon component
   const IconComponent: ReactNode = isSuccessState ? (
      <CheckCircle size={24} className={iconColor} />
   ) : icon === "info" ? (
      <InfoCircle size={24} active={!isError} className={iconColor} />
   ) : isError ? (
      <ExclamationCircleRed size={24} className={iconColor} />
   ) : (
      <ExclamationCircle size={24} className={iconColor} />
   );

   return createPortal(
      <div
         className="fixed inset-0 z-60 flex items-center justify-center p-2 md:p-3 xl:p-4 bg-overlay rounded-2xl"
         onClick={onClose}>
         {/* Modal Content */}
         <div
            className="relative z-10 w-[95%] max-w-[400px] md:max-w-[420px] xl:w-full xl:max-w-[480px] rounded-2xl md:rounded-3xl overflow-hidden flex flex-col bg-background border border-border"
            onClick={(e) => e.stopPropagation()}>
            {/* Content */}
            <div className="flex items-start gap-3 md:gap-4 xl:gap-4 px-4 md:px-5 xl:px-5 py-4 md:py-5 xl:py-5">
               {/* Icon */}
               <div
                  className={`flex items-center justify-center p-1.5 md:p-2 xl:p-2 rounded-xl shrink-0 ${iconBg}`}>
                  {IconComponent}
               </div>

               {/* Text */}
               <div className="flex flex-col gap-0.5 md:gap-1 xl:gap-1 flex-1 min-w-0">
                  <h3 className="text-sm md:text-base xl:text-base font-medium leading-6 text-text-strong tracking-[-0.176px]">
                     {title}
                  </h3>
                  <p className="text-sm font-normal leading-5 text-text-sub tracking-[-0.084px]">
                     {description}
                  </p>
               </div>
            </div>

            {/* Footer */}
            <div className="px-4 md:px-5 xl:px-5 py-3 md:py-4 xl:py-4 border-t border-border">
               <div className="r-btn-group items-center justify-end gap-2 md:gap-3 xl:gap-3">
                  {displayCancelText && (
                     <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="r-btn-full px-2.5 md:px-3 xl:px-3 py-1.5 md:py-2 xl:py-2 rounded-xl text-sm font-medium leading-5 transition-colors text-text-sub bg-background border border-border hover:bg-bg-weak tracking-[-0.084px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        {displayCancelText}
                     </button>
                  )}
                  <button
                     type="button"
                     onClick={onConfirm}
                     disabled={isLoading || isSuccess}
                     className={`r-btn-full px-3 md:px-4 xl:px-4 py-2 md:py-2.5 xl:py-2.5 rounded-xl text-sm font-medium leading-5 transition-colors hover:opacity-90 text-text-main ${
                        isSuccess ? "bg-success" : buttonColor
                     } tracking-[-0.084px] cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2`}>
                     {isLoading && (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"></span>
                     )}
                     {isSuccess && (
                        <svg
                           className="w-5 h-5 text-white"
                           fill="none"
                           stroke="currentColor"
                           strokeWidth="2"
                           viewBox="0 0 24 24">
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                           />
                        </svg>
                     )}
                     {displayConfirmText}
                  </button>
               </div>
            </div>
         </div>
      </div>,
      document.body
   );
}

export default ConfirmModal;
