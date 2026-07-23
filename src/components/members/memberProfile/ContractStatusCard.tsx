/** @format */

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { WalletClock } from "@/Icons";
import ContractStatusValue from "./ContractStatusValue";

interface ContractStatusCardProps {
   status: "Active" | "Expired" | "Upcoming" | "Terminated";
   daysRemaining?: number;
   onExtendDuration?: () => void;
}

const ContractStatusCard: React.FC<ContractStatusCardProps> = ({
   status,
   daysRemaining,
   onExtendDuration,
}) => {
   const { t } = useTranslation("members");

   return (
      <div className="flex flex-col border border-border bg-background shadow-subtle r-rounded gap-2 p-2 md:gap-3 md:p-3 xl:rounded-2xl xl:gap-3 xl:p-3">
         {/* Title row with icon */}
         <div className="flex items-center gap-2 w-full">
            <div className="rounded-md border border-border bg-background p-1 shadow-subtle md:rounded-lg md:p-1.5 xl:rounded-lg xl:p-1.5">
               <WalletClock className="fill-highlighted" size={20} />
            </div>
            <p className="flex-1 text-sm font-medium leading-5 text-text-sub tracking-[-0.176px] md:text-base md:leading-6 xl:text-base xl:leading-6">
               {t("profile.summary.contractStatus")}
            </p>
         </div>

         {/* Value row */}
         <div className="flex items-center w-full">
            <ContractStatusValue
               status={status}
               daysRemaining={daysRemaining}
               onExtendDuration={onExtendDuration}
            />
         </div>
      </div>
   );
};

export default ContractStatusCard;
