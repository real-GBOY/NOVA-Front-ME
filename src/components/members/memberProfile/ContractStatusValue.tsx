/** @format */

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Dot } from "@/Icons";

interface ContractStatusValueProps {
   status: "Active" | "Expired" | "Upcoming" | "Terminated";
   daysRemaining?: number;
   onExtendDuration?: () => void;
}

const ContractStatusValue: React.FC<ContractStatusValueProps> = ({
   status,
   daysRemaining,
   onExtendDuration,
}) => {
   const { t } = useTranslation("members");

   const getStatusColorClass = (currentStatus: string) => {
      switch (currentStatus) {
         case "Active":
            return "fill-success-dark";
         case "Expired":
            return "fill-error";
         case "Upcoming":
            return "fill-warning";
         case "Terminated":
            return "fill-error";
         default:
            return "fill-text-sub";
      }
   };

   const getStatusLabel = (currentStatus: string) => {
      if (currentStatus === "Active" && daysRemaining !== undefined) {
         return t("profile.summary.badges.endsIn", { days: daysRemaining });
      }

      if (currentStatus === "Expired") {
         return t("profile.contract.duration.expired");
      }

      if (currentStatus === "Terminated") {
         return "Terminated";
      }

      // For other statuses, return the status itself (Active, Upcoming, Terminated)
      return currentStatus;
   };

   return (
      <div className="flex items-center justify-between w-full">
         <div className="bg-background border-[0.5px] border-border rounded-md ps-1 pe-2 py-0.5 flex items-center gap-0.5 shadow-[0px_1px_2px_-1px_rgba(10,13,20,0.08)] md:rounded-lg md:py-1 xl:rounded-lg xl:py-1">
            <Dot size={16} className={getStatusColorClass(status)} />
            <p className="text-[11px] font-medium text-text-sub leading-4 md:text-xs xl:text-xs">
               {getStatusLabel(status)}
            </p>
         </div>
         {status === "Expired" && onExtendDuration && (
            <button
               onClick={onExtendDuration}
               className="text-primary text-xs font-medium leading-5 tracking-[-0.084px] hover:underline md:text-sm xl:text-sm">
               {t("profile.contract.duration.extendDuration")}
            </button>
         )}
      </div>
   );
};

export default ContractStatusValue;
