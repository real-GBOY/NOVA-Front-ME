/** @format */

import { useState, useMemo, useCallback } from "react";
import { format, isValid } from "date-fns";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import DatePicker from "@/designSystem/DatePicker";
import LoadingState from "@/designSystem/LoadingState";
import DirhamLabel from "@/designSystem/DirhamLabel";
import StatusTag from "@/designSystem/StatusTag";
import { useTranslation } from "@/hooks/useTranslation";
import { useGetFinancialAccountHistory } from "@/hooks/financialAccountHistory/useFinancialAccountHistory";
import {
   type SourceType,
   type HistoryTransaction,
} from "@/services/financialAccountHistoryService";
import { FileExport, Calender, ArrowDownSLine } from "@/Icons";
import {
   exportToExcel,
   exportToCSV,
   generateFilename,
} from "@/utilities/exportUtils";
import toast from "@/utilities/toast";

export interface FinancialHistoryAccount {
   id: string | number;
   name: string;
   account_id?: string | number;
}

interface FinancialHistoryModalProps {
   isOpen: boolean;
   onClose: () => void;
   account: FinancialHistoryAccount | null;
   /** Translation namespace prefix for this modal type (e.g., "banks.history" or "prettyCashNames.history") */
   translationPrefix: string;
}

type TabType = "incoming" | "outgoing";

const SOURCE_TYPE_OPTIONS: { value: SourceType | ""; labelKey: string }[] = [
   { value: "", labelKey: "allSources" },
   { value: "PaymentVoucher", labelKey: "paymentVoucher" },
   { value: "ReceiptVoucher", labelKey: "receiptVoucher" },
   { value: "InvoicePayment", labelKey: "invoicePayment" },
];

