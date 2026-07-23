/** @format */

import { AlertFill, CheckCircle, CloseLine } from "@/Icons";
import { useTranslation } from "@/hooks/useTranslation";

interface ToastContentProps {
   message: string;
   boldText?: string;
   onClose?: () => void;
   type?: "success" | "error" | "info";
}

export const ToastContent = ({
   message,
   boldText,
   onClose,
   type = "success",
}: ToastContentProps) => {
   const { t } = useTranslation("common");

   // Split message to handle bold text properly
   const parts = boldText ? message.split(`"${boldText}"`) : [message];

   const getIcon = () => {
      switch (type) {
         case "success":
            return (
               <CheckCircle
                  active={true}
                  className="shrink-0 fill-success"
                  size={20}
               />
            );
         case "error":
            return (
               <AlertFill active={true} className="fill-danger" size={20} />
            );
         case "info":
            return (
               <AlertFill active={true} className="fill-primary" size={20} />
            );
         default:
            return null;
      }
   };

   return (
      <div className="bg-background border border-border rounded-xl flex items-center px-2.5 py-2 shadow-lg ring-1 ring-black/5 justify-between">
         <div className="flex gap-2">
            {getIcon()}
            <p className="text-sm font-normal leading-5 text-text-strong">
               {parts[0]}
               {boldText && (
                  <>
                     "<span className="font-medium">{boldText}</span>"
                  </>
               )}
               {parts[1]}
            </p>
         </div>
         <button
            onClick={onClose}
            className="w-5 h-5 text-text-strong opacity-40 hover:opacity-60 transition-opacity flex items-center justify-center self-end place-self-end"
            aria-label={t("aria.close")}>
            <CloseLine />
         </button>
      </div>
   );
};
