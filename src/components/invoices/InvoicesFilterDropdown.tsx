/** @format */

import { useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import FilterModal from "@/designSystem/FilterModal";
import FilterSection from "@/designSystem/FilterSection";
import SearchableSelect from "./SearchableSelect";
import SearchableMultiSelect from "@/designSystem/SearchableMultiSelect";
import DatePicker from "@/designSystem/DatePicker";
import { customerService } from "@/services/customerService";
import { agentService } from "@/services/agentService";

export type InvoicesFilters = {
   dateFrom?: string; // YYYY-MM-DD
   dateTo?: string; // YYYY-MM-DD
   customerId?: string;
   agentId?: string;
   status?: string[];
};

const initialFilters: InvoicesFilters = {
   status: [],
};

type InvoicesFilterDropdownProps = {
   onApply?: (filters: InvoicesFilters) => void;
   triggerClassName?: string;
};

function InvoicesFilterDropdown({
   onApply,
   triggerClassName = "",
}: InvoicesFilterDropdownProps) {
   const { t } = useTranslation("settings");
   const [isOpen, setIsOpen] = useState(false);
   const [filters, setFilters] = useState<InvoicesFilters>(initialFilters);

   // Fetch customer options with server-side search
   const fetchCustomerOptions = async (
      search: string
   ): Promise<Array<{ id: string; label: string }>> => {
      const response = await customerService.list({
         page: 1,
         limit: 20,
         search: search || undefined,
      });
      return (response?.data || []).map((c) => ({
         id: String(c.customer_id ?? c.id ?? ""),
         label: c.customer_name ?? c.name ?? "",
      }));
   };

   // Fetch agent options with server-side search
   const fetchAgentOptions = async (
      search: string
   ): Promise<Array<{ id: string; label: string }>> => {
      const response = await agentService.list({
         page: 1,
         limit: 20,
         search: search || undefined,
      });
      return (response?.data || []).map((a) => ({
         id: String(a.agent_id ?? a.id ?? ""),
         label: a.agent_name ?? a.name ?? "",
      }));
   };

   const statusOptions = useMemo(
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
         statusOptions.filter((option) => filters.status?.includes(option.id)),
      [filters.status, statusOptions]
   );

   // Helpers
   const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
   };

   const getMonthRange = (baseDate: Date) => {
      const year = baseDate.getFullYear();
      const month = baseDate.getMonth();
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      return { start, end };
   };

   const handleCurrentMonth = () => {
      const { start, end } = getMonthRange(new Date());
      setFilters((prev) => ({
         ...prev,
         dateFrom: formatDate(start),
         dateTo: formatDate(end),
      }));
   };

   const handlePrevMonth = () => {
      const base = filters.dateFrom ? new Date(filters.dateFrom) : new Date();
      const prevMonthDate = new Date(
         base.getFullYear(),
         base.getMonth() - 1,
         1
      );
      const { start, end } = getMonthRange(prevMonthDate);
      setFilters((prev) => ({
         ...prev,
         dateFrom: formatDate(start),
         dateTo: formatDate(end),
      }));
   };

   const handleNextMonth = () => {
      const base = filters.dateFrom ? new Date(filters.dateFrom) : new Date();
      const nextMonthDate = new Date(
         base.getFullYear(),
         base.getMonth() + 1,
         1
      );
      const { start, end } = getMonthRange(nextMonthDate);
      setFilters((prev) => ({
         ...prev,
         dateFrom: formatDate(start),
         dateTo: formatDate(end),
      }));
   };

   const handleApply = () => {
      if (onApply) {
         // Clean filters
         const cleanFilters: InvoicesFilters = {};
         if (filters.dateFrom) cleanFilters.dateFrom = filters.dateFrom;
         if (filters.dateTo) cleanFilters.dateTo = filters.dateTo;
         if (filters.customerId) cleanFilters.customerId = filters.customerId;
         if (filters.agentId) cleanFilters.agentId = filters.agentId;
         if (filters.status && filters.status.length > 0) {
            cleanFilters.status = filters.status;
         }
         onApply(cleanFilters);
      }
      setIsOpen(false);
   };

   const handleResetAll = () => {
      setFilters(initialFilters);
   };

   const handleResetField = (field: keyof InvoicesFilters) => {
      setFilters((prev) => {
         const next = { ...prev };
         delete next[field];
         return next;
      });
   };

   return (
      <FilterModal
         isOpen={isOpen}
         onClose={() => setIsOpen(!isOpen)}
         onApply={handleApply}
         onResetAll={handleResetAll}
         triggerLabel={t("invoices.filters.filter")}
         title={t("invoices.filters.title")}
         resetAllLabel={t("invoices.filters.resetAll")}
         cancelLabel={t("common:actions.cancel")}
         applyLabel={t("common:actions.applyNow")}
         triggerClassName={triggerClassName}>
         {/* Date Range */}
         <FilterSection
            label={t("invoices.filters.dateRange")}
            onReset={() => {
               handleResetField("dateFrom");
               handleResetField("dateTo");
            }}
            resetLabel={t("invoices.filters.reset")}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
               <div className="flex-1">
                  <DatePicker
                     value={
                        filters.dateFrom
                           ? new Date(filters.dateFrom)
                           : undefined
                     }
                     onChange={(date) =>
                        setFilters({
                           ...filters,
                           dateFrom: date ? formatDate(date) : "",
                        })
                     }
                     placeholder={t("invoices.filters.dateFrom")}
                  />
               </div>
               <span className="text-text-sub hidden sm:inline">-</span>
               <div className="flex-1">
                  <DatePicker
                     value={
                        filters.dateTo ? new Date(filters.dateTo) : undefined
                     }
                     onChange={(date) =>
                        setFilters({
                           ...filters,
                           dateTo: date ? formatDate(date) : "",
                        })
                     }
                     placeholder={t("invoices.filters.dateTo")}
                     popoverAlign="right"
                  />
               </div>
            </div>
            <div className="flex items-center justify-between w-full gap-2 mt-2">
               <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-bg-weak transition-colors">
                  Prev Month
               </button>
               <button
                  type="button"
                  onClick={handleCurrentMonth}
                  className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-bg-weak transition-colors">
                  Current Month
               </button>
               <button
                  type="button"
                  onClick={handleNextMonth}
                  className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-bg-weak transition-colors">
                  Next Month
               </button>
            </div>
         </FilterSection>

         {/* Customer */}
         <FilterSection
            label={t("invoices.filters.customer")}
            onReset={() => handleResetField("customerId")}
            resetLabel={t("invoices.filters.reset")}>
            <SearchableSelect
               value={filters.customerId || ""}
               onChange={(val) => setFilters({ ...filters, customerId: val })}
               options={[]}
               placeholder={t("invoices.filters.selectCustomer")}
               debounceMs={400}
               serverSideSearch={true}
               fetchOptions={fetchCustomerOptions}
            />
         </FilterSection>

         {/* Agent */}
         <FilterSection
            label={t("invoices.filters.agent")}
            onReset={() => handleResetField("agentId")}
            resetLabel={t("invoices.filters.reset")}>
            <SearchableSelect
               value={filters.agentId || ""}
               onChange={(val) => setFilters({ ...filters, agentId: val })}
               options={[]}
               placeholder={t("invoices.filters.selectAgent")}
               debounceMs={400}
               serverSideSearch={true}
               fetchOptions={fetchAgentOptions}
            />
         </FilterSection>

         {/* Status */}
         <FilterSection
            label={t("invoices.filters.status")}
            onReset={() => handleResetField("status")}
            resetLabel={t("invoices.filters.reset")}>
            <SearchableMultiSelect
               placeholder={t("invoices.filters.selectStatus")}
               availableItems={statusOptions}
               selectedItems={selectedStatuses}
               onChange={(items) =>
                  setFilters({
                     ...filters,
                     status: items.map((item) => item.id),
                  })
               }
            />
         </FilterSection>
      </FilterModal>
   );
}

export default InvoicesFilterDropdown;
