/** @format */

import { KeyboardEvent } from "react";
import { ArrowRightSLine } from "@/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/hooks/useLanguage";

interface SidebarFooterProps {
   avatarSrc: string;
   name: string;
   role: string;
   onClick?: () => void;
}

function SidebarFooter({ avatarSrc, name, role, onClick }: SidebarFooterProps) {
   const { t } = useTranslation("common");
   const { isRTL } = useLanguage();

   const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (!onClick) return;
      if (event.key === "Enter" || event.key === " ") {
         event.preventDefault();
         onClick();
      }
   };

   const isInteractive = Boolean(onClick);

   return (
      <div
         className={`px-3 md:px-4 xl:px-4 py-2.5 md:py-3 xl:py-3 border-t border-border ${
            isInteractive ? "cursor-pointer" : ""
         }`}
         role={isInteractive ? "button" : undefined}
         tabIndex={isInteractive ? 0 : undefined}
         onClick={onClick}
         onKeyDown={handleKeyDown}>
         <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-purple-200 overflow-hidden shrink-0">
               <img
                  src={avatarSrc}
                  alt={t("aria.avatar")}
                  className="w-full h-full object-cover"
               />
            </div>
            <div className="flex-1 min-w-0">
               <div className="text-text-strong font-medium text-sm md:text-base xl:text-base truncate">
                  {name}
               </div>
               <div className="text-text-sub text-sm">{role}</div>
            </div>
            <div>
               <ArrowRightSLine isRTL={isRTL} />
            </div>
         </div>
      </div>
   );
}

export default SidebarFooter;
