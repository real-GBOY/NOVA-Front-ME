import React from "react";
import { MemoCheckCircle } from "@/Icons";
import { Separator } from "@/designSystem/ui/separator";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useTranslation } from "@/hooks/useTranslation";
import type { DashboardRequestsSummary } from "@/services/dashboardService";

type RequestsChartProps = {
   data?: DashboardRequestsSummary;
};

export const RequestsChart = ({
   data: requestsData,
}: RequestsChartProps): JSX.Element => {
   const { t } = useTranslation("common");
   const requests = requestsData;

   const sumRequestType = (type?: {
      pending: number;
      approved: number;
      rejected: number;
   }) => (type?.pending ?? 0) + (type?.approved ?? 0) + (type?.rejected ?? 0);

   const chartData = [
      {
         name: t("charts.requests.attendance"),
         value: sumRequestType(requests?.attendance),
         color: "var(--c-chart-requests-attendance)",
      },
      {
         name: t("charts.requests.overtime"),
         value: sumRequestType(requests?.overtime),
         color: "var(--c-chart-requests-overtime)",
      },
      {
         name: t("charts.requests.timeOff"),
         value: sumRequestType(requests?.time_off),
         color: "var(--c-chart-requests-timeoff)",
      },
   ];

   const totalRequests = chartData.reduce(
      (acc, current) => acc + current.value,
      0
   );

   return (
      <div className="flex flex-col items-start gap-2 p-1.5 relative bg-bg-weak rounded-3xl border border-solid border-border h-full">
         <div className="flex flex-col items-start  p-4 relative self-stretch w-full bg-background rounded-[20px] overflow-hidden border border-solid border-border shadow-[0px_1px_2px_0px_rgba(10,13,20,0.08)] h-full">
            {/* Header */}
            <div className="flex items-center justify-center relative shrink-0 w-full">
               <div className="flex flex-1 gap-3 items-center min-h-px min-w-px relative shrink-0">
                  <div className="bg-background border border-border rounded-[10px] flex items-center p-1.5 shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] shrink-0">
                     <MemoCheckCircle
                        className="fill-chart-requests-attendance"
                        size={20}
                     />
                  </div>
                  <p className="flex-1 font-medium leading-6 min-h-px min-w-px text-base text-text-strong tracking-[-0.176px]">
                     {t("charts.requests.title")}
                  </p>
               </div>
            </div>

            <Separator className="bg-border h-px w-full mt-4 mb-2" />

            {/* Content */}
            <div className="flex gap-6 h-[103px] items-center overflow-hidden relative shrink-0 w-full">
               {/* Semi-Circle Chart */}
               <div className="h-[103px] overflow-hidden relative shrink-0 w-[187px]">
                  <ResponsiveContainer width="100%" height={206} minWidth={0}>
                     <PieChart>
                        <Pie
                           data={chartData}
                           cx="50%"
                           cy="50%"
                           startAngle={180}
                           endAngle={0}
                           innerRadius={85}
                           outerRadius={93}
                           paddingAngle={2}
                           dataKey="value"
                           stroke="none">
                           {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Pie>
                     </PieChart>
                  </ResponsiveContainer>

                  {/* Center Text */}
                  <div className="absolute flex flex-col gap-0.5 items-center left-1/2 top-[calc(50%+10.5px)] translate-x-[-50%] translate-y-[-50%]">
                     <div className="flex items-center justify-center relative shrink-0">
                        <p className="font-medium leading-7 text-xl text-text-strong">
                           {totalRequests}
                        </p>
                     </div>
                     <p className="font-medium leading-5 text-sm text-text-soft text-center tracking-[-0.084px]">
                        {t("charts.requests.total")}
                     </p>
                  </div>
               </div>

               {/* Legend / Stats */}
               <div className="flex flex-1 flex-col gap-3 items-start min-h-px min-w-px relative shrink-0 pt-5">
                  {chartData.map((item, index) => (
                     <div
                        key={index}
                        className="flex items-center justify-between relative shrink-0 w-full">
                        <div className="flex gap-2 items-center relative shrink-0">
                           <div
                              className="h-2 relative shrink-0 w-1 rounded-full"
                              style={{ backgroundColor: item.color }}
                           />
                           <p className="font-medium leading-4 text-xs text-text-sub">
                              {item.name}
                           </p>
                        </div>
                        <p className="font-medium leading-5 text-sm text-text-strong tracking-[-0.084px]">
                           {item.value}
                        </p>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
};
