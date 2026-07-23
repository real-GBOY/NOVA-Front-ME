/** @format */

import { forwardRef } from "react";

// Map invoice status to stamp image
const getStatusStamp = (status?: string) => {
   const stampMap: Record<string, string> = {
      Draft: "/icons/draft.png",
      Pending: "/icons/pending.png",
      Partially_Paid: "/icons/partially.png",
      Fully_Paid: "/icons/fully.png",
      Void: "/icons/void.png",
   };

   const stampSrc = status ? stampMap[status] : null;

   if (!stampSrc) return null;

   return (
      <img
         src={stampSrc}
         alt={`${status} stamp`}
         className="w-24 h-24 object-contain"
      />
   );
};

export interface InvoiceServiceItem {
   id?: string;
   service_name: string;
   government_fee: number;
   discount_value: number;
   discount_type?: "Percentage" | "Fixed";
   service_charge: number;
   fine_amount: number;
   tax_rate: number;
   total: number;
}

interface InvoicePaperProps {
   invoiceData: {
      invoiceNumber?: string;
      token?: string;
      agentName?: string;
      date: Date | string | null;
      preparedBy?: string;
      trn?: string;
      customerName: string;
      customerTitle?: string;
      amount: number;
      subtotal?: number;
      totalDiscount?: number;
      totalTax?: number;
      currency: string;
      items: InvoiceServiceItem[];
      notes?: string;
      status?: string;
   };
}

