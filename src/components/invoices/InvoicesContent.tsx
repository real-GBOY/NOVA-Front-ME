/** @format */

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { PaginationState, Updater } from "@tanstack/react-table";
import KPICard from "@/designSystem/KPICard";
import LoadingState from "@/designSystem/LoadingState";
import { formatPermissionName } from "@/utilities/permissionFormatters";
import {
   CheckCircle,
   ClockTwo,
   Draft,
   InvoiceDollar,
   MinusCircle,
   ReceiptDollar,
   TotalInvoices,
   WalletClock,
} from "@/Icons";
import InvoicesTable from "./InvoicesTable";
import InvoicesToolbar, { type InvoiceTab } from "./ui/InvoicesToolbar";
import type { Invoice, InvoiceItem } from "./data";
import CreateInvoiceModal from "./CreateInvoiceModal";
import InvoiceDetailsDrawer from "./InvoiceDetailsDrawer";
import ConfirmModal from "@/designSystem/ConfirmModal";
import RecordPaymentModal from "./RecordPaymentModal";
import BulkPaymentModal from "./BulkPaymentModal";
import VoidInvoiceModal from "./VoidInvoiceModal";
import {
   useInvoiceStats,
   useListInvoices,
   useDeleteInvoice,
   useCreateInvoice,
   useUpdateInvoice,
   useGetInvoiceById,
   useRecordPayment,
   useChangeInvoiceStatus,
   useVoidInvoice,
   useBulkRecordPayments,
} from "@/hooks/invoices/useInvoices";
import type { InvoiceFormData } from "@/utilities/schemas/invoiceSchema";
import type { InvoiceService as InvoiceServiceType } from "@/utilities/schemas/invoiceSchema";
import type { CreateInvoiceRequest } from "@/services/invoiceService";
import { useTranslation } from "@/hooks/useTranslation";
import { useListCustomers } from "@/hooks/customers/useCustomers";
import toast from "@/utilities/toast";
import { formatCurrency } from "@/utilities/i18n";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import FloatingActionBar from "@/designSystem/FloatingActionBar";
import DirhamLabel from "@/designSystem/DirhamLabel";

import { useTableFilter } from "@/hooks/table";
import type { InvoicesFilters } from "./InvoicesFilterDropdown";
import { useDebounce } from "@/hooks/useDebounce";

