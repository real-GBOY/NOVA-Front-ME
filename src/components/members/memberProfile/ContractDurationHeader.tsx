/** @format */

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { ClipboardClock } from "@/Icons";

interface ContractDurationHeaderProps {
   onTerminate: () => void;
   onExtendDuration: () => void;
}

const ContractDurationHeader: React.FC<ContractDurationHeaderProps> = ({
   onTerminate,
   onExtendDuration,
}) => {
   const { t } = useTranslation("members");

   return (
      <div className="r-stack items-start md:items-center r-gap-sm w-full xl:gap-3">
         <ClipboardClock className="fill-icon-sub" size={24} />
         <h3 className="flex-1 text-lg font-medium text-text-strong leading-6 tracking-[-0.27px]">
            {t("profile.contract.duration.title")}
         </h3>
         <div className="r-btn-group xl:flex-row xl:gap-3">
            <button
               onClick={onTerminate}
               className="r-btn-full bg-background border border-border rounded-lg flex items-center justify-center gap-0.5 shadow-subtle hover:bg-bg-weak transition-colors px-3 py-2 xl:px-2.5 xl:py-1">
               <span className="px-1 text-sm font-medium text-text-sub leading-5 tracking-[-0.084px]">
                  {t("profile.contract.duration.terminate")}
               </span>
            </button>
            <button
               onClick={onExtendDuration}
               className="r-btn-full bg-bg-dark rounded-lg flex items-center justify-center gap-0.5 hover:bg-opacity-90 transition-colors px-3 py-2 xl:px-2.5 xl:py-1">
               <span className="px-1 text-sm font-medium text-text-main leading-5 tracking-[-0.084px]">
                  {t("profile.contract.duration.extendDuration")}
               </span>
            </button>
         </div>
      </div>
   );
};

export default ContractDurationHeader;