function FinancialHistoryModal({
   isOpen,
   onClose,
   account,
   translationPrefix,
}: FinancialHistoryModalProps) {
   const { t } = useTranslation("settings");
   const { t: tc } = useTranslation("common");

   const [activeTab, setActiveTab] = useState<TabType>("incoming");
   const [page, setPage] = useState(1);
   const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
   const [toDate, setToDate] = useState<Date | undefined>(undefined);
   const [sourceType, setSourceType] = useState<SourceType | "">("");
   const [isExporting, setIsExporting] = useState(false);

   // Get the account_id for the API call
   const accountId = account?.account_id || account?.id;

   // Map tab to transaction type: incoming = Credit, outgoing = Debit
   const transactionType = activeTab === "incoming" ? "Credit" : "Debit";

   // Fetch history data with improved caching
   const {
      data: historyData,
      isLoading,
      isFetching,
   } = useGetFinancialAccountHistory(
      accountId,
      {
         page,
         limit: 20,
         from_date: fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
         to_date: toDate ? format(toDate, "yyyy-MM-dd") : undefined,
         source_type: sourceType || undefined,
         transaction_type: transactionType,
      },
      { enabled: isOpen && !!accountId }
   );

   const transactions = useMemo(
      () => historyData?.data?.transactions || [],
      [historyData]
   );

   const pagination = historyData?.pagination;

   // Handle export using frontend utilities
   const handleExport = useCallback(
      (exportFormat: "csv" | "xlsx") => {
         if (transactions.length === 0) {
            toast.error(t(`${translationPrefix}.export.error`));
            return;
         }

         setIsExporting(true);
         try {
            // Format transactions data for export
            const exportData = transactions.map((txn: HistoryTransaction) => ({
               [t(`${translationPrefix}.columns.date`)]: txn.transaction_date
                  ? format(new Date(txn.transaction_date), "dd MMM yyyy")
                  : "-",
               [t(`${translationPrefix}.columns.source`)]:
                  txn.source_type?.replace(/([A-Z])/g, " $1").trim() || "-",
               [t(`${translationPrefix}.columns.description`)]:
                  txn.description || txn.source_code || "-",
               [t(`${translationPrefix}.columns.amount`)]: txn.amount || 0,
               [t(`${translationPrefix}.columns.type`) || "Type"]:
                  txn.transaction_type === "Credit"
                     ? tc("credit")
                     : tc("debit"),
            }));

            const filename = generateFilename(
               `${account?.name || "account"}_${activeTab}_history`
            );

            if (exportFormat === "xlsx") {
               exportToExcel(
                  exportData,
                  filename,
                  activeTab === "incoming" ? tc("credit") : tc("debit")
               );
            } else {
               exportToCSV(exportData, filename);
            }

            toast.success(t(`${translationPrefix}.export.success`));
         } catch (error) {
            console.error("Export error:", error);
            toast.error(t(`${translationPrefix}.export.error`));
         } finally {
            setIsExporting(false);
         }
      },
      [transactions, account?.name, activeTab, translationPrefix, t, tc]
   );

   // Reset filters
   const handleResetFilters = useCallback(() => {
      setFromDate(undefined);
      setToDate(undefined);
      setSourceType("");
      setPage(1);
   }, []);

   // Handle tab change
   const handleTabChange = useCallback((tab: TabType) => {
      setActiveTab(tab);
      setPage(1);
   }, []);

   // Get source type display label
   const getSourceTypeLabel = (source: string) => {
      return source?.replace(/([A-Z])/g, " $1").trim() || "-";
   };

   // Render transactions table
   const renderTransactionsTable = () => {
      if (isLoading) {
         return (
            <div className="py-12 flex items-center justify-center">
               <LoadingState
                  size="medium"
                  label={t(`${translationPrefix}.loading`)}
               />
            </div>
         );
      }

      if (transactions.length === 0) {
         return (
            <div className="py-12 flex flex-col items-center justify-center bg-bg-weak rounded-xl border border-border">
               <div className="w-16 h-16 mb-4 rounded-full bg-bg-soft flex items-center justify-center">
                  <Calender className="w-8 h-8 fill-text-soft" />
               </div>
               <p className="text-sm text-text-sub text-center">
                  {activeTab === "incoming"
                     ? t(`${translationPrefix}.empty.incoming`)
                     : t(`${translationPrefix}.empty.outgoing`)}
               </p>
            </div>
         );
      }

      return (
         <div className="overflow-hidden rounded-xl border border-border bg-background">
            <div className="overflow-x-auto">
               <table className="w-full min-w-[700px]">
                  <thead>
                     <tr className="border-b border-border bg-bg-weak">
                        <th className="text-start py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-text-sub">
                           {t(`${translationPrefix}.columns.date`)}
                        </th>
                        <th className="text-start py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-text-sub">
                           {t(`${translationPrefix}.columns.source`)}
                        </th>
                        <th className="text-start py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-text-sub">
                           {t(`${translationPrefix}.columns.description`)}
                        </th>
                        <th className="text-start py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-text-sub">
                           {t(`${translationPrefix}.columns.amount`)}
                        </th>
                        <th className="text-start py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-text-sub">
                           {t(`${translationPrefix}.columns.type`) ||
                              tc("type")}
                        </th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                     {transactions.map(
                        (transaction: HistoryTransaction, index: number) => {
                           const date = transaction.transaction_date
                              ? new Date(transaction.transaction_date)
                              : null;
                           const formattedDate =
                              date && isValid(date)
                                 ? format(date, "dd MMM yyyy")
                                 : "-";

                           const isCredit =
                              transaction.transaction_type === "Credit";

                           return (
                              <tr
                                 key={transaction.history_id || index}
                                 className="hover:bg-bg-weak/50 transition-colors">
                                 <td className="py-4 px-4 text-sm text-text-strong font-medium whitespace-nowrap">
                                    {formattedDate}
                                 </td>
                                 <td className="py-4 px-4">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-bg-soft text-text-sub text-xs font-medium">
                                       {getSourceTypeLabel(
                                          transaction.source_type
                                       )}
                                    </span>
                                 </td>
                                 <td className="py-4 px-4 text-sm text-text-sub max-w-[280px]">
                                    <span className="line-clamp-2">
                                       {transaction.description ||
                                          transaction.source_code ||
                                          "-"}
                                    </span>
                                 </td>
                                 <td className="py-4 px-4 text-sm font-medium">
                                    <DirhamLabel
                                       value={
                                          transaction.amount?.toLocaleString() ||
                                          "0"
                                       }
                                    />
                                 </td>
                                 <td className="py-4 px-4">
                                    <StatusTag
                                       label={
                                          isCredit ? tc("credit") : tc("debit")
                                       }
                                       variant={
                                          isCredit ? "completed" : "inactive"
                                       }
                                    />
                                 </td>
                              </tr>
                           );
                        }
                     )}
                  </tbody>
               </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
               <div className="flex items-center justify-between py-3 px-4 border-t border-border bg-bg-weak/50">
                  <p className="text-sm text-text-sub">
                     {tc("pagination.pageOf", {
                        current: pagination.page,
                        total: pagination.total_pages,
                     }) ||
                        `Page ${pagination.page} of ${pagination.total_pages}`}
                  </p>
                  <div className="flex gap-2">
                     <Button
                        variant="secondary"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={pagination.page <= 1}
                        className="text-sm py-1.5">
                        {tc("pagination.previous")}
                     </Button>
                     <Button
                        variant="secondary"
                        onClick={() =>
                           setPage((p) =>
                              Math.min(pagination.total_pages, p + 1)
                           )
                        }
                        disabled={pagination.page >= pagination.total_pages}
                        className="text-sm py-1.5">
                        {tc("pagination.next")}
                     </Button>
                  </div>
               </div>
            )}
         </div>
      );
   };

   const tabs: { id: TabType; label: string }[] = [
      {
         id: "incoming",
         label: t(`${translationPrefix}.tabs.incoming`),
      },
      {
         id: "outgoing",
         label: t(`${translationPrefix}.tabs.outgoing`),
      },
   ];

   return (
      <Modal
         isOpen={isOpen}
         onClose={onClose}
         title={`${account?.name || ""} - ${t(`${translationPrefix}.title`)}`}
         size="large">
         <div className="flex flex-col gap-5 p-6">
            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3">
               {/* Date Range */}
               <div className="flex items-center gap-2">
                  <span className="text-sm text-text-sub font-medium">
                     {t(`${translationPrefix}.filters.from`)}:
                  </span>
                  <DatePicker
                     value={fromDate}
                     onChange={(date) => {
                        setFromDate(date);
                        setPage(1);
                     }}
                     placeholder={t(`${translationPrefix}.filters.selectDate`)}
                     buttonClassName="!py-2 !px-3 text-sm min-w-[130px]"
                  />
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-sm text-text-sub font-medium">
                     {t(`${translationPrefix}.filters.to`)}:
                  </span>
                  <DatePicker
                     value={toDate}
                     onChange={(date) => {
                        setToDate(date);
                        setPage(1);
                     }}
                     placeholder={t(`${translationPrefix}.filters.selectDate`)}
                     buttonClassName="!py-2 !px-3 text-sm min-w-[130px]"
                  />
               </div>

               {/* Source Type Filter */}
               <div className="relative">
                  <select
                     value={sourceType}
                     onChange={(e) => {
                        setSourceType(e.target.value as SourceType | "");
                        setPage(1);
                     }}
                     className="appearance-none px-3 py-2 pe-8 text-sm border border-border rounded-lg bg-background text-text-strong focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer">
                     {SOURCE_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                           {t(
                              `${translationPrefix}.sourceTypes.${option.labelKey}`
                           ) ||
                              option.labelKey.replace(/([A-Z])/g, " $1").trim()}
                        </option>
                     ))}
                  </select>
                  <ArrowDownSLine className="absolute end-2.5 top-1/2 -translate-y-1/2 w-4 h-4 fill-text-sub pointer-events-none" />
               </div>

               {/* Reset Filters */}
               <Button
                  variant="secondary"
                  onClick={handleResetFilters}
                  className="text-text-sub hover:text-text-strong text-sm py-1.5">
                  {t(`${translationPrefix}.filters.reset`)}
               </Button>

               {/* Export Buttons */}
               <div className="ms-auto flex items-center gap-2">
                  <Button
                     variant="secondary"
                     onClick={() => handleExport("xlsx")}
                     disabled={isExporting || transactions.length === 0}
                     className="flex items-center gap-2 text-sm py-1.5">
                     <FileExport size={16} />
                     Excel
                  </Button>
                  <Button
                     variant="secondary"
                     onClick={() => handleExport("csv")}
                     disabled={isExporting || transactions.length === 0}
                     className="flex items-center gap-2 text-sm py-1.5">
                     <FileExport size={16} />
                     CSV
                  </Button>
               </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
               <div className="flex gap-0">
                  {tabs.map((tab) => (
                     <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleTabChange(tab.id)}
                        className={`relative px-4 pb-3 text-sm font-medium transition-colors ${
                           activeTab === tab.id
                              ? "text-primary"
                              : "text-text-sub hover:text-text-strong"
                        }`}>
                        {tab.label}
                        {activeTab === tab.id && (
                           <div className="absolute bottom-0 end-0 right-0 h-0.5 bg-primary rounded-full" />
                        )}
                     </button>
                  ))}
                  {/* Loading indicator */}
                  {isFetching && !isLoading && (
                     <div className="ms-auto flex items-center gap-2 pb-3 px-2">
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                     </div>
                  )}
               </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[350px]">{renderTransactionsTable()}</div>
         </div>
      </Modal>
   );
}

export default FinancialHistoryModal;
