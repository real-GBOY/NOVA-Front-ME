/** @format */

import { ReactNode } from "react";
import InfoCircleIcon from "@/Icons/info-circle";

interface KPICardProps {
   label: string;
   value: string | number | ReactNode;
   icon?: ReactNode;
   tooltip?: string;
}

function KPICard({ label, value, icon, tooltip }: KPICardProps) {
   return (
      <div className="bg-background border border-border rounded-xl md:rounded-2xl xl:rounded-2xl p-3 md:p-3.5 xl:p-3.5 r-min-w-0 xl:min-w-[200px] min-h-[88px] md:min-h-[96px] xl:min-h-[96px]">
         <div className="flex flex-col gap-2 md:gap-3 xl:gap-3">
            <div className="flex items-center gap-2 md:gap-2.5 xl:gap-2.5">
               <div className="border border-border rounded-lg p-1 md:p-1.5 xl:p-1.5 flex items-center justify-center shadow-subtle bg-background w-7 h-7 md:w-8.5 md:h-8.5 xl:w-8.5 xl:h-8.5 overflow-hidden shrink-0 [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5">
                  {icon}
               </div>
               <p className="text-[10px] md:text-xs xl:text-sm font-medium text-text-sub flex-1 truncate">
                  {label}
               </p>
               {tooltip && (
                  <div
                     className="relative cursor-help group"
                     data-tooltip={tooltip}>
                     <InfoCircleIcon />
                     <div className="absolute top-full end-0 mt-1.5 px-2 py-1 flex justify-center items-center gap-1 rounded-sm bg-text-strong text-text-main text-sm max-w-xs pointer-events-none z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:block">
                        {tooltip}
                        <div className="absolute bottom-full end-2 border-4 border-transparent border-b-text-strong" />
                     </div>
                  </div>
               )}
            </div>
            <p className="text-sm md:text-base xl:text-lg font-medium text-text-strong">{value}</p>
         </div>
      </div>
   );
}

export default KPICard;
