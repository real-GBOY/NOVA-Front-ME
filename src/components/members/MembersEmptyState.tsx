import React from "react";
// import Svg42 from "@/Icons/42"; // Removed
import { useTranslation } from "@/hooks/useTranslation";

const MembersEmptyState: React.FC = () => {
   const { t } = useTranslation("members");

   return (
      <div className="flex w-full flex-col items-center justify-center gap-6 pt-12">
         <img
            src="/icons/image42.png"
            alt="No members"
            className="w-[152px] h-[117px] object-contain mt-12"
         />
         <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-lg font-medium leading-6 text-text-strong tracking-tight">
               {t("emptyState.title")}
            </p>
            <p className="w-[308px] text-sm text-text-sub font-normal leading-5">
               {t("emptyState.description")}
            </p>
         </div>
      </div>
   );
};

export default MembersEmptyState;
