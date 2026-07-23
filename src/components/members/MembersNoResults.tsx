import React from "react";
// import Svg44 from "@/Icons/44"; // Removed
import { useTranslation } from "@/hooks/useTranslation";

const MembersNoResults: React.FC = () => {
   const { t } = useTranslation("members");

   return (
      <div className="flex w-full flex-col items-center justify-center gap-6 pt-12">
         <img
            src="/icons/image44.png"
            alt="No results found"
            className="w-[156px] h-[116px] object-contain mt-12"
         />
         <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-lg font-medium leading-6 text-text-strong tracking-tight">
               {t("noResults.title")}
            </p>
            <p className="w-[308px] text-sm text-text-sub font-normal leading-5">
               {t("noResults.description")}
            </p>
         </div>
      </div>
   );
};

export default MembersNoResults;
