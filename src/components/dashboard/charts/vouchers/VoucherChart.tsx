import React, { useMemo } from "react";
import {
   Area,
   AreaChart,
   CartesianGrid,
   XAxis,
   YAxis,
   TooltipProps,
} from "recharts";
import { Separator } from "@/designSystem/ui/separator";
import { Badge } from "@/designSystem/ui/badge";
import { ChartContainer, ChartTooltip } from "@/designSystem/ui/chart";
import ArrowRightUpFill from "@/Icons/arrow-right-up-fill";
import ArrowLeftDownFill from "@/Icons/arrow-left-down-fill";
import PollSquare from "@/Icons/poll-square";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/hooks/useLanguage";
import type { DashboardDateRange } from "../header";
import type { DashboardVouchersSummary } from "@/services/dashboardService";
import type {
   NameType,
   ValueType,
} from "recharts/types/component/DefaultTooltipContent";

const CustomYAxisTick = ({ x, y, payload }: any) => {
   return (
      <g transform={`translate(${x},${y})`}>
         <svg x={-50} y={-6} width="12" height="12" viewBox="0 0 344.84 299.91">
            <path
               fill="var(--c-text-sub)"
               d="M342.14,140.96l2.7,2.54v-7.72c0-17-11.92-30.84-26.56-30.84h-23.41C278.49,36.7,222.69,0,139.68,0c-52.86,0-59.65,0-109.71,0,0,0,15.03,12.63,15.03,52.4v52.58h-27.68c-5.38,0-10.43-2.08-14.61-6.01l-2.7-2.54v7.72c0,17.01,11.92,30.84,26.56,30.84h18.44s0,29.99,0,29.99h-27.68c-5.38,0-10.43-2.07-14.61-6.01l-2.7-2.54v7.71c0,17,11.92,30.82,26.56,30.82h18.44s0,54.89,0,54.89c0,38.65-15.03,50.06-15.03,50.06h109.71c85.62,0,139.64-36.96,155.38-104.98h32.46c5.38,0,10.43,2.07,14.61,6l2.7,2.54v-7.71c0-17-11.92-30.83-26.56-30.83h-18.9c.32-4.88.49-9.87.49-15s-.18-10.11-.51-14.99h28.17c5.37,0,10.43,2.07,14.61,6.01ZM89.96,15.01h45.86c61.7,0,97.44,27.33,108.1,89.94l-153.96.02V15.01ZM136.21,284.93h-46.26v-89.98l153.87-.02c-9.97,56.66-42.07,88.38-107.61,90ZM247.34,149.96c0,5.13-.11,10.13-.34,14.99l-157.04.02v-29.99l157.05-.02c.22,4.84.33,9.83.33,15Z"
            />
         </svg>
         <text
            x={-50 + 12 + 5} // Icon's right edge + 5px gap
            y={0}
            dy={4}
            textAnchor="start" // Start from this x
            fill="var(--c-text-sub)" // Using system color variable
            fontSize={14}
            fontFamily="inherit">
            {`${payload.value / 1000}k`}
         </text>
      </g>
   );
};

type VoucherChartProps = {
   data?: DashboardVouchersSummary;
   range?: DashboardDateRange;
};

