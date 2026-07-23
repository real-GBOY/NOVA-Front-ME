/** @format */

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import AddButton from "@/designSystem/AddButton";
import Button from "@/designSystem/Button";
import { MAIN_COLORS } from "@/services/constants/COLORS";
import { AddHourLeaveModal, AddOvertimeModal, AddVacationModal } from "./modals";

import TimeManagementFilterDropdown, {
   TimeManagementFilters,
} from "./TimeManagementFilterDropdown";

type TabType = "shift" | "attendance" | "timeOff" | "overtime" | "history";

interface TimeManagementHeaderProps {
   activeTab: TabType;
   onTabChange: (tab: TabType) => void;
   onFilterApply: (filters: TimeManagementFilters) => void;
   currentFilters: TimeManagementFilters;
   defaultFilters: TimeManagementFilters;
   showShiftTab?: boolean;
   showAttendanceActions?: boolean;
   onCheckIn?: () => void;
   onCheckOut?: () => void;
}

function TimeManagementHeader({
   activeTab,
   onTabChange,
   onFilterApply,
   currentFilters,
   defaultFilters,
   showShiftTab = false,
   showAttendanceActions = false,
   onCheckIn,
   onCheckOut,
}: TimeManagementHeaderProps) {
   const { t } = useTranslation("members");
   const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
   const [isHourLeaveModalOpen, setIsHourLeaveModalOpen] = useState(false);
   const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);

   const tabs: { id: TabType; label: string }[] = [
      ...(showShiftTab
         ? [{ id: "shift" as TabType, label: t("profile.tabs.shift") }]
         : []),
      { id: "attendance", label: t("timeManagement.tabs.attendance") },
      { id: "timeOff", label: t("timeManagement.tabs.timeOff") },
      { id: "overtime", label: t("timeManagement.tabs.overtime") },
      { id: "history", label: t("timeManagement.tabs.history") },
   ];

   const handleAddClick = () => {
      switch (activeTab) {
         case "overtime":
            setIsOvertimeModalOpen(true);
            break;
      }
   };

   return (
      <>
         <div className="r-stack items-start md:items-center justify-between r-gap-sm w-full pb-3 xl:pb-4 xl:gap-4">
            <div className="bg-bg-weak flex p-0.5 rounded-lg overflow-x-auto">
               {tabs.map((tab) => (
                  <button
                     key={tab.id}
                     onClick={() => onTabChange(tab.id)}
                     className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap xl:px-4 xl:py-1 xl:text-sm ${
                        activeTab === tab.id
                           ? "bg-background shadow-sm text-text-strong"
                           : "text-text-soft hover:bg-background/50"
                     }`}>
                     {tab.label}
                  </button>
               ))}
            </div>

            <div className="r-stack items-start md:items-center r-gap-sm w-full md:w-auto md:justify-end xl:flex-row xl:flex-nowrap xl:items-center xl:justify-end xl:gap-2 xl:flex-1">
               {activeTab !== "shift" && activeTab !== "history" && (
                  <TimeManagementFilterDropdown
                     activeTab={activeTab}
                     onApply={onFilterApply}
                     currentFilters={currentFilters}
                     defaultFilters={defaultFilters}
                  />
               )}

               {activeTab === "attendance" && showAttendanceActions && (
                  <div className="r-stack items-center gap-2">
                     <Button
                        variant="secondary"
                        onClick={onCheckIn}
                        className="r-btn-full text-sm font-medium xl:px-3 xl:py-2">
                        {t("timeManagement.checkActions.checkIn")}
                     </Button>
                     <Button
                        variant="secondary"
                        onClick={onCheckOut}
                        className="r-btn-full text-sm font-medium xl:px-3 xl:py-2">
                        {t("timeManagement.checkActions.checkOut")}
                     </Button>
                  </div>
               )}

               {activeTab === "timeOff" && (
                  <div className="r-stack items-center gap-2">
                     <AddButton
                        onClick={() => setIsVacationModalOpen(true)}
                        text={t("timeManagement.addButtons.addVacation")}
                        backgroundColor={MAIN_COLORS.light["bg-dark"]}
                     />
                     <AddButton
                        onClick={() => setIsHourLeaveModalOpen(true)}
                        text={t("timeManagement.addButtons.addHourLeave")}
                        backgroundColor={MAIN_COLORS.light["bg-dark"]}
                     />
                  </div>
               )}

               {activeTab === "overtime" && (
                  <AddButton
                     onClick={handleAddClick}
                     text={t("timeManagement.addButtons.addOvertime")}
                     backgroundColor={MAIN_COLORS.light["bg-dark"]}
                  />
               )}
            </div>
         </div>

         <AddVacationModal
            isOpen={isVacationModalOpen}
            onClose={() => setIsVacationModalOpen(false)}
         />

         <AddHourLeaveModal
            isOpen={isHourLeaveModalOpen}
            onClose={() => setIsHourLeaveModalOpen(false)}
         />

         <AddOvertimeModal
            isOpen={isOvertimeModalOpen}
            onClose={() => setIsOvertimeModalOpen(false)}
         />
      </>
   );
}

export default TimeManagementHeader;
