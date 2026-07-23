/** @format */

import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import FilterModal from "@/designSystem/FilterModal";
import FilterSection from "@/designSystem/FilterSection";
import DatePicker from "@/designSystem/DatePicker";
import LoadingState from "@/designSystem/LoadingState";
import { useListEmployees } from "@/hooks/employees/useEmployee";
import SearchableSelect from "@/components/invoices/SearchableSelect";

export type LegalCaseFilters = {
   status?: string;
   lawyerId?: string;
   dateFrom?: Date;
   dateTo?: Date;
};

const initialFilters: LegalCaseFilters = {
   status: "",
   lawyerId: "",
   dateFrom: undefined,
   dateTo: undefined,
};

// Status options based on common legal case statuses
const STATUS_OPTIONS = [
   { id: "Open", key: "open" },
   { id: "In Progress", key: "inProgress" },
   { id: "Closed", key: "closed" },
   { id: "On Hold", key: "onHold" },
   { id: "Cancelled", key: "cancelled" },
];

type LegalCasesFilterDropdownProps = {
   onApply?: (filters: LegalCaseFilters) => void;
   triggerClassName?: string;
};

function LegalCasesFilterDropdown({
   onApply,
   triggerClassName = "",
}: LegalCasesFilterDropdownProps) {
   const { t } = useTranslation("settings");
   const [isOpen, setIsOpen] = useState(false);
   const [filters, setFilters] = useState<LegalCaseFilters>(initialFilters);

   // Fetch lawyers (employees)
   const { data: employeesData, isLoading: isLoadingEmployees } =
      useListEmployees({ page: 1, limit: 100 });

   const lawyerOptions = useMemo(
      () =>
         employeesData?.data.map((emp) => ({
            id: emp.id.toString(),
            label: emp.name,
         })) || [],
      [employeesData]
   );

   const handleResetAll = () => {
      setFilters(initialFilters);
   };

   const handleResetField = (field: keyof LegalCaseFilters) => {
      setFilters((prev) => {
         const next = { ...prev };
         if (field === "dateFrom" || field === "dateTo") {
            next[field] = undefined;
         } else {
            next[field] = "";
         }
         return next;
      });
   };

   const handleResetDateRange = () => {
      setFilters((prev) => ({
         ...prev,
         dateFrom: undefined,
         dateTo: undefined,
      }));
   };

   const handleApply = () => {
      if (onApply) {
         const cleanedFilters: LegalCaseFilters = {};
         if (filters.status) cleanedFilters.status = filters.status;
         if (filters.lawyerId) cleanedFilters.lawyerId = filters.lawyerId;
         if (filters.dateFrom) cleanedFilters.dateFrom = filters.dateFrom;
         if (filters.dateTo) cleanedFilters.dateTo = filters.dateTo;

         onApply(cleanedFilters);
      }
      setIsOpen(false);
   };

   const translatedStatusOptions = useMemo(
      () =>
         STATUS_OPTIONS.map((opt) => ({
            id: opt.id,
            label:
               t(`legalCases.status.${opt.key}`, { defaultValue: opt.id }) ||
               opt.id,
         })),
      [t]
   );

   return (
      <FilterModal
         isOpen={isOpen}
         onClose={() => setIsOpen(!isOpen)}
         onApply={handleApply}
         onResetAll={handleResetAll}
         triggerLabel={t("legalCases.filter", "Filter")}
         title={t("legalCases.filterTitle", "Filter Cases")}
         resetAllLabel={t("legalCases.resetAll", "Reset All")}
         cancelLabel={t("common:actions.cancel")}
         applyLabel={t("common:actions.applyNow")}
         triggerClassName={triggerClassName}>
         {/* Status Filter */}
         <FilterSection
            label={t("legalCases.table.status", "Status")}
            onReset={() => handleResetField("status")}
            resetLabel={t("legalCases.reset", "Reset")}>
            <SearchableSelect
               value={filters.status || ""}
               onChange={(value) => setFilters({ ...filters, status: value })}
               options={translatedStatusOptions}
               placeholder={t("legalCases.selectStatus", "Select Status")}
            />
         </FilterSection>

         {/* Lawyer Filter */}
         <FilterSection
            label={t("legalCases.lawyer", "Lawyer")}
            onReset={() => handleResetField("lawyerId")}
            resetLabel={t("legalCases.reset", "Reset")}>
            {isLoadingEmployees ? (
               <LoadingState size="small" label={t("common:filters.loadingEmployees")} />
            ) : (
               <SearchableSelect
                  value={filters.lawyerId || ""}
                  onChange={(value) =>
                     setFilters({ ...filters, lawyerId: value })
                  }
                  options={lawyerOptions}
                  placeholder={t("legalCases.selectLawyer", "Select Lawyer")}
               />
            )}
         </FilterSection>

         {/* Date Range Filter */}
         <FilterSection
            label={t("legalCases.dateRange", "Date Range")}
            onReset={handleResetDateRange}
            resetLabel={t("legalCases.reset", "Reset")}>
            <div className="flex flex-col sm:flex-row gap-3">
               <div className="flex-1 flex flex-col gap-1">
                  <label className="text-sm font-medium text-text-strong tracking-tight">
                     {t("legalCases.dateFrom", "From")}
                  </label>
                  <DatePicker
                     value={filters.dateFrom}
                     onChange={(date) =>
                        setFilters({ ...filters, dateFrom: date })
                     }
                     placeholder="DD/MM/YYYY"
                  />
               </div>
               <div className="flex-1 flex flex-col gap-1">
                  <label className="text-sm font-medium text-text-strong tracking-tight">
                     {t("legalCases.dateTo", "To")}
                  </label>
                  <DatePicker
                     value={filters.dateTo}
                     onChange={(date) =>
                        setFilters({ ...filters, dateTo: date })
                     }
                     placeholder="DD/MM/YYYY"
                     popoverAlign="right"
                  />
               </div>
            </div>
         </FilterSection>
      </FilterModal>
   );
}

export default LegalCasesFilterDropdown;
