import { SelectBoxCircleFill } from "@/Icons";
import TimeTimeline from "./TimeTimeline";
import { useTranslation } from "@/hooks/useTranslation";
import type { NormalizedAttendanceTimelineDay } from "./attendanceTimelineMapper";

interface TimeManagementScheduleListProps {
   data: NormalizedAttendanceTimelineDay[];
   isLoading: boolean;
   onResolveShiftBounds?: (date: string) => void;
   loadingShiftDates?: Record<string, boolean>;
}

function TimeManagementScheduleList({
   data,
   isLoading,
   onResolveShiftBounds,
   loadingShiftDates,
}: TimeManagementScheduleListProps) {
   const { t } = useTranslation("members");
   const legendItems = [
      {
         key: "workingTime",
         label: t("timeManagement.attendanceModal.types.workingTime"),
         color: "#9B59B6",
      },
      {
         key: "late",
         label: t("timeManagement.attendanceModal.types.late"),
         color: "#E74C3C",
      },
      {
         key: "absence",
         label: t("timeManagement.attendanceModal.types.absence"),
         color: "#FF69B4",
      },
      {
         key: "dayOff",
         label: t("timeManagement.attendanceModal.types.dayOff"),
         color: "#F39C12",
      },
      {
         key: "overtime",
         label: t("timeManagement.attendanceModal.types.overtime"),
         color: "#FF69B4",
      },
      {
         key: "break",
         label: t("timeManagement.attendanceModal.types.break"),
         color: "#2ECC71",
      },
      {
         key: "earlyLeave",
         label: t("timeManagement.attendanceModal.types.earlyLeave"),
         color: "#3498DB",
      },
      {
         key: "requestedDayOff",
         label: t("timeManagement.attendanceModal.types.requestedDayOff"),
         color: "#F1C40F",
      },
   ];

   if (isLoading) {
      return (
         <div className="flex items-center justify-center py-8">
            <p className="text-text-soft">{t("loading.general")}</p>
         </div>
      );
   }

   if (!data || data.length === 0) {
      return (
         <div className="flex items-center justify-center py-8">
            <p className="text-text-soft">
               {t("timeManagement.schedule.noData")}
            </p>
         </div>
      );
   }

   return (
      <div className="flex flex-col items-start relative size-full r-gap xl:gap-4">
         <div className="flex flex-col gap-2 ps-1">
            <p className="text-xs font-medium text-text-sub">
               {t("timeManagement.schedule.legendTitle")}
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-text-sub ">
               {legendItems.map((item) => (
                  <div key={item.key} className="flex items-center gap-2">
                     <span
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ backgroundColor: item.color }}
                     />
                     <span className="font-medium text-text-strong">
                        {item.label}
                     </span>
                  </div>
               ))}
            </div>
         </div>
         {data.map((day, index) => {
            const statusText =
               day.hasOvertime
                  ? t("timeManagement.schedule.overtimeApproved")
                  : day.hasDayOff
                  ? t("timeManagement.schedule.dayOffApproved")
                  : undefined;
            return (
               <div
                  key={`${day.date}-${index}`}
                  className="bg-background border border-stroke-sub-300 border-solid relative r-rounded size-full w-full xl:rounded-2xl">
                  <div className="box-border flex flex-col r-gap items-start overflow-clip r-p-sm relative rounded-[inherit] size-full w-full xl:gap-4 xl:p-4">
                     <div
                        className="flex gap-2 items-center justify-center relative w-full"
                        data-name="Title">
                        <p className="flex-1 font-medium leading-6 min-h-px min-w-px relative text-base text-text-strong tracking-[-0.176px] whitespace-pre-wrap">
                           {day.day_label}
                        </p>
                        {statusText && (
                           <div
                              className="bg-background border-[0.5px] border-stroke-sub-300 border-solid relative rounded-md"
                              data-name="Status Badge">
                              <div className="box-border flex gap-1 items-center overflow-clip pl-1 pr-2 py-1 relative rounded-[inherit]">
                                 <SelectBoxCircleFill
                                    className="fill-success"
                                    size={16}
                                 />
                                 <p className="font-medium leading-4 relative text-xs text-text-sub">
                                    {statusText}
                                 </p>
                              </div>
                           </div>
                        )}
                     </div>
                     <div
                        className="r-stack r-gap items-start overflow-clip relative w-full xl:gap-6"
                        data-name="Container">
                        <div
                           className="flex gap-4 items-center relative xl:gap-6"
                           data-name="Time">
                           <div
                              className="flex flex-col gap-1 items-start justify-center leading-5 relative text-sm tracking-[-0.084px] w-16 whitespace-pre-wrap"
                              data-name="Clock-in">
                              <p className="font-normal relative text-text-soft w-full">
                                 {t("timeManagement.schedule.clockIn")}
                              </p>
                              <p className="font-medium relative text-text-strong w-full">
                                 {day.clock_in || "-"}
                              </p>
                           </div>
                           <div
                              className="bg-bg-weak h-6 rounded-full w-px"
                              data-name="Divider"
                           />
                           <div
                              className="flex flex-col gap-1 items-start justify-center leading-5 relative text-sm tracking-[-0.084px] w-16 whitespace-pre-wrap"
                              data-name="Clock-out">
                              <p className="font-normal relative text-text-soft w-full">
                                 {t("timeManagement.schedule.clockOut")}
                              </p>
                              <p className="font-medium relative text-text-strong w-full">
                                 {day.clock_out || "-"}
                              </p>
                           </div>
                           <div
                              className="bg-bg-weak h-6 rounded-full w-px"
                              data-name="Divider"
                           />
                           <div
                              className="flex flex-col gap-1 items-start justify-center leading-5 relative text-sm tracking-[-0.084px] w-16 whitespace-pre-wrap"
                              data-name="Duration">
                              <p className="font-normal relative text-text-soft w-full">
                                 {t("timeManagement.schedule.duration")}
                              </p>
                              <p className="font-medium relative text-text-strong w-full">
                                 {day.duration_hours > 0
                                    ? `${day.duration_hours}h`
                                    : "-"}
                              </p>
                           </div>
                        </div>
                        <div
                           className="hidden xl:block bg-bg-weak h-6 rounded-full w-px"
                           data-name="Divider"
                        />
                        <div className="flex flex-1 flex-row items-center self-stretch">
                           <TimeTimeline
                              slots={day.segments}
                              shiftStartTime={day.shift_start || undefined}
                              shiftEndTime={day.shift_end || undefined}
                              onResolveShiftStart={
                                 !day.shift_start && onResolveShiftBounds
                                    ? () => onResolveShiftBounds(day.date)
                                    : undefined
                              }
                              onResolveShiftEnd={
                                 !day.shift_end && onResolveShiftBounds
                                    ? () => onResolveShiftBounds(day.date)
                                    : undefined
                              }
                              isResolvingShiftBounds={Boolean(loadingShiftDates?.[day.date])}
                           />
                        </div>
                     </div>
                  </div>
               </div>
            );
         })}
      </div>
   );
}

export default TimeManagementScheduleList;
