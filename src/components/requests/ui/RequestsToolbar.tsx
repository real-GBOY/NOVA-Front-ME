/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/hooks/useLanguage";
import { Search2Line } from "@/Icons";
import SortDropdown, { SortOption } from "@/designSystem/SortDropdown";
import Button from "@/designSystem/Button";
import RequestsFilterDropdown, {
   type RequestFilterData,
} from "./RequestsFilterModal";
import type { RequestTabType } from "@/types/requests";
import ExportButton from "@/components/common/ExportButton";

export type RequestsViewType = "table";

type RequestsToolbarProps<OptionId extends string = string> = {
   searchQuery: string;
   onSearchChange: (value: string) => void;
   searchDisabled?: boolean;
   searchNote?: string;
   onFilterApply: (filters: RequestFilterData) => void;
   sortOptions: SortOption<OptionId>[];
   onSortChange: (optionId: OptionId) => void;
   activeTab: RequestTabType;
   onTabChange: (tab: RequestTabType) => void;
   initialFilters?: RequestFilterData;
   className?: string;
   exportData?: any[];
   rawData?: any[];
   rawDataIdField?: string;
   canViewAttendance?: boolean;
   canViewTimeOff?: boolean;
   canViewOvertime?: boolean;
};

function RequestsToolbar<OptionId extends string>({
   searchQuery,
   onSearchChange,
   onFilterApply,
   sortOptions,
   onSortChange,
   activeTab,
   onTabChange,
   searchDisabled = false,
   searchNote,
   initialFilters,
   className,
   exportData = [],
   rawData = [],
   rawDataIdField = "id",
   canViewAttendance = true,
   canViewTimeOff = true,
   canViewOvertime = true,
}: RequestsToolbarProps<OptionId>) {
   const { t } = useTranslation("requests");
   const { isRTL } = useLanguage();

   const allTabs: { id: RequestTabType; label: string; visible: boolean }[] = [
      {
         id: "attendance",
         label: t("tabs.attendance"),
         visible: canViewAttendance,
      },
      { id: "timeOff", label: t("tabs.timeOff"), visible: canViewTimeOff },
      { id: "overtime", label: t("tabs.overtime"), visible: canViewOvertime },
   ];

   const tabs = allTabs.filter((tab) => tab.visible);

   // Dynamic filename based on active tab
   const getFilename = () => {
      if (activeTab === "attendance") return "attendance_requests";
      if (activeTab === "timeOff") return "timeoff_requests";
      return "overtime_requests";
   };

   const getSheetName = () => {
      if (activeTab === "attendance") return "Attendance Requests";
      if (activeTab === "timeOff") return "Time Off Requests";
      return "Overtime Requests";
   };

   return (
      <div
         className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:whitespace-nowrap ${
            isRTL ? "sm:flex-row-reverse" : ""
         } ${className ?? ""}`}>
         {/* Tabs */}
         <div className="bg-bg-weak flex p-0.5 rounded-lg w-full sm:w-auto overflow-x-auto sm:overflow-visible">
            {tabs.map((tab) => (
               <Button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`!px-4 !py-1 !text-sm !font-medium !rounded-md !transition-colors !whitespace-nowrap ${
                     activeTab === tab.id
                        ? "!bg-background !shadow-sm !text-text-strong hover:!bg-background"
                        : "!text-text-soft hover:!bg-background/50 !bg-transparent !border-0"
                  }`}>
                  {tab.label}
               </Button>
            ))}
         </div>

         {/* Search, Filter, and Sort */}
         <div className="flex flex-col gap-2 w-full sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <div className="w-full sm:max-w-xs">
               <div className="relative">
                  <div
                     className={`absolute top-1/2 -translate-y-1/2 ${
                        isRTL ? "right-3" : "left-3"
                     }`}>
                     <Search2Line size={20} />
                  </div>
                  <div
                     className={`w-full text-xs md:text-sm xl:text-sm ${
                        isRTL ? "pr-10 pl-3" : "pl-10 pr-3"
                     } py-2 text-text-sub cursor-default`}
                     aria-label="Use filters to filter user requests">
                     {searchQuery || "Use filters to filter user requests"}
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:flex-wrap sm:items-center">
               <RequestsFilterDropdown
                  onApply={onFilterApply}
                  initialFilters={initialFilters}
                  triggerClassName="w-full justify-between"
               />
               <SortDropdown
                  label={t("actions.sortBy")}
                  options={sortOptions}
                  onSelect={onSortChange}
                  className="w-full sm:w-auto"
               />
               <ExportButton
                  data={exportData}
                  rawData={rawData}
                  idField={rawDataIdField}
                  filename={getFilename()}
                  sheetName={getSheetName()}
                  className="w-full sm:w-auto text-xs sm:text-sm whitespace-nowrap justify-start col-span-2 sm:col-span-1"
               />
            </div>
         </div>
      </div>
   );
}

export default RequestsToolbar;
