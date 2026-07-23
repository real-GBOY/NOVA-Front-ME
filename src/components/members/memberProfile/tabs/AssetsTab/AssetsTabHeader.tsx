/** @format */

import { Search2Line, InfoCircle } from "@/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import AssetsFilterDropdown, { AssetsFilters } from "./AssetsFilterDropdown";

interface AssetsTabHeaderProps {
   searchQuery: string;
   onSearchChange: (query: string) => void;
   onFilterApply: (filters: AssetsFilters) => void;
}

function AssetsTabHeader({
   searchQuery,
   onSearchChange,
   onFilterApply,
}: AssetsTabHeaderProps) {
   const { t } = useTranslation("members");

   return (
      <div className="r-stack items-start md:items-center justify-between r-gap-sm w-full xl:gap-4">
         <div className="flex w-full flex-wrap items-center r-gap-sm md:justify-end xl:gap-2">
            <div className="w-full md:max-w-xs xl:max-w-xs bg-background border border-stroke-sub-300 rounded-lg flex items-center gap-2 px-3 py-2 xl:px-2.5 xl:py-2">
               <Search2Line className="size-5 fill-text-sub" />
               <input
                  type="text"
                  placeholder={t("profile.assets.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-text-strong placeholder:text-text-soft min-w-0"
               />
               <InfoCircle className="size-5 fill-text-sub" />
            </div>

            <AssetsFilterDropdown onApply={onFilterApply} />
         </div>
      </div>
   );
}

export default AssetsTabHeader;
