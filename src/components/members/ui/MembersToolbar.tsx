/** @format */

import Button from "@/designSystem/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/hooks/useLanguage";
import {
   DiagramCells,
   GridSquare,
   FileExport,
   UserPlusCircleAlt,
   Search2Line,
} from "@/Icons";
import SortDropdown, { SortOption } from "@/designSystem/SortDropdown";
import MembersFilterDropdown, { MemberFilters } from "./MembersFilterDropdown";
import { PermissionGate } from "@/utilities/secure/PermissionGate";

export type ViewType = "table" | "grid";

type MembersToolbarProps<OptionId extends string = string> = {
   searchQuery: string;
   onSearchChange: (value: string) => void;
   onFilterClick: () => void;
   sortOptions: SortOption<OptionId>[];
   onSortChange: (optionId: OptionId) => void;
   viewType: ViewType;
   onViewTypeChange: (view: ViewType) => void;
   onExportClick: () => void;
   onAddMemberClick: () => void;
   onFiltersApply?: (filters: MemberFilters) => void;
};

function MembersToolbar<OptionId extends string>({
   searchQuery,
   onSearchChange,

   sortOptions,
   onSortChange,
   viewType,
   onViewTypeChange,
   onExportClick,
   onAddMemberClick,
   onFiltersApply,
}: MembersToolbarProps<OptionId>) {
   const { t } = useTranslation("members");
   const { isRTL } = useLanguage();

   return (
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between xl:whitespace-nowrap">
         <div className="flex w-full items-center gap-2 sm:flex-1">
            <div className="relative flex-1">
               <div
                  className={`absolute top-1/2 -translate-y-1/2 ${
                     isRTL ? "right-3" : "left-3"
                  }`}>
                  <Search2Line size={20} />
               </div>
               <input
                  type="text"
                  placeholder={t("searchMembers")}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className={`w-full text-xs md:text-sm xl:text-sm ${
                     isRTL ? "pr-10 pl-3" : "pl-10 pr-3"
                  } py-2 border border-border rounded-lg bg-background text-text-sub placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary/20`}
               />
            </div>
            <div className="flex items-center gap-2">
               <button
                  onClick={() => onViewTypeChange("table")}
                  className={`p-2 rounded-lg transition-colors ${
                     viewType === "table"
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-background border border-border hover:bg-bg-weak"
                  }`}>
                  <DiagramCells size={20} active={viewType === "table"} />
               </button>
               <button
                  onClick={() => onViewTypeChange("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                     viewType === "grid"
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-background border border-border hover:bg-bg-weak"
                  }`}>
                  <GridSquare size={20} active={viewType === "grid"} />
               </button>
            </div>
         </div>

         <div className="flex flex-col gap-2 w-full sm:flex-row sm:w-auto sm:flex-wrap sm:items-center">
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
               <MembersFilterDropdown
                  onApply={onFiltersApply}
                  triggerClassName="w-full justify-between"
               />
               <SortDropdown
                  label={t("filters.sortBy")}
                  options={sortOptions}
                  onSelect={onSortChange}
                  className="w-full sm:w-auto"
               />
            </div>
            <button
               onClick={onExportClick}
               className="w-full sm:w-auto flex items-center justify-start gap-1 px-2 py-2 text-xs sm:text-sm font-medium text-text-sub border border-border rounded-lg bg-background hover:bg-bg-weak transition-colors whitespace-nowrap">
               <FileExport />
               {t("common:actions.export")}
            </button>
            <PermissionGate permission="add_employee">
               <Button
                  onClick={onAddMemberClick}
                  className="w-full sm:w-auto flex items-center justify-start gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                  <UserPlusCircleAlt className="fill-current" />
                  <p className="text-sm tracking-tight whitespace-nowrap">{t("addMember")}</p>
               </Button>
            </PermissionGate>
         </div>
      </div>
   );
}

export default MembersToolbar;
