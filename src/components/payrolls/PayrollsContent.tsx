/** @format */

import {
   useState,
   useMemo,
   useRef,
   useCallback,
   useLayoutEffect,
   useEffect,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import type { PaginationState, Updater } from "@tanstack/react-table";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/hooks/useLanguage";
import { useDebounce } from "@/hooks/useDebounce";
import { DataTable } from "@/designSystem/ui/data-table";
import StatusTag from "@/designSystem/StatusTag";
import DirhamLabel from "@/designSystem/DirhamLabel";
import Dropdown from "@/designSystem/Dropdown";
import MemberTag1 from "@/components/contracts/MemberTag1";
import PayrollDetailsDrawer from "./PayrollDetailsDrawer";

import CreateVoucherModal, {
   CreateVoucherFormData,
} from "./CreateVoucherModal";
import {
   Search2Line,
   SortDescending,
   Calender,
   SackDollar,
   Tag,
   Dot,
   Check,
   MoreVertical,
   ReceiptDollar,
   ArrowDownSLine,
} from "@/Icons";
import {
   getAllPayrolls,
   approvePayroll,
   createPayrollVoucher,
   DashboardPayroll,
} from "@/services/payrollService";
import { format } from "date-fns";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import ConfirmModal from "@/designSystem/ConfirmModal";
import ExportButton from "@/components/common/ExportButton";
import toast from "@/utilities/toast";
import { reactQueryKeys } from "@/config/reactQueryKeys";

const PAYROLL_STATUSES = ["Draft", "Review", "Approved", "Finalized"];
const PAYROLL_CYCLES = ["Monthly", "Biweekly", "Weekly"];

interface PayrollFilters {
   status: string;
   cycleType: string;
}

// Separate action cell component to encapsulate dropdown state
function PayrollActionsCell({
   payroll,
   onApprove,
   onCreateVoucher,
   canApprove,
   canCreateVoucher,
   t,
}: {
   payroll: DashboardPayroll;
   onApprove: (payroll: DashboardPayroll) => void;
   onCreateVoucher: (payroll: DashboardPayroll) => void;
   canApprove: boolean;
   canCreateVoucher: boolean;
   t: (key: string) => string;
}) {
   const [isOpen, setIsOpen] = useState(false);
   const buttonRef = useRef<HTMLButtonElement>(null);
   const canApprovePayroll =
      canApprove &&
      payroll.status !== "Approved" &&
      payroll.status !== "Finalized";
   const canCreateVoucherForPayroll =
      canCreateVoucher &&
      (payroll.status === "Approved" || payroll.status === "Finalized");

   const items = [
      ...(canApprovePayroll
         ? [
              {
                 id: "approve",
                 label: t("actions.approve"),
                 icon: Check,
                 onClick: () => {
                    onApprove(payroll);
                    setIsOpen(false);
                 },
              },
           ]
         : []),
      ...(canCreateVoucherForPayroll
         ? [
              {
                 id: "createVoucher",
                 label: t("actions.createVoucher"),
                 icon: ReceiptDollar,
                 onClick: () => {
                    onCreateVoucher(payroll);
                    setIsOpen(false);
                 },
              },
           ]
         : []),
   ];

   // Only show the menu if there are items
   if (items.length === 0) {
      return <div className="w-8 h-8" />;
   }

   return (
      <>
         <button
            ref={buttonRef}
            onClick={(e) => {
               e.stopPropagation();
               setIsOpen(true);
            }}
            data-row-menu-trigger
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-bg-weak">
            <MoreVertical size={16} className="fill-text-sub" />
         </button>
         <Dropdown
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            anchorRef={buttonRef}
            items={items}
         />
      </>
   );
}

export default function PayrollsContent() {
   const { t } = useTranslation("payrolls");
   const { isRTL } = useLanguage();
   const navigate = useNavigate();
   const queryClient = useQueryClient();
   const { can } = usePermissions();
   const canViewPayroll = can("payroll.view_basic");
   const canApprovePayroll = can("payroll.approve");
   const canExportPayroll = can("payroll.export");

   const canCreateVoucher = can("voucher.create");

   // Month/Year for filtering
   const currentDate = new Date();
   const currentMonthIndex = currentDate.getMonth();
   const currentYearValue = currentDate.getFullYear();
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

   // State
   const [searchQuery, setSearchQuery] = useState("");
   const debouncedSearchQuery = useDebounce(searchQuery, 400);
   const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
   });
   const [filters, setFilters] = useState<PayrollFilters>({
      status: "",
      cycleType: "",
   });
   const [sortBy, setSortBy] = useState<"period_start" | "created_at">(
      "period_start",
   );
   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
   const [selectedYear, setSelectedYear] = useState<number>(currentYearValue);
   const [selectedMonth, setSelectedMonth] = useState<number | null>(
      currentMonthIndex,
   );
   const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
   const monthButtonRef = useRef<HTMLButtonElement>(null);

   // Drawer state
   const [selectedPayroll, setSelectedPayroll] =
      useState<DashboardPayroll | null>(null);
   const [isDrawerOpen, setIsDrawerOpen] = useState(false);

   // Modal states

   const [isCreateVoucherModalOpen, setIsCreateVoucherModalOpen] =
      useState(false);
   const [payrollForVoucher, setPayrollForVoucher] =
      useState<DashboardPayroll | null>(null);

   // Dropdown states
   const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
   const [isCycleDropdownOpen, setIsCycleDropdownOpen] = useState(false);
   const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
   const statusButtonRef = useRef<HTMLButtonElement>(null);
   const cycleButtonRef = useRef<HTMLButtonElement>(null);
   const sortButtonRef = useRef<HTMLButtonElement>(null);
   const sortLabel = useMemo(() => {
      if (sortBy === "period_start" && sortOrder === "asc") {
         return t("sort.periodStartAsc");
      }
      if (sortBy === "period_start" && sortOrder === "desc") {
         return t("sort.periodStartDesc");
      }
      if (sortBy === "created_at" && sortOrder === "asc") {
         return t("sort.createdAtAsc");
      }
      if (sortBy === "created_at" && sortOrder === "desc") {
         return t("sort.createdAtDesc");
      }
      return t("sort.newest");
   }, [sortBy, sortOrder, t]);

   // Confirm modal state
   const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
   const [payrollToApprove, setPayrollToApprove] =
      useState<DashboardPayroll | null>(null);

   // Build query params with month/year filtering
   const queryParams = useMemo(() => {
      const monthToUse =
         selectedMonth !== null ? selectedMonth : currentMonthIndex;
      const yearToUse = selectedYear;

      // Payroll cycle: 25th of previous month -> 24th of selected month
      const cycleStartDate = new Date(yearToUse, monthToUse - 1, 25);
      const cycleEndDate = new Date(yearToUse, monthToUse, 24);
      const fromDate = format(cycleStartDate, "yyyy-MM-dd");
      const toDate = format(cycleEndDate, "yyyy-MM-dd");

      return {
         page: pagination.pageIndex + 1,
         limit: pagination.pageSize,
         fromDate,
         toDate,
         ...(filters.status && { status: filters.status }),
         ...(filters.cycleType && { cycleType: filters.cycleType }),
         ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
         sortBy,
         sortOrder,
      };
   }, [
      pagination.pageIndex,
      pagination.pageSize,
      filters,
      sortBy,
      sortOrder,
      selectedMonth,
      selectedYear,
      currentMonthIndex,
      debouncedSearchQuery,
   ]);

   useEffect(() => {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
   }, [
      debouncedSearchQuery,
      filters.status,
      filters.cycleType,
      sortBy,
      sortOrder,
      selectedMonth,
      selectedYear,
   ]);

   const handlePaginationChange = useCallback(
      (updater: Updater<PaginationState>) => {
         setPagination((prev) => {
            const next =
               typeof updater === "function" ? updater(prev) : updater;

            if (next.pageSize !== prev.pageSize) {
               return { pageIndex: 0, pageSize: next.pageSize };
            }

            return next;
         });
      },
      [],
   );

   // Fetch payrolls
   const { data, isLoading, error } = useQuery({
      queryKey: ["all-payrolls", queryParams],
      queryFn: () => getAllPayrolls(queryParams),
      enabled: canViewPayroll,
   });

   const payrolls = data?.data || [];
   const filteredPayrolls = payrolls;
   const pageCount = Math.max(1, data?.pagination?.totalPages || 1);

   // Navigate to employee profile payroll tab, preserving relevant query params
   const handleEmployeeClick = useCallback(
      (employeeId: number, e: React.MouseEvent) => {
         e.stopPropagation();

         const urlSearchParams = new URLSearchParams();

         // Open the payroll tab in profile
         urlSearchParams.set("activeTabId", "payroll");

         // Preserve the current payroll filters where it makes sense
         if (queryParams.fromDate) {
            urlSearchParams.set("fromDate", String(queryParams.fromDate));
         }
         if (queryParams.toDate) {
            urlSearchParams.set("toDate", String(queryParams.toDate));
         }
         if (filters.status) {
            urlSearchParams.set("status", filters.status);
         }
         if (filters.cycleType) {
            urlSearchParams.set("cycleType", filters.cycleType);
         }

         navigate(
            `/dashboard/members/profile/${employeeId}?${urlSearchParams.toString()}`,
         );
      },
      [navigate, queryParams, filters.status, filters.cycleType],
   );

   // Open drawer when row is clicked
   const handleRowClick = (payroll: DashboardPayroll) => {
      setSelectedPayroll(payroll);
      setIsDrawerOpen(true);
   };

   // Approve mutation
   const approveMutation = useMutation({
      mutationFn: (payrollId: string) => approvePayroll(payrollId),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["all-payrolls"] });
         setIsDrawerOpen(false);
         setIsConfirmModalOpen(false);
         setPayrollToApprove(null);
         toast.success(t("toast.approveSuccess"));
      },
      onError: (error) => {
         console.error("Error approving payroll:", error);
         toast.error(t("toast.approveError"));
      },
   });

   // Create voucher mutation
   const createVoucherMutation = useMutation({
      mutationFn: ({
         payrollId,
         data,
      }: {
         payrollId: string;
         data: CreateVoucherFormData;
      }) => createPayrollVoucher(payrollId, data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["all-payrolls"] });
         queryClient.invalidateQueries({
            queryKey: reactQueryKeys.vouchers.payments.lists(),
         });
         queryClient.invalidateQueries({
            queryKey: reactQueryKeys.vouchers.payments.stats(),
         });
         setIsCreateVoucherModalOpen(false);
         setPayrollForVoucher(null);
         toast.success(t("toast.voucherSuccess"));
      },
      onError: (error) => {
         console.error("Error creating voucher:", error);
         toast.error(t("toast.voucherError"));
      },
   });

   // Handle approve action - show confirmation modal
   const handleApprove = useCallback(
      (payroll: DashboardPayroll) => {
         if (!canApprovePayroll) return;
         setPayrollToApprove(payroll);
         setIsConfirmModalOpen(true);
      },
      [canApprovePayroll],
   );

   // Handle create voucher action
   const handleCreateVoucher = useCallback(
      (payroll: DashboardPayroll) => {
         if (!canCreateVoucher) return;
         setPayrollForVoucher(payroll);
         setIsCreateVoucherModalOpen(true);
      },
      [canCreateVoucher],
   );

   // Handle create voucher submit
   const handleCreateVoucherSubmit = async (data: CreateVoucherFormData) => {
      if (!payrollForVoucher) return;
      await createVoucherMutation.mutateAsync({
         payrollId: payrollForVoucher.payroll_id,
         data,
      });
   };

   // Handle confirm approve
   const handleConfirmApprove = () => {
      if (payrollToApprove) {
         approveMutation.mutate(payrollToApprove.payroll_id);
      }
   };

   // Navigate drawer
   const handleNavigateNext = () => {
      if (!selectedPayroll) return;
      const currentIndex = filteredPayrolls.findIndex(
         (p) => p.payroll_id === selectedPayroll.payroll_id,
      );
      if (currentIndex < filteredPayrolls.length - 1) {
         setSelectedPayroll(filteredPayrolls[currentIndex + 1]);
      }
   };

   const handleNavigatePrev = () => {
      if (!selectedPayroll) return;
      const currentIndex = filteredPayrolls.findIndex(
         (p) => p.payroll_id === selectedPayroll.payroll_id,
      );
      if (currentIndex > 0) {
         setSelectedPayroll(filteredPayrolls[currentIndex - 1]);
      }
   };

   const getCurrentPayrollIndex = () => {
      if (!selectedPayroll) return 0;
      return (
         filteredPayrolls.findIndex(
            (p) => p.payroll_id === selectedPayroll.payroll_id,
         ) + 1
      );
   };

   // Status variant mapping for StatusTag
   const getStatusVariant = (
      status: string,
   ): "active" | "inactive" | "pending" | "completed" | "warning" | "error" => {
      switch (status) {
         case "Draft":
            return "inactive";
         case "Review":
            return "pending";
         case "Approved":
            return "completed";
         case "Finalized":
            return "active";
         default:
            return "inactive";
      }
   };

   // Table columns
   const columns = useMemo<ColumnDef<DashboardPayroll>[]>(() => {
      const cols: ColumnDef<DashboardPayroll>[] = [
         {
            accessorKey: "Employee",
            header: () => (
               <div className="flex items-center gap-2">
                  <span>{t("fields.employee")}</span>
               </div>
            ),
            cell: ({ row }) => {
               const emp = row.original.Employee;
               if (!emp) {
                  return (
                     <span className="text-sm text-text-sub">
                        {t("labels.allEmployees")}
                     </span>
                  );
               }
               const firstName = emp.first_name || "";
               const lastName = emp.last_name || "";
               const fullName =
                  `${firstName} ${lastName}`.trim() ||
                  t("labels.unknownEmployee");
               const jobTitle = emp.JobTitle?.title || undefined;
               const avatarUrl = emp.profilePicture?.storage_path || undefined;
               return (
                  <MemberTag1
                     name={fullName}
                     jobTitle={jobTitle}
                     avatar={avatarUrl}
                     onClick={
                        emp.employee_id
                           ? (e) => handleEmployeeClick(emp.employee_id, e)
                           : undefined
                     }
                     variant="table"
                  />
               );
            },
            size: 200,
         },
         {
            accessorKey: "period_start",
            header: () => (
               <div className="flex items-center gap-2">
                  <Calender className="size-4 text-text-sub" />
                  <span>{t("fields.period")}</span>
               </div>
            ),
            cell: ({ row }) => {
               const start = new Date(row.original.period_start);
               const end = new Date(row.original.period_end);
               return (
                  <span className="text-sm text-text-sub">
                     {format(start, "dd MMM")} - {format(end, "dd MMM yyyy")}
                  </span>
               );
            },
         },
         {
            accessorKey: "cycle_type",
            header: () => (
               <div className="flex items-center gap-2">
                  <Tag className="size-4 text-text-sub" />
                  <span>{t("fields.cycleType")}</span>
               </div>
            ),
            cell: ({ row }) => (
               <span className="text-sm text-text-sub">
                  {t(`filters.${row.original.cycle_type}`, {
                     defaultValue: row.original.cycle_type,
                  })}
               </span>
            ),
         },
         {
            accessorKey: "status",
            header: () => (
               <div className="flex items-center gap-2">
                  <span>{t("fields.status")}</span>
               </div>
            ),
            cell: ({ row }) => (
               <StatusTag
                  label={t(`status.${row.original.status}`, {
                     defaultValue: row.original.status,
                  })}
                  variant={getStatusVariant(row.original.status)}
               />
            ),
         },
         {
            accessorKey: "base_salary",
            header: () => (
               <div className="flex items-center gap-2">
                  <SackDollar className="size-4 text-text-sub" />
                  <span>{t("fields.baseSalary")}</span>
               </div>
            ),
            cell: ({ row }) => (
               <DirhamLabel value={parseFloat(row.original.base_salary)} />
            ),
         },
         {
            accessorKey: "net_pay",
            header: () => (
               <div className="flex items-center gap-2">
                  <SackDollar className="size-4 text-text-sub" />
                  <span>{t("fields.netPay")}</span>
               </div>
            ),
            cell: ({ row }) => {
               const netPay = parseFloat(row.original.net_pay);
               const isNegative = netPay < 0;
               return (
                  <span className={isNegative ? "text-danger" : ""}>
                     <DirhamLabel value={netPay} />
                  </span>
               );
            },
         },
      ];

      if (canApprovePayroll || canCreateVoucher) {
         cols.push({
            id: "actions",
            header: () => <div />,
            cell: ({ row }) => (
               <PayrollActionsCell
                  payroll={row.original}
                  onApprove={handleApprove}
                  onCreateVoucher={handleCreateVoucher}
                  canApprove={canApprovePayroll}
                  canCreateVoucher={canCreateVoucher}
                  t={t}
               />
            ),
            size: 48,
         });
      }

      return cols;
   }, [
      t,
      handleApprove,
      handleCreateVoucher,
      handleEmployeeClick,
      canApprovePayroll,
      canCreateVoucher,
   ]);

   // Permission check
   if (!canViewPayroll) {
      return (
         <NoPermissionMessage
            message={t("noPermission.title")}
            description={t("noPermission.description")}
         />
      );
   }

   return (
      <div className="w-full flex flex-col gap-6">
         {/* Toolbar */}
         <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 xl:whitespace-nowrap">
            {/* Search */}
            <div className="w-full sm:flex-1 sm:max-w-md">
               <div className="relative">
                  <div
                     className={`absolute top-1/2 -translate-y-1/2 ${
                        isRTL ? "right-3" : "left-3"
                     }`}>
                     <Search2Line size={20} />
                  </div>
                  <input
                     type="text"
                     placeholder={t("searchPlaceholder")}
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className={`w-full text-xs md:text-sm xl:text-sm ${
                        isRTL ? "pr-10 pl-3" : "pl-10 pr-3"
                     } py-2 border border-border rounded-lg bg-background text-text-sub placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary/20`}
                  />
               </div>
            </div>

            {/* Filters & Sort */}
            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:items-center">
               {/* Month/Year Filter */}
               <button
                  ref={monthButtonRef}
                  onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                  className="flex w-full items-center gap-2 px-2.5 py-2 text-xs sm:text-sm font-medium text-text-sub border border-border rounded-lg bg-background hover:bg-bg-weak transition-colors whitespace-nowrap">
                  <Calender className="size-5 fill-text-sub" />
                  <span>
                     {selectedMonth !== null
                        ? `${months[selectedMonth]} ${selectedYear}`
                        : `${months[currentMonthIndex]} ${selectedYear}`}
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

               {/* Status Filter */}
               <button
                  ref={statusButtonRef}
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="flex w-full items-center gap-2 px-2.5 py-2 text-xs sm:text-sm font-medium text-text-sub border border-border rounded-lg bg-background hover:bg-bg-weak transition-colors whitespace-nowrap">
                  <Tag className="size-5 fill-text-sub" />
                  <span>
                     {filters.status
                        ? t(`status.${filters.status}`)
                        : t("filters.allStatuses")}
                  </span>
               </button>
               <Dropdown
                  isOpen={isStatusDropdownOpen}
                  onClose={() => setIsStatusDropdownOpen(false)}
                  anchorRef={statusButtonRef}
                  items={[
                     {
                        id: "all",
                        label: t("filters.allStatuses"),
                        icon: Dot,
                        onClick: () =>
                           setFilters((f) => ({ ...f, status: "" })),
                     },
                     ...PAYROLL_STATUSES.map((s) => ({
                        id: s,
                        label: t(`status.${s}`),
                        icon: Dot,
                        onClick: () => setFilters((f) => ({ ...f, status: s })),
                     })),
                  ]}
               />

               {/* Cycle Filter */}
               <button
                  ref={cycleButtonRef}
                  onClick={() => setIsCycleDropdownOpen(!isCycleDropdownOpen)}
                  className="flex w-full items-center gap-2 px-2.5 py-2 text-xs sm:text-sm font-medium text-text-sub border border-border rounded-lg bg-background hover:bg-bg-weak transition-colors whitespace-nowrap">
                  <Tag className="size-5 fill-text-sub" />
                  <span>
                     {filters.cycleType
                        ? t(`filters.${filters.cycleType}`)
                        : t("filters.allCycles")}
                  </span>
               </button>
               <Dropdown
                  isOpen={isCycleDropdownOpen}
                  onClose={() => setIsCycleDropdownOpen(false)}
                  anchorRef={cycleButtonRef}
                  items={[
                     {
                        id: "all",
                        label: t("filters.allCycles"),
                        icon: Dot,
                        onClick: () =>
                           setFilters((f) => ({ ...f, cycleType: "" })),
                     },
                     ...PAYROLL_CYCLES.map((c) => ({
                        id: c,
                        label: t(`filters.${c}`),
                        icon: Dot,
                        onClick: () =>
                           setFilters((f) => ({ ...f, cycleType: c })),
                     })),
                  ]}
               />

               {/* Export Button */}
               {canExportPayroll && (
                  <ExportButton
                     data={filteredPayrolls}
                     rawData={payrolls}
                     idField="payroll_id"
                     filename="payrolls"
                     sheetName="Payrolls"
                     className="w-full sm:w-auto text-xs sm:text-sm whitespace-nowrap justify-start"
                  />
               )}

               {/* Sort */}
               <button
                  ref={sortButtonRef}
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="flex w-full items-center justify-start gap-2 px-2.5 py-2 text-xs sm:text-sm font-medium text-text-sub border border-border rounded-lg bg-background hover:bg-bg-weak transition-colors whitespace-nowrap">
                  <SortDescending className="size-5 fill-text-sub" />
                  <span>{sortLabel}</span>
               </button>
               <Dropdown
                  isOpen={isSortDropdownOpen}
                  onClose={() => setIsSortDropdownOpen(false)}
                  anchorRef={sortButtonRef}
                  items={[
                     {
                        id: "period_start_desc",
                        label: t("sort.periodStartDesc"),
                        icon: SortDescending,
                        onClick: () => {
                           setSortBy("period_start");
                           setSortOrder("desc");
                        },
                     },
                     {
                        id: "period_start_asc",
                        label: t("sort.periodStartAsc"),
                        icon: SortDescending,
                        onClick: () => {
                           setSortBy("period_start");
                           setSortOrder("asc");
                        },
                     },
                     {
                        id: "created_at_desc",
                        label: t("sort.createdAtDesc"),
                        icon: SortDescending,
                        onClick: () => {
                           setSortBy("created_at");
                           setSortOrder("desc");
                        },
                     },
                     {
                        id: "created_at_asc",
                        label: t("sort.createdAtAsc"),
                        icon: SortDescending,
                        onClick: () => {
                           setSortBy("created_at");
                           setSortOrder("asc");
                        },
                     },
                  ]}
               />
            </div>
         </div>
         <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-bg-weak text-xs text-text-sub">
            <Dot className="fill-text-sub" />
            <span>{t("messages.autoCreateNote")}</span>
         </div>

         {/* Content */}
         {error ? (
            <div className="flex items-center justify-center py-12">
               <p className="text-danger">{t("error.loadFailed")}</p>
            </div>
         ) : filteredPayrolls.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-background border border-border rounded-2xl">
               <div className="text-center max-w-md">
                  <div className="mb-4">
                     <SackDollar className="size-16 fill-text-soft mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-strong mb-2">
                     {t("noPayrolls")}
                  </h3>
                  <p className="text-sm text-text-sub">{t("noPayrollsDesc")}</p>
               </div>
            </div>
         ) : (
            <div className="border border-border rounded-xl overflow-hidden relative">
               <DataTable
                  columns={columns}
                  data={filteredPayrolls}
                  isLoading={isLoading}
                  showPagination
                  pageSize={pagination.pageSize}
                  pageCount={pageCount}
                  pagination={pagination}
                  onPaginationChange={handlePaginationChange}
                  manualPagination={true}
                  onRowClick={handleRowClick}
               />
            </div>
         )}

         {/* Payroll Details Drawer */}
         <PayrollDetailsDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            payroll={selectedPayroll}
            payrollIndex={getCurrentPayrollIndex()}
            totalPayrolls={filteredPayrolls.length}
            onNavigateNext={
               getCurrentPayrollIndex() < filteredPayrolls.length
                  ? handleNavigateNext
                  : undefined
            }
            onNavigatePrev={
               getCurrentPayrollIndex() > 1 ? handleNavigatePrev : undefined
            }
            onApprove={canApprovePayroll ? handleApprove : undefined}
            onCreateVoucher={canCreateVoucher ? handleCreateVoucher : undefined}
         />

         {/* Confirm Approve Modal */}
         {canApprovePayroll && (
            <ConfirmModal
               isOpen={isConfirmModalOpen}
               onClose={() => {
                  setIsConfirmModalOpen(false);
                  setPayrollToApprove(null);
               }}
               onConfirm={handleConfirmApprove}
               title={t("modal.confirm.approve")}
               description={t("modal.confirm.approveDesc", {
                  name: `${payrollToApprove?.Employee.first_name || ""} ${
                     payrollToApprove?.Employee.last_name || ""
                  }`.trim(),
               })}
               confirmText={t("modal.confirm.confirm")}
               cancelText={t("modal.confirm.cancel")}
               variant="primary"
               icon="info"
               isLoading={approveMutation.isPending}
            />
         )}

         {/* Create Voucher Modal */}
         {canCreateVoucher && (
            <CreateVoucherModal
               isOpen={isCreateVoucherModalOpen}
               onClose={() => {
                  setIsCreateVoucherModalOpen(false);
                  setPayrollForVoucher(null);
               }}
               onSubmit={handleCreateVoucherSubmit}
               payroll={payrollForVoucher}
               isLoading={createVoucherMutation.isPending}
            />
         )}
      </div>
   );
}

