/** @format */

import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Checkbox from "@/designSystem/Checkbox";

const normalizeStartTime = (time: string): string => {
   if (!time) return time;
   const normalized = time.length >= 5 ? time.substring(0, 5) : time;
   return normalized;
};

const normalizeEndTime = (time: string): string => {
   return normalizeStartTime(time);
};

type ShiftSegment = {
   weekday: number;
   start_time: string;
   end_time: string;
   break_minutes: number | null;
};

type WeekdaySegmentsEditorProps = {
   segments: ShiftSegment[];
   workingDays?: string[];
   onChange: (segments: ShiftSegment[]) => void;
};

const DEFAULT_WORKING_DAYS = [
   "Monday",
   "Tuesday",
   "Wednesday",
   "Thursday",
   "Friday",
];

const DAY_NAME_TO_WEEKDAY: Record<string, number> = {
   Sunday: 0,
   Monday: 1,
   Tuesday: 2,
   Wednesday: 3,
   Thursday: 4,
   Friday: 5,
   Saturday: 6,
};

function WeekdaySegmentsEditor({
   segments,
   workingDays,
   onChange,
}: WeekdaySegmentsEditorProps) {
   const { t } = useTranslation("settings");
   const workingDaysList = useMemo(() => {
      const sourceDays = (workingDays || []).length
         ? workingDays || []
         : DEFAULT_WORKING_DAYS;

      const mapped = sourceDays
         .map((day) => ({
            weekday: DAY_NAME_TO_WEEKDAY[day],
            name: day,
         }))
         .filter((day) => typeof day.weekday === "number");

      if (!mapped.length) {
         return DEFAULT_WORKING_DAYS.map((day) => ({
            weekday: DAY_NAME_TO_WEEKDAY[day],
            name: day,
         }));
      }

      return mapped.sort((a, b) => a.weekday - b.weekday);
   }, [workingDays]);
   const [localSegments, setLocalSegments] = useState<
      Record<
         number,
         {
            enabled: boolean;
            start_time: string;
            end_time: string;
            break_minutes: number | null;
         }
      >
   >({});

   // Initialize local state from segments prop
   useEffect(() => {
      const initial: typeof localSegments = {};
      workingDaysList.forEach((day) => {
         const existing = segments.find((s) => s.weekday === day.weekday);
         if (existing) {
            initial[day.weekday] = {
               enabled: true,
               start_time: normalizeStartTime(existing.start_time),
               end_time: normalizeEndTime(existing.end_time),
               break_minutes: existing.break_minutes,
            };
         } else {
            initial[day.weekday] = {
               enabled: false,
               start_time: "08:00",
               end_time: "23:59",
               break_minutes: 60,
            };
         }
      });
      setLocalSegments(initial);
   }, [segments, workingDaysList]);

   const handleToggleDay = (weekday: number) => {
      const updated = {
         ...localSegments,
         [weekday]: {
            ...localSegments[weekday],
            enabled: !localSegments[weekday]?.enabled,
         },
      };
      setLocalSegments(updated);
      updateParent(updated);
   };

   const handleTimeChange = (
      weekday: number,
      field: "start_time" | "end_time",
      value: string,
   ) => {
      const updated = {
         ...localSegments,
         [weekday]: {
            ...localSegments[weekday],
            [field]: value,
         },
      };
      setLocalSegments(updated);
      updateParent(updated);
   };

   const handleBreakChange = (weekday: number, value: string) => {
      const updated = {
         ...localSegments,
         [weekday]: {
            ...localSegments[weekday],
            break_minutes: value ? parseInt(value) : null,
         },
      };
      setLocalSegments(updated);
      updateParent(updated);
   };

   const updateParent = (updated: typeof localSegments) => {
      const newSegments: ShiftSegment[] = [];
      Object.entries(updated).forEach(([weekday, data]) => {
         if (data.enabled) {
            newSegments.push({
               weekday: parseInt(weekday),
               start_time: data.start_time,
               end_time: data.end_time,
               break_minutes: data.break_minutes,
            });
         }
      });
      onChange(newSegments);
   };

   return (
      <div className="flex flex-col gap-3">
         <label className="text-sm font-medium text-text-strong">
            {t("companySettings.shifts.modal.workingDays")}
            <span className="text-danger ml-1">*</span>
         </label>

         <div className="flex flex-col gap-2">
            {workingDaysList.map((day) => {
               const segment = localSegments[day.weekday];
               if (!segment) return null;

               return (
                  <div
                     key={day.weekday}
                     className="flex flex-col gap-2 p-3 rounded-xl border border-border bg-background">
                     <div className="flex items-center gap-2">
                        <Checkbox
                           checked={segment.enabled}
                           onChange={() => handleToggleDay(day.weekday)}
                        />
                        <span className="text-sm font-medium text-text-strong">
                           {t(
                              `companySettings.shifts.weekdays.${day.name.toLowerCase()}`,
                           )}
                        </span>
                     </div>

                     {segment.enabled && (
                        <div className="grid grid-cols-3 gap-3 ms-6">
                           <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-text-sub">
                                 {t("companySettings.shifts.modal.startTime")}
                              </label>
                              <input
                                 type="time"
                                 value={segment.start_time}
                                 onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                 ) =>
                                    handleTimeChange(
                                       day.weekday,
                                       "start_time",
                                       e.target.value,
                                    )
                                 }
                                 className="text-sm px-3 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                           </div>
                           <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-text-sub">
                                 {t("companySettings.shifts.modal.endTime")}
                              </label>
                              <input
                                 type="time"
                                 value={segment.end_time}
                                 onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                 ) =>
                                    handleTimeChange(
                                       day.weekday,
                                       "end_time",
                                       e.target.value,
                                    )
                                 }
                                 className="text-sm px-3 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                           </div>
                           <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-text-sub">
                                 {t(
                                    "companySettings.shifts.modal.breakMinutes",
                                 )}
                              </label>
                              <input
                                 type="number"
                                 value={segment.break_minutes?.toString() || ""}
                                 onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                 ) =>
                                    handleBreakChange(
                                       day.weekday,
                                       e.target.value,
                                    )
                                 }
                                 placeholder="0"
                                 min="0"
                                 className="text-sm px-3 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                           </div>
                        </div>
                     )}
                  </div>
               );
            })}
         </div>

         <p className="text-xs text-text-sub">
            {t("companySettings.shifts.modal.workingDaysHelp")}
         </p>
      </div>
   );
}

export default WeekdaySegmentsEditor;
