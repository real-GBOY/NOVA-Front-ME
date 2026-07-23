/** @format */

import { useMemo, useState } from "react";
import { FileExport } from "@/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import DatePicker from "@/designSystem/DatePicker";
import FilterSection from "@/designSystem/FilterSection";
import SearchableMultiSelect from "@/designSystem/SearchableMultiSelect";
import Select from "@/designSystem/Select";
import Checkbox from "@/designSystem/Checkbox";
import { invoiceService } from "@/services/invoiceService";
import {
   exportToCSV,
   exportToExcel,
   formatDataForExport,
   generateFilename,
} from "@/utilities/exportUtils";
import toast from "@/utilities/toast";

type ExportFormat = "excel" | "csv";

type StatusOption = {
   id: string;
   label: string;
};

type InvoiceListFilters = {
   page?: number;
   limit?: number;
   search?: string;
   status?: string | string[];
   customer_id?: string | number;
   agent_id?: string | number;
   from_date?: string;
   to_date?: string;
   date_from?: string;
   date_to?: string;
   sort_by?: string;
   sort_order?: "asc" | "desc";
};

interface InvoicesExportButtonProps {
   filename?: string;
   sheetName?: string;
   className?: string;
}

export default function InvoicesExportButton({
   filename = "invoices",
   sheetName = "Invoices",
   className = "",
}: InvoicesExportButtonProps) {
   const { t } = useTranslation("settings");
   const [isOpen, setIsOpen] = useState(false);
   const [dateFrom, setDateFrom] = useState<string>("");
   const [dateTo, setDateTo] = useState<string>("");
   const [allStatuses, setAllStatuses] = useState(true);
   const [selectedStatusIds, setSelectedStatusIds] = useState<string[]>([]);
   const [format, setFormat] = useState<ExportFormat>("excel");
   const [isExporting, setIsExporting] = useState(false);

   const statusOptions = useMemo<StatusOption[]>(
      () => [
         { id: "Draft", label: t("invoices.status.draft") },
         { id: "Pending", label: t("invoices.status.pending") },
         { id: "Partially_Paid", label: t("invoices.status.partiallyPaid") },
         { id: "Fully_Paid", label: t("invoices.status.fullyPaid") },
         { id: "Cancelled", label: t("invoices.status.cancelled") },
         { id: "Void", label: t("invoices.status.void") },
      ],
      [t]
   );

   const selectedStatuses = useMemo(
      () =>
         statusOptions.filter((option) =>
            selectedStatusIds.includes(option.id)
         ),
      [statusOptions, selectedStatusIds]
   );

   const formatOptions = useMemo(
      () => [
         { value: "excel", label: t("invoices.export.formatExcel") },
         { value: "csv", label: t("invoices.export.formatCsv") },
      ],
      [t]
   );

   const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
   };

   const getLastPaymentDate = (
      invoice: Record<string, unknown>,
      historyOverride?: unknown[]
   ) => {
      const parseDate = (value: unknown) => {
         if (typeof value !== "string") return null;
         const date = new Date(value);
         return Number.isNaN(date.getTime()) ? null : date;
      };

      const pickLatest = (values: string[]) => {
         let latest: { value: string; date: Date } | null = null;
         values.forEach((value) => {
            const date = parseDate(value);
            if (!date) return;
            if (!latest || date > latest.date) {
               latest = { value, date };
            }
         });
         return latest?.value || "";
      };

      const payments = Array.isArray(invoice.payments) ? invoice.payments : [];
      const paymentDates = payments
         .map((payment) => {
            if (!payment || typeof payment !== "object") return null;
            const record = payment as Record<string, unknown>;
            if (typeof record.payment_date === "string") return record.payment_date;
            if (typeof record.created_at === "string") return record.created_at;
            if (typeof record.date === "string") return record.date;
            return null;
         })
         .filter((value): value is string => Boolean(value));

      const history = Array.isArray(historyOverride)
         ? historyOverride
         : Array.isArray(invoice.history)
           ? invoice.history
           : [];
      const historyDates = history
         .map((entry) => {
            if (!entry || typeof entry !== "object") return null;
            const record = entry as Record<string, unknown>;
            const action = String(record.action || "").toLowerCase();
            if (!action.includes("payment") && !action.includes("paid")) {
               return null;
            }
            if (typeof record.performed_at === "string") return record.performed_at;
            if (typeof record.created_at === "string") return record.created_at;
            return null;
         })
         .filter((value): value is string => Boolean(value));

      const candidateDates = [...paymentDates, ...historyDates];
      return pickLatest(candidateDates);
   };

   const getInvoiceId = (invoice: Record<string, unknown>) =>
      (invoice.invoice_id as string | number | undefined) ??
      (invoice.id as string | number | undefined);

   const shouldFetchHistory = (invoice: Record<string, unknown>) => {
      const status = String(invoice.status || "").toLowerCase();
      const amountPaid =
         Number(invoice.amount_paid ?? invoice.amountPaid ?? invoice.paid_amount) ||
         0;
      return amountPaid > 0 || status.includes("paid");
   };

   const orderExportColumns = (rows: Record<string, unknown>[]) => {
      const preferredColumns: Array<{
         key: string;
         alternatives?: string[];
      }> = [
         { key: "id" },
         { key: "invoice_code" },
         { key: "status" },
         { key: "customer_name" },
         { key: "customer_id" },
         { key: "agent_id" },
         { key: "agent_name" },
         { key: "amount_paid", alternatives: ["paid_amount"] },
         { key: "balance_due", alternatives: ["remaining_amount"] },
         { key: "total", alternatives: ["total_amount"] },
      ];

      const preferredKeys = new Set(
         preferredColumns.flatMap(({ key, alternatives }) => [
            key,
            ...(alternatives || []),
         ])
      );

      return rows.map((row) => {
         const ordered: Record<string, unknown> = {};
         const consumedKeys = new Set<string>();

         preferredColumns.forEach(({ key, alternatives }) => {
            if (key in row) {
               ordered[key] = row[key];
               consumedKeys.add(key);
               return;
            }
            const match = alternatives?.find((alt) => alt in row);
            if (match) {
               ordered[key] = row[match];
               consumedKeys.add(match);
               return;
            }
            ordered[key] = "";
         });

         Object.entries(row).forEach(([key, value]) => {
            if (preferredKeys.has(key) || consumedKeys.has(key)) return;
            ordered[key] = value;
         });

         return ordered;
      });
   };

   const handleStatusChange = (items: StatusOption[]) => {
      const nextIds = items.map((item) => item.id);
      setSelectedStatusIds(nextIds);
      if (nextIds.length > 0) {
         setAllStatuses(false);
      }
   };

   const handleAllStatusesChange = (checked: boolean) => {
      setAllStatuses(checked);
      if (checked) {
         setSelectedStatusIds([]);
      }
   };

   const resetFilters = () => {
      setDateFrom("");
      setDateTo("");
      setAllStatuses(true);
      setSelectedStatusIds([]);
      setFormat("excel");
   };

   const fetchAllInvoicesByStatus = async (
      filters: InvoiceListFilters & { status?: string }
   ) => {
      const limit = 100;
      let page = 1;
      let totalPages = 1;
      const allInvoices: Record<string, unknown>[] = [];

      do {
         const response = await invoiceService.list({
            ...filters,
            page,
            limit,
         });
         const pageData = response?.data || [];
         allInvoices.push(...pageData);
         totalPages = response?.pagination?.total_pages || 1;
         page += 1;
      } while (page <= totalPages);

      return allInvoices;
   };

   const fetchAllInvoices = async (filters: InvoiceListFilters) => {
      const statusFilter = filters.status;
      if (Array.isArray(statusFilter) && statusFilter.length > 1) {
         const uniqueStatuses = Array.from(
            new Set(statusFilter.filter((status) => status))
         );
         const responses = await Promise.all(
            uniqueStatuses.map((status) =>
               fetchAllInvoicesByStatus({ ...filters, status })
            )
         );
         const merged = new Map<string | number, Record<string, unknown>>();
         const extras: Record<string, unknown>[] = [];
         responses.flat().forEach((invoice) => {
            const key =
               (invoice as { invoice_id?: string | number; id?: string | number })
                  ?.invoice_id ??
               (invoice as { invoice_id?: string | number; id?: string | number })
                  ?.id ??
               (invoice as { invoice_code?: string })?.invoice_code;
            if (key === undefined || key === null) {
               extras.push(invoice);
               return;
            }
            if (!merged.has(key)) merged.set(key, invoice);
         });
         return [...Array.from(merged.values()), ...extras];
      }

      const singleStatus = Array.isArray(statusFilter)
         ? statusFilter[0]
         : statusFilter;
      return fetchAllInvoicesByStatus({ ...filters, status: singleStatus });
   };

   const handleExport = async () => {
      setIsExporting(true);
      try {
         const filters: InvoiceListFilters = {};
         if (dateFrom) filters.date_from = dateFrom;
         if (dateTo) filters.date_to = dateTo;
         if (!allStatuses && selectedStatusIds.length > 0) {
            filters.status = selectedStatusIds;
         }

         const invoices = await fetchAllInvoices(filters);
         if (!invoices.length) {
            toast.error(t("invoices.export.noData"));
            return;
         }

         const invoicesWithLastPaymentDate = await Promise.all(
            invoices.map(async (invoice) => {
               let lastPaymentDate = getLastPaymentDate(invoice);
               if (!lastPaymentDate && shouldFetchHistory(invoice)) {
                  const invoiceId = getInvoiceId(invoice);
                  if (invoiceId !== undefined && invoiceId !== null) {
                     const history = await invoiceService.getHistory(invoiceId);
                     lastPaymentDate = getLastPaymentDate(invoice, history);
                  }
               }
               return { invoice, lastPaymentDate };
            })
         );

         const sanitizedInvoices = invoicesWithLastPaymentDate.map(
            ({ invoice, lastPaymentDate }) => {
               const sanitized: Record<string, unknown> = {};
               Object.entries(invoice).forEach(([key, value]) => {
                  if (key === "due_date" || key === "dueDate") return;
                  sanitized[key] = value;
               });
               sanitized.last_payment_date = lastPaymentDate;
               return sanitized;
            }
         );

         const formattedData = orderExportColumns(
            formatDataForExport(sanitizedInvoices)
         );
         const exportFilename = generateFilename(filename);

         if (format === "excel") {
            exportToExcel(formattedData, exportFilename, sheetName);
            toast.success(t("invoices.export.successExcel"));
         } else {
            exportToCSV(formattedData, exportFilename);
            toast.success(t("invoices.export.successCsv"));
         }

         setIsOpen(false);
      } catch (error) {
         console.error("Export error:", error);
         toast.error(t("invoices.export.error"));
      } finally {
         setIsExporting(false);
      }
   };

   const footer = (
      <div className="flex items-center justify-between gap-3 w-full">
         <Button
            variant="secondary"
            onClick={resetFilters}
            disabled={isExporting}>
            {t("common:actions.reset")}
         </Button>
         <div className="flex items-center gap-3">
            <Button
               variant="secondary"
               onClick={() => setIsOpen(false)}
               disabled={isExporting}>
               {t("common:actions.cancel")}
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
               {isExporting && (
                  <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle" />
               )}
               {t("common:actions.export")}
            </Button>
         </div>
      </div>
   );

   return (
      <>
         <button
            type="button"
            onClick={() => setIsOpen(true)}
            className={`flex items-center gap-2 px-2.5 py-2 text-sm font-medium text-text-sub border border-border rounded-lg bg-background hover:bg-bg-weak transition-colors ${className}`}>
            <FileExport className="size-5 fill-text-sub" />
            <span>{t("common:actions.export")}</span>
         </button>

         <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title={t("invoices.export.title")}
            size="medium"
            overflow="visible"
            contentClassName="flex flex-col gap-6"
            footer={footer}>
            <FilterSection
               label={t("invoices.export.dateRange")}
               onReset={() => {
                  setDateFrom("");
                  setDateTo("");
               }}
               resetLabel={t("invoices.filters.reset")}>
               <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex-1">
                     <DatePicker
                        value={dateFrom ? new Date(dateFrom) : undefined}
                        onChange={(date) =>
                           setDateFrom(date ? formatDate(date) : "")
                        }
                        placeholder={t("invoices.export.dateFrom")}
                     />
                  </div>
                  <span className="text-text-sub hidden sm:inline">-</span>
                  <div className="flex-1">
                     <DatePicker
                        value={dateTo ? new Date(dateTo) : undefined}
                        onChange={(date) =>
                           setDateTo(date ? formatDate(date) : "")
                        }
                        placeholder={t("invoices.export.dateTo")}
                        popoverAlign="right"
                     />
                  </div>
               </div>
            </FilterSection>

            <FilterSection
               label={t("invoices.export.status")}
               onReset={() => {
                  setAllStatuses(true);
                  setSelectedStatusIds([]);
               }}
               resetLabel={t("invoices.filters.reset")}>
               <div className="flex flex-col gap-3">
                  <Checkbox
                     checked={allStatuses}
                     onChange={(event) =>
                        handleAllStatusesChange(event.target.checked)
                     }
                     label={t("invoices.export.allStatuses")}
                  />
                  <div
                     className={
                        allStatuses ? "pointer-events-none opacity-60" : ""
                     }>
                     <SearchableMultiSelect
                        placeholder={t("invoices.export.selectStatus")}
                        availableItems={statusOptions}
                        selectedItems={selectedStatuses}
                        onChange={handleStatusChange}
                     />
                  </div>
               </div>
            </FilterSection>

            <FilterSection
               label={t("invoices.export.formatLabel")}
               onReset={() => setFormat("excel")}
               resetLabel={t("invoices.filters.reset")}>
               <Select
                  options={formatOptions}
                  value={format}
                  onChange={(value) => setFormat(value as ExportFormat)}
                  placeholder={t("invoices.export.formatPlaceholder")}
               />
            </FilterSection>
         </Modal>
      </>
   );
}