function InvoicesContent() {
   const { t } = useTranslation("settings");
   const [searchParams, setSearchParams] = useSearchParams();
   const tabParam = searchParams.get("tab");
   const { can } = usePermissions();
   const canViewInvoices = can("view_invoices");
   const canCreateInvoice = can("create_invoice");
   const canUpdateInvoice = can("update_invoice");
   const canDeleteInvoice = can("delete_invoice");
   const canManagePayments = can("manage_invoice_payments");

   const canAccessInvoices =
      canViewInvoices ||
      canCreateInvoice ||
      canUpdateInvoice ||
      canDeleteInvoice ||
      canManagePayments;

   // Map URL tab query param to InvoiceTab, default to "all"
   const activeTab: InvoiceTab =
      tabParam === "all"
         ? "all"
         : tabParam === "draft"
         ? "draft"
         : tabParam === "pending"
         ? "pending"
         : tabParam === "partially_paid"
         ? "partially_paid"
         : tabParam === "fully_paid"
         ? "fully_paid"
         : tabParam === "cancelled"
         ? "cancelled"
         : tabParam === "void"
         ? "void"
         : "all";

   // Set default tab query param if not specified
   useEffect(() => {
      if (!tabParam) {
         setSearchParams({ tab: "all" }, { replace: true });
      }
   }, [tabParam, setSearchParams]);

   const [searchInput, setSearchInput] = useState("");
   const debouncedSearch = useDebounce(searchInput.trim(), 400);
   const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(12);
   const [sortBy, setSortBy] = useState<string>("created_at");
   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

   // State for details and delete actions
   const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
   const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(
      null
   );
   const [isDetailsOpen, setIsDetailsOpen] = useState(false);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

   // State for payment and status change modals
   const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
   const [invoiceForPayment, setInvoiceForPayment] = useState<Invoice | null>(
      null
   );
   const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
   const [statusChangeAction, setStatusChangeAction] = useState<{
      invoice: Invoice;
      newStatus: string;
   } | null>(null);

   // State for bulk payment selection/modals
   const [selectedInvoices, setSelectedInvoices] = useState<Invoice[]>([]);
   const [selectionResetSignal, setSelectionResetSignal] = useState(0);
   const [isBulkPaymentModalOpen, setIsBulkPaymentModalOpen] = useState(false);
   const [bulkPaymentInvoices, setBulkPaymentInvoices] = useState<Invoice[]>(
      []
   );

   // State for voiding invoices
   const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
   const [invoiceForVoid, setInvoiceForVoid] = useState<Invoice | null>(null);

   // State for editing invoices
   const [editInvoiceId, setEditInvoiceId] = useState<number | null>(null);

   // Filter Integration
   const { filters, updateFilters } = useTableFilter<InvoicesFilters>();

   const handleFiltersApply = (newFilters: InvoicesFilters) => {
      updateFilters(newFilters);
      setPage(1);
   };

   // Map tab to status filter (backend uses: Draft, Pending, Partially_Paid, Fully_Paid, Cancelled, Void)
   const statusFilter = useMemo(() => {
      if (filters.status && filters.status.length > 0) return filters.status;
      if (activeTab === "all") return undefined;
      if (activeTab === "draft") return "Draft";
      if (activeTab === "pending") return "Pending";
      if (activeTab === "partially_paid") return "Partially_Paid";
      if (activeTab === "fully_paid") return "Fully_Paid";
      if (activeTab === "cancelled") return "Cancelled";
      if (activeTab === "void") return "Void";
      return undefined;
   }, [activeTab, filters.status]);

   useEffect(() => {
      setPage(1);
   }, [activeTab, debouncedSearch, filters]);

   // Fetch invoice stats from backend
   const { data: stats } = useInvoiceStats(undefined, {
      enabled: canViewInvoices,
   });

   // Fetch customers for invoice creation (to get customer details like TRN, contact, address)
   const { data: customersData } = useListCustomers(
      { page: 1, limit: 100 },
      {
         enabled:
            canViewInvoices && (can("read_customer") || isCreateInvoiceOpen),
      }
   );

   const isInvoiceSearch = useMemo(() => {
      if (!debouncedSearch) return false;
      const normalized = debouncedSearch.toLowerCase();
      return /^[0-9]+$/.test(normalized) || normalized.includes("inv");
   }, [debouncedSearch]);

   const { data: searchedCustomers, isLoading: isSearchingCustomers } =
      useListCustomers(
      isInvoiceSearch || !debouncedSearch
         ? undefined
         : { page: 1, limit: 50, search: debouncedSearch },
      {
         enabled:
            canViewInvoices &&
            !isInvoiceSearch &&
            Boolean(debouncedSearch) &&
            can("read_customer"),
      }
   );

   const searchedCustomerIds = useMemo(
      () =>
         (searchedCustomers?.data || [])
            .map((customer) => Number(customer.customer_id ?? customer.id))
            .filter((value) => Number.isFinite(value)),
      [searchedCustomers]
   );

   // Fetch invoices list for table (with filters and pagination)
   const shouldUseSearch =
      isInvoiceSearch ||
      (Boolean(debouncedSearch) &&
         !isInvoiceSearch &&
         !isSearchingCustomers &&
         searchedCustomerIds.length === 0);

   const {
      data: invoicesResponse,
      isLoading: invoicesLoading,
      error: invoicesError,
   } = useListInvoices(
      {
         page,
         limit: pageSize,
         search: shouldUseSearch ? debouncedSearch || undefined : undefined,
         status: statusFilter,
         sort_by: sortBy,
         sort_order: sortOrder,
         // Add filters
         date_from: filters.dateFrom,
         date_to: filters.dateTo,
         customer_id: filters.customerId
            ? Number(filters.customerId)
            : searchedCustomerIds.length > 0
            ? searchedCustomerIds
            : undefined,
         agent_id: filters.agentId ? Number(filters.agentId) : undefined,
      },
      { enabled: canViewInvoices }
   );

   const shouldLoadInvoiceDetails = isDetailsOpen && !!selectedInvoiceId;
   const { data: detailedInvoice, isLoading: isLoadingInvoiceDetails } =
      useGetInvoiceById(shouldLoadInvoiceDetails ? selectedInvoiceId : 0, {
         enabled: canViewInvoices && shouldLoadInvoiceDetails,
         include_items: true,
         include_history: true,
      });

   const invoiceForDrawer = detailedInvoice || selectedInvoice;

   const shouldLoadEditDetails = isCreateInvoiceOpen && !!editInvoiceId;
   const { data: editInvoiceDetails, isLoading: isLoadingEditDetails } =
      useGetInvoiceById(shouldLoadEditDetails ? editInvoiceId : 0, {
         enabled: canViewInvoices && shouldLoadEditDetails,
         include_items: true,
      });

   const invoiceForModal = shouldLoadEditDetails
      ? editInvoiceDetails || selectedInvoice
      : null;

   // Create mutation
   const createInvoice = useCreateInvoice();

   // Update mutation
   const updateInvoice = useUpdateInvoice();

   const isSavingInvoice = createInvoice.isPending || updateInvoice.isPending;
   const isModalLoading = isSavingInvoice || isLoadingEditDetails;
   const modalLoadingMessage = isSavingInvoice
      ? "Saving invoice..."
      : "Loading invoice...";

   // Delete mutation
   const deleteInvoice = useDeleteInvoice();

   const handleSortChange = (optionId: string) => {
      // Map sort option to backend sort_by
      // Backend accepts: invoice_code, invoice_date, total_amount, status, created_at, updated_at
      const sortMap: Record<
         string,
         { sort_by: string; sort_order: "asc" | "desc" }
      > = {
         dateCreated: { sort_by: "created_at", sort_order: "desc" },
         lastUpdated: { sort_by: "updated_at", sort_order: "desc" },
         amountHigh: { sort_by: "total_amount", sort_order: "desc" },
         amountLow: { sort_by: "total_amount", sort_order: "asc" },
      };

      const sortConfig = sortMap[optionId];
      if (sortConfig) {
         setSortBy(sortConfig.sort_by);
         setSortOrder(sortConfig.sort_order);
         setPage(1);
      }
   };

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

   const blockedBulkStatuses = new Set([
      "Fully_Paid",
      "Cancelled",
      "Void",
   ]);

   const getInvoiceId = (invoice: Invoice) => invoice.invoice_id || invoice.id;
   const normalizeCustomerId = (
      value: string | number | null | undefined
   ): string | null => {
      if (value === null || value === undefined) return null;
      if (typeof value === "number") {
         return Number.isFinite(value) && value > 0 ? String(value) : null;
      }
      const trimmed = value.trim();
      if (!trimmed) return null;
      const lowered = trimmed.toLowerCase();
      if (["null", "undefined", "nan"].includes(lowered)) return null;
      if (/^\d+$/.test(trimmed)) {
         const numeric = Number(trimmed);
         return numeric > 0 ? String(numeric) : null;
      }
      return trimmed;
   };
   const getCustomerId = (invoice: Invoice) =>
      normalizeCustomerId(invoice.customer_id ?? invoice.customer?.customer_id);

   const handleAddInvoiceClick = () => {
      setSelectedInvoice(null);
      setEditInvoiceId(null);
      setIsCreateInvoiceOpen(true);
   };

   const handleViewDetails = (invoice: Invoice) => {
      setSelectedInvoice(invoice);
      const possibleId = invoice.invoice_id ?? invoice.id;
      const normalizedId =
         typeof possibleId === "number" ? possibleId : Number(possibleId);
      setSelectedInvoiceId(
         normalizedId && !Number.isNaN(normalizedId) ? normalizedId : null
      );
      setIsDetailsOpen(true);
   };

   const handleEditInvoice = (invoice: Invoice) => {
      setSelectedInvoice(invoice);
      const possibleId = getInvoiceId(invoice);
      const normalizedId =
         typeof possibleId === "number" ? possibleId : Number(possibleId);
      setEditInvoiceId(
         normalizedId && !Number.isNaN(normalizedId) ? normalizedId : null
      );
      setIsCreateInvoiceOpen(true);
   };

   // Handle navigation to next/previous invoice
   const handleNavigateInvoice = (invoice: Invoice) => {
      handleViewDetails(invoice);
   };

   // Drawer action handlers
   const handleEditFromDrawer = (invoice: Invoice) => {
      setIsDetailsOpen(false);
      setSelectedInvoiceId(null);
      handleEditInvoice(invoice);
   };

   const handleVoidFromDrawer = (invoice: Invoice) => {
      setIsDetailsOpen(false);
      setSelectedInvoiceId(null);
      handleVoidInvoice(invoice);
   };

   const handleDeleteFromDrawer = (invoice: Invoice) => {
      setIsDetailsOpen(false);
      setSelectedInvoiceId(null);
      handleDeleteClick(invoice);
   };

   // Creation modal action handlers
   const handleEditFromCreateModal = (invoice: Invoice) => {
      // Close current modal and reopen with edit mode
      setIsCreateInvoiceOpen(false);
      setSelectedInvoice(null);
      setEditInvoiceId(null);
      // Use setTimeout to let the modal close first
      setTimeout(() => {
         handleEditInvoice(invoice);
      }, 100);
   };

   const handleCancelFromCreateModal = async (invoiceId: number | string) => {
      await changeStatusMutation.mutateAsync({
         id: invoiceId,
         payload: { status: "Cancelled" },
      });
      toast.success("Invoice cancelled successfully");
   };

   const handleDeleteClick = (invoice: Invoice) => {
      setSelectedInvoice(invoice);
      setIsDeleteModalOpen(true);
   };

   const handleConfirmDelete = async () => {
      if (selectedInvoice) {
         try {
            // Use invoice_id if available, otherwise fall back to id (backward compatibility)
            const invoiceId = selectedInvoice.invoice_id || selectedInvoice.id;
            if (invoiceId) {
               await deleteInvoice.mutateAsync(invoiceId);
               toast.success(t("invoices.toast.deleteSuccess"));
               setIsDeleteModalOpen(false);
               setSelectedInvoice(null);
            }
         } catch (error) {
            console.error("Error deleting invoice:", error);
            toast.error(t("invoices.toast.deleteError"));
         }
      }
   };

   const handleRowSelectionChange = useCallback(
      (rows: Invoice[]) => {
         setSelectedInvoices(rows);
      },
      [setSelectedInvoices]
   );

   // Record payment mutation
   const recordPaymentMutation = useRecordPayment();

   // Change status mutation
   const changeStatusMutation = useChangeInvoiceStatus();

   // Void invoice mutation
   const voidInvoiceMutation = useVoidInvoice();

   // Bulk payment mutation
   const bulkPaymentMutation = useBulkRecordPayments();

   // Handlers for payment and status
   const handleRecordPayment = (invoice: Invoice) => {
      setInvoiceForPayment(invoice);
      setIsPaymentModalOpen(true);
   };

   const handleSubmitPayment = async (paymentData: {
      amount: number;
      payment_date: string;
      payment_method?: string;
      account_id?: number;
      reference_number?: string;
      remarks?: string;
   }) => {
      if (!invoiceForPayment) return;
      try {
         const invoiceId = invoiceForPayment.invoice_id || invoiceForPayment.id;
         await recordPaymentMutation.mutateAsync({
            invoiceId: invoiceId as string | number,
            payload: {
               amount: paymentData.amount,
               payment_date: paymentData.payment_date,
               payment_method: paymentData.payment_method,
               account_id: paymentData.account_id,
               reference: paymentData.reference_number,
               notes: paymentData.remarks,
            },
         });
         toast.success("Payment recorded successfully");
         setIsPaymentModalOpen(false);
         setInvoiceForPayment(null);
      } catch (error) {
         console.error("Error recording payment:", error);
         toast.error("Failed to record payment");
      }
   };

   const handleOpenBulkPayment = (invoices?: Invoice[]) => {
      const targetInvoices =
         invoices && invoices.length > 0 ? invoices : selectedInvoices;
      if (targetInvoices.length === 0) {
         toast.error(
            t(
               "invoices.bulkPaymentModal.errors.noSelection",
               "Select at least one invoice to apply a bulk payment."
            )
         );
         return;
      }

      const customerIdValues = targetInvoices.map((invoice) =>
         getCustomerId(invoice)
      );
      if (customerIdValues.some((id) => !id)) {
         toast.error(
            t(
               "invoices.bulkPaymentModal.errors.missingCustomer",
               "Some selected invoices are missing customer information."
            )
         );
         return;
      }
      const customerIds = new Set(customerIdValues.map((id) => String(id)));
      if (customerIds.size !== 1) {
         toast.error(
            t(
               "invoices.bulkPaymentModal.errors.multiCustomer",
               "Bulk payments must be applied to invoices for a single customer."
            )
         );
         return;
      }

      const invalidStatusInvoices = targetInvoices.filter((invoice) =>
         blockedBulkStatuses.has(invoice.status)
      );
      if (invalidStatusInvoices.length > 0) {
         toast.error(
            t(
               "invoices.bulkPaymentModal.errors.invalidStatus",
               "Selected invoices include statuses that cannot receive payments."
            )
         );
         return;
      }

      const validInvoices = targetInvoices.filter((invoice) =>
         Boolean(getInvoiceId(invoice))
      );
      if (validInvoices.length === 0) {
         toast.error(
            t(
               "invoices.bulkPaymentModal.errors.noValidInvoices",
               "No valid invoices selected for bulk payment."
            )
         );
         return;
      }

      setBulkPaymentInvoices(validInvoices);
      setIsBulkPaymentModalOpen(true);
   };

   const handleSubmitBulkPayment = async (paymentData: {
      amount: number;
      payment_date: string;
      payment_method?: string;
      account_id?: number;
      reference_number?: string;
      remarks?: string;
   }) => {
      if (bulkPaymentInvoices.length === 0) return;
      try {
         const customerId = getCustomerId(bulkPaymentInvoices[0]);
         if (!customerId) {
            toast.error(
               t(
                  "invoices.bulkPaymentModal.errors.unknownCustomer",
                  "Unable to determine customer for bulk payment."
               )
            );
            return;
         }

         const invoiceEntries = bulkPaymentInvoices
            .map((invoice) => ({
               id: getInvoiceId(invoice),
               due: Number(
                  invoice.balance_due ?? invoice.remaining_amount ?? 0
               ),
            }))
            .filter((entry) => entry.id);

         const invoiceIds = invoiceEntries
            .sort(
               (a, b) =>
                  (Number.isNaN(a.due) ? 0 : a.due) -
                  (Number.isNaN(b.due) ? 0 : b.due)
            )
            .map((entry) => entry.id as string | number);
         if (invoiceIds.length === 0) {
            toast.error(
               t(
                  "invoices.bulkPaymentModal.errors.noValidInvoices",
                  "No valid invoices selected for bulk payment."
               )
            );
            return;
         }

         await bulkPaymentMutation.mutateAsync({
            customer_id: customerId,
            invoice_ids: invoiceIds,
            amount: paymentData.amount,
            payment_date: paymentData.payment_date,
            payment_method: paymentData.payment_method,
            account_id: paymentData.account_id,
            reference_number: paymentData.reference_number,
            remarks: paymentData.remarks,
         });
         toast.success(
            t(
               "invoices.toast.bulkPaymentSuccess",
               "Bulk payment recorded successfully"
            )
         );
         setIsBulkPaymentModalOpen(false);
         setBulkPaymentInvoices([]);
         setSelectedInvoices([]);
         setSelectionResetSignal((prev) => prev + 1);
      } catch (error) {
         console.error("Error recording bulk payment:", error);
         toast.error(
            t(
               "invoices.toast.bulkPaymentError",
               "Failed to record bulk payment"
            )
         );
      }
   };

   const handleVoidInvoice = (invoice: Invoice) => {
      setInvoiceForVoid(invoice);
      setIsVoidModalOpen(true);
   };

   const handleConfirmVoidInvoice = async (payload: { note: string }) => {
      if (!invoiceForVoid) return;
      try {
         const invoiceId = getInvoiceId(invoiceForVoid);
         if (!invoiceId) return;
         await voidInvoiceMutation.mutateAsync({
            id: invoiceId as string | number,
            payload,
         });
         toast.success(
            t("invoices.toast.voidSuccess", "Invoice voided successfully")
         );
         setIsVoidModalOpen(false);
         setInvoiceForVoid(null);
      } catch (error) {
         console.error("Error voiding invoice:", error);
         toast.error(t("invoices.toast.voidError", "Failed to void invoice"));
      }
   };

   const renderBulkPaymentBar = useCallback(
      (selectedCount: number, rows: Invoice[]) => (
         <FloatingActionBar
            selectedCount={selectedCount}
            selectedLabel={t(
               "invoices.bulkPayment.selectedLabel",
               "Invoices selected"
            )}
            actions={[
               {
                  id: "bulk-payment",
                  label: t("invoices.actions.bulkPayment"),
                  icon: <ReceiptDollar size={16} className="fill-primary" />,
                  onClick: () => handleOpenBulkPayment(rows),
               },
            ]}
         />
      ),
      [t, handleOpenBulkPayment]
   );

   const handleCancelInvoice = (invoice: Invoice) => {
      setStatusChangeAction({ invoice, newStatus: "Cancelled" });
      setIsStatusModalOpen(true);
   };

   const handleMarkAsPending = (invoice: Invoice) => {
      setStatusChangeAction({ invoice, newStatus: "Pending" });
      setIsStatusModalOpen(true);
   };


   const handleConfirmStatusChange = async () => {
      if (!statusChangeAction) return;
      try {
         const invoiceId =
            statusChangeAction.invoice.invoice_id ||
            statusChangeAction.invoice.id;
         await changeStatusMutation.mutateAsync({
            id: invoiceId as string | number,
            payload: { status: statusChangeAction.newStatus as any },
         });
         toast.success(
            `Invoice status changed to ${statusChangeAction.newStatus.replace(
               "_",
               " "
            )}`
         );
         setIsStatusModalOpen(false);
         setStatusChangeAction(null);
      } catch (error) {
         console.error("Error changing status:", error);
         toast.error("Failed to change invoice status");
      }
   };

   // Transform form data and services to API format
   const transformToApiFormat = (
      formData: InvoiceFormData,
      services: InvoiceServiceType[],
      status: "Draft" | "Pending" = "Draft",
      customersData?: {
         customer_id: string | number;
         customer_name?: string;
         trn?: string;
         contact_number?: string;
         email?: string;
         address?: string;
      }[]
   ): CreateInvoiceRequest => {
      // Invoice date is today's date
      const invoiceDate = new Date().toISOString().split("T")[0];

      const items = services.map((service) => {
         // Always use the user-edited unitPrice value (service_id is only for reference/prefill)
         const unitPrice = parseFloat(service.unitPrice) || 0;
         const govFees = service.govFees ?? 0;
         const discount = parseFloat(service.discount) || 0;
         const taxRate = parseFloat(service.tax) || 0;
         const fineAmount = parseFloat(service.fine) || 0;

         // Calculate subtotal: unit_price + government_fee
         const subtotal = unitPrice + govFees;

         // Calculate discount amount
         const discountAmount =
            discount > 0
               ? service.discountType === "Percentage"
                  ? (subtotal * discount) / 100
                  : discount
               : 0;

         return {
            service_id: service.serviceId
               ? typeof service.serviceId === "string"
                  ? parseInt(service.serviceId)
                  : service.serviceId
               : undefined,
            service_name: service.service,
            unit_price: unitPrice,
            government_fee: govFees,
            service_charge: 0,
            quantity: 1,
            discount_type:
               discount > 0
                  ? service.discountType || ("Percentage" as const)
                  : undefined,
            discount_value: discount > 0 ? discount : undefined,
            tax_rate: taxRate > 0 ? taxRate : undefined,
            fine_amount: fineAmount > 0 ? fineAmount : undefined,
            assigned_employee_id: service.assignedEmployeeId
               ? typeof service.assignedEmployeeId === "string"
                  ? parseInt(service.assignedEmployeeId)
                  : service.assignedEmployeeId
               : undefined,
         };
      });

      // Extract customer_id and get customer details
      const customerId = parseInt(formData.customerName) || 0;
      const selectedCustomer = customersData?.find(
         (c) => String(c.customer_id) === String(customerId)
      );

      // Extract agent_id - only include if agent is selected
      const agentId = formData.agent ? parseInt(formData.agent) : undefined;
      const validAgentId = agentId && agentId > 0 ? agentId : undefined;

      return {
         token: formData.token || undefined,
         invoice_type: "Tax_Invoice",
         invoice_date: invoiceDate,
         due_date: invoiceDate,
         customer_id: customerId,
         customer_name: selectedCustomer?.customer_name || undefined,
         customer_trn:
            formData.customerTrn || selectedCustomer?.trn || undefined,
         customer_contact:
            formData.customerContact ||
            selectedCustomer?.contact_number ||
            undefined,
         customer_email:
            formData.customerEmail || selectedCustomer?.email || undefined,
         customer_address: selectedCustomer?.address || undefined,
         ...(validAgentId && { agent_id: validAgentId }),
         remarks: undefined, // Can be added as a separate field if needed
         internal_notes: formData.notes || undefined,
         status: status,
         items: items,
      };
   };

   // Transform services to UpdateInvoiceRequest items format
   const transformServicesToUpdateItems = (
      services: InvoiceServiceType[]
   ): Array<Omit<InvoiceItem, "id" | "total">> => {
      return services.map((service) => {
         // Always use the user-edited unitPrice value (service_id is only for reference/prefill)
         const unitPrice = parseFloat(service.unitPrice) || 0;
         const govFees = service.govFees ?? 0;
         const discount = parseFloat(service.discount) || 0;
         const taxRate = parseFloat(service.tax) || 0;
         const fineAmount = parseFloat(service.fine) || 0;

         return {
            service_id: service.serviceId
               ? typeof service.serviceId === "string"
                  ? parseInt(service.serviceId)
                  : service.serviceId
               : undefined,
            service_name: service.service,
            unit_price: unitPrice,
            government_fee: govFees,
            service_charge: 0,
            quantity: 1,
            discount_type:
               discount > 0
                  ? service.discountType || ("Percentage" as const)
                  : undefined,
            discount_value: discount > 0 ? discount : undefined,
            tax_rate: taxRate > 0 ? taxRate : undefined,
            fine_amount: fineAmount > 0 ? fineAmount : undefined,
         };
      });
   };

   const handleSaveAsDraft = async (
      formData: InvoiceFormData,
      services: InvoiceServiceType[]
   ) => {
      try {
         if (selectedInvoice) {
            // Update existing invoice
            const invoiceId = selectedInvoice.invoice_id || selectedInvoice.id;
            if (invoiceId) {
               const customerId = parseInt(formData.customerName) || undefined;
               const selectedCustomer = customersData?.data?.find(
                  (c) => String(c.customer_id) === String(customerId)
               );
               const agentId = formData.agent
                  ? parseInt(formData.agent)
                  : undefined;
               const validAgentId =
                  agentId && agentId > 0 ? agentId : undefined;

               const updatePayload = {
                  customer_id: customerId,
                  customer_name: selectedCustomer?.customer_name || undefined,
                  customer_trn: formData.customerTrn || undefined,
                  customer_contact: formData.customerContact || undefined,
                  customer_email: formData.customerEmail || undefined,
                  ...(validAgentId && { agent_id: validAgentId }),
                  items: transformServicesToUpdateItems(services),
                  token: formData.token || undefined,
                  remarks: undefined,
                  internal_notes: formData.notes || undefined,
               };
               const result = await updateInvoice.mutateAsync({
                  id: invoiceId,
                  payload: updatePayload,
               });
               toast.success(t("invoices.toast.updateSuccess"));
               return result; // Return invoice data
            }
         } else {
            // Create new invoice
            const payload = transformToApiFormat(
               formData,
               services,
               "Draft",
               customersData?.data
            );
            const result = await createInvoice.mutateAsync(payload);
            toast.success(t("invoices.toast.createSuccess"));
            return result; // Return invoice data
         }
         // Don't close modal - let modal handle it
      } catch (error) {
         console.error("Error saving draft invoice:", error);
         toast.error(t("invoices.toast.saveError"));
      }
   };

   const handleSendInvoice = async (
      formData: InvoiceFormData,
      services: InvoiceServiceType[]
   ) => {
      try {
         if (selectedInvoice) {
            // Update existing invoice
            const invoiceId = selectedInvoice.invoice_id || selectedInvoice.id;
            if (invoiceId) {
               const customerId = parseInt(formData.customerName) || undefined;
               const selectedCustomer = customersData?.data?.find(
                  (c) => String(c.customer_id) === String(customerId)
               );
               const agentId = formData.agent
                  ? parseInt(formData.agent)
                  : undefined;
               const validAgentId =
                  agentId && agentId > 0 ? agentId : undefined;

               const updatePayload = {
                  customer_id: customerId,
                  customer_name: selectedCustomer?.customer_name || undefined,
                  customer_trn: formData.customerTrn || undefined,
                  customer_contact: formData.customerContact || undefined,
                  customer_email: formData.customerEmail || undefined,
                  ...(validAgentId && { agent_id: validAgentId }),
                  items: transformServicesToUpdateItems(services),
                  token: formData.token || undefined,
                  remarks: undefined,
                  internal_notes: formData.notes || undefined,
               };
               const result = await updateInvoice.mutateAsync({
                  id: invoiceId,
                  payload: updatePayload,
               });
               toast.success(t("invoices.toast.updateSuccess"));
               return result; // Return invoice data
            }
         } else {
            // Create new invoice
            const payload = transformToApiFormat(
               formData,
               services,
               "Pending",
               customersData?.data
            );
            const result = await createInvoice.mutateAsync(payload);
            toast.success(t("invoices.toast.createSuccess"));
            return result; // Return invoice data
         }
         // Don't close modal - let modal handle it
      } catch (error) {
         console.error("Error sending invoice:", error);
         toast.error(t("invoices.toast.saveError"));
      }
   };

   // Use backend data directly (status is already in backend format)
   const transformedInvoices: Invoice[] = invoicesResponse?.data || [];
   const totalPages = invoicesResponse?.pagination?.total_pages || 1;

   // Use backend stats directly - ensure we always have valid numbers
   const displayStats = useMemo(() => {
      if (stats && typeof stats === "object") {
         const byStatus = stats.by_status ?? {};
         const totalInvoices =
            typeof stats.total_invoices === "number" ? stats.total_invoices : 0;
         const totalAmount =
            typeof stats.total_amount === "number" ? stats.total_amount : 0;
         const totalDue =
            typeof stats.total_due === "number" ? stats.total_due : 0;
         const paidInvoices = byStatus.Fully_Paid ?? 0;
         const pendingInvoices = byStatus.Pending ?? 0;
         const partiallyPaidInvoices = byStatus.Partially_Paid ?? 0;
         const draftInvoices = byStatus.Draft ?? 0;

         return {
            total: totalInvoices,
            totalAmount,
            totalDue,
            paid: paidInvoices,
            pending: pendingInvoices,
            partiallyPaid: partiallyPaidInvoices,
            draft: draftInvoices,
         };
      }

      // Return zeros if stats are not available yet
      return {
         total: 0,
         totalAmount: 0,
         totalDue: 0,
         paid: 0,
         pending: 0,
         partiallyPaid: 0,
         draft: 0,
      };
   }, [stats]);

   // TODO: Consistency - Standardized to show full page layout with header.
   if (!canAccessInvoices) {
      return (
         <NoPermissionMessage
            message={t("permissions.noAccess.title", "Access Restricted")}
            description={t(
               "permissions.noAccess.message",
               "You don't have permission to access the invoices module."
            )}
         />
      );
   }

   return (
      <div className="flex flex-col min-h-0 h-full">
         {canViewInvoices && (
            <>
               {/* KPI cards */}
               <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3 xl:gap-3 mb-6">
                  <KPICard
                     icon={<TotalInvoices className="fill-highlighted" />}
                     label={t("invoices.kpi.totalInvoices")}
                     value={displayStats.total}
                  />
                  <KPICard
                     icon={<InvoiceDollar className="fill-information" />}
                     label={t("invoices.kpi.totalAmount")}
                     value={<DirhamLabel value={displayStats.totalAmount} />}
                  />
                  <KPICard
                     icon={<WalletClock className="fill-warning" />}
                     label={t("invoices.kpi.totalDue")}
                     value={<DirhamLabel value={displayStats.totalDue} />}
                  />
                  <KPICard
                     icon={<CheckCircle className="fill-success" />}
                     label={t("invoices.kpi.paidInvoices")}
                     value={displayStats.paid}
                  />
                  <KPICard
                     icon={<MinusCircle className="fill-warning" />}
                     label={t("invoices.kpi.pendingInvoices")}
                     value={displayStats.pending}
                  />
                  <KPICard
                     icon={<ClockTwo className="fill-information" />}
                     label={t(
                        "invoices.kpi.partiallyPaidInvoices",
                        "Partially Paid"
                     )}
                     value={displayStats.partiallyPaid}
                  />
                  <KPICard
                     icon={<Draft className="fill-text-sub" />}
                     label={t("invoices.kpi.draftInvoices")}
                     value={displayStats.draft}
                  />
               </div>
            </>
         )}

         <InvoicesToolbar
            activeTab={activeTab}
            onTabChange={(tab) => setSearchParams({ tab }, { replace: false })}
            searchQuery={searchInput}
            onSearchChange={setSearchInput}
            onSortChange={handleSortChange}
            onAddInvoiceClick={handleAddInvoiceClick}
            onFiltersApply={handleFiltersApply}
         />
         {/* Table Logic with Loading/Error states */}
         <div className="flex-1 min-h-0 flex flex-col">
            {!canViewInvoices ? (
               <NoPermissionMessage
                  message={t(
                     "permissions.noReadAccess.title",
                     "Access Restricted"
                  )}
                  description={`${t(
                     "permissions.noReadAccess.message",
                     "You don't have permission to view invoices."
                  )} (Missing: ${formatPermissionName("view_invoices")})`}
                  className="mt-12"
               />
            ) : invoicesLoading ? (
               <LoadingState
                  size="large"
                  label={t("invoices.loadingInvoices")}
               />
            ) : invoicesError ? (
               (invoicesError as any)?.response?.status === 403 ? (
                  <NoPermissionMessage
                     message={t(
                        "permissions.noReadAccess.title",
                        "Access Restricted"
                     )}
                     description={`${t(
                        "permissions.noReadAccess.message",
                        "You don't have permission to view invoices."
                     )} (Missing: ${formatPermissionName("view_invoices")})`}
                     className="mt-12"
                  />
               ) : (
                  <div className="flex items-center justify-center py-12">
                     <p className="text-danger">
                        {t("invoices.errorLoadingInvoices")}
                     </p>
                  </div>
               )
            ) : (
               <InvoicesTable
                  data={transformedInvoices}
                  onViewDetails={handleViewDetails}
                  onEditInvoice={
                     canUpdateInvoice ? handleEditInvoice : undefined
                  }
                  onDelete={canDeleteInvoice ? handleDeleteClick : undefined}
                  onRecordPayment={
                     canManagePayments ? handleRecordPayment : undefined
                  }
                  onCancelInvoice={
                     canUpdateInvoice ? handleCancelInvoice : undefined
                  }
                  onMarkAsPending={
                     canUpdateInvoice ? handleMarkAsPending : undefined
                  }
                  onVoidInvoice={
                     canUpdateInvoice ? handleVoidInvoice : undefined
                  }
                  onRowSelectionChange={
                     canManagePayments ? handleRowSelectionChange : undefined
                  }
                  renderFloatingBar={
                     canManagePayments ? renderBulkPaymentBar : undefined
                  }
                  resetSelectionSignal={
                     canManagePayments ? selectionResetSignal : undefined
                  }
                  pageCount={totalPages}
                  pagination={{ pageIndex: page - 1, pageSize }}
                  onPaginationChange={handlePaginationChange}
               />
            )}
         </div>

         <CreateInvoiceModal
            isOpen={isCreateInvoiceOpen}
            onClose={() => {
               setIsCreateInvoiceOpen(false);
               setSelectedInvoice(null);
               setEditInvoiceId(null);
            }}
            invoice={invoiceForModal}
            onSaveDraft={handleSaveAsDraft}
            onSendInvoice={handleSendInvoice}
            onEditInvoice={
               canUpdateInvoice ? handleEditFromCreateModal : undefined
            }
            onCancelInvoice={
               canUpdateInvoice ? handleCancelFromCreateModal : undefined
            }
            isLoading={isModalLoading}
            loadingMessage={modalLoadingMessage}
         />

         <InvoiceDetailsDrawer
            isOpen={isDetailsOpen}
            onClose={() => {
               setIsDetailsOpen(false);
               setSelectedInvoiceId(null);
            }}
            invoice={invoiceForDrawer}
            isLoading={isLoadingInvoiceDetails}
            invoices={transformedInvoices}
            currentIndex={
               invoiceForDrawer
                  ? transformedInvoices.findIndex(
                       (inv) =>
                          (inv.invoice_id || inv.id) ===
                          (invoiceForDrawer.invoice_id || invoiceForDrawer.id)
                    )
                  : -1
            }
            onNavigate={handleNavigateInvoice}
            onEdit={canUpdateInvoice ? handleEditFromDrawer : undefined}
            onVoid={canUpdateInvoice ? handleVoidFromDrawer : undefined}
            onDelete={canDeleteInvoice ? handleDeleteFromDrawer : undefined}
         />

         <ConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
               if (!deleteInvoice.isPending) {
                  setIsDeleteModalOpen(false);
               }
            }}
            onConfirm={handleConfirmDelete}
            title={t("invoices.deleteModal.title")}
            description={t("invoices.deleteModal.message")}
            confirmText={t("invoices.deleteModal.confirmButton")}
            cancelText={t("invoices.deleteModal.cancelButton")}
            variant="error"
            icon="exclamation"
            isLoading={deleteInvoice.isPending}
         />

         {/* Record Payment Modal */}
         <RecordPaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
               setIsPaymentModalOpen(false);
               setInvoiceForPayment(null);
            }}
            invoice={invoiceForPayment}
            onSubmit={handleSubmitPayment}
            isLoading={recordPaymentMutation.isPending}
         />

         <BulkPaymentModal
            isOpen={isBulkPaymentModalOpen}
            onClose={() => {
               setIsBulkPaymentModalOpen(false);
               setBulkPaymentInvoices([]);
            }}
            invoices={bulkPaymentInvoices}
            onSubmit={handleSubmitBulkPayment}
            isLoading={bulkPaymentMutation.isPending}
         />

         <VoidInvoiceModal
            isOpen={isVoidModalOpen}
            onClose={() => {
               setIsVoidModalOpen(false);
               setInvoiceForVoid(null);
            }}
            invoice={invoiceForVoid}
            onSubmit={handleConfirmVoidInvoice}
            isLoading={voidInvoiceMutation.isPending}
         />

         {/* Status Change Confirm Modal */}
         <ConfirmModal
            isOpen={isStatusModalOpen}
            onClose={() => {
               if (!changeStatusMutation.isPending) {
                  setIsStatusModalOpen(false);
                  setStatusChangeAction(null);
               }
            }}
            onConfirm={handleConfirmStatusChange}
            title={
               statusChangeAction?.newStatus === "Cancelled"
                  ? "Cancel Invoice"
                  : `Mark as ${
                       statusChangeAction?.newStatus?.replace("_", " ") || ""
                    }`
            }
            description={
               statusChangeAction?.newStatus === "Cancelled"
                  ? "Are you sure you want to cancel this invoice? This action cannot be undone."
                  : `Are you sure you want to mark this invoice as ${statusChangeAction?.newStatus?.replace(
                       "_",
                       " "
                    )}?`
            }
            confirmText="Confirm"
            cancelText="Cancel"
            variant={
               statusChangeAction?.newStatus === "Cancelled"
                  ? "error"
                  : "primary"
            }
            icon={
               statusChangeAction?.newStatus === "Cancelled"
                  ? "exclamation"
                  : "info"
            }
            isLoading={changeStatusMutation.isPending}
         />
      </div>
   );
}

export default InvoicesContent;
