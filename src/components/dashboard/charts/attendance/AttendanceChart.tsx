import React, { useMemo } from "react";
import { UserCheckCircleAlt } from "@/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import { Separator } from "@/designSystem/ui/separator";
import type { DashboardDateRange } from "../header";
import type { DashboardAttendanceSummary } from "@/services/dashboardService";

type AttendanceChartProps = {
   data?: DashboardAttendanceSummary;
   range?: DashboardDateRange;
};

export const AttendanceChart = ({
   data,
}: AttendanceChartProps): JSX.Element => {
   const { t } = useTranslation("common");
   const attendance = data;
   const breakdown = attendance?.breakdown;
   const lateArrivals = breakdown?.late_arrivals ?? 0;
   const dayOffs = breakdown?.day_offs ?? 0;
   const onTime = breakdown?.on_time ?? 0;
   const totalBreakdown = lateArrivals + dayOffs + onTime;
   const attendanceRate =
      attendance?.rate_percent ?? Math.round((attendance?.rate ?? 0) * 100);
   const legendItems = [
      {
         label: t("charts.attendance.lateArrival"),
         color: "bg-chart-attendance-late",
      },
      {
         label: t("charts.attendance.dayOff"),
         color: "bg-chart-attendance-dayoff",
      },
      {
         label: t("charts.attendance.onTime"),
         color: "bg-chart-attendance-ontime",
      },
   ];

   const segments = useMemo(() => {
      if (!totalBreakdown) {
         return {
            lateArrival: 0,
            dayOff: 0,
            onTime: 0,
         };
      }
      return {
         lateArrival: Math.round((lateArrivals / totalBreakdown) * 100),
         dayOff: Math.round((dayOffs / totalBreakdown) * 100),
         onTime: Math.round((onTime / totalBreakdown) * 100),
      };
   }, [dayOffs, lateArrivals, onTime, totalBreakdown]);

   return (
      <div className="flex flex-col items-start gap-2 p-1.5 relative bg-bg-weak rounded-3xl border border-solid border-border">
         <div className="flex flex-col items-start gap-4 p-4 relative self-stretch w-full bg-background rounded-[20px] border border-solid border-border shadow-[0px_1px_2px_0px_rgba(10,13,20,0.08)] h-full">
            {/* Header */}
            <section className="flex items-center justify-between gap-2 w-full">
               <div className="flex items-center gap-3 flex-1">
                  <div className="inline-flex items-center justify-center p-1.5 bg-background rounded-[10px] border border-solid border-border shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)]">
                     <UserCheckCircleAlt
                        className="fill-chart-attendance-dayoff"
                        size={20}
                     />
                  </div>

                  <h2 className="flex-1 font-medium text-text-strong text-base tracking-[-0.176px] leading-6">
                     {t("charts.attendance.title")}
                  </h2>
               </div>

            </section>

            <Separator className="bg-border h-px w-full" />

            {/* Content */}
            <div className="flex flex-col gap-4 w-full flex-1">
               {/* Stats Row */}
               <div className="flex items-center gap-2">
                  <p className="text-[32px] font-medium text-text-strong leading-10 tracking-[-0.16px]">
                     {attendanceRate}%
                  </p>

                  {/* <div className="flex items-center gap-2">
                     <Badge
                        variant="outline"
                        className="inline-flex items-center justify-center gap-1 px-1.5 py-0.5 relative bg-badge-success-bg rounded-md overflow-hidden border border-solid border-badge-success-border">
                        <ArrowRightUpFill
                           className="fill-badge-success-text"
                           size={12}
                        />
                        <span className="font-medium text-badge-success-text text-xs leading-4">
                           {growth}%
                        </span>
                     </Badge>
                     <span className="text-sm font-medium text-text-sub leading-5 tracking-[-0.084px]">
                        {t("charts.attendance.vsLastWeek")}
                     </span>
                  </div> */}
               </div>

               {/* Chart & Legend */}
               <div className="flex flex-col gap-4 w-full">
                  {/* Progress Bar */}
                  <div className="flex w-full h-3 rounded-[2px] overflow-hidden bg-bg-weak gap-1">
                     <div
                        className="h-full bg-chart-attendance-late rounded-[2px]"
                        style={{ width: `${segments.lateArrival}%` }}
                     />
                     <div
                        className="h-full bg-chart-attendance-dayoff rounded-[2px]"
                        style={{ width: `${segments.dayOff}%` }}
                     />
                     <div
                        className="h-full bg-chart-attendance-ontime rounded-[2px]"
                        style={{ width: `${segments.onTime}%` }}
                     />
                  </div>

                  {/* Legend */}
                  <div className="flex items-start gap-4 flex-wrap">
                     {legendItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-1">
                           <div className="relative w-4 h-4 flex items-center justify-center">
                              <div
                                 className={`w-3 h-3 ${item.color} rounded-full ring-2 ring-white shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)]`}
                              />
                           </div>
                           <span className="font-medium text-text-sub text-xs leading-4">
                              {item.label}
                           </span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};
