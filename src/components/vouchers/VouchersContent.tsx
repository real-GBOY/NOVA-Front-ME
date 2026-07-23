/** @format */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useDebounce } from "@/hooks/useDebounce";

import VouchersTable from "./VouchersTable";
import VouchersToolbar, { type VoucherTab } from "./ui/VouchersToolbar";
import AddPaymentVoucherModal from "./AddPaymentVoucherModal";
import VoucherDetailsDrawer from "./VoucherDetailsDrawer";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { usePaymentVoucher } from "@/hooks/paymentVouchers/usePaymentVoucher";
import { useReceiptVoucher } from "@/hooks/vouchers/useReceiptVoucher";
import type { VoucherFormData } from "@/utilities/schemas/voucherSchema";
import {
   paymentVoucherService,
   type PaymentVoucherListItem,
} from "@/services/paymentVoucherService";
import {
   receiptVoucherService,
   type ReceiptVoucherListItem,
} from "@/services/receiptVoucherService";
import { useListBanks } from "@/hooks/banks/useBanks";
import { useListPrettyCashNames } from "@/hooks/prettyCashNames/usePrettyCashNames";
import { useListCustomers } from "@/hooks/customers/useCustomers";
import { useListAgents } from "@/hooks/agents/useAgents";
import { useTableFilter, useTableSort } from "@/hooks/table";
import { useServerTableData } from "@/hooks/table/useServerTableData";
import type { VoucherFilters } from "./ui/VouchersFilterDropdown";
import LoadingOverlay from "@/designSystem/LoadingOverlay";
import LoadingState from "@/designSystem/LoadingState";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { PaginationState, Updater } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import { formatPermissionName } from "@/utilities/permissionFormatters";
import toast from "@/utilities/toast";

// Combined type for table display
type VoucherTableItem = {
   id: number;
   paymentCode: string;
   dateCreated: string;
   from: string;
   to: string;
   amount: number;
   status: string;
   type: VoucherTab;
};

