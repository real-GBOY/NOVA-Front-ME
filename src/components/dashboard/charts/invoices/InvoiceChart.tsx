/** @format */

import { TotalInvoices } from "@/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import type { InvoiceChartProps } from "./types";

function InvoiceChart({ data, onCheckDrafts }: InvoiceChartProps) {
   const { t } = useTranslation("common");

   const formatCurrency = (value: number) => {
      return value.toLocaleString();
   };

   // Calculate bar heights with 30% base offset for better visual appearance
   // Maps 0-100% data range to 30-100% visual range
   const BASE_OFFSET = 30;
   const fullyPaidHeight = BASE_OFFSET + data.fullyPaidPercentage * 0.7;
   const pendingHeight = BASE_OFFSET + data.pendingPercentage * 0.7;

   return (
      <div className="bg-bg-weak border border-border rounded-3xl p-1.5">
         <div className="bg-background border border-border rounded-[20px] shadow-[0px_1px_2px_0px_rgba(10,13,20,0.08)] p-4 flex flex-col gap-4 h-[417px]">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 w-full">
               <div className="flex items-center gap-3 flex-1">
                  <div className="bg-background border border-border rounded-lg shadow-subtle p-1.5">
                     <TotalInvoices size={20} className="fill-primary" />
                  </div>
                  <p className="text-base font-medium text-text-strong leading-6 tracking-[-0.176px]">
                     {t("charts.invoices.title")}
                  </p>
               </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border w-full" />

            {/* Chart Content */}
            <div className="flex flex-col gap-4 flex-1">
               {/* Value Display */}
               <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                     {data.currency === "AED" && (
                        <svg
                           className="h-5 w-5 text-text-strong"
                           viewBox="0 0 344.84 299.91"
                           aria-hidden="true">
                           <path
                              fill="currentColor"
                              d="M342.14,140.96l2.7,2.54v-7.72c0-17-11.92-30.84-26.56-30.84h-23.41C278.49,36.7,222.69,0,139.68,0c-52.86,0-59.65,0-109.71,0,0,0,15.03,12.63,15.03,52.4v52.58h-27.68c-5.38,0-10.43-2.08-14.61-6.01l-2.7-2.54v7.72c0,17.01,11.92,30.84,26.56,30.84h18.44s0,29.99,0,29.99h-27.68c-5.38,0-10.43-2.07-14.61-6.01l-2.7-2.54v7.71c0,17,11.92,30.82,26.56,30.82h18.44s0,54.89,0,54.89c0,38.65-15.03,50.06-15.03,50.06h109.71c85.62,0,139.64-36.96,155.38-104.98h32.46c5.38,0,10.43,2.07,14.61,6l2.7,2.54v-7.71c0-17-11.92-30.83-26.56-30.83h-18.9c.32-4.88.49-9.87.49-15s-.18-10.11-.51-14.99h28.17c5.37,0,10.43,2.07,14.61,6.01ZM89.96,15.01h45.86c61.7,0,97.44,27.33,108.1,89.94l-153.96.02V15.01ZM136.21,284.93h-46.26v-89.98l153.87-.02c-9.97,56.66-42.07,88.38-107.61,90ZM247.34,149.96c0,5.13-.11,10.13-.34,14.99l-157.04.02v-29.99l157.05-.02c.22,4.84.33,9.83.33,15Z"
                           />
                        </svg>
                     )}
                     <p className="text-[32px] font-medium text-text-strong leading-10 tracking-[-0.16px]">
                        {formatCurrency(data.totalValue)}
                     </p>
                  </div>
               </div>

               {/* Chart Bars and Legend */}
               <div className="flex gap-12 items-center flex-1">
                  {/* Bars */}
                  <div className="flex gap-6 h-full items-end flex-1">
                     {/* Fully Paid Bar */}
                     <div className="flex-1 h-full flex flex-col justify-end rounded-lg overflow-hidden bg-primary/10 shadow-subtle">
                        <div
                           className="w-full rounded-t-lg bg-linear-to-b from-primary to-primary/80 relative shadow-[inset_0px_4px_8px_0px_rgba(255,255,255,0.1)]"
                           style={{ height: `${fullyPaidHeight}%` }}>
                           {/* Decorative dots */}
                           <div className="absolute inset-0 opacity-20">
                              <div className="absolute left-[22px] top-[59px] w-0.5 h-0.5 bg-background rounded-full" />
                              <div className="absolute left-[5px] top-12 w-0.5 h-0.5 bg-background rounded-full" />
                              <div className="absolute left-[35px] top-[43px] w-0.5 h-0.5 bg-background/50 rounded-full" />
                           </div>
                        </div>
                     </div>

                     {/* Pending Bar */}
                     <div className="flex-1 h-full flex flex-col justify-end rounded-lg overflow-hidden bg-warning/10 shadow-subtle">
                        <div
                           className="w-full rounded-t-lg bg-linear-to-b from-warning to-warning/80 relative shadow-[inset_0px_4px_8px_0px_rgba(255,255,255,0.1)]"
                           style={{ height: `${pendingHeight}%` }}>
                           {/* Decorative dots */}
                           <div className="absolute inset-0 opacity-20">
                              <div className="absolute left-[22px] top-[59px] w-0.5 h-0.5 bg-background rounded-full" />
                              <div className="absolute left-[5px] top-12 w-0.5 h-0.5 bg-background rounded-full" />
                              <div className="absolute left-[35px] top-[43px] w-0.5 h-0.5 bg-background/50 rounded-full" />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Legend */}
                  <div className="flex-1 flex flex-col gap-8 justify-center ps-8">
                     {/* Fully Paid */}
                     <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                           <div className="w-4 h-4 flex items-center justify-center">
                              <div className="w-2.5 h-2.5 rounded-sm bg-primary border-2 border-background" />
                           </div>
                           <span className="text-xs font-medium text-text-sub leading-4">
                              {t("charts.invoices.fullyPaid")}
                           </span>
                        </div>
                        <p className="text-xl font-medium text-text-strong leading-7">
                           {data.fullyPaidPercentage}%
                        </p>
                     </div>

                     {/* Pending */}
                     <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                           <div className="w-4 h-4 flex items-center justify-center">
                              <div className="w-2.5 h-2.5 rounded-sm bg-warning border-2 border-background" />
                           </div>
                           <span className="text-xs font-medium text-text-sub leading-4">
                              {t("charts.invoices.pending")}
                           </span>
                        </div>
                        <p className="text-xl font-medium text-text-strong leading-7">
                           {data.pendingPercentage}%
                        </p>
                     </div>
                  </div>
               </div>

               {/* Info Banner */}
               <div className="bg-bg-weak rounded-lg p-2  flex items-center gap-2">
                  <p className="text-xs font-medium text-text-sub leading-4 flex-1">
                     {t("charts.invoices.draftMessage", {
                        percentage: data.draftPercentage,
                     })}
                  </p>
                  <button
                     type="button"
                     onClick={onCheckDrafts}
                     className="text-xs font-medium text-primary leading-4 hover:underline">
                     {t("charts.invoices.check")}
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}

export default InvoiceChart;
