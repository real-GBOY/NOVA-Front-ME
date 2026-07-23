/** @format */

import { useRef, useState, useEffect } from "react";
import Drawer from "@/designSystem/Drawer";
import LoadingState from "@/designSystem/LoadingState";
import {
   AngleLeftSmall,
   AngleRightSmall,
   Print,
   CloseLine,
   FileText,
   Loader2Line,
   Edit,
   Ban,
   Trash,
} from "@/Icons";
import BadgeTag from "@/designSystem/BadgeTag";
import type { Invoice } from "./data";
import { getInvoiceStatusLabel, getInvoiceStatusVariant } from "./data";
import { useTranslation } from "@/hooks/useTranslation";
import InvoicePaper from "@/components/common/paper/InvoicePaper";
import { agentService } from "@/services/agentService";
import { useGetInvoiceHistory } from "@/hooks/invoices/useInvoices";
import { format, isValid } from "date-fns";
import { applyPrintWindowMeta } from "@/utils/printWindow";

interface InvoiceDetailsDrawerProps {
   isOpen: boolean;
   onClose: () => void;
   invoice: Invoice | null;
   isLoading?: boolean;
   invoices?: Invoice[];
   currentIndex?: number;
   onNavigate?: (invoice: Invoice) => void;
   onEdit?: (invoice: Invoice) => void;
   onVoid?: (invoice: Invoice) => void;
   onDelete?: (invoice: Invoice) => void;
}