function VouchersContent() {
   const { t } = useTranslation("settings");
   const queryClient = useQueryClient();
   const [searchParams, setSearchParams] = useSearchParams();
   const tabParam = searchParams.get("tab");
   const { can } = usePermissions();
   const canViewVouchers = can("view_vouchers");
   const canCreateVouchers = can("create_vouchers");
   const canUpdateVouchers = can("update_vouchers");
   const canDeleteVouchers = can("delete_vouchers");
   const canApproveVouchers = can("approve_vouchers");

   const canAccessVouchers =
      canViewVouchers ||
      canCreateVouchers ||
      canUpdateVouchers ||
      canDeleteVouchers ||
      canApproveVouchers;

   // Map URL tab query param to VoucherTab, default to "payment"
   const activeTab: VoucherTab = tabParam === "receipt" ? "receipt" : "payment";

   // Set default tab query param if not specified
   useEffect(() => {
      if (!tabParam) {
         setSearchParams({ tab: "payment" }, { replace: true });
      }
   }, [tabParam, setSearchParams]);

   const [searchQuery, setSearchQuery] = useState("");
   const debouncedSearchQuery = useDebounce(searchQuery, 400);
   const [isAddVoucherOpen, setIsAddVoucherOpen] = useState(false);

   // State for details and delete actions
   const [selectedVoucherType, setSelectedVoucherType] =
      useState<VoucherTab>("payment");
   const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(
      null,
   );
   const [selectedVoucherForDelete, setSelectedVoucherForDelete] = useState<{
      id: number;
      type: VoucherTab;
   } | null>(null);
   const [isDetailsOpen, setIsDetailsOpen] = useState(false);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
   const [selectedVoucherForAction, setSelectedVoucherForAction] = useState<{
      id: number;
      type: VoucherTab;
   } | null>(null);
   const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
   const [errorMessage, setErrorMessage] = useState<string>("");

   // ===== FILTER & SORT INTEGRATION =====
   const { filters, updateFilters } = useTableFilter<VoucherFilters>();
   const { sortConfig, setSortConfig, clearSort } =
      useTableSort<VoucherTableItem>();

   // State for pagination
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(20);

   // Reset page when tab or search query change
   useEffect(() => {
      setPage(1);
   }, [activeTab, debouncedSearchQuery]);

   const handleFiltersApply = useCallback(
      (newFilters: VoucherFilters) => {
         updateFilters(newFilters);
         setPage(1); // Reset page on filter change
      },
      [updateFilters],
   );

   // Handle pagination change
   const handlePaginationChange = (updater: Updater<PaginationState>) => {
      if (typeof updater === "function") {
         const newState = updater({ pageIndex: page - 1, pageSize });
         setPage(newState.pageIndex + 1);
         setPageSize(newState.pageSize);
      } else {
         setPage(updater.pageIndex + 1);
         setPageSize(updater.pageSize);
      }
   };

   // Hooks (for mutations and single item fetch)
   // Destructure only what we need to avoid unused variable warnings
   const {
      useCreatePaymentVoucher,
      useUpdatePaymentVoucher,
      useDeletePaymentVoucher,
      useApprovePaymentVoucher,
      useGetPaymentVoucherById,
   } = usePaymentVoucher();

   const {
      useCreateReceiptVoucher,
      useUpdateReceiptVoucher,
      useApproveReceiptVoucher,
      useGetReceiptVoucherById,
   } = useReceiptVoucher();

   // ===== SERVER SIDE DATA FETCHING =====
   const { data: banksData } = useListBanks({ limit: 100, page: 1 });
   const { data: prettyCashNamesData } = useListPrettyCashNames({
      limit: 100,
      page: 1,
   });
   const { data: customersData } = useListCustomers({ limit: 100, page: 1 });
   const { data: agentsData } = useListAgents({ limit: 100, page: 1 });

   const accountOptions = useMemo(
      () => {
         const bankOptions =
            banksData?.data.map((b) => ({
               id: String(b.account_id),
               label: b.bank_name,
            })) || [];
         const cashOptions =
            prettyCashNamesData?.data.map((cash) => ({
               id: String(cash.account_id),
               label: cash.account_name,
            })) || [];

         const seen = new Set<string>();
         return [...bankOptions, ...cashOptions].filter((option) => {
            if (seen.has(option.id)) return false;
            seen.add(option.id);
            return true;
         });
      },
      [banksData, prettyCashNamesData],
   );

   const customerOptions = useMemo(
      () =>
         customersData?.data.map((c) => ({
            id: String(c.customer_id),
            label: c.customer_name,
         })) || [],
      [customersData],
   );

   const agentOptions = useMemo(
      () =>
         agentsData?.data.map((a) => ({
            id: String(a.agent_id),
            label: a.name || a.agent_code || `Agent ${a.agent_id}`,
         })) || [],
      [agentsData],
   );

   // Helper to map UI filters to Backend filters
   const mapFilters = useMemo(() => {
      const mappedFilters: any = {};
      if (filters.status) mappedFilters.status = filters.status;
      if (filters.dateFrom)
         mappedFilters.date_from = filters.dateFrom.toISOString();
      if (filters.dateTo) mappedFilters.date_to = filters.dateTo.toISOString();
      if (filters.minAmount !== undefined)
         mappedFilters.amount_from = filters.minAmount;
      if (filters.maxAmount !== undefined)
         mappedFilters.amount_to = filters.maxAmount;
      if (filters.fromAccountId)
         mappedFilters.from_account_id = Number(filters.fromAccountId);
      if (filters.toAccountId)
         mappedFilters.to_account_id = Number(filters.toAccountId);
      if (filters.toCustomerId)
         mappedFilters.to_customer_id = Number(filters.toCustomerId);
      if (filters.toAgentId)
         mappedFilters.to_agent_id = Number(filters.toAgentId);
      if (filters.fromCustomerId)
         mappedFilters.from_customer_id = Number(filters.fromCustomerId);
      if (filters.fromAgentId)
         mappedFilters.from_agent_id = Number(filters.fromAgentId);
      return mappedFilters;
   }, [filters]);

   // Map UI sort keys to Backend DB columns
   const getSortField = (field?: string, type: VoucherTab = "payment") => {
      if (!field) return undefined;

      const commonMapping: Record<string, string> = {
         dateCreated: "created_at",
         amount: "total_amount",
         status: "status",
      };

      if (commonMapping[field]) return commonMapping[field];

      if (type === "payment") {
         if (field === "paymentCode") return "voucher_code";
         // Add other payment specific mappings if needed
      } else {
         if (field === "paymentCode") return "receipt_code";
         // Add other receipt specific mappings if needed
      }

      return field;
   };

   const handleSortChange = (optionId: string) => {
      const dateField =
         activeTab === "payment" ? "voucher_date" : "receipt_date";
      switch (optionId) {
         case "dateCreated":
            setSortConfig({ field: dateField, direction: "desc" });
            break;
         case "lastUpdated":
            setSortConfig({ field: "created_at", direction: "desc" });
            break;
         case "amountHigh":
            setSortConfig({ field: "total_amount", direction: "desc" });
            break;
         case "amountLow":
            setSortConfig({ field: "total_amount", direction: "asc" });
            break;
         default:
            clearSort();
            break;
      }
   };

   // Data fetching for Payments
   const {
      data: paymentData,
      totalCount: paymentTotal,
      isLoading: isLoadingPayments,
      isFetching: isFetchingPayments,
      error: paymentError,
   } = useServerTableData<PaymentVoucherListItem>({
      queryKey: [...reactQueryKeys.vouchers.payments.lists(), "server"],
      queryFn: paymentVoucherService.list,
      page,
      pageSize,
      searchQuery: debouncedSearchQuery,
      enabled: activeTab === "payment" && canViewVouchers,
      filters: mapFilters,
      sortField: getSortField(sortConfig?.field, "payment"),
      sortDirection: sortConfig?.direction,
   });

   // Data fetching for Receipts
   const {
      data: receiptData,
      totalCount: receiptTotal,
      isLoading: isLoadingReceipts,
      isFetching: isFetchingReceipts,
      error: receiptError,
   } = useServerTableData<ReceiptVoucherListItem>({
      queryKey: [...reactQueryKeys.vouchers.receipts.lists(), "server"],
      queryFn: receiptVoucherService.list,
      page,
      pageSize,
      searchQuery: debouncedSearchQuery,
      enabled: activeTab === "receipt" && canViewVouchers,
      filters: mapFilters,
      sortField: getSortField(sortConfig?.field, "receipt"),
      sortDirection: sortConfig?.direction,
   });

   // Transform data for table
   const normalizeStatusForTable = useCallback((status?: string) => {
      if (!status) return "";
      if (status === "Active") return "Approved";
      if (status === "Inactive") return "Pending_Approval";
      return status;
   }, []);

   const transformPaymentVoucher = useCallback(
      (voucher: PaymentVoucherListItem): VoucherTableItem => {
         let toValue = "-";
         if (voucher.to_type === "Customer") {
            if (!can("view_customers")) {
               toValue = "Unauthorized";
            } else if (voucher.to_customer) {
               toValue = voucher.to_customer.customer_name;
            }
         } else if (voucher.to_type === "Agent") {
            if (!can("view_agents")) {
               toValue = "Unauthorized";
            } else if (voucher.to_agent) {
               toValue = voucher.to_agent.agent_name;
            }
         } else if (voucher.to_type === "Employee") {
            if (!can("view_employees")) {
               toValue = "Unauthorized";
            } else if (voucher.to_employee) {
               toValue =
                  voucher.to_employee.name ||
                  `${voucher.to_employee.first_name || ""} ${
                     voucher.to_employee.last_name || ""
                  }`.trim() ||
                  `Employee ${voucher.to_employee.employee_id}`;
            }
         } else if (voucher.to_type === "Bank") {
            if (!can("view_banks")) {
               toValue = "Unauthorized";
            } else if (voucher.to_account) {
               toValue = voucher.to_account.account_name;
            }
         } else if (voucher.to_type === "Other" && voucher.to_entity_name) {
            toValue = voucher.to_entity_name;
         }

         let fromValue = voucher.from_account?.account_name || "-";
         if (
            voucher.from_account &&
            !can("view_banks") &&
            !can("view_petty_cash")
         ) {
            // Basic check: if can't see accounts at all
            fromValue = "Unauthorized";
         }

         return {
            id: voucher.voucher_id,
            paymentCode: voucher.voucher_code,
            dateCreated: voucher.created_at,
            from: fromValue,
            to: toValue,
            amount: voucher.total_amount,
            status: normalizeStatusForTable(voucher.status),
            type: "payment",
         };
      },
      [can, normalizeStatusForTable],
   );

   const transformReceiptVoucher = useCallback(
      (voucher: ReceiptVoucherListItem): VoucherTableItem => {
         let fromValue = "-";
         if (voucher.from_type === "Customer") {
            if (!can("view_customers")) {
               fromValue = "Unauthorized";
            } else if (voucher.from_customer) {
               fromValue = voucher.from_customer.customer_name;
            }
         } else if (voucher.from_type === "Agent") {
            if (!can("view_agents")) {
               fromValue = "Unauthorized";
            } else if (voucher.from_agent) {
               fromValue =
                  voucher.from_agent.name ||
                  voucher.from_agent.agent_code ||
                  `Agent ${voucher.from_agent.agent_id}`;
            }
         } else if (voucher.from_type === "Other") {
            fromValue = voucher.from_entity_name || "-";
         } else if (voucher.from_customer) {
            if (!can("view_customers")) {
               fromValue = "Unauthorized";
            } else {
               fromValue = voucher.from_customer.customer_name;
            }
         } else if (voucher.from_agent) {
            if (!can("view_agents")) {
               fromValue = "Unauthorized";
            } else {
               fromValue =
                  voucher.from_agent.name ||
                  voucher.from_agent.agent_code ||
                  `Agent ${voucher.from_agent.agent_id}`;
            }
         } else if (voucher.from_entity_name) {
            fromValue = voucher.from_entity_name;
         }

         let toValue = voucher.to_account?.account_name || "-";
         if (
            voucher.to_account &&
            !can("view_banks") &&
            !can("view_petty_cash")
         ) {
            toValue = "Unauthorized";
         }

         return {
            id: voucher.receipt_id,
            paymentCode: voucher.receipt_code,
            dateCreated: voucher.created_at,
            from: fromValue,
            to: toValue,
            amount: voucher.total_amount,
            status: normalizeStatusForTable(voucher.status),
            type: "receipt",
         };
      },
      [can, normalizeStatusForTable],
   );

   const tableData = useMemo(() => {
      if (activeTab === "payment") {
         return paymentData.map(transformPaymentVoucher);
      } else {
         return receiptData.map(transformReceiptVoucher);
      }
   }, [
      activeTab,
      paymentData,
      receiptData,
      transformPaymentVoucher,
      transformReceiptVoucher,
   ]);

   // Details Data Loading settings
   const shouldLoadPaymentDetails =
      (isDetailsOpen || isAddVoucherOpen) &&
      selectedVoucherType === "payment" &&
      !!selectedVoucherId;

   const { data: selectedPaymentVoucher, isLoading: isLoadingPaymentVoucher } =
      useGetPaymentVoucherById(
         shouldLoadPaymentDetails ? selectedVoucherId || 0 : 0,
         { enabled: canViewVouchers && shouldLoadPaymentDetails },
      );

   const shouldLoadReceiptDetails =
      (isDetailsOpen || isAddVoucherOpen) &&
      selectedVoucherType === "receipt" &&
      !!selectedVoucherId;

   const { data: selectedReceiptVoucher, isLoading: isLoadingReceiptVoucher } =
      useGetReceiptVoucherById(selectedVoucherId ? selectedVoucherId : 0, {
         enabled: canViewVouchers && shouldLoadReceiptDetails,
      });

   // Mutations
   const createPayment = useCreatePaymentVoucher();
   const updatePayment = useUpdatePaymentVoucher();
   const approvePayment = useApprovePaymentVoucher();
   const createReceipt = useCreateReceiptVoucher();
   const updateReceipt = useUpdateReceiptVoucher();
   const approveReceipt = useApproveReceiptVoucher();
   const deletePayment = useDeletePaymentVoucher();

   // Actions Handlers
   const handleAddVoucherClick = () => {
      if (!canCreateVouchers) {
         return;
      }
      setSelectedVoucherId(null);
      setIsAddVoucherOpen(true);
   };

   const handleApproveClick = (voucher: VoucherTableItem) => {
      if (!canApproveVouchers) {
         return;
      }
      setSelectedVoucherForAction({
         id: voucher.id,
         type: voucher.type,
      });
      setIsConfirmModalOpen(true);
   };

   const handleConfirmAction = async () => {
      if (!selectedVoucherForAction || !canApproveVouchers) return;

      try {
         const approvedVoucherId = selectedVoucherForAction.id;
         const approvedVoucherType = selectedVoucherForAction.type;

         if (selectedVoucherForAction.type === "payment") {
            await approvePayment.mutateAsync(selectedVoucherForAction.id);
         } else {
            await approveReceipt.mutateAsync(selectedVoucherForAction.id);
         }

         if (approvedVoucherType === "payment") {
            await Promise.all([
               queryClient.invalidateQueries({
                  queryKey: reactQueryKeys.vouchers.payments.lists(),
               }),
               queryClient.invalidateQueries({
                  queryKey: reactQueryKeys.vouchers.payments.stats(),
               }),
               queryClient.invalidateQueries({
                  queryKey: reactQueryKeys.vouchers.payments.detail(
                     approvedVoucherId,
                  ),
               }),
               queryClient.refetchQueries({
                  queryKey: reactQueryKeys.vouchers.payments.detail(
                     approvedVoucherId,
                  ),
                  type: "active",
               }),
            ]);
         } else {
            await Promise.all([
               queryClient.invalidateQueries({
                  queryKey: reactQueryKeys.vouchers.receipts.lists(),
               }),
               queryClient.invalidateQueries({
                  queryKey: reactQueryKeys.vouchers.receipts.detail(
                     approvedVoucherId,
                  ),
               }),
               queryClient.refetchQueries({
                  queryKey: reactQueryKeys.vouchers.receipts.detail(
                     approvedVoucherId,
                  ),
                  type: "active",
               }),
            ]);
         }

         setIsConfirmModalOpen(false);
         setSelectedVoucherForAction(null);
         toast.success(
            t("vouchers.approveSuccess", "Voucher approved successfully"),
         );
      } catch (error: unknown) {
         console.error("Error approving voucher:", error);
         const errorMessage =
            error instanceof Error
               ? error.message
               : (error as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message || "Failed to approve voucher";

         if (errorMessage.toLowerCase().includes("insufficient balance")) {
            toast.error(
               t(
                  "vouchers.insufficientBalance",
                  "Insufficient balance in source account",
               ),
            );
         } else {
            toast.error(errorMessage);
         }
         setIsConfirmModalOpen(false);
         setSelectedVoucherForAction(null);
      }
   };

   const handleViewDetails = (voucher: VoucherTableItem) => {
      setSelectedVoucherId(voucher.id);
      setSelectedVoucherType(voucher.type);
      setIsDetailsOpen(true);
   };

   // Navigation handlers for drawer
   const getCurrentVoucherIndex = () => {
      if (!selectedVoucherId) return -1;
      return tableData.findIndex((v) => v.id === selectedVoucherId);
   };

   const handleNavigateNext = () => {
      const currentIndex = getCurrentVoucherIndex();
      if (currentIndex < tableData.length - 1) {
         const nextVoucher = tableData[currentIndex + 1];
         setSelectedVoucherId(nextVoucher.id);
         setSelectedVoucherType(nextVoucher.type);
      }
   };

   const handleNavigatePrev = () => {
      const currentIndex = getCurrentVoucherIndex();
      if (currentIndex > 0) {
         const prevVoucher = tableData[currentIndex - 1];
         setSelectedVoucherId(prevVoucher.id);
         setSelectedVoucherType(prevVoucher.type);
      }
   };

   // Approve from drawer
   const handleApproveFromDrawer = (voucher: {
      id: string;
      type: "payment" | "receipt";
   }) => {
      if (!canApproveVouchers) {
         return;
      }
      setSelectedVoucherForAction({
         id: Number(voucher.id),
         type: voucher.type,
      });
      setIsConfirmModalOpen(true);
   };

   const handleDeleteClick = (voucher: VoucherTableItem) => {
      if (!canDeleteVouchers) {
         return;
      }
      setSelectedVoucherForDelete({
         id: voucher.id,
         type: voucher.type,
      });
      setIsDeleteModalOpen(true);
   };

   const handleConfirmDelete = async () => {
      if (!selectedVoucherForDelete || !canDeleteVouchers) return;

      try {
         if (selectedVoucherForDelete.type === "payment") {
            await deletePayment.mutateAsync(selectedVoucherForDelete.id);
         } else {
            // For receipts, we might need a delete endpoint if cancel is removed
            // Assuming delete works similar to payment
            console.warn("Delete receipt implementation pending");
         }
         setIsDeleteModalOpen(false);
         setSelectedVoucherForDelete(null);
      } catch (error) {
         console.error("Error deleting voucher:", error);
      }
   };

   const handleVoucherSubmit = async (data: VoucherFormData) => {
      const voucherType =
         selectedVoucherId !== null ? selectedVoucherType : activeTab;

      try {
         if (selectedVoucherId && !canUpdateVouchers) {
            throw new Error("You don't have permission to update vouchers");
         }
         if (!selectedVoucherId && !canCreateVouchers) {
            throw new Error("You don't have permission to create vouchers");
         }
         if (voucherType === "payment") {
            if (!data.date) {
               throw new Error("Date is required");
            }
            // Validate required fields based on to_type
            if (data.toType === "Customer" && !data.toCustomerId) {
               throw new Error("Customer is required when To Type is Customer");
            }
            if (data.toType === "Agent" && !data.toAgentId) {
               throw new Error("Agent is required when To Type is Agent");
            }
            if (data.toType === "Employee" && !data.toEmployeeId) {
               throw new Error("Employee is required when To Type is Employee");
            }
            if (data.toType === "Bank" && !data.toAccountId) {
               throw new Error("Bank Account is required when To Type is Bank");
            }
            if (data.toType === "Other" && !data.toEntityName) {
               throw new Error("Entity Name is required when To Type is Other");
            }
            const paymentData = {
               voucher_date: data.date.toISOString().split("T")[0],
               from_type: data.fromType || "Cash",
               from_account_id: data.fromAccountId
                  ? Number(data.fromAccountId)
                  : undefined,
               to_type: data.toType || "Other",
               to_customer_id:
                  data.toType === "Customer" && data.toCustomerId
                     ? Number(data.toCustomerId)
                     : undefined,
               to_agent_id:
                  data.toType === "Agent" && data.toAgentId
                     ? Number(data.toAgentId)
                     : undefined,
               to_employee_id:
                  data.toType === "Employee" && data.toEmployeeId
                     ? Number(data.toEmployeeId)
                     : undefined,
               to_account_id:
                  data.toType === "Bank" && data.toAccountId
                     ? Number(data.toAccountId)
                     : undefined,
               to_entity_name:
                  data.toType === "Other"
                     ? data.toEntityName || undefined
                     : undefined,
               expense_type_id:
                  data.expenseTypeId &&
                  String(data.expenseTypeId).trim() &&
                  !isNaN(Number(data.expenseTypeId)) &&
                  Number(data.expenseTypeId) > 0
                     ? Number(data.expenseTypeId)
                     : undefined,
               amount: data.amount,
               commission: data.commission || undefined,
               tax_type: data.taxType || undefined,
               tax_rate: data.taxRate || undefined,
               currency: data.currency || undefined,
               payment_method: data.paymentMethod || undefined,
               bank_name: data.bankName || undefined,
               transaction_details: data.transactionDetails || undefined,
               remarks: data.remarks || undefined,
               status: data.status || "Draft",
            };

            if (selectedVoucherId) {
               await updatePayment.mutateAsync({
                  id: selectedVoucherId,
                  payload: paymentData,
               });
            } else {
               await createPayment.mutateAsync(paymentData);
            }
         } else {
            // voucherType === "receipt"
            if (!data.date) {
               throw new Error("Date is required");
            }
            if (!data.toAccountId) {
               throw new Error("To Account is required");
            }
            if (!data.incomeTypeId) {
               throw new Error("Income Type is required");
            }
            const receiptData = {
               receipt_date: data.date.toISOString().split("T")[0],
               from_type: data.fromType || undefined,
               from_customer_id: data.fromCustomerId
                  ? Number(data.fromCustomerId)
                  : undefined,
               from_agent_id: data.fromAgentId
                  ? Number(data.fromAgentId)
                  : undefined,
               from_entity_name: data.fromEntityName || undefined,
               to_account_id: Number(data.toAccountId),
               income_type_id: Number(data.incomeTypeId),
               amount: data.amount,
               tax_amount: data.taxAmount || undefined,
               bank_commission: data.bankCommission || undefined,
               currency: data.currency || undefined,
               payment_method: data.paymentMethod || undefined,
               reference_number: data.referenceNumber || undefined,
               bank_name: data.bankName || undefined,
               transaction_details: data.transactionDetails || undefined,
               remarks: data.remarks || undefined,
            };

            if (selectedVoucherId) {
               await updateReceipt.mutateAsync({
                  id: selectedVoucherId,
                  payload: receiptData,
               });
            } else {
               await createReceipt.mutateAsync(receiptData);
            }
         }
         setIsAddVoucherOpen(false);
         setSelectedVoucherId(null);
      } catch (error) {
         console.error("Error creating/updating voucher:", error);
      }
   };

   // Transform detail data for drawer
   const selectedVoucherForDrawer = useMemo(() => {
      const mapStatusToDrawer = (status: string): "active" | "inactive" => {
         const activeStatuses = [
            "Draft",
            "Pending_Approval",
            "Approved",
            "Active",
         ];
         return activeStatuses.includes(status) ? "active" : "inactive";
      };

      if (selectedVoucherType === "payment" && selectedPaymentVoucher) {
         const paymentTo =
            selectedPaymentVoucher.to_type === "Customer"
               ? selectedPaymentVoucher.to_customer?.customer_name
               : selectedPaymentVoucher.to_type === "Agent"
                 ? selectedPaymentVoucher.to_agent?.agent_name
                 : selectedPaymentVoucher.to_type === "Employee"
                   ? selectedPaymentVoucher.to_employee?.name ||
                     `${selectedPaymentVoucher.to_employee?.first_name || ""} ${
                        selectedPaymentVoucher.to_employee?.last_name || ""
                     }`.trim()
                   : selectedPaymentVoucher.to_type === "Bank"
                     ? selectedPaymentVoucher.to_account?.account_name
                     : selectedPaymentVoucher.to_type === "Other"
                       ? selectedPaymentVoucher.to_entity_name
                       : selectedPaymentVoucher.to_customer?.customer_name ||
                         selectedPaymentVoucher.to_agent?.agent_name ||
                         selectedPaymentVoucher.to_account?.account_name ||
                         selectedPaymentVoucher.to_employee?.name ||
                         selectedPaymentVoucher.to_entity_name;

         return {
            id: String(selectedPaymentVoucher.voucher_id),
            paymentCode: selectedPaymentVoucher.voucher_code,
            from: selectedPaymentVoucher.from_account?.account_name || "-",
            to: paymentTo || "-",
            dateCreated: selectedPaymentVoucher.created_at,
            voucherDate: selectedPaymentVoucher.voucher_date,
            amount: selectedPaymentVoucher.amount,
            currency: selectedPaymentVoucher.currency,
            status: mapStatusToDrawer(selectedPaymentVoucher.status),
            statusLabel: selectedPaymentVoucher.status,
            type: "payment" as const,
            expenseType: selectedPaymentVoucher.expense_type?.type_name,
            paymentMethod: selectedPaymentVoucher.payment_method,
            remarks: selectedPaymentVoucher.remarks,
            customerName: selectedPaymentVoucher.to_customer?.customer_name,
            commission: selectedPaymentVoucher.commission,
            tax: selectedPaymentVoucher.tax_amount,
            linkedInvoices: selectedPaymentVoucher.linked_invoices?.map(
               (inv) => ({
                  invoiceNumber: inv.invoice_code,
                  pending: 0,
                  pay: inv.payment_amount,
               }),
            ),
         };
      } else if (selectedVoucherType === "receipt" && selectedReceiptVoucher) {
         const receiptFrom =
            selectedReceiptVoucher.from_type === "Customer"
               ? selectedReceiptVoucher.from_customer?.customer_name
               : selectedReceiptVoucher.from_type === "Agent"
                 ? selectedReceiptVoucher.from_agent?.name ||
                   selectedReceiptVoucher.from_agent?.agent_code
                 : selectedReceiptVoucher.from_type === "Other"
                   ? selectedReceiptVoucher.from_entity_name
                   : selectedReceiptVoucher.from_customer?.customer_name ||
                     selectedReceiptVoucher.from_agent?.name ||
                     selectedReceiptVoucher.from_entity_name;

         return {
            id: String(selectedReceiptVoucher.receipt_id),
            paymentCode: selectedReceiptVoucher.receipt_code,
            from: receiptFrom || "-",
            to: selectedReceiptVoucher.to_account?.account_name || "-",
            dateCreated: selectedReceiptVoucher.created_at,
            voucherDate: selectedReceiptVoucher.receipt_date,
            amount: selectedReceiptVoucher.amount,
            totalAmount: selectedReceiptVoucher.total_amount,
            currency: selectedReceiptVoucher.currency,
            status: mapStatusToDrawer(selectedReceiptVoucher.status),
            statusLabel: selectedReceiptVoucher.status,
            type: "receipt" as const,
            incomeType: selectedReceiptVoucher.income_type?.type_name,
            paymentMethod: selectedReceiptVoucher.payment_method,
            remarks: selectedReceiptVoucher.remarks,
            referenceNumber: selectedReceiptVoucher.reference_number,
            bankName: selectedReceiptVoucher.bank_name,
            transactionDetails: selectedReceiptVoucher.transaction_details,
            commission: selectedReceiptVoucher.bank_commission,
            tax: selectedReceiptVoucher.tax_amount,
            linkedInvoices: selectedReceiptVoucher.linked_invoices?.map(
               (inv) => ({
                  invoiceNumber: inv.invoice_code,
                  pending: inv.receivable_amount,
                  pay: inv.payable_amount,
               }),
            ),
         };
      }
      return null;
   }, [selectedVoucherType, selectedPaymentVoucher, selectedReceiptVoucher]);

   const isLoading =
      activeTab === "payment"
         ? isLoadingPayments || isFetchingPayments
         : isLoadingReceipts || isFetchingReceipts;

   const isDetailsLoading =
      selectedVoucherType === "payment"
         ? isLoadingPaymentVoucher
         : isLoadingReceiptVoucher;

   const isVoucherLoading =
      isAddVoucherOpen &&
      selectedVoucherId !== null &&
      ((selectedVoucherType === "payment" && isLoadingPaymentVoucher) ||
         (selectedVoucherType === "receipt" && isLoadingReceiptVoucher));

   const isSubmitting =
      createPayment.isPending ||
      updatePayment.isPending ||
      createReceipt.isPending ||
      updateReceipt.isPending;
   const isTableFetching =
      activeTab === "payment" ? isFetchingPayments : isFetchingReceipts;

   const totalCount = activeTab === "payment" ? paymentTotal : receiptTotal;
   // Calculate page count manually
   const totalPages = Math.ceil(totalCount / pageSize);

   if (!canAccessVouchers) {
      return (
         <div className="p-6">
            <NoPermissionMessage
               message={t("permissions.noAccess.title", "Access Restricted")}
               description={t(
                  "permissions.noAccess.message",
                  "You don't have permission to access the vouchers module.",
               )}
            />
         </div>
      );
   }

   return (
      <>
         <VouchersToolbar
            activeTab={activeTab}
            onTabChange={(tab) => setSearchParams({ tab }, { replace: false })}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSortChange={handleSortChange}
            onAddVoucherClick={handleAddVoucherClick}
            onFiltersApply={handleFiltersApply}
            filterProps={{
               activeTab,
               accountOptions,
               customerOptions,
               agentOptions,
            }}
            exportData={tableData}
            rawData={activeTab === "payment" ? paymentData : receiptData}
            rawDataIdField={
               activeTab === "payment" ? "voucher_id" : "receipt_id"
            }
         />

         <LoadingOverlay isLoading={isVoucherLoading || isSubmitting} />

         {!canViewVouchers ? (
            <NoPermissionMessage
               message={t(
                  "permissions.noReadAccess.title",
                  "Access Restricted",
               )} // Fallback string provided directly
               description={`${t(
                  "permissions.noReadAccess.message",
                  "You don't have permission to view vouchers.",
               )} (Missing: ${formatPermissionName("view_vouchers")})`}
               className="mt-12"
            />
         ) : (
            <>
               {/* Table Logic */}
               {isLoading ? (
                  <LoadingState size="large" label={t("vouchers.loading")} />
               ) : isTableFetching ? (
                  <LoadingState size="small" label={t("vouchers.loading")} />
               ) : (activeTab === "payment" && paymentError) ||
                 (activeTab === "receipt" && receiptError) ? (
                  (activeTab === "payment" &&
                     (paymentError as any)?.response?.status === 403) ||
                  (activeTab === "receipt" &&
                     (receiptError as any)?.response?.status === 403) ? (
                     <NoPermissionMessage
                        message={t(
                           "permissions.noReadAccess.title",
                           "Access Restricted",
                        )}
                        description={`${t(
                           "permissions.noReadAccess.message",
                           "You don't have permission to view vouchers.",
                        )} (Missing: ${formatPermissionName("view_vouchers")})`}
                        className="mt-12"
                     />
                  ) : (
                     <div className="flex items-center justify-center py-12">
                        <p className="text-danger">
                           {t("vouchers.errorLoading") ||
                              "Failed to load vouchers"}
                        </p>
                     </div>
                  )
               ) : (
                  <VouchersTable
                     data={tableData}
                     onViewDetails={handleViewDetails}
                     onApprove={
                        canApproveVouchers ? handleApproveClick : undefined
                     }
                     onDelete={
                        canDeleteVouchers ? handleDeleteClick : undefined
                     }
                     pageCount={totalPages}
                     pagination={{ pageIndex: page - 1, pageSize }}
                     onPaginationChange={handlePaginationChange}
                  />
               )}

               {(canCreateVouchers || canUpdateVouchers) && (
                  <AddPaymentVoucherModal
                     isOpen={isAddVoucherOpen && !isVoucherLoading}
                     onClose={() => {
                        setIsAddVoucherOpen(false);
                        setSelectedVoucherId(null);
                     }}
                     onSubmit={handleVoucherSubmit}
                     voucherType={
                        selectedVoucherId !== null
                           ? selectedVoucherType
                           : activeTab
                     }
                     voucher={
                        selectedVoucherType === "payment" &&
                        selectedPaymentVoucher
                           ? selectedPaymentVoucher
                           : selectedVoucherType === "receipt" &&
                               selectedReceiptVoucher
                             ? selectedReceiptVoucher
                             : null
                     }
                  />
               )}

               <VoucherDetailsDrawer
                  isOpen={isDetailsOpen}
                  onClose={() => setIsDetailsOpen(false)}
                  voucher={selectedVoucherForDrawer}
                  isLoading={isDetailsLoading}
                  voucherIndex={getCurrentVoucherIndex() + 1}
                  totalVouchers={tableData.length}
                  onNavigateNext={
                     getCurrentVoucherIndex() < tableData.length - 1
                        ? handleNavigateNext
                        : undefined
                  }
                  onNavigatePrev={
                     getCurrentVoucherIndex() > 0
                        ? handleNavigatePrev
                        : undefined
                  }
                  onApprove={
                     canApproveVouchers ? handleApproveFromDrawer : undefined
                  }
               />

               {canDeleteVouchers && (
                  <ConfirmModal
                     isOpen={isDeleteModalOpen}
                     onClose={() => setIsDeleteModalOpen(false)}
                     onConfirm={handleConfirmDelete}
                     title={t("vouchers.deleteModal.title")}
                     description={t("vouchers.deleteModal.message")}
                     confirmText={t("vouchers.deleteModal.confirmButton")}
                     cancelText={t("vouchers.deleteModal.cancelButton")}
                     variant="error"
                     icon="exclamation"
                  />
               )}

               {canApproveVouchers && (
                  <>
                     <ConfirmModal
                        isOpen={isConfirmModalOpen}
                        onClose={() => setIsConfirmModalOpen(false)}
                        onConfirm={handleConfirmAction}
                        title="Approve Voucher"
                        description="Are you sure you want to approve this voucher? This action cannot be undone."
                        confirmText="Approve"
                        cancelText="Close"
                        variant="primary"
                        icon="info"
                     />
                     <ConfirmModal
                        isOpen={isErrorModalOpen}
                        onClose={() => {
                           setIsErrorModalOpen(false);
                           setErrorMessage("");
                        }}
                        onConfirm={() => {
                           setIsErrorModalOpen(false);
                           setErrorMessage("");
                        }}
                        title={t("vouchers.errorModal.title") || "Error"}
                        description={errorMessage}
                        confirmText={t("vouchers.errorModal.okButton") || "OK"}
                        variant="error"
                        icon="exclamation"
                     />
                  </>
               )}
            </>
         )}
      </>
   );
}

export default VouchersContent;
