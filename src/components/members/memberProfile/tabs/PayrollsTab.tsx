/** @format */

import {
   useState,
   useMemo,
   useRef,
   useEffect,
   useLayoutEffect,
   useCallback,
} from "react";
import { useSearchParams } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "@/hooks/useTranslation";
import { DataTable } from "@/designSystem/ui/data-table";
import {
   SortDescending,
   AddLine,
   SackDollar,
   Tag,
   Calender,
   ChatText,
   MoreVertical,
   Briefcase,
   Edit,
   Trash,
   AlertFill,
   ArrowDownSLine,
} from "@/Icons";
import Dropdown from "@/designSystem/Dropdown";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   getEmployeePayrollStructure,
   PayrollItem,
   createPayrollItem,
   updatePayrollItem,
   deletePayrollItem,
   createPayroll,
} from "@/services/payrollService";
import LoadingState from "@/designSystem/LoadingState";
import DirhamLabel from "@/designSystem/DirhamLabel";
import PayrollItemModal from "./PayrollItemModal";
import ConfirmModal from "@/designSystem/ConfirmModal";
import toast from "@/utilities/toast";
import { format } from "date-fns";
import { usePermissions } from "@/contexts/PermissionContext";

interface PayrollsTabProps {
   employeeId: string;
}

export default function PayrollsTab({ employeeId }: PayrollsTabProps) {
   const [searchParams] = useSearchParams();
   const { t } = useTranslation("members");
   const queryClient = useQueryClient();
   const currentDate = new Date();
   const currentMonthIndex = currentDate.getMonth();
   const currentYearValue = currentDate.getFullYear();
   const [selectedYear, setSelectedYear] = useState<number>(currentYearValue);
   const [selectedMonth, setSelectedMonth] = useState<number | null>(
      currentMonthIndex,
   );
   const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
   const monthButtonRef = useRef<HTMLButtonElement>(null);
   const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
   ];
   const selectedMonthIndex = selectedMonth ?? currentMonthIndex;
   const isPastPeriod =
      selectedYear < currentYearValue ||
      (selectedYear === currentYearValue &&
         selectedMonthIndex < currentMonthIndex);
   const selectedPeriodLabel =
      selectedMonth !== null
         ? `${months[selectedMonth]} ${selectedYear}`
         : `${months[currentMonthIndex]} ${selectedYear}`;

   // If we navigated here from the payroll page, pick up its date range
   useEffect(() => {
      const fromDate = searchParams.get("fromDate");
      const toDate = searchParams.get("toDate");

      // Prefer toDate's month/year since the payroll page uses a custom cycle
      const sourceDate = toDate || fromDate;
      if (!sourceDate) return;

      const parsed = new Date(sourceDate);
      if (Number.isNaN(parsed.getTime())) return;

      setSelectedYear(parsed.getFullYear());
      setSelectedMonth(parsed.getMonth());
   }, [searchParams]);

   // Permission checks
   const { can } = usePermissions();
   const canViewPayroll = can("payroll.view_basic");
   const canManageItems = can("payroll.manage_items");
   const canRunPayroll = can("payroll.run_create");

   // Modal States
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [selectedItem, setSelectedItem] = useState<PayrollItem | null>(null);

   const [sortBy, setSortBy] = useState<string>("effectiveDate_desc");
   const [itemsPage, setItemsPage] = useState(1);
   const [itemsPageSize, setItemsPageSize] = useState(10);

   useEffect(() => {
      setItemsPage(1);
   }, [selectedMonth, selectedYear, sortBy]);

   // Build query parameters for API
   const queryParams = useMemo(() => {
      const params: Record<string, string> = {};
      
      // Use current month/year if selectedMonth is null
      const monthToUse = selectedMonth !== null ? selectedMonth : currentMonthIndex;
      const yearToUse = selectedYear;

      // Match the payrolls screen period:
      // cycleStart: 25th of previous month, cycleEnd: 24th of selected month
      const cycleStartDate = new Date(yearToUse, monthToUse - 1, 25);
      const cycleEndDate = new Date(yearToUse, monthToUse, 24);

      params.fromDate = format(cycleStartDate, "yyyy-MM-dd");
      params.toDate = format(cycleEndDate, "yyyy-MM-dd");

      const [sortField, sortDirection] = sortBy.split("_");
      if (sortField === "effectiveDate") {
         params.sort_by = "effective_date";
      } else if (sortField === "amount") {
         params.sort_by = "amount";
      }
      if (sortDirection === "asc" || sortDirection === "desc") {
         params.sort_order = sortDirection;
      }

      params.page = String(itemsPage);
      params.limit = String(itemsPageSize);
      
      return params;
   }, [selectedMonth, selectedYear, currentMonthIndex, sortBy, itemsPage, itemsPageSize]);

   const { data, isLoading } = useQuery({
      queryKey: ["employee-payroll-structure", employeeId, queryParams],
      queryFn: () => getEmployeePayrollStructure(employeeId, queryParams),
      enabled: !!employeeId && canViewPayroll,
   });

   const payrollItems = data?.items || [];
   const payrollData = data?.payroll || null;
   const [payrollId, setPayrollId] = useState<string | null>(null);

   useEffect(() => {
      if (data?.payrollId) {
         setPayrollId(String(data.payrollId));
      }
   }, [data?.payrollId]);

   // Mutations
   const createMutation = useMutation({
      mutationFn: (newItem: Partial<PayrollItem>) => {
         if (!canManageItems) {
            throw new Error("You don't have permission to create payroll items");
         }
         if (!payrollId) throw new Error("No active payroll found");
         return createPayrollItem(String(payrollId), newItem);
      },
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: ["employee-payroll-structure", employeeId],
         });
         toast.success(t("payroll.messages.addSuccess"));
         setIsModalOpen(false);
      },
      onError: (error) => {
         console.error(error);
         toast.error(t("error"));
      },
   });

   const createPayrollMutation = useMutation({
      mutationFn: async () => {
         const now = new Date();
         const periodStart = format(
            new Date(now.getFullYear(), now.getMonth(), 1),
            "yyyy-MM-dd"
         );
         
         // Get the last day of the current month
         const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
         
         // Check if the end of the month is in the future
         const isEndOfMonthInFuture = lastDayOfMonth > now;
         
         // If end of month is in future, use current date for periodEnd
         const periodEnd = isEndOfMonthInFuture
            ? format(now, "yyyy-MM-dd")
            : format(lastDayOfMonth, "yyyy-MM-dd");
         
         return createPayroll(employeeId, {
            periodStart,
            periodEnd,
            cycleType: "Monthly",
            notes: `Auto-generated payroll for ${format(now, "MMMM yyyy")}`,
         });
      },
      onSuccess: (response) => {
         const createdPayroll = response?.data || response;
         const newId =
            createdPayroll?.payroll_id ??
            createdPayroll?.id ??
            createdPayroll?.payrollId;
         if (newId) setPayrollId(String(newId));
         queryClient.invalidateQueries({
            queryKey: ["employee-payroll-structure", employeeId],
         });
         setIsModalOpen(true);
      },
      onError: (error) => {
         console.error(error);
         toast.error(t("error"));
      },
   });

   const updateMutation = useMutation({
      mutationFn: (updatedItem: Partial<PayrollItem>) => {
         if (!canManageItems) {
            throw new Error("You don't have permission to edit payroll items");
         }
         if (!payrollId || !selectedItem)
            throw new Error("No item selected or payroll found");
         return updatePayrollItem(
            String(payrollId),
            selectedItem.id,
            updatedItem
         );
      },
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: ["employee-payroll-structure", employeeId],
         });
         toast.success(t("payroll.messages.updateSuccess"));
         setIsModalOpen(false);
         setSelectedItem(null);
      },
      onError: (error) => {
         console.error(error);
         toast.error(t("error"));
      },
   });

   const deleteMutation = useMutation({
      mutationFn: () => {
         if (!canManageItems) {
            throw new Error("You don't have permission to delete payroll items");
         }
         if (!payrollId || !selectedItem)
            throw new Error("No item selected or payroll found");
         return deletePayrollItem(String(payrollId), selectedItem.id);
      },
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: ["employee-payroll-structure", employeeId],
         });
         toast.success(t("payroll.messages.deleteSuccess"));
         setIsDeleteModalOpen(false);
         setSelectedItem(null);
      },
      onError: (error) => {
         console.error(error);
         toast.error(t("error"));
      },
   });

   // Handlers
   const handleAdd = () => {
      if (!canManageItems) {
         toast.error("You don't have permission to create payroll items");
         return;
      }
      setSelectedItem(null);
      if (payrollId) {
         setIsModalOpen(true);
      } else {
         if (!canRunPayroll) {
            toast.error("You don't have permission to create payroll runs");
            return;
         }
         createPayrollMutation.mutate();
      }
   };

   const handleEdit = useCallback((item: PayrollItem) => {
      if (!canManageItems) {
         toast.error("You don't have permission to edit payroll items");
         return;
      }
      setSelectedItem(item);
      setIsModalOpen(true);
   }, [canManageItems]);

   const handleDelete = useCallback((item: PayrollItem) => {
      if (!canManageItems) {
         toast.error("You don't have permission to delete payroll items");
         return;
      }
      setSelectedItem(item);
      setIsDeleteModalOpen(true);
   }, [canManageItems]);

   const handleSave = (formData: Partial<PayrollItem>) => {
      if (selectedItem) {
         updateMutation.mutate(formData);
      } else {
         createMutation.mutate(formData);
      }
   };

   const columns = useMemo<ColumnDef<PayrollItem>[]>(
      () => [
         {
            accessorKey: "itemName",
            header: () => (
               <div className="flex items-center gap-2">
                  <Briefcase className="size-4 text-text-sub" />
                  <span>{t("payroll.table.payrollItem")}</span>
               </div>
            ),
            cell: ({ row }) => (
               <span className="text-sm font-medium text-text-strong">
                  {row.original.itemName}
               </span>
            ),
         },
         {
            accessorKey: "componentType",
            header: () => (
               <div className="flex items-center gap-2">
                  <Tag className="size-4 text-text-sub" />
                  <span>{t("payroll.table.type")}</span>
               </div>
            ),
            cell: ({ row }) => (
               <span className="text-sm text-text-sub">
                  {t(`payroll.types.${row.original.componentType}`, {
                     defaultValue: row.original.componentType,
                  })}
               </span>
            ),
         },
         {
            accessorKey: "amount",
            header: () => (
               <div className="flex items-center gap-2">
                  <SackDollar className="size-4 text-text-sub" />
                  <span>{t("payroll.table.amount")}</span>
               </div>
            ),
            cell: ({ row }) => <DirhamLabel value={row.original.amount} />,
         },
         {
            accessorKey: "effectiveDate",
            header: () => (
               <div className="flex items-center gap-2">
                  <Calender className="size-4 text-text-sub" />
                  <span>{t("payroll.table.effectiveDate")}</span>
               </div>
            ),
            cell: ({ row }) => {
               const date = new Date(row.original.effectiveDate);
               return (
                  <span className="text-sm text-text-sub">
                     {date.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                     })}
                  </span>
               );
            },
         },
         {
            accessorKey: "notes",
            header: () => (
               <div className="flex items-center gap-2">
                  <ChatText className="size-4 text-text-sub" />
                  <span>{t("payroll.table.notes")}</span>
               </div>
            ),
            cell: ({ row }) => (
               <span className="text-sm text-text-sub truncate max-w-[200px] block">
                  {row.original.notes || "-"}
               </span>
            ),
         },
         {
            id: "actions",
            header: () => (
               <div className="flex justify-end pr-2 text-text-soft">
                  <MoreVertical className="size-4" />
               </div>
            ),
            cell: ({ row }) => (
               <div className="flex justify-end pr-2">
                  <ActionCell
                     item={row.original}
                     onEdit={() => handleEdit(row.original)}
                     onDelete={() => handleDelete(row.original)}
                  />
               </div>
            ),
            size: 80,
         },
      ],
      [t, handleEdit, handleDelete]
   );

   const filteredData = payrollItems;

   if (isLoading) {
      return <LoadingState label={t("loading.profile")} />;
   }

   // Show permission denied message if user cannot view payroll
   if (!canViewPayroll) {
      return (
         <div className="flex items-center justify-center py-12">
            <p className="text-text-sub">
               {t("payroll.messages.noPermission") || "You don't have permission to view payroll information"}
            </p>
         </div>
      );
   }

   // Show empty state when no payroll exists for selected period
   if (!data || !payrollData) {
      const selectedPeriod = selectedMonth !== null 
         ? `${months[selectedMonth]} ${selectedYear}`
         : selectedPeriodLabel;
      
      return (
         <div className="w-full flex flex-col r-gap xl:gap-6">
            {/* Toolbar - keep it visible */}
            <div className="r-stack items-start md:items-center justify-between r-gap-sm xl:gap-4 xl:whitespace-nowrap">
               {/* Actions */}
               <div className="flex w-full flex-wrap items-center r-gap-sm md:w-auto xl:gap-2">
                  {/* Month/Year Filter */}
                  <button
                     ref={monthButtonRef}
                     onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                     className="r-btn-full flex items-center gap-2 text-sm font-medium text-text-sub border border-border rounded-lg bg-background hover:bg-bg-weak transition-colors px-3 py-2 xl:px-2.5 xl:py-2">
                     <span>
                        {selectedPeriodLabel}
                     </span>
                  </button>
                  {isMonthDropdownOpen && (
                     <MonthYearPicker
                        selectedYear={selectedYear}
                        selectedMonth={selectedMonth}
                        onYearChange={setSelectedYear}
                        onMonthChange={setSelectedMonth}
                        onClose={() => setIsMonthDropdownOpen(false)}
                        anchorRef={monthButtonRef}
                     />
                  )}
               </div>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center bg-background border border-border r-rounded r-p-sm xl:rounded-2xl xl:py-16 xl:px-4">
               <div className="text-center max-w-md">
                  <div className="mb-4">
                     <SackDollar className="size-16 fill-text-soft mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-strong mb-2">
                     No Payroll Found
                  </h3>
                  <p className="text-sm text-text-sub mb-4">
                     There is no payroll data for {selectedPeriod}. Try selecting a different month or create a new payroll.
                  </p>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="w-full flex flex-col r-gap xl:gap-6">
         {/* Toolbar */}
         <div className="r-stack items-start md:items-center justify-between r-gap-sm xl:gap-4 xl:whitespace-nowrap">
            {/* Actions */}
            <div className="flex w-full flex-wrap items-center r-gap-sm md:w-auto xl:gap-2">
               {/* Month/Year Filter */}
               <button
                  ref={monthButtonRef}
                  onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                  className="r-btn-full flex items-center gap-2 text-sm font-medium text-text-sub border border-border rounded-lg bg-background hover:bg-bg-weak transition-colors px-3 py-2 xl:px-2.5 xl:py-2">
                  <span>
                     {selectedPeriodLabel}
                  </span>
               </button>
               {isMonthDropdownOpen && (
                  <MonthYearPicker
                     selectedYear={selectedYear}
                     selectedMonth={selectedMonth}
                     onYearChange={setSelectedYear}
                     onMonthChange={setSelectedMonth}
                     onClose={() => setIsMonthDropdownOpen(false)}
                     anchorRef={monthButtonRef}
                  />
               )}

               <Dropdown
                  trigger={
                     <button className="r-btn-full flex items-center gap-2 text-sm font-medium text-text-sub border border-border rounded-lg bg-background hover:bg-bg-weak transition-colors px-3 py-2 xl:px-2.5 xl:py-2">
                        <span className="flex items-center gap-2">
                           <SortDescending className="size-5 fill-text-sub" />{" "}
                           {t("filters.sortBy")}
                        </span>
                     </button>
                  }
                  items={[
                     {
                        id: "effectiveDate_desc",
                        label: t("payroll.sort.newest"),
                        icon: SortDescending,
                        onClick: () => setSortBy("effectiveDate_desc"),
                     },
                     {
                        id: "effectiveDate_asc",
                        label: t("payroll.sort.oldest"),
                        icon: SortDescending,
                        onClick: () => setSortBy("effectiveDate_asc"),
                     },
                     {
                        id: "amount_desc",
                        label: t("payroll.sort.amountHighToLow"),
                        icon: SackDollar,
                        onClick: () => setSortBy("amount_desc"),
                     },
                     {
                        id: "amount_asc",
                        label: t("payroll.sort.amountLowToHigh"),
                        icon: SackDollar,
                        onClick: () => setSortBy("amount_asc"),
                     },
                  ]}
               />

               {canManageItems && !isPastPeriod && (
                  <button
                     onClick={handleAdd}
                     disabled={isLoading || createPayrollMutation.isPending}
                     className="r-btn-full flex items-center gap-2 bg-text-strong text-text-main rounded-lg hover:bg-text-strong/90 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 xl:px-3 xl:py-2">
                     <AddLine className="size-5 fill-current" />
                     <span>{t("payroll.addPayItem")}</span>
                  </button>
               )}
            </div>
         </div>

         {/* Payroll Summary Card */}
         {data && payrollData && (
            <PayrollSummaryCard
               payroll={payrollData}
            />
         )}

         {/* Table */}
         <div className="border border-border overflow-hidden rounded-lg md:rounded-xl xl:rounded-xl">
            <DataTable
               columns={columns}
               data={filteredData as PayrollItem[]}
               showPagination
               pageSize={itemsPageSize}
               manualPagination
               pageCount={Math.max(1, data?.pagination?.totalPages || 1)}
               pagination={{
                  pageIndex: Math.max(0, itemsPage - 1),
                  pageSize: itemsPageSize,
               }}
               onPaginationChange={(updater) => {
                  const current = {
                     pageIndex: Math.max(0, itemsPage - 1),
                     pageSize: itemsPageSize,
                  };
                  const next =
                     typeof updater === "function" ? updater(current) : updater;
                  setItemsPage(next.pageIndex + 1);
                  setItemsPageSize(next.pageSize);
               }}
               isLoading={isLoading}
            />
         </div>

         {/* Add/Edit Modal */}
         <PayrollItemModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSave}
            initialData={selectedItem || undefined}
            isLoading={createMutation.isPending || updateMutation.isPending}
         />

         {/* Delete Confirmation Modal */}
         <ConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={() => deleteMutation.mutate()}
            title={t("payroll.messages.deleteConfirmTitle")}
            description={t("payroll.messages.deleteConfirmDescription")}
            confirmText={t("payroll.messages.confirmDelete")}
            variant="error"
            isLoading={deleteMutation.isPending}
         />
      </div>
   );
}

