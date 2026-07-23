/** @format */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { addMonths, endOfMonth, startOfMonth } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/hooks/useLanguage";
import { SortDescending } from "@/Icons";
import Button from "@/designSystem/Button";
import LoadingState from "@/designSystem/LoadingState";
import DatePicker from "@/designSystem/DatePicker";
import { useListEmployees } from "@/hooks/employees/useEmployee";
import SearchableSelect from "@/components/invoices/SearchableSelect";
import { employeeService } from "@/services/employeeService";

export type RequestFilterData = {
   employeeId?: string;
   dateFrom?: Date;
   dateTo?: Date;
};

type RequestsFilterDropdownProps = {
   onApply?: (filters: RequestFilterData) => void;
   initialFilters?: RequestFilterData;
   triggerClassName?: string;
};

function RequestsFilterDropdown({
   onApply,
   initialFilters = {},
   triggerClassName = "",
}: RequestsFilterDropdownProps) {
   const { t } = useTranslation("requests");
   const { isRTL } = useLanguage();
   const [isOpen, setIsOpen] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);
   const buttonRef = useRef<HTMLButtonElement>(null);

   const { data: employeesData, isLoading: isLoadingEmployees } =
      useListEmployees({ page: 1, limit: 20 });

   const employeeOptions = useMemo(
      () =>
         employeesData?.data.map((emp) => ({
            id: emp.id.toString(),
            label: emp.name,
         })) || [],
      [employeesData],
   );

   const fetchEmployeeOptions = useCallback(async (search: string) => {
      const response = await employeeService.list({
         page: 1,
         limit: 20,
         search: search || undefined,
      });
      return (
         response?.data?.map((emp) => ({
            id: emp.id.toString(),
            label: emp.name,
         })) || []
      );
   }, []);

   const [employeeId, setEmployeeId] = useState<string>(
      initialFilters.employeeId || "",
   );
   const [dateFrom, setDateFrom] = useState<Date | undefined>(
      initialFilters.dateFrom,
   );
   const [dateTo, setDateTo] = useState<Date | undefined>(
      initialFilters.dateTo,
   );

   // Reset to initial filters when dropdown opens
   useEffect(() => {
      if (isOpen) {
         setEmployeeId(initialFilters.employeeId || "");
         setDateFrom(initialFilters.dateFrom);
         setDateTo(initialFilters.dateTo);
      }
   }, [isOpen, initialFilters]);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         const target = event.target as HTMLElement | null;
         const isDatepickerPortalClick = !!target?.closest?.(
            '[data-datepicker-portal="true"]',
         );
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node) &&
            buttonRef.current &&
            !buttonRef.current.contains(event.target as Node) &&
            !isDatepickerPortalClick
         ) {
            setIsOpen(false);
         }
      };

      const handleEscape = (event: KeyboardEvent) => {
         if (event.key === "Escape") {
            setIsOpen(false);
         }
      };

      if (isOpen) {
         document.addEventListener("mousedown", handleClickOutside);
         document.addEventListener("keydown", handleEscape);
      }

      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
         document.removeEventListener("keydown", handleEscape);
      };
   }, [isOpen]);

   const handleResetAll = () => {
      setEmployeeId("");
      setDateFrom(undefined);
      setDateTo(undefined);
   };

   const handleResetDateRange = () => {
      setDateFrom(undefined);
      setDateTo(undefined);
   };

   const applyMonthRangeImmediately = (targetDate: Date) => {
      const nextFrom = startOfMonth(targetDate);
      const nextTo = endOfMonth(targetDate);
      setDateFrom(nextFrom);
      setDateTo(nextTo);
      if (onApply) {
         onApply({
            employeeId: employeeId || undefined,
            dateFrom: nextFrom,
            dateTo: nextTo,
         });
      }
   };

   const handlePrevMonth = () => {
      const anchor = dateFrom || new Date();
      applyMonthRangeImmediately(addMonths(anchor, -1));
   };

   const handleNextMonth = () => {
      const anchor = dateFrom || new Date();
      applyMonthRangeImmediately(addMonths(anchor, 1));
   };

   const handleCurrentMonth = () => {
      applyMonthRangeImmediately(new Date());
   };

   const handleApply = () => {
      if (onApply) {
         onApply({
            employeeId: employeeId || undefined,
            dateFrom,
            dateTo,
         });
      }
      setIsOpen(false);
   };

   const handleCancel = () => {
      setIsOpen(false);
   };

   return (
      <div className="relative">
         <button
            ref={buttonRef}
            onClick={() => setIsOpen((prev) => !prev)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-strong bg-background border border-border rounded-lg hover:bg-bg-weak transition-colors ${triggerClassName} ${
               isOpen ? "bg-bg-weak" : ""
            }`}
            aria-expanded={isOpen}>
            <SortDescending size={16} className="fill-text-sub" />
            {t("actions.filter")}
         </button>

         {isOpen && (
            <div
               ref={dropdownRef}
               className={`absolute top-full mt-2 w-[400px] bg-background border border-border rounded-3xl shadow-lg z-50 ${
                  isRTL ? "end-0" : "right-0"
               }`}>
               {/* Header with Title and Reset All */}
               <div
                  className={`flex items-center justify-between px-6 py-4 border-b border-border ${
                     isRTL ? "flex-row-reverse" : ""
                  }`}>
                  <h2 className="text-sm font-medium text-text-strong">
                     {t("filter.title")}
                  </h2>
                  <button
                     type="button"
                     onClick={handleResetAll}
                     className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                     {t("filter.resetAll")}
                  </button>
               </div>

               {/* Content */}
               <div className="flex flex-col gap-6 px-6 py-6">
                  {/* Employee Filter */}
                  <div className="flex flex-col gap-2">
                     <label className="text-sm font-medium text-text-strong">
                        {t("filter.employee", "Employee")}
                     </label>
                     {isLoadingEmployees ? (
                        <LoadingState
                           size="small"
                           label={t("common:filters.loadingEmployees")}
                        />
                     ) : (
                        <SearchableSelect
                           value={employeeId}
                           onChange={setEmployeeId}
                           options={employeeOptions}
                           placeholder={t(
                              "filter.selectEmployee",
                              "Select Employee",
                           )}
                           serverSideSearch
                           fetchOptions={fetchEmployeeOptions}
                        />
                     )}
                  </div>

                  <div className="flex flex-col gap-2">
                     <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-strong">
                           {t("filter.dateRange", "Date Range")}
                        </label>
                        <button
                           type="button"
                           onClick={handleResetDateRange}
                           className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                           {t("filter.reset", "Reset")}
                        </button>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                           <label className="text-sm font-medium text-text-strong">
                              {t("filter.startDate", "Start Date")}
                           </label>
                           <DatePicker
                              value={dateFrom}
                              onChange={(date) => setDateFrom(date)}
                              placeholder="DD/MM/YYYY"
                              renderInPortal
                              monthYearDropdownDirection="down"
                              popoverDirection="down"
                           />
                        </div>
                        <div className="flex flex-col gap-1">
                           <label className="text-sm font-medium text-text-strong">
                              {t("filter.endDate", "End Date")}
                           </label>
                           <DatePicker
                              value={dateTo}
                              onChange={(date) => setDateTo(date)}
                              placeholder="DD/MM/YYYY"
                              popoverAlign="right"
                              renderInPortal
                              monthYearDropdownDirection="down"
                              popoverDirection="down"
                           />
                        </div>
                     </div>
                     <div className="flex items-center justify-between w-full gap-2">
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
                  </div>
               </div>

               {/* Footer Buttons */}
               <div
                  className={`flex items-center justify-end gap-3 px-6 py-4 border-t border-border ${
                     isRTL ? "flex-row-reverse" : ""
                  }`}>
                  <Button
                     variant="secondary"
                     onClick={handleCancel}
                     className="min-w-[66px] h-9 rounded-xl">
                     {t("filter.cancel")}
                  </Button>
                  <Button
                     variant="primary"
                     onClick={handleApply}
                     className="min-w-[90px] h-9 rounded-xl">
                     {t("filter.applyNow")}
                  </Button>
               </div>
            </div>
         )}
      </div>
   );
}

export default RequestsFilterDropdown;
