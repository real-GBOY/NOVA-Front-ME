/** @format */

import { forwardRef } from "react";
import { SYNERGY_LOGO } from "@/components/constants";

interface VoucherPaperProps {
   voucherType: "payment" | "receipt";
   voucherData: {
      date: Date | string | null;
      amount: number;
      currency: string;
      from: string;
      to: string;
      method: string;
      classificationLabel?: string; // Expense Type or Income Type Name
      classificationValue?: string;
      accountName?: string; // For receipt: To Account
      remarks?: string;
      referenceNumber?: string; // For receipt: code
      code?: string;
   };
}

const VoucherPaper = forwardRef<HTMLDivElement, VoucherPaperProps>(
   ({ voucherType, voucherData }, ref) => {
      const formatDate = (date: Date | string | null | undefined): string => {
         if (!date) return "-";
         const d = typeof date === "string" ? new Date(date) : date;
         const day = String(d.getDate()).padStart(2, "0");
         const month = String(d.getMonth() + 1).padStart(2, "0");
         const year = d.getFullYear();
         return `${day}/${month}/${year}`;
      };

      const formatCurrency = (amount: number | string | null | undefined) => {
         if (amount === null || amount === undefined || amount === "")
            return "0.00";
         const numAmount =
            typeof amount === "string" ? parseFloat(amount) : amount;
         if (isNaN(numAmount)) return "0.00";
         return numAmount.toFixed(2);
      };

      return (
         <div
            ref={ref}
            className="w-full max-w-[595px] bg-background rounded-2xl p-10 shadow-lg flex flex-col mx-auto">
            {/* Header Section */}
            <div className="flex gap-4 items-start">
               {/* Logo Placeholder */}
               <div className="w-14 h-14 bg-bg-weak rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                     src={SYNERGY_LOGO}
                     className="w-full h-full object-contain"
                     alt="Logo"
                  />
               </div>
               {/* Company Name English */}
               <div className="flex flex-col flex-1">
                  <h3 className="font-bold text-lg leading-tight text-text-strong">
                     MGMT
                  </h3>
                  <p className="font-semibold text-xs leading-relaxed text-text-strong mt-0.5">
                     Government Transactions Center One Person Company L.L.C
                  </p>
               </div>
               {/* Company Name Arabic */}
               <div className="flex flex-col items-end text-right">
                  <h3 className="font-bold text-lg leading-tight text-text-strong font-cairo">
                     MGMT
                  </h3>
                  <p className="font-semibold text-xs leading-relaxed text-text-sub mt-0.5">
                     لإنجاز المعاملات الحكومية شركة الشخص الواحد ش.ذ.م.م
                  </p>
               </div>
            </div>

            {/* Contact Info Section */}
            <div className="flex gap-3 items-center">
               <div className="flex-1 flex flex-col gap-1.5 text-[10px]">
                  <div className="flex gap-2 items-start">
                     <span className="w-16 text-text-sub shrink-0">Email:</span>
                     <span className="font-semibold text-text-strong">
                        info@novagov.com
                     </span>
                  </div>
                  <div className="flex gap-2 items-start">
                     <span className="w-16 text-text-sub shrink-0">Tel:</span>
                     <span className="font-semibold text-text-strong">
                        043344446
                     </span>
                  </div>
                  <div className="flex gap-2 items-start">
                     <span className="w-16 text-text-sub shrink-0">
                        Website:
                     </span>
                     <span className="font-semibold text-text-strong">
                        www.novagov.com
                     </span>
                  </div>
               </div>
               <div className="flex items-center justify-end">
                  <img
                     src={SYNERGY_LOGO}
                     className="w-24 h-32 object-cover"
                     alt="Logo"
                  />
               </div>
            </div>

            <div className="h-px bg-border w-full my-6" />

            {/* Voucher Details */}
            <div className="flex flex-col gap-4">
               <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-text-strong">
                     {voucherType === "payment"
                        ? "Payment Voucher"
                        : "Receipt Voucher"}
                  </p>
                  {voucherData.code && (
                     <p className="text-sm font-medium text-text-sub">
                        {voucherData.code}
                     </p>
                  )}
               </div>
               <div className="flex flex-col gap-2">
                  <PreviewLine
                     label={
                        voucherType === "payment"
                           ? "Paid to:"
                           : "Received from:"
                     }
                     value={
                        voucherType === "payment"
                           ? voucherData.to
                           : voucherData.from
                     }
                  />
                  <PreviewLine
                     label="Amount"
                     value={`${formatCurrency(voucherData.amount)} ${
                        voucherData.currency || "AED"
                     }`}
                  />
                  <PreviewLine
                     label="Payment Method"
                     value={voucherData.method || "-"}
                  />
                  <PreviewLine
                     label="Date"
                     value={formatDate(voucherData.date)}
                  />
                  {voucherType === "payment" && (
                     <PreviewLine
                        label={
                           voucherData.classificationLabel || "Expense Type"
                        }
                        value={voucherData.classificationValue || "-"}
                     />
                  )}
                  {voucherType === "receipt" && (
                     <>
                        <PreviewLine
                           label={
                              voucherData.classificationLabel || "Income Type"
                           }
                           value={voucherData.classificationValue || "-"}
                        />
                        <PreviewLine
                           label="To Account"
                           value={voucherData.accountName || "-"}
                        />
                     </>
                  )}
                  {voucherData.referenceNumber && (
                     <PreviewLine
                        label="Ref No."
                        value={voucherData.referenceNumber}
                     />
                  )}
                  <PreviewLine
                     label="Remarks"
                     value={voucherData.remarks || "-"}
                  />
               </div>
            </div>

            <div className="flex items-center justify-end mt-4">
               <div className="flex items-center gap-2 text-xs">
                  <p className="text-text-sub">Total Amount:</p>
                  <p className="font-medium text-text-strong text-right">
                     {formatCurrency(voucherData.amount)}{" "}
                     {voucherData.currency || "AED"}
                  </p>
               </div>
            </div>

            <div className="h-px bg-border w-full my-6" />

            <div className="flex gap-12 text-xs text-text-sub">
               <p className="flex-1">
                  {voucherType === "payment"
                     ? "Receiver's Signature"
                     : "Payer's Signature"}
               </p>
               <p className="flex-1">Authorized Signature</p>
            </div>
         </div>
      );
   }
);

// Helper component for preview lines
function PreviewLine({ label, value }: { label: string; value: string }) {
   return (
      <div className="flex items-start gap-2 text-xs">
         <p className="text-text-sub w-[120px] shrink-0 pt-0.5">{label}</p>
         <p className="font-medium text-text-strong text-right break-words whitespace-pre-wrap flex-1 min-w-0">
            {value}
         </p>
      </div>
   );
}

export default VoucherPaper;