const InvoicePaper = forwardRef<HTMLDivElement, InvoicePaperProps>(
   ({ invoiceData }, ref) => {
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

      const DirhamIcon = () => (
         <img
            src="/icons/dirham.png"
            alt="AED"
            className="w-4 h-4 object-contain inline-block"
         />
      );

      const formatAmount = (amount: number | null | undefined) => {
         if (amount === null || amount === undefined) return "-";
         if (isNaN(amount)) return "-";
         return amount.toFixed(2);
      };

      const formatDiscount = (
         value: number,
         type: InvoiceServiceItem["discount_type"]
      ) => {
         if (value === null || value === undefined) return "-";
         if (type === "Percentage") return `${value}%`;
         return formatCurrency(value);
      };

      return (
         <div
            ref={ref}
            className="w-full max-w-[700px] rounded-2xl p-8 shadow-lg flex flex-col mx-auto bg-white text-gray-900 dark:bg-white dark:text-gray-900">
            {/* Header Section */}
            <div className="flex gap-4 items-start">
               {/* Logo */}
               <div className="w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                     src="/icons/6be7484c1fb25b0fcb0ecb5300c2821f5d13f3e8.png"
                     className="w-full h-full object-contain"
                     alt="Logo"
                  />
               </div>
               {/* Company Name English */}
               <div className="flex flex-col flex-1">
                  <h3 className="font-bold text-lg leading-tight">
                     BAB AL KARAMA
                  </h3>
                  <p className="font-medium text-xs text-gray-600 mt-0.5">
                     Government Transactions Center One Person Company L.L.C
                  </p>
               </div>
               {/* Company Name Arabic */}
               <div className="flex flex-col items-end text-right">
                  <h3 className="font-bold text-lg leading-tight font-cairo">
                     باب الكرامة
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                     لإنجاز المعاملات الحكومية شركة الشخص الواحد ش.ذ.م.م
                  </p>
               </div>
            </div>

            {/* Contact Info + Dubai Logo */}
            <div className="flex gap-4 items-start mt-4">
               <div className="flex-1 flex flex-col gap-1 text-[11px]">
                  <div className="flex gap-2">
                     <span className="w-14 text-gray-500">Email:</span>
                     <span className="font-medium">info@novagov.com</span>
                  </div>
                  <div className="flex gap-2">
                     <span className="w-14 text-gray-500">Tel:</span>
                     <span className="font-medium">043344446</span>
                  </div>
                  <div className="flex gap-2">
                     <span className="w-14 text-gray-500">Website:</span>
                     <span className="font-medium">www.novagov.com</span>
                  </div>
               </div>
               <div className="flex items-start justify-end">
                  <img
                     src="/icons/govLogo.png"
                     className="w-20 h-24 object-contain"
                     alt="Government of Dubai"
                  />
               </div>
            </div>

            <div className="h-px bg-gray-200 w-full my-5" />

            {/* Invoice Details - Two Column Layout */}
            <div className="flex justify-between items-start mb-4">
               <p className="text-sm font-semibold">INVOICE</p>
               <p className="text-sm font-bold text-right">
                  {invoiceData.invoiceNumber || "-"}
               </p>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[12px]">
               {/* Left Column */}
               <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-500">Token:</span>
                  <span className="font-medium">
                     {invoiceData.token || "-"}
                  </span>
               </div>
               {/* Right Column */}
               <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-500">Agent:</span>
                  <span className="font-medium">
                     {invoiceData.agentName || "-"}
                  </span>
               </div>
               <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-500">Invoice Date:</span>
                  <span className="font-medium">
                     {formatDate(invoiceData.date)}
                  </span>
               </div>
               <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-500">Prepared by:</span>
                  <span className="font-medium">
                     {invoiceData.preparedBy || "-"}
                  </span>
               </div>
               <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-medium">
                     {invoiceData.customerName || "-"}
                  </span>
               </div>
               {invoiceData.trn && (
                  <div className="flex justify-between border-b border-gray-100 pb-1">
                     <span className="text-gray-500">TRN:</span>
                     <span className="font-medium">{invoiceData.trn}</span>
                  </div>
               )}
            </div>
            {/* Items Table */}
            <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
               {/* Table Header */}
               <div className="grid grid-cols-8 bg-gray-50 text-[10px] font-medium text-gray-600 border-b border-gray-200">
                  <span className="flex items-center justify-center border-r border-gray-200 px-3 py-3">
                     #
                  </span>
                  <span className="col-span-2 flex items-center border-r border-gray-200 px-3 py-3">
                     Serv
                  </span>
                  <span className="flex items-center justify-center border-r border-gray-200 px-3 py-3 text-[12px] whitespace-nowrap">
                     Gov Fees
                  </span>
                  <span className="flex items-center justify-center border-r border-gray-200 px-3 py-3">
                     Discount
                  </span>
                  <span className="flex items-center justify-center border-r border-gray-200 px-3 py-3">
                     Fine
                  </span>
                  <span className="flex items-center justify-center border-r border-gray-200 px-3 py-3 text-[10px] whitespace-nowrap">
                     Service Charge
                  </span>
                  <span className="flex items-center justify-center border-r border-gray-200 px-3 py-3">
                     VAT
                  </span>
               </div>
               {/* Table Body */}
               <div className="divide-y divide-gray-100">
                  {invoiceData.items.length > 0 ? (
                     invoiceData.items.map((item, index) => (
                        <div
                           key={item.id || index}
                           className="grid grid-cols-8 text-[11px]">
                           <span className="flex items-center justify-center border-r border-gray-100 px-3 py-3 text-gray-500">
                              {index + 1}
                           </span>
                           <span className="col-span-2 flex items-start border-r border-gray-100 px-3 py-3 font-medium break-words whitespace-normal">
                              {item.service_name || "-"}
                           </span>
                           <span className="flex items-center justify-center border-r border-gray-100 px-3 py-3">
                              {formatAmount(item.government_fee)}
                           </span>
                           <span className="flex items-center justify-center border-r border-gray-100 px-3 py-3">
                              {formatDiscount(
                                 item.discount_value,
                                 item.discount_type
                              )}
                           </span>
                           <span className="flex items-center justify-center border-r border-gray-100 px-3 py-3">
                              {formatAmount(item.fine_amount)}
                           </span>
                           <span className="flex items-center justify-center border-r border-gray-100 px-3 py-3">
                              {formatAmount(item.service_charge)}
                           </span>
                           <span className="flex items-center justify-center border-r border-gray-100 px-3 py-3">
                              {item.tax_rate ? `${item.tax_rate}%` : "-"}
                           </span>
                        </div>
                     ))
                  ) : (
                     <div className="px-3 py-4 text-center text-gray-400 text-xs">
                        No items added yet
                     </div>
                  )}
               </div>
            </div>
            {/* Totals Breakdown */}
            <div className="flex justify-between items-end mt-6">
               {/* Status Stamp */}
               <div className="opacity-80">
                  {getStatusStamp(invoiceData.status)}
               </div>
               <div className="flex flex-col gap-3 w-64">
                  {invoiceData.subtotal !== undefined && (
                     <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Subtotal:</span>
                        <span className="text-sm font-medium flex items-center gap-1">
                           <DirhamIcon /> {formatCurrency(invoiceData.subtotal)}
                        </span>
                     </div>
                  )}
                  {invoiceData.totalDiscount !== undefined &&
                     invoiceData.totalDiscount > 0 && (
                        <div className="flex justify-between items-center">
                           <span className="text-xs text-gray-600">
                              Discount:
                           </span>
                           <span className="text-sm font-medium text-red-600 flex items-center gap-1">
                              -<DirhamIcon />{" "}
                              {formatCurrency(invoiceData.totalDiscount)}
                           </span>
                        </div>
                     )}
                  {invoiceData.totalTax !== undefined &&
                     invoiceData.totalTax > 0 && (
                        <div className="flex justify-between items-center">
                           <span className="text-xs text-gray-600">Tax:</span>
                           <span className="text-sm font-medium flex items-center gap-1">
                              <DirhamIcon />{" "}
                              {formatCurrency(invoiceData.totalTax)}
                           </span>
                        </div>
                     )}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                     <span className="text-sm font-semibold text-gray-700">
                        Grand Total:
                     </span>
                     <span className="text-xl font-bold flex items-center gap-1">
                        <DirhamIcon /> {formatCurrency(invoiceData.amount)}
                     </span>
                  </div>
               </div>
            </div>

            {/* Notes Section */}
            {invoiceData.notes && (
               <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                     Notes:
                  </p>
                  <p className="text-xs text-gray-700 whitespace-pre-wrap">
                     {invoiceData.notes}
                  </p>
               </div>
            )}

            <div className="flex-1" />

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-400 mt-8 pt-4 border-t border-gray-100">
               <p className="flex-1">Authorized Signature</p>
               <p className="font-cairo">فاتورة معتمدة</p>
            </div>
         </div>
      );
   }
);

export default InvoicePaper;