export default function InvoiceDetailsDrawer({
   isOpen,
   onClose,
   invoice,
   isLoading = false,
   invoices = [],
   currentIndex = -1,
   onNavigate,
   onEdit,
   onVoid,
   onDelete,
}: InvoiceDetailsDrawerProps) {
   const { t } = useTranslation("settings");
   const invoicePreviewRef = useRef<HTMLDivElement>(null);
   const [agentName, setAgentName] = useState<string>("-");

   const shouldShowLoader = isLoading || !invoice;

   // Calculate pagination info
   const totalInvoices = invoices.length;
   const currentPosition = currentIndex >= 0 ? currentIndex + 1 : 0;
   const canGoPrevious = currentIndex > 0;
   const canGoNext = currentIndex >= 0 && currentIndex < totalInvoices - 1;

   // Navigation handlers
   const handlePrevious = () => {
      if (canGoPrevious && invoices[currentIndex - 1] && onNavigate) {
         onNavigate(invoices[currentIndex - 1]);
      }
   };

   const handleNext = () => {
      if (canGoNext && invoices[currentIndex + 1] && onNavigate) {
         onNavigate(invoices[currentIndex + 1]);
      }
   };

   // Fetch invoice history
   const { data: invoiceHistory = [], isLoading: isLoadingHistory } =
      useGetInvoiceHistory(invoice?.invoice_id || null, {
         enabled: isOpen && !!invoice?.invoice_id,
      });

   // Fetch agent name when invoice changes
   useEffect(() => {
      const fetchAgentName = async () => {
         if (invoice?.agent?.agent_id) {
            try {
               const agent = await agentService.getById(invoice.agent.agent_id);
               setAgentName(agent.name || "-");
            } catch (error) {
               console.error("Failed to fetch agent:", error);
               setAgentName("-");
            }
         } else {
            setAgentName("-");
         }
      };

      fetchAgentName();
   }, [invoice?.agent?.agent_id]);

   const handlePrint = () => {
      if (!invoicePreviewRef.current) return;

      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const invoiceContent = invoicePreviewRef.current.innerHTML;
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
                  <title>Invoice - ${invoice?.invoice_code || "Preview"}</title>
                  <style>
                     ${stylesheets}
                     @media print {
                        body { margin: 0; padding: 20px; }
                        @page { margin: 0.5in; }
                     }
                  </style>
               </head>
               <body>${invoiceContent}</body>
            </html>
         `);

      printWindow.document.close();
      applyPrintWindowMeta(
         printWindow,
         "فاتورة معتمدة",
         "print",
         "فاتورة-معتمدة"
      );
      printWindow.focus();
      setTimeout(() => {
         printWindow.print();
         printWindow.close();
      }, 250);
   };

   const resolveItemTotal = (item: any) => {
      const total = Number(item?.total);
      if (Number.isFinite(total) && total > 0) return total;
      const unitPrice = Number(item?.unit_price ?? item?.service_charge ?? 0);
      const govFees = Number(item?.government_fee ?? 0);
      const fine = Number(item?.fine_amount ?? 0);
      const discountAmount = Number(item?.discount_amount ?? 0);
      const taxAmount = Number(item?.tax_amount ?? 0);
      const subtotal = unitPrice + govFees + fine - discountAmount;
      const computed = subtotal + taxAmount;
      return Number.isFinite(computed) && computed > 0 ? computed : 0;
   };

   const computedInvoiceTotal =
      invoice?.items?.reduce((sum, item) => sum + resolveItemTotal(item), 0) ??
      0;
   const resolvedTotalAmount =
      computedInvoiceTotal > 0
         ? computedInvoiceTotal
         : invoice?.total_amount || 0;

   // Calculate subtotal, discount, and tax from items
   const computedSubtotal =
      invoice?.items?.reduce((sum, item) => {
         const unitPrice = Number(
            item?.unit_price ?? item?.service_charge ?? 0
         );
         const govFees = Number(item?.government_fee ?? 0);
         return sum + unitPrice + govFees;
      }, 0) ?? 0;

   const computedTotalDiscount =
      invoice?.items?.reduce((sum, item) => {
         return sum + Number(item?.discount_amount ?? 0);
      }, 0) ?? 0;

   const computedTotalTax =
      invoice?.items?.reduce((sum, item) => {
         return sum + Number(item?.tax_amount ?? 0);
      }, 0) ?? 0;
   return (
      <Drawer isOpen={isOpen} onClose={onClose} width="max-w-[700px]">
         <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-background sticky top-0 z-10">
               <div className="flex items-center gap-4">
                  {totalInvoices > 0 && (
                     <>
                        <div className="flex items-center gap-2">
                           <button
                              onClick={handlePrevious}
                              disabled={!canGoPrevious}
                              className="p-1.5 rounded-lg border border-border hover:bg-bg-weak transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent">
                              <AngleLeftSmall
                                 size={20}
                                 className="fill-text-sub"
                              />
                           </button>
                           <button
                              onClick={handleNext}
                              disabled={!canGoNext}
                              className="p-1.5 rounded-lg border border-border hover:bg-bg-weak transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent">
                              <AngleRightSmall
                                 size={20}
                                 className="fill-text-sub"
                              />
                           </button>
                        </div>
                        <span className="text-sm font-medium text-text-soft tracking-tight">
                           {currentPosition} of {totalInvoices}
                        </span>
                     </>
                  )}
                  {/* Status Badge */}
                  {invoice?.status && (
                     <BadgeTag
                        label={getInvoiceStatusLabel(invoice.status)}
                        variant={getInvoiceStatusVariant(invoice.status)}
                        size="sm"
                     />
                  )}
               </div>
               <div className="flex items-center gap-2">
                  {/* Action Buttons based on status */}
                  {invoice && (
                     <>
                        {/* Edit button - Draft and Pending */}
                        {onEdit &&
                           (invoice.status === "Draft" ||
                              invoice.status === "Pending") && (
                              <button
                                 onClick={() => onEdit(invoice)}
                                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-bg-weak transition-colors">
                                 <Edit size={16} className="fill-text-sub" />
                                 <span className="text-sm font-medium text-text-sub">
                                    Edit
                                 </span>
                              </button>
                           )}
                        {/* Void button - Partially_Paid, Fully_Paid */}
                        {onVoid &&
                           (invoice.status === "Partially_Paid" ||
                              invoice.status === "Fully_Paid") && (
                              <button
                                 onClick={() => onVoid(invoice)}
                                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-bg-weak transition-colors">
                                 <Ban size={16} className="fill-text-sub" />
                                 <span className="text-sm font-medium text-text-sub">
                                    Void
                                 </span>
                              </button>
                           )}
                        {/* Delete button - Draft only */}
                        {onDelete && invoice.status === "Draft" && (
                           <button
                              onClick={() => onDelete(invoice)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-bg-weak transition-colors">
                              <Trash size={16} className="fill-danger" />
                              <span className="text-sm font-medium text-danger">
                                 Delete
                              </span>
                           </button>
                        )}
                     </>
                  )}
                  <button
                     onClick={handlePrint}
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-bg-weak transition-colors">
                     <Print size={16} className="fill-text-sub" />
                     <span className="text-sm font-medium text-text-sub">
                        Print
                     </span>
                  </button>
                  <button
                     onClick={onClose}
                     className="p-1.5 rounded-lg hover:bg-bg-weak transition-colors">
                     <CloseLine size={20} className="fill-text-strong" />
                  </button>
               </div>
            </div>

            {shouldShowLoader ? (
               <div className="flex-1 px-5 py-6">
                  <LoadingState
                     size="medium"
                     label={t("invoices.loadingDetails")}
                     minHeight="200px"
                     fullHeight
                  />
               </div>
            ) : (
               <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
                  {/* Show Invoice Paper directly */}
                  <InvoicePaper
                     ref={invoicePreviewRef}
                     invoiceData={{
                        invoiceNumber:
                           invoice!.invoice_code ||
                           invoice!.invoice_number ||
                           "",
                        token: invoice!.token || "",
                        agentName: agentName,
                        date: invoice!.invoice_date || invoice!.created_at,
                        preparedBy: invoice!.created_by?.name || "-",
                        trn:
                           invoice!.customer?.trn ||
                           invoice!.customer_trn ||
                           "",
                        customerName:
                           invoice!.customer?.customer_name ||
                           invoice!.customer_name ||
                           "-",
                        amount: resolvedTotalAmount,
                        subtotal: computedSubtotal,
                        totalDiscount: computedTotalDiscount,
                        totalTax: computedTotalTax,
                        currency: invoice!.currency || "AED",
                        items:
                           invoice!.items?.map((item) => ({
                              id: item.id?.toString(),
                              service_name: item.service_name || "",
                              government_fee: item.government_fee || 0,
                              discount_value: item.discount_value || 0,
                              discount_type: item.discount_type || "Percentage",
                              service_charge: item.unit_price || 0, // Display unit_price (service charge) for UI
                              fine_amount: item.fine_amount || 0,
                              tax_rate: item.tax_rate || 0,
                              total: item.total || 0,
                           })) || [],
                        notes:
                           invoice!.remarks ||
                           invoice!.internal_notes ||
                           undefined,
                        status: invoice!.status,
                     }}
                  />

                  {/* Invoice Logs */}
                  <div className="bg-background border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-5">
                     <h2 className="text-lg font-medium text-text-strong">
                        Invoice Logs
                     </h2>
                     {isLoadingHistory ? (
                        <div className="py-4 text-center">
                           <LoadingState size="small" label="Loading logs..." />
                        </div>
                     ) : (
                        <div className="flex flex-col relative">
                           {/* Connecting line - spans from first to last circle */}
                           {invoiceHistory.length > 0 && (
                              <div
                                 className="absolute left-5 top-10 w-0.5 border-l border-dashed border-stroke-sub"
                                 style={{ height: "calc(100% - 40px)" }}
                              />
                           )}

                           {invoiceHistory.length === 0 && (
                              <p className="text-sm text-text-soft py-4 text-center">
                                 No logs recorded yet.
                              </p>
                           )}

                           {invoiceHistory.map(
                              (
                                 log: {
                                    history_id?: string | number;
                                    id?: string | number;
                                    action?: string;
                                    description?: string;
                                    performed_by?: { name?: string };
                                    performed_at?: string;
                                    created_at?: string;
                                 },
                                 index: number
                              ) => {
                                 const dateString =
                                    log.performed_at || log.created_at;
                                 const performedAt = dateString
                                    ? new Date(dateString)
                                    : null;
                                 const showDate =
                                    performedAt && isValid(performedAt)
                                       ? format(performedAt, "dd MMMM, yyyy")
                                       : null;
                                 const showTime =
                                    performedAt && isValid(performedAt)
                                       ? format(performedAt, "hh:mm a")
                                       : null;

                                 return (
                                    <div
                                       key={log.history_id || log.id || index}
                                       className="flex gap-4 relative">
                                       <div className="flex flex-col items-center">
                                          <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center shadow-sm p-2 relative z-10">
                                             {log.action === "created" ||
                                             log.action === "create" ? (
                                                <Loader2Line
                                                   size={24}
                                                   className="fill-text-sub"
                                                />
                                             ) : (
                                                <FileText
                                                   size={24}
                                                   className="fill-primary"
                                                />
                                             )}
                                          </div>
                                       </div>
                                       <div className="flex-1 flex flex-col gap-3 pb-5">
                                          <div className="flex flex-col gap-1">
                                             <h3 className="text-base font-medium text-text-strong leading-6 capitalize">
                                                {log.action || "Action"}
                                             </h3>
                                             <p className="text-sm text-text-sub leading-5">
                                                {log.description ||
                                                   log.action ||
                                                   "No description available"}
                                             </p>
                                             {log.performed_by?.name && (
                                                <p className="text-xs text-text-soft mt-1">
                                                   By: {log.performed_by.name}
                                                </p>
                                             )}
                                          </div>
                                          {(showDate || showTime) && (
                                             <div className="flex items-center gap-2 text-xs text-text-sub leading-4">
                                                {showDate && (
                                                   <span>{showDate}</span>
                                                )}
                                                {showDate && showTime && (
                                                   <span>•</span>
                                                )}
                                                {showTime && (
                                                   <span>{showTime}</span>
                                                )}
                                             </div>
                                          )}
                                       </div>
                                    </div>
                                 );
                              }
                           )}
                        </div>
                     )}
                  </div>
               </div>
            )}
         </div>
      </Drawer>
   );
}