// Month/Year Picker Component
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
   const [position, setPosition] = useState<{
      top: number;
      right: number;
   } | null>(null);
   const [isSelectingYear, setIsSelectingYear] = useState(false);

   const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
   ];
   const years = [2026, 2025, 2024, 2023];
   const YearIcon = ({
      size = 6,
      className = "",
   }: {
      size?: number;
      className?: string;
   }) => (
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
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, [onClose, anchorRef, isSelectingYear]);

   if (!position) {
      return null;
   }

   return (
      <div
         ref={dropdownRef}
         className="fixed bg-background border border-border rounded-lg shadow-lg z-50 w-[90vw] max-w-[280px] xl:w-[280px] p-2.5 xl:p-3 xl:rounded-2xl"
         style={{ top: `${position.top}px`, right: `${position.right}px` }}>
         {/* Year Selector */}
         <div className="flex items-center justify-between mb-2 pb-2 border-b border-border xl:mb-3 xl:pb-2">
            <button
               ref={yearButtonRef}
               onClick={() => setIsYearDropdownOpen((prev) => !prev)}
               className="flex items-center gap-2 text-sm font-medium text-text-strong border border-border rounded-lg bg-background hover:bg-bg-weak transition-colors px-3 py-2 xl:px-2.5 xl:py-2">
               <span>{selectedYear}</span>
               <ArrowDownSLine
                  className={`transition-transform ${
                     isYearDropdownOpen ? "rotate-180" : ""
                  }`}
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
