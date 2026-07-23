/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import type { ViewShift } from "./types";

type ViewShiftDetailsModalProps = {
   isOpen: boolean;
   onClose: () => void;
   shift: ViewShift;
};

const WEEKDAY_NAMES = [
   "Sunday",
   "Monday",
   "Tuesday",
   "Wednesday",
   "Thursday",
   "Friday",
   "Saturday",
];

const formatDisplayTime = (time: string): string => {
   if (!time) return time;
   if (time.startsWith("24:00")) return "24:00";
   return time.length >= 5 ? time.substring(0, 5) : time;
};

function ViewShiftDetailsModal({
   isOpen,
   onClose,
   shift,
}: ViewShiftDetailsModalProps) {
   const { t } = useTranslation("settings");

   const footer = (
      <div className="flex justify-end gap-3 w-full">
         <Button onClick={onClose}>
            {t("companySettings.shifts.modal.close")}
         </Button>
      </div>
   );

   return (
      <Modal
         isOpen={isOpen}
         onClose={onClose}
         title={t("companySettings.shifts.modal.viewTitle")}
         width="w-[35rem]"
         size="medium"
         footer={footer}>
         <div className="flex flex-col gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium text-text-strong">
                  {t("companySettings.shifts.modal.name")}
               </label>
               <div className="px-3 py-2.5 rounded-xl bg-bg-weak border border-border text-sm text-text-strong">
                  {shift.name}
               </div>
            </div>

            {/* Description */}
            {shift.description && (
               <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-strong">
                     {t("companySettings.shifts.modal.description")}
                  </label>
                  <div className="px-3 py-2.5 rounded-xl bg-bg-weak border border-border text-sm text-text-sub">
                     {shift.description}
                  </div>
               </div>
            )}

            {/* Timezone */}
            <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium text-text-strong">
                  {t("companySettings.shifts.modal.timezone")}
               </label>
               <div className="px-3 py-2.5 rounded-xl bg-bg-weak border border-border text-sm text-text-strong">
                  {shift.timezone}
               </div>
            </div>

            {/* Default Status */}
            <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium text-text-strong">
                  {t("companySettings.shifts.table.isDefault")}
               </label>
               <div className="px-3 py-2.5 rounded-xl bg-bg-weak border border-border text-sm text-text-strong">
                  {shift.isDefault
                     ? t("companySettings.shifts.table.yes")
                     : t("companySettings.shifts.table.no")}
               </div>
            </div>

            {/* Working Days Schedule */}
            <div className="flex flex-col gap-2">
               <label className="text-sm font-medium text-text-strong">
                  {t("companySettings.shifts.modal.schedule")}
               </label>
               <div className="flex flex-col gap-2">
                  {shift.segments
                     .sort((a, b) => a.weekday - b.weekday)
                     .map((segment) => (
                        <div
                           key={segment.weekday}
                           className="flex items-center justify-between p-3 rounded-xl bg-bg-weak border border-border">
                           <span className="text-sm font-medium text-text-strong">
                              {t(
                                 `companySettings.shifts.weekdays.${WEEKDAY_NAMES[
                                    segment.weekday
                                 ].toLowerCase()}`,
                              )}
                           </span>
                           <div className="flex items-center gap-4 text-sm text-text-sub">
                              <span>
                                 {formatDisplayTime(
                                    segment.start_time,
                                 )}{" "}
                                 -{" "}
                                 {formatDisplayTime(
                                    segment.end_time,
                                 )}
                              </span>
                              {segment.break_minutes !== null && (
                                 <span className="text-xs">
                                    {t("companySettings.shifts.modal.break")}:{" "}
                                    {segment.break_minutes}{" "}
                                    {t("companySettings.shifts.modal.minutes")}
                                 </span>
                              )}
                           </div>
                        </div>
                     ))}
               </div>
            </div>
         </div>
      </Modal>
   );
}

export default ViewShiftDetailsModal;