function ActionCell({
   item,
   onEdit,
   onDelete,
}: {
   item: PayrollItem;
   onEdit: () => void;
   onDelete: () => void;
}) {
   const { t } = useTranslation("members");
   const { can } = usePermissions();
   const [isOpen, setIsOpen] = useState(false);
   const buttonRef = useRef<HTMLButtonElement>(null);
   const canEditPayroll = can("payroll.manage_items");
   const canDeletePayroll = can("payroll.manage_items");

   const isManual =
      item.sourceType === "Manual" ||
      (item as any).source_type === "Manual" ||
      item.isManual === true ||
      (item as any).is_manual === true;

   const dropdownItems = [
      {
         id: "edit",
         label: t("payroll.actions.edit"),
         icon: Edit,
         onClick: onEdit,
         disabled: !isManual || !canEditPayroll,
         tooltip: !isManual
            ? {
                 label: t("payroll.tooltips.systemItem"),
              }
            : !canEditPayroll
            ? {
                 label: "No permission to edit",
              }
            : undefined,
      },
      {
         id: "delete",
         label: t("payroll.actions.delete"),
         icon: Trash,
         variant: "danger" as const,
         onClick: onDelete,
         disabled: !isManual || !canDeletePayroll,
         tooltip: !isManual
            ? {
                 label: t("payroll.tooltips.systemItem"),
              }
            : !canDeletePayroll
            ? {
                 label: "No permission to delete",
              }
            : undefined,
      },
   ];

   return (
      <>
         <button
            ref={buttonRef}
            onClick={() => setIsOpen(!isOpen)}
            data-row-menu-trigger
            className={`p-1 rounded-md transition-colors ${
               isOpen ? "bg-bg-weak" : "hover:bg-bg-weak"
            } ${isManual ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}>
            <MoreVertical className="" />
         </button>
         <Dropdown
            items={dropdownItems}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            anchorRef={buttonRef}
         />
      </>
   );
}

function PayrollSummaryCard({
   payroll,
}: {
   payroll: {
      base_salary: string;
      gross_total: string;
      deduction_total: string;
      net_pay: string;
      warnings?: Array<{ type: string; message: string }>;
      notes?: string;
   };
}) {
   const [isExpanded, setIsExpanded] = useState(false);

   const baseSalary = parseFloat(payroll.base_salary || "0");
   const totalEarnings = parseFloat(payroll.gross_total || "0");
   const totalDeductions = parseFloat(payroll.deduction_total || "0");
   const netPay = parseFloat(payroll.net_pay || "0");

   const hasWarnings = payroll.warnings && payroll.warnings.length > 0;
   const hasNotes = payroll.notes && payroll.notes.trim().length > 0;

   return (
      <div className="bg-background border border-border r-rounded overflow-hidden xl:rounded-2xl">
         {/* Clickable Header */}
         <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-3 py-3 xl:p-4 flex items-center justify-between hover:bg-bg-weak/50 transition-colors">
            <span className="text-sm font-medium text-text-strong">
               Payroll Summary
            </span>
            <ArrowDownSLine
               className={`size-5 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
               }`}
            />
         </button>

         {/* Main Summary */}
         <div className="px-3 pb-3 xl:px-4 xl:pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 r-gap-sm xl:grid-cols-4 xl:gap-3">
               <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-text-sub">Base Salary</span>
                  <div className="flex items-center gap-1">
                     <img
                        src="/icons/dirham.png"
                        alt="dirham"
                        className="w-4 h-4"
                     />
                     <span className="text-lg font-semibold text-text-strong">
                        {baseSalary.toFixed(2)}
                     </span>
                  </div>
               </div>
               <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-text-sub">Total Earnings</span>
                  <div className="flex items-center gap-1">
                     <img
                        src="/icons/dirham.png"
                        alt="dirham"
                        className="w-4 h-4"
                     />
                     <span className="text-lg font-semibold text-success">
                        {totalEarnings.toFixed(2)}
                     </span>
                  </div>
               </div>
               <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-text-sub">Total Deductions</span>
                  <div className="flex items-center gap-1">
                     <img
                        src="/icons/dirham.png"
                        alt="dirham"
                        className="w-4 h-4"
                     />
                     <span className="text-lg font-semibold text-danger">
                        {totalDeductions.toFixed(2)}
                     </span>
                  </div>
               </div>
               <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-text-sub">Net Pay</span>
                  <div className="flex items-center gap-1">
                     <img
                        src="/icons/dirham.png"
                        alt="dirham"
                        className="w-4 h-4"
                     />
                     <span className="text-lg font-semibold text-text-strong">
                        {netPay.toFixed(2)}
                     </span>
                  </div>
               </div>
            </div>
         </div>

         {/* Expanded Content */}
         <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
               isExpanded ? "max-h-96" : "max-h-0"
            }`}>
            <div className="px-3 pb-3 pt-2 border-t border-border space-y-2 xl:px-4 xl:pb-4 xl:space-y-3">
               {/* Warnings */}
               {hasWarnings && (
                  <div className="space-y-2">
                     {payroll.warnings!.map((warning, idx) => (
                        <div
                           key={idx}
                           className="flex items-start gap-2 px-2.5 py-2 bg-warning/5 border border-warning/20 rounded-lg">
                           <AlertFill className="size-4 fill-warning mt-0.5 flex-shrink-0" />
                           <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-warning">
                                 {warning.type}
                              </p>
                              <p className="text-xs text-text-sub mt-0.5">
                                 {warning.message}
                              </p>
                           </div>
                        </div>
                     ))}
                  </div>
               )}

               {/* Notes */}
               {hasNotes && (
                  <div className="flex items-start gap-2 px-2.5 py-2 bg-bg-weak border border-border rounded-lg">
                     <ChatText className="size-4 fill-text-sub mt-0.5 flex-shrink-0" />
                     <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-strong mb-0.5">
                           Notes
                        </p>
                        <p className="text-xs text-text-sub">{payroll.notes}</p>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}

function MonthYearPicker({
   selectedYear,
   selectedMonth,
   onYearChange,
   onMonthChange,
   onClose,
   anchorRef,
}: {
   selectedYear: number;
   selectedMonth: number | null;
   onYearChange: (year: number) => void;
   onMonthChange: (month: number | null) => void;
   onClose: () => void;
   anchorRef: React.RefObject<HTMLElement>;
}) {
   const dropdownRef = useRef<HTMLDivElement>(null);
   const yearButtonRef = useRef<HTMLButtonElement>(null);
   const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
   const [position, setPosition] = useState<{ top: number; right: number } | null>(null);
   const [isSelectingYear, setIsSelectingYear] = useState(false);

   const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
   ];
   const years = [2026, 2025];
   const YearIcon = ({ size = 6, className = "" }: { size?: number; className?: string }) => (
      <span
         className={`inline-block rounded-full bg-border ${className}`}
         style={{ width: size, height: size }}
      />
   );

   useLayoutEffect(() => {
      if (anchorRef.current) {
         const rect = anchorRef.current.getBoundingClientRect();
         setPosition({
            top: rect.bottom + 4,
            right: window.innerWidth - rect.right,
         });
      }
   }, [anchorRef]);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         // Don't close if we're currently selecting a year
         if (isSelectingYear) {
            return;
         }

         const target = event.target;
         if (target instanceof Element) {
            if (target.closest('[data-dropdown-scope="year-picker"]')) {
               return;
            }
         }
         
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node) &&
            anchorRef.current &&
            !anchorRef.current.contains(event.target as Node)
         ) {
            onClose();
         }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, [onClose, anchorRef, isSelectingYear]);

   if (!position) {
      return null;
   }

   return (
      <div
         ref={dropdownRef}
         className="fixed bg-background border border-border r-rounded shadow-lg z-50 w-[90vw] max-w-[280px] xl:w-[280px] r-p-sm xl:p-3 xl:rounded-2xl"
         style={{ top: `${position.top}px`, right: `${position.right}px` }}>
         {/* Year Selector */}
         <div className="flex items-center justify-between mb-2 pb-2 border-b border-border xl:mb-3 xl:pb-2">
            <button
               ref={yearButtonRef}
               onClick={() => setIsYearDropdownOpen((prev) => !prev)}
               className="flex items-center gap-2 text-sm font-medium text-text-strong border border-border rounded-lg bg-background hover:bg-bg-weak transition-colors px-3 py-2 xl:px-2.5 xl:py-2">
               <span>{selectedYear}</span>
               <ArrowDownSLine
                  className={`transition-transform ${isYearDropdownOpen ? "rotate-180" : ""}`}
                  size={16}
               />
            </button>
            <Dropdown
               isOpen={isYearDropdownOpen}
               onClose={() => {
                  setIsYearDropdownOpen(false);
                  // Reset the flag after dropdown closes
                  setTimeout(() => {
                     setIsSelectingYear(false);
                  }, 150);
               }}
               anchorRef={yearButtonRef}
               dataScope="year-picker"
               items={years.map((year) => ({
                  id: String(year),
                  label: String(year),
                  icon: YearIcon,
                  onClick: () => {
                     setIsSelectingYear(true);
                     onYearChange(year);
                     setIsYearDropdownOpen(false);
                  },
               }))}
               zIndex="z-[60]"
               variant="match-width"
            />
         </div>

         {/* Month Grid */}
         <div className="grid grid-cols-3 gap-1">
            {months.map((month, index) => (
               <button
                  key={month}
                  onClick={() => {
                     onMonthChange(index);
                     onClose();
                  }}
                  className={`px-2 py-1.5 rounded-lg text-sm transition-colors ${
                     selectedMonth === index
                        ? "bg-text-strong text-text-main"
                        : "hover:bg-bg-weak text-text-strong"
                  }`}>
                  {month}
               </button>
            ))}
         </div>
      </div>
   );
}
