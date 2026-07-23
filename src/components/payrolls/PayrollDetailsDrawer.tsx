/** @format */

import { ReactNode, useRef } from "react";
import Drawer from "@/designSystem/Drawer";
import LoadingState from "@/designSystem/LoadingState";
import {
   AngleLeftSmall,
   AngleRightSmall,
   Print,
   CloseLine,
   SelectBoxCircleFill,
   Check,
} from "@/Icons";
import DirhamLabel from "@/designSystem/DirhamLabel";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/hooks/useLanguage";
import { DashboardPayroll } from "@/services/payrollService";
import { isEnglishText, cn } from "@/utilities/index";
import { format } from "date-fns";
import { applyPrintWindowMeta } from "@/utils/printWindow";

interface PayrollDetailsDrawerProps {
   isOpen: boolean;
   onClose: () => void;
   payroll: DashboardPayroll | null;
   payrollIndex?: number;
   totalPayrolls?: number;
   onNavigateNext?: () => void;
   onNavigatePrev?: () => void;
   isLoading?: boolean;
   onApprove?: (payroll: DashboardPayroll) => void;
   onCreateVoucher?: (payroll: DashboardPayroll) => void;
}

export default function PayrollDetailsDrawer({
   isOpen,
   onClose,
   payroll,
   payrollIndex = 1,
   totalPayrolls = 1,
   onNavigateNext,
   onNavigatePrev,
   isLoading = false,
   onApprove,
   onCreateVoucher,
}: PayrollDetailsDrawerProps) {
   const { t } = useTranslation("payrolls");
   const { isRTL } = useLanguage();
   const contentRef = useRef<HTMLDivElement>(null);

   const handlePrint = () => {
      if (!contentRef.current) return;

      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const content = contentRef.current.innerHTML;
      const stylesheets = Array.from(document.styleSheets)
         .map((styleSheet) => {
            try {
               return Array.from(styleSheet.cssRules)
                  .map((rule) => rule.cssText)
                  .join("\n");
            } catch {
               const link = styleSheet.href;
               return link ? `@import url("${link}");` : "";
            }
         })
         .join("\n");

      printWindow.document.write(`
         <!DOCTYPE html>
         <html>
            <head>
               <title>Payroll - ${payroll?.Employee.first_name} ${payroll?.Employee.last_name}</title>
               <style>
                  ${stylesheets}
                  @media print {
                     body { margin: 0; padding: 20px; }
                     @page { margin: 0.5in; }
                  }
               </style>
            </head>
            <body>${content}</body>
         </html>
      `);

      printWindow.document.close();
      applyPrintWindowMeta(
         printWindow,
         `Payroll ${payroll?.Employee.first_name || ""} ${
            payroll?.Employee.last_name || ""
         }`.trim() || "Payroll"
      );
      printWindow.focus();
      setTimeout(() => {
         printWindow.print();
         printWindow.close();
      }, 250);
   };

   const shouldShowLoader = isLoading || !payroll;

   const statusLabels = {
      Draft: "Draft",
      Review: "Review",
      Approved: "Approved",
      Finalized: "Finalized",
   } as const;

   const getStatusLabel = (status: string) => {
      const statusKey = status as keyof typeof statusLabels;
      return (
         t(`details.status.${statusKey}`) || statusLabels[statusKey] || status
      );
   };

   const getStatusDotClass = (status: string) => {
      switch (status) {
         case "Approved":
         case "Finalized":
            return "fill-success";
         case "Review":
            return "fill-warning";
         default:
            return "fill-text-sub";
      }
   };

   if (!isOpen) return null;

   return (
      <Drawer isOpen={isOpen} onClose={onClose} width="max-w-[600px]">
         <div className="flex flex-col h-full bg-background rounded-[24px] overflow-hidden">
            {/* Header with Navigation */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-background shrink-0">
               <div className="flex-1 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                     <div className="flex items-center border border-border rounded-lg shadow-sm">
                        <button
                           type="button"
                           onClick={onNavigatePrev}
                           disabled={!onNavigatePrev}
                           className="p-2 flex items-center justify-center disabled:opacity-50 hover:bg-bg-weak transition-colors rounded-s-lg">
                           {isRTL ? (
                              <AngleRightSmall
                                 className="w-5 h-5"
                                 isRTL={isRTL}
                              />
                           ) : (
                              <AngleLeftSmall
                                 className="w-5 h-5"
                                 isRTL={isRTL}
                              />
                           )}
                        </button>
                        <div className="w-px h-5 bg-border" />
                        <button
                           type="button"
                           onClick={onNavigateNext}
                           disabled={!onNavigateNext}
                           className="p-2 flex items-center justify-center disabled:opacity-50 hover:bg-bg-weak transition-colors rounded-e-lg">
                           {isRTL ? (
                              <AngleLeftSmall
                                 className="w-5 h-5"
                                 isRTL={isRTL}
                              />
                           ) : (
                              <AngleRightSmall
                                 className="w-5 h-5"
                                 isRTL={isRTL}
                              />
                           )}
                        </button>
                     </div>
                     <p
                        className={cn(
                           "text-sm text-text-soft font-medium tracking-tight",
                           isEnglishText(
                              `${payrollIndex} ${t(
                                 "common:pagination.of"
                              )} ${totalPayrolls}`
                           ) && "font-english"
                        )}>
                        {payrollIndex} {t("common:pagination.of")}{" "}
                        {totalPayrolls}
                     </p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button
                     type="button"
                     onClick={handlePrint}
                     className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-[10px] border border-border bg-background shadow-sm hover:bg-bg-weak transition-colors">
                     <Print className="w-5 h-5 fill-text-sub" />
                     <span className="text-sm font-medium text-text-sub leading-5 pr-1">
                        {t("details.print")}
                     </span>
                  </button>
                  <button
                     type="button"
                     onClick={onClose}
                     className="p-0.5 rounded-md hover:bg-bg-weak transition-colors">
                     <CloseLine className="w-5 h-5 fill-text-sub" />
                  </button>
               </div>
            </div>

            {shouldShowLoader ? (
               <div className="flex-1 px-4 py-6">
                  <LoadingState
                     size="medium"
                     label={t("loading")}
                     minHeight="200px"
                     fullHeight
                  />
               </div>
            ) : (
               <>
                  {/* Payroll Header Info */}
                  <div className="px-4 py-4 border-b border-border bg-background shrink-0">
                     <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                           <p className="text-base font-medium text-text-strong tracking-[-0.176px] leading-6 truncate">
                              {payroll.Employee.first_name}{" "}
                              {payroll.Employee.last_name}
                           </p>
                           {/* Status Badge */}
                           <div className="flex items-center gap-1 pl-1 pr-2 py-1 rounded-lg border border-border bg-background">
                              <SelectBoxCircleFill
                                 className={`w-4 h-4 ${getStatusDotClass(
                                    payroll.status
                                 )}`}
                              />
                              <p className="text-xs font-medium text-text-sub leading-4">
                                 {getStatusLabel(payroll.status)}
                              </p>
                           </div>
                        </div>
                        <p className="text-sm text-text-soft font-normal tracking-[-0.084px] leading-5">
                           {format(
                              new Date(payroll.period_start),
                              "dd MMM yyyy"
                           )}{" "}
                           -{" "}
                           {format(new Date(payroll.period_end), "dd MMM yyyy")}
                        </p>
                     </div>
                  </div>

                  {/* Scrollable Content */}
                  <div
                     ref={contentRef}
                     className="flex-1 overflow-y-auto px-4 py-6">
                     <div className="flex flex-col gap-6">
                        {/* Payroll Information Section */}
                        <div className="bg-bg-weak border border-border rounded-2xl p-4 flex flex-col gap-4">
                           <InfoField
                              label={t("fields.employee")}
                              value={`${payroll.Employee.first_name} ${payroll.Employee.last_name}`}
                           />
                           <InfoField
                              label={t("fields.period")}
                              value={`${format(
                                 new Date(payroll.period_start),
                                 "dd MMM yyyy"
                              )} - ${format(
                                 new Date(payroll.period_end),
                                 "dd MMM yyyy"
                              )}`}
                           />
                           <InfoField
                              label={t("fields.cycleType")}
                              value={payroll.cycle_type}
                           />
                           <InfoField
                              label={t("details.runType")}
                              value={payroll.run_type}
                           />
                        </div>

                        {/* Financial Details */}
                        <div className="flex flex-col gap-4">
                           <h2 className="text-xl font-medium text-text-strong leading-7 tracking-normal">
                              {t("details.financialDetails")}
                           </h2>
                           <div className="bg-bg-weak border border-border rounded-2xl p-4 flex flex-col gap-4">
                              <InfoField
                                 label={t("fields.baseSalary")}
                                 value={
                                    <DirhamLabel
                                       value={parseFloat(payroll.base_salary)}
                                    />
                                 }
                              />
                              <InfoField
                                 label={t("fields.grossTotal")}
                                 value={
                                    <DirhamLabel
                                       value={parseFloat(payroll.gross_total)}
                                    />
                                 }
                              />
                              <InfoField
                                 label={t("fields.deductions")}
                                 value={
                                    <DirhamLabel
                                       value={parseFloat(
                                          payroll.deduction_total
                                       )}
                                    />
                                 }
                              />
                              <InfoField
                                 label={t("fields.netPay")}
                                 value={
                                    <span
                                       className={
                                          parseFloat(payroll.net_pay) < 0
                                             ? "text-danger"
                                             : ""
                                       }>
                                       <DirhamLabel
                                          value={parseFloat(payroll.net_pay)}
                                       />
                                    </span>
                                 }
                              />
                              <InfoField
                                 label={t("details.employerCost")}
                                 value={
                                    <DirhamLabel
                                       value={parseFloat(payroll.employer_cost)}
                                    />
                                 }
                              />
                           </div>
                        </div>

                        {/* Notes Section */}
                        {payroll.notes && (
                           <div className="flex flex-col gap-4">
                              <h2 className="text-xl font-medium text-text-strong leading-7 tracking-normal">
                                 {t("details.notes")}
                              </h2>
                              <div className="bg-bg-weak border border-border rounded-2xl p-4">
                                 <p className="text-sm text-text-sub">
                                    {payroll.notes}
                                 </p>
                              </div>
                           </div>
                        )}

                        {/* Warnings Section */}
                        {payroll.warnings && payroll.warnings.length > 0 && (
                           <div className="flex flex-col gap-4">
                              <h2 className="text-xl font-medium text-text-strong leading-7 tracking-normal">
                                 {t("details.warnings")}
                              </h2>
                              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex flex-col gap-2">
                                 {payroll.warnings.map((warning, index) => (
                                    <div
                                       key={index}
                                       className="flex items-start gap-2">
                                       <span className="text-warning font-medium">
                                          {warning.type}:
                                       </span>
                                       <span className="text-sm text-text-sub">
                                          {warning.message}
                                       </span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Footer with Action Buttons */}
                  {((payroll.status !== "Approved" &&
                     payroll.status !== "Finalized" &&
                     onApprove) ||
                     (payroll.status === "Approved" && onCreateVoucher)) && (
                     <div className="px-4 py-4 border-t border-border bg-background shrink-0 flex gap-3">
                        {/* Create Voucher Button - for Approved payrolls */}
                        {payroll.status === "Approved" && onCreateVoucher && (
                           <button
                              type="button"
                              onClick={() => onCreateVoucher(payroll)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-bg-weak text-text-strong border border-border rounded-xl font-medium hover:bg-border transition-colors">
                              <span>{t("actions.createVoucher")}</span>
                           </button>
                        )}
                        {/* Approve Button - for Draft/Review payrolls */}
                        {payroll.status !== "Approved" &&
                           payroll.status !== "Finalized" &&
                           onApprove && (
                              <button
                                 type="button"
                                 onClick={() => onApprove(payroll)}
                                 className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
                                 <Check className="w-5 h-5 fill-current" />
                                 <span>{t("actions.approve")}</span>
                              </button>
                           )}
                     </div>
                  )}
               </>
            )}
         </div>
      </Drawer>
   );
}

// Helper component for info fields
function InfoField({ label, value }: { label: string; value: ReactNode }) {
   return (
      <div className="flex flex-col gap-2">
         <p className="text-sm text-text-sub font-normal tracking-[-0.084px] leading-5">
            {label}
         </p>
         <div className="text-base text-text-strong font-normal tracking-[-0.176px] leading-6">
            {value}
         </div>
      </div>
   );
}