export const VoucherChart = ({ data }: VoucherChartProps): JSX.Element => {
   const { t } = useTranslation("common");
   const { isRTL } = useLanguage();
   const vouchers = data;
   const paymentTotal = vouchers?.payment?.total_amount ?? 0;
   const receiptTotal = vouchers?.receipt?.total_amount ?? 0;
   const formatAmount = (value: number) => value.toLocaleString();

   const legendItems = [
      {
         color: "bg-chart-payment",
         label: t("charts.vouchers.paymentVoucher"),
      },
      {
         color: "bg-chart-receipt",
         label: t("charts.vouchers.receiptVoucher"),
      },
   ];

   const statsData = useMemo(
      () => [
         {
            label: t("charts.vouchers.paymentVoucher"),
            Icon: ArrowRightUpFill,
            iconColor: "fill-chart-payment",
            value: formatAmount(paymentTotal),
            change: "0%",
            badgeBg: "bg-badge-error-bg",
            badgeBorder: "border-badge-error-border",
            badgeText: "text-badge-error-text",
         },
         {
            label: t("charts.vouchers.receiptVoucher"),
            Icon: ArrowLeftDownFill,
            iconColor: "fill-chart-receipt",
            value: formatAmount(receiptTotal),
            change: "0%",
            badgeBg: "bg-badge-success-bg",
            badgeBorder: "border-badge-success-border",
            badgeText: "text-badge-success-text",
         },
      ],
      [paymentTotal, receiptTotal, t]
   );

   const chartData = useMemo(() => {
      // Use the days data from the API if available
      if (vouchers?.days && vouchers.days.length > 0) {
         return vouchers.days.map((dayData) => {
            // Parse the date safely (API returns YYYY-MM-DD format)
            // Split to avoid timezone issues
            const [year, month, day] = dayData.date.split("-").map(Number);
            const date = new Date(year, month - 1, day);

            const dayLabel = date.toLocaleDateString("en-US", {
               month: "short",
               day: "numeric",
            });

            return {
               day: dayLabel,
               paymentVoucher: dayData.total_payment_amount || 0,
               receiptVoucher: dayData.total_receipt_amount || 0,
            };
         });
      }

      // Fallback to static week data if no days data
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const paymentDaily = paymentTotal / days.length;
      const receiptDaily = receiptTotal / days.length;

      return days.map((day) => ({
         day,
         paymentVoucher: Math.round(paymentDaily),
         receiptVoucher: Math.round(receiptDaily),
      }));
   }, [vouchers, paymentTotal, receiptTotal]);

   const chartConfig = {
      receiptVoucher: {
         label: t("charts.vouchers.receiptVoucher"),
         color: "var(--c-chart-receipt)",
      },
      paymentVoucher: {
         label: t("charts.vouchers.paymentVoucher"),
         color: "var(--c-chart-payment)",
      },
   };

   const tooltipLabels: Record<string, string> = {
      paymentVoucher: t("charts.vouchers.paymentVoucher"),
      receiptVoucher: t("charts.vouchers.receiptVoucher"),
   };

   const CustomTooltipContent = ({
      active,
      payload,
      label,
   }: TooltipProps<ValueType, NameType>) => {
      if (active && payload && payload.length) {
         return (
            <div className="bg-background border border-border rounded-16 shadow-[0px_16px_32px_-12px_rgba(14,18,27,0.1)] p-[12px] flex flex-col gap-[12px] min-w-[200px]">
               <p className="font-medium text-text-strong text-[14px] tracking-[-0.084px] leading-5">
                  {label}
               </p>
               <div className="flex flex-col gap-[12px] w-full">
                  {payload.map((entry, index) => (
                     <div
                        key={index}
                        className="flex items-center justify-between w-full gap-4">
                        <div className="flex items-center gap-1">
                           <div className="relative w-4 h-4 flex items-center justify-center">
                              <div
                                 className="w-3 h-3 rounded-full ring-2 ring-white shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)]"
                                 style={{ backgroundColor: entry.color }}
                              />
                           </div>
                           <span className="font-medium text-text-sub text-[12px] leading-4">
                              {tooltipLabels[entry.name as string] ??
                                 entry.name}
                           </span>
                        </div>
                        <div
                           className={`flex items-center gap-1 ${
                              isRTL ? "flex-row-reverse" : ""
                           }`}>
                           <svg
                              className="w-3 h-3 text-text-sub flex-shrink-0"
                              viewBox="0 0 344.84 299.91"
                              aria-hidden="true">
                              <path
                                 fill="currentColor"
                                 d="M342.14,140.96l2.7,2.54v-7.72c0-17-11.92-30.84-26.56-30.84h-23.41C278.49,36.7,222.69,0,139.68,0c-52.86,0-59.65,0-109.71,0,0,0,15.03,12.63,15.03,52.4v52.58h-27.68c-5.38,0-10.43-2.08-14.61-6.01l-2.7-2.54v7.72c0,17.01,11.92,30.84,26.56,30.84h18.44s0,29.99,0,29.99h-27.68c-5.38,0-10.43-2.07-14.61-6.01l-2.7-2.54v7.71c0,17,11.92,30.82,26.56,30.82h18.44s0,54.89,0,54.89c0,38.65-15.03,50.06-15.03,50.06h109.71c85.62,0,139.64-36.96,155.38-104.98h32.46c5.38,0,10.43,2.07,14.61,6l2.7,2.54v-7.71c0-17-11.92-30.83-26.56-30.83h-18.9c.32-4.88.49-9.87.49-15s-.18-10.11-.51-14.99h28.17c5.37,0,10.43,2.07,14.61,6.01ZM89.96,15.01h45.86c61.7,0,97.44,27.33,108.1,89.94l-153.96.02V15.01ZM136.21,284.93h-46.26v-89.98l153.87-.02c-9.97,56.66-42.07,88.38-107.61,90ZM247.34,149.96c0,5.13-.11,10.13-.34,14.99l-157.04.02v-29.99l157.05-.02c.22,4.84.33,9.83.33,15Z"
                              />
                           </svg>
                           <span className="font-medium text-text-strong text-[14px] tracking-[-0.084px] leading-5">
                              {entry.value?.toLocaleString()}
                           </span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         );
      }
      return null;
   };

   return (
      <div className="flex flex-col items-start gap-2 p-1.5 relative bg-bg-weak rounded-3xl border border-solid border-border">
         <div className="flex flex-col items-start gap-4 p-4 relative self-stretch w-full bg-background rounded-[20px] overflow-hidden border border-solid border-border shadow-[0px_1px_2px_0px_rgba(10,13,20,0.08)]">
            <section className="flex items-center justify-between gap-6 w-full">
               <div className="flex items-center gap-3 flex-1">
                  <div className="inline-flex items-center justify-center p-1.5 bg-background rounded-[10px] border border-solid border-border shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)]">
                     <PollSquare className="fill-chart-receipt" size={20} />
                  </div>

                  <h2 className="flex-1 font-medium text-text-strong text-[16px] tracking-[-0.176px] leading-6">
                     {t("charts.vouchers.title")}
                  </h2>
               </div>

               <div className="inline-flex items-center gap-4">
                  {legendItems.map((item, index) => (
                     <div
                        key={index}
                        className="inline-flex items-center gap-1">
                        <div className="relative w-4 h-4 flex items-center justify-center">
                           <div
                              className={`w-3 h-3 ${item.color} rounded-full ring-2 ring-white shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)]`}
                           />
                        </div>

                        <span className="font-medium text-text-sub text-[12px] leading-4">
                           {item.label}
                        </span>
                     </div>
                  ))}
               </div>
            </section>

            <Separator className="bg-border h-px w-full" />

            <div className="flex items-start gap-8 relative self-stretch w-full flex-[0_0_auto]">
               {statsData.map((stat, index) => (
                  <React.Fragment key={index}>
                     <div className="flex items-start gap-3 relative flex-1 grow">
                        <div className="inline-flex items-center justify-center p-2.5 relative flex-[0_0_auto] bg-background rounded-full overflow-hidden border border-solid border-border shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)]">
                           <stat.Icon className={stat.iconColor} size={20} />
                        </div>

                        <div className="flex flex-col items-start justify-center gap-1 relative flex-1 grow">
                           <div className="relative self-stretch font-medium text-text-soft text-[11px] tracking-[0.22px] leading-[12px] uppercase">
                              {stat.label}
                           </div>

                           <div
                              className={`flex items-center gap-1 relative self-stretch w-full flex-[0_0_auto] ${
                                 isRTL ? "flex-row-reverse" : ""
                              }`}>
                              <svg
                                 className="h-3 w-3 text-text-sub flex-shrink-0"
                                 viewBox="0 0 344.84 299.91"
                                 aria-hidden="true">
                                 <path
                                    fill="currentColor"
                                    d="M342.14,140.96l2.7,2.54v-7.72c0-17-11.92-30.84-26.56-30.84h-23.41C278.49,36.7,222.69,0,139.68,0c-52.86,0-59.65,0-109.71,0,0,0,15.03,12.63,15.03,52.4v52.58h-27.68c-5.38,0-10.43-2.08-14.61-6.01l-2.7-2.54v7.72c0,17.01,11.92,30.84,26.56,30.84h18.44s0,29.99,0,29.99h-27.68c-5.38,0-10.43-2.07-14.61-6.01l-2.7-2.54v7.71c0,17,11.92,30.82,26.56,30.82h18.44s0,54.89,0,54.89c0,38.65-15.03,50.06-15.03,50.06h109.71c85.62,0,139.64-36.96,155.38-104.98h32.46c5.38,0,10.43,2.07,14.61,6l2.7,2.54v-7.71c0-17-11.92-30.83-26.56-30.83h-18.9c.32-4.88.49-9.87.49-15s-.18-10.11-.51-14.99h28.17c5.37,0,10.43,2.07,14.61,6.01ZM89.96,15.01h45.86c61.7,0,97.44,27.33,108.1,89.94l-153.96.02V15.01ZM136.21,284.93h-46.26v-89.98l153.87-.02c-9.97,56.66-42.07,88.38-107.61,90ZM247.34,149.96c0,5.13-.11,10.13-.34,14.99l-157.04.02v-29.99l157.05-.02c.22,4.84.33,9.83.33,15Z"
                                 />
                              </svg>

                              <div className="font-medium text-text-strong text-base tracking-[-0.176px] leading-6 whitespace-nowrap">
                                 {stat.value}
                              </div>

                              <Badge
                                 variant="outline"
                                 className={`inline-flex items-center justify-center px-2 py-0.5 relative flex-[0_0_auto] ${stat.badgeBg} rounded-md overflow-hidden border border-solid ${stat.badgeBorder}`}>
                                 <div
                                    className={`font-medium ${stat.badgeText} text-xs leading-4 whitespace-nowrap`}>
                                    {stat.change}
                                 </div>
                              </Badge>
                           </div>
                        </div>
                     </div>

                     {index < statsData.length - 1 && (
                        <Separator
                           orientation="vertical"
                           className="relative self-stretch w-px bg-border"
                        />
                     )}
                  </React.Fragment>
               ))}
            </div>

            <Separator className="bg-border h-px w-full" />

            <div className="w-full">
               <ChartContainer config={chartConfig} className="h-60 w-full">
                  <AreaChart
                     data={chartData}
                     margin={{
                        top: 10,
                        right: 10,
                        left: 7,
                        bottom: 0,
                     }}>
                     <defs>
                        <linearGradient
                           id="fillPayment"
                           x1="0"
                           y1="0"
                           x2="0"
                           y2="1">
                           <stop
                              offset="5%"
                              stopColor="var(--c-chart-payment)"
                              stopOpacity={0.3}
                           />
                           <stop
                              offset="95%"
                              stopColor="var(--c-chart-payment)"
                              stopOpacity={0}
                           />
                        </linearGradient>
                        <linearGradient
                           id="fillReceipt"
                           x1="0"
                           y1="0"
                           x2="0"
                           y2="1">
                           <stop
                              offset="5%"
                              stopColor="var(--c-chart-receipt)"
                              stopOpacity={0.3}
                           />
                           <stop
                              offset="95%"
                              stopColor="var(--c-chart-receipt)"
                              stopOpacity={0}
                           />
                        </linearGradient>
                     </defs>
                     <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="var(--c-border)"
                     />
                     <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tick={{
                           fill: "var(--c-text-sub)",
                           fontSize: 12,
                           fontFamily: "inherit",
                        }}
                     />
                     <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tick={<CustomYAxisTick />}
                     />
                     <ChartTooltip
                        cursor={false}
                        content={<CustomTooltipContent />}
                     />
                     <Area
                        dataKey="paymentVoucher"
                        type="monotone"
                        fill="url(#fillPayment)"
                        fillOpacity={1}
                        stroke="var(--c-chart-payment)"
                        strokeWidth={2}
                        stackId="a"
                     />
                     <Area
                        dataKey="receiptVoucher"
                        type="monotone"
                        fill="url(#fillReceipt)"
                        fillOpacity={1}
                        stroke="var(--c-chart-receipt)"
                        strokeWidth={2}
                        stackId="a"
                     />
                  </AreaChart>
               </ChartContainer>
            </div>
         </div>
      </div>
   );
};
