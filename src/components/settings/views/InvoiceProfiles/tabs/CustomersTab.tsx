/** @format */

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/designSystem/ui/data-table";
import { useTranslation } from "@/hooks/useTranslation";
import Checkbox from "@/designSystem/Checkbox";
import StatusTag from "@/designSystem/StatusTag";
import Dropdown, { DropdownItem } from "@/designSystem/Dropdown";
import CustomersFloatingActionBar from "./CustomersFloatingActionBar";
import AddCustomerModal from "../modals/AddCustomerModal";
import DeleteCustomerModal from "../modals/DeleteCustomerModal";
import { MoreVertical, Edit, Trash } from "@/Icons";
import type { Customer } from "../types";
import {
	useDeleteCustomer,
	useUpdateCustomer,
	useListCustomers,
	useCreateCustomer,
} from "@/hooks/customers/useCustomers";
import type { CreateCustomerRequest, UpdateCustomerRequest } from "@/services/customerService";
import { PaginationState, Updater } from "@tanstack/react-table";
import toast from "@/utilities/toast";
import { StatusFilters } from "../../../shared/StatusFilterDropdown";
import LoadingState from "@/designSystem/LoadingState";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import { formatPermissionName } from "@/utilities/permissionFormatters";

const getBackendErrorCode = (error: unknown): string | undefined => {
	if (typeof error === "object" && error !== null) {
		const err = error as {
			response?: { data?: { error?: string; code?: string } };
			error?: string;
			code?: string;
		};
		if (err.response?.data?.error) return err.response.data.error;
		if (err.response?.data?.code) return err.response.data.code;
		if (err.error) return err.error;
		if (err.code) return err.code;
	}
	return undefined;
};

const getCustomerInvoicesCount = (customer?: Customer | null) => {
	if (!customer) return 0;
	const legacy = (customer as unknown as { invoicesCount?: number }).invoicesCount;
	return customer.invoices_count ?? legacy ?? 0;
};

interface CustomersTabProps {
	searchQuery: string;
	filters: StatusFilters;
	sortBy: string;
}

// Actions Cell Component
function ActionsCell({
	customer,
	onDelete,
	onEdit,
	canEdit,
	canDelete,
}: {
	customer: Customer;
	onDelete: (customer: Customer) => void;
	onEdit?: (customer: Customer) => void;
	canEdit: boolean;
	canDelete: boolean;
}) {
	const { t } = useTranslation("settings");
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);

	const dropdownItems: DropdownItem[] = [
		...(canEdit
			? [
					{
						id: "edit",
						label: t("invoiceProfiles.actions.edit"),
						icon: Edit,
						onClick: () => {
							onEdit?.(customer);
							setIsOpen(false);
						},
						variant: "default" as const,
					},
			  ]
			: []),
		...(canDelete
			? [
					{
						id: "delete",
						label: t("invoiceProfiles.actions.delete"),
						icon: Trash,
						onClick: () => {
							onDelete(customer);
							setIsOpen(false);
						},
						variant: "danger" as const,
					},
			  ]
			: []),
	];

	if (dropdownItems.length === 0) return null;

	return (
		<>
			<button
				ref={buttonRef}
				type='button'
				aria-label={t("invoiceProfiles.actions.label")}
				className={`p-1.5 transition-colors rounded-lg flex items-center justify-center w-8 h-8 ${
					isOpen
						? "bg-bg-weak"
						: "bg-transparent hover:bg-bg-weak active:bg-border"
				}`}
				data-row-menu-trigger
				onClick={() => setIsOpen(!isOpen)}>
				<MoreVertical size={20} />
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

function CustomersTab({ searchQuery, filters, sortBy }: CustomersTabProps) {
	const { t } = useTranslation("settings");
	const { can } = usePermissions();
	const canViewCustomers = can("view_customers");
	const canUpdateCustomer = can("update_customer");
	const canDeleteCustomer = can("delete_customer");
	// Modal and Action States
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [customersToDelete, setCustomersToDelete] = useState<Customer[]>([]);
	const [selectionResetSignal, setSelectionResetSignal] = useState(0);
	const [deleteModalState, setDeleteModalState] =
		useState<"idle" | "loading" | "success">("idle");

	// Pagination state
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(12);

	// Delete mutation
	const deleteCustomer = useDeleteCustomer();

	// Update mutation
	const updateCustomer = useUpdateCustomer();

	// Create mutation (for when modal is opened from tab)
	const createCustomer = useCreateCustomer();

	// Map sort options to backend format
	const sortConfig: Record<string, { field: string; order: "asc" | "desc" }> =
		{
			nameAsc: { field: "customer_name", order: "asc" },
			nameDesc: { field: "customer_name", order: "desc" },
			newest: { field: "created_at", order: "desc" },
			oldest: { field: "created_at", order: "asc" },
		};
	const { field: sortField, order: sortDirection } =
		sortConfig[sortBy] || sortConfig.newest;
	const selectedStatus = filters.status[0];
	const normalizedStatus = selectedStatus
		? selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)
		: undefined;

	// Reset page when filters or search change
	useEffect(() => {
		setPage(1);
	}, [searchQuery, filters.status, sortBy]);

	// Fetch customers with server-side pagination, search, filtering, and sorting
	const { data: customersResponse, isLoading, error } = useListCustomers(
		{
			page,
			limit: pageSize,
			search: searchQuery || undefined,
			status: normalizedStatus,
			sort_by: sortField,
			sort_order: sortDirection,
		},
		{ enabled: canViewCustomers }
	);

	const customers = customersResponse?.data || [];
	const totalPages = customersResponse?.pagination?.total_pages || 1;

	// Pagination handler
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

	// Bulk actions handlers (must be before early return)
	const handleBulkDelete = useCallback((rows: Customer[]) => {
		setCustomersToDelete(rows);
		setIsDeleteModalOpen(true);
	}, []);

	const handleEditCustomer = useCallback((customer: Customer) => {
		if (!canUpdateCustomer) return;
		setSelectedCustomer(customer);
		setIsModalOpen(true);
	}, [canUpdateCustomer]);

	const handleDeleteCustomer = useCallback(
		(customer: Customer) => {
			if (getCustomerInvoicesCount(customer) > 0) {
				toast.error(t("invoiceProfiles.dependency.customerHasInvoices"));
				return;
			}
			setCustomersToDelete([customer]);
			setIsDeleteModalOpen(true);
		},
		[t]
	);

	const confirmDelete = useCallback(async () => {
		if (customersToDelete.length === 0) return;
		setDeleteModalState("loading");

		try {
			await Promise.all(
				customersToDelete.map((customer) =>
					deleteCustomer.mutateAsync(customer.customer_id || customer.id!)
				)
			);

			const message =
				customersToDelete.length > 1
					? t("invoiceProfiles.toast.customers.deleteMultipleSuccess", {
							count: customersToDelete.length,
					  })
					: t("invoiceProfiles.toast.customers.deleteSuccess", {
							name:
								customersToDelete[0].customer_name ||
								customersToDelete[0].name ||
								"",
					  });

			toast.success(message);
			setSelectionResetSignal((prev) => prev + 1);
			setDeleteModalState("success");
			setTimeout(() => {
				setIsDeleteModalOpen(false);
				setCustomersToDelete([]);
				setDeleteModalState("idle");
			}, 600);
		} catch (error) {
			let errorMessage = t("invoiceProfiles.toast.customers.deleteError");
			const backendError = getBackendErrorCode(error);
			if (backendError === "CUSTOMER_HAS_INVOICES") {
				errorMessage = t("invoiceProfiles.dependency.customerHasInvoices");
			} else if (
				error &&
				typeof error === "object" &&
				"message" in error &&
				typeof (error as { message?: string }).message === "string"
			) {
				errorMessage =
					(error as { message?: string }).message ||
					errorMessage;
			}
			toast.error(errorMessage);
			setIsDeleteModalOpen(false);
			setCustomersToDelete([]);
			setDeleteModalState("idle");
		}
	}, [customersToDelete, deleteCustomer, t]);

	// Floating action bar
	const renderFloatingBar = useCallback(
		(selectedCount: number, selectedRows: Customer[]) => (
			<CustomersFloatingActionBar
				selectedCount={selectedCount}
				selectedRows={selectedRows}
				onDelete={handleBulkDelete}
				onEdit={handleEditCustomer}
				canEdit={canUpdateCustomer}
				canDelete={canDeleteCustomer}
				resetSignal={selectionResetSignal}
			/>
		),
		[handleBulkDelete, handleEditCustomer, selectionResetSignal, canUpdateCustomer, canDeleteCustomer]
	);

	const columns: ColumnDef<Customer>[] = useMemo(
		() => [
			// Selection checkbox column
			...(canDeleteCustomer
				? [
						{
							id: "select",
							header: ({ table }: { table: { getIsAllPageRowsSelected: () => boolean; toggleAllPageRowsSelected: (value: boolean) => void } }) => (
								<div className='[&>div]:gap-0'>
									<Checkbox
										checked={table.getIsAllPageRowsSelected()}
										onChange={(e) =>
											table.toggleAllPageRowsSelected(e.target.checked)
										}
										className='m-0 mb-0.5 me-0.5'
									/>
								</div>
							),
							cell: ({ row }: { row: { original: Customer; getIsSelected: () => boolean; toggleSelected: (value: boolean) => void } }) => {
								const invoiceCount = getCustomerInvoicesCount(row.original);
								const hasDependencies = invoiceCount > 0;
								const dependenciesText = `${invoiceCount} ${
									invoiceCount === 1
										? t("invoiceProfiles.dependency.invoice")
										: t("invoiceProfiles.dependency.invoices")
								}`;

								return (
									<div
										className='[&>div]:gap-0'
										title={
											hasDependencies
												? `${t("invoiceProfiles.dependency.cannotDelete")}: ${dependenciesText}`
												: undefined
										}>
										<Checkbox
											checked={row.getIsSelected()}
											onChange={(e) => row.toggleSelected(e.target.checked)}
											className='m-0 me-0.5'
										/>
									</div>
								);
							},
								size: 40,
						},
				  ]
				: []),
			// Customer Name column
			{
				accessorKey: "customer_name",
				header: () => (
					<span className='text-sm text-text-strong pl-4'>
						{t("invoiceProfiles.table.customerName")}
					</span>
				),
				cell: ({ row }) => (
					<p className='text-sm text-text-strong pl-4'>
						{row.original.customer_name || row.original.name || "-"}
					</p>
				),
				size: 200,

			},
			// Type column
			{
				accessorKey: "customer_type",
				header: () => (
					<span className='text-sm text-text-strong'>
						{t("invoiceProfiles.table.type")}
					</span>
				),
				cell: ({ row }) => {
					const type =
						row.original.customer_type || row.original.type || "Individual";
					return (
						<span className='text-sm text-text-sub bg-bg-weak px-2.5 py-0.5 rounded-full'>
							{type}
						</span>
					);
				},
				size: 150,

			},
			// TRN/ID column
			{
				accessorKey: "trn",
				header: () => (
					<span className='text-sm text-text-strong'>
						{t("invoiceProfiles.table.trnId")}
					</span>
				),
				cell: ({ row }) => (
					<p className='text-sm text-text-strong'>
						{row.original.trn || row.original.trnId || "-"}
					</p>
				),
				size: 150,

			},
			// Contact Number column
			{
				accessorKey: "contact_number",
				header: () => (
					<span className='text-sm text-text-strong'>
						{t("invoiceProfiles.table.contactNumber")}
					</span>
				),
				cell: ({ row }) => {
					const contactNumber =
						row.original.contact_number || row.original.contactNumber || "";
					return contactNumber ? (
						<a
							href={`tel:${contactNumber}`}
							className='text-sm text-primary underline hover:opacity-80'>
							{contactNumber}
						</a>
					) : (
						<span className='text-sm text-text-sub'>-</span>
					);
				},
				size: 180,

			},
			// Email column
			{
				accessorKey: "email",
				header: () => (
					<span className='text-sm text-text-strong'>
						{t("invoiceProfiles.table.email")}
					</span>
				),
				cell: ({ row }) => {
					const email = row.original.email || "";
					return email ? (
						<a
							href={`mailto:${email}`}
							className='text-sm text-primary underline hover:opacity-80'>
							{email}
						</a>
					) : (
						<span className='text-sm text-text-sub'>-</span>
					);
				},
				size: 220,

			},
			// Status column
			{
				accessorKey: "status",
				header: () => (
					<span className='text-sm text-text-strong'>
						{t("invoiceProfiles.table.status")}
					</span>
				),
				cell: ({ row }) => {
					const status = row.original.status?.toLowerCase() || "active";
					const statusKey = status === "active" ? "active" : "inactive";
					return (
						<StatusTag
							label={t(`invoiceProfiles.status.${statusKey}`)}
							variant={statusKey}
							className='border-border border flex items-center justify-center ps-1! pe-2! py-0.5!'
						/>
					);
				},
				size: 150,

			},
			// Actions column
			...(canUpdateCustomer || canDeleteCustomer
				? [
						{
							id: "actions",
							header: () => <div />,
							cell: ({ row }: { row: { original: Customer } }) => (
								<ActionsCell
									customer={row.original}
									onDelete={handleDeleteCustomer}
									onEdit={handleEditCustomer}
									canEdit={canUpdateCustomer}
									canDelete={canDeleteCustomer}
								/>
							),
							size: 64,
						},
				  ]
				: []),
		],
		[handleDeleteCustomer, handleEditCustomer, t, canUpdateCustomer, canDeleteCustomer]
	);

	// Show loader while fetching data (after all hooks)
	if (!canViewCustomers) {
		return (
			<div className="p-6">
				<NoPermissionMessage
					message={`You don't have permission to view customers. Missing: ${formatPermissionName("view_customers")}`}
				/>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="w-full">
				<LoadingState size="medium" label={t("invoiceProfiles.customers.loading")} />
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='flex flex-col items-center gap-2'>
					<span className='text-error'>
						Error loading customers. Please try again.
					</span>
					{process.env.NODE_ENV === "development" && (
						<span className='text-xs text-text-sub'>
							{error instanceof Error ? error.message : String(error)}
						</span>
					)}
				</div>
			</div>
		);
	}

	return (
		<>
			<DataTable
				columns={columns}
				data={customers as Customer[]}
				enableRowSelection={canDeleteCustomer}
				showPagination={true}
				pageSize={pageSize}
				pageCount={totalPages}
				pagination={{ pageIndex: page - 1, pageSize }}
				onPaginationChange={handlePaginationChange}
				manualPagination={true}
				translationNamespace='settings'
				renderFloatingBar={canDeleteCustomer ? renderFloatingBar : undefined}
				resetSelectionSignal={selectionResetSignal}
			/>
			{canUpdateCustomer && (
				<AddCustomerModal
					isOpen={isModalOpen}
					onClose={() => {
						setIsModalOpen(false);
						setSelectedCustomer(null);
					}}
					customer={selectedCustomer}
					isLoading={
						selectedCustomer ? updateCustomer.isPending : createCustomer.isPending
					}
					onSuccess={async (customerData) => {
						try {
							const statusValue = String(customerData.status || "").toLowerCase();
							const displayName =
								customerData.name ||
								customerData.customer_name ||
								selectedCustomer?.customer_name ||
								t("invoiceProfiles.table.customerName");

							if (selectedCustomer) {
								// Update existing customer
								const customerId =
									selectedCustomer.customer_id || selectedCustomer.id;
								if (customerId) {
									const payload: UpdateCustomerRequest = {
										customer_name: customerData.name || undefined,
										customer_type: customerData.type || undefined,
										contact_number: customerData.contactNumber || undefined,
										email: customerData.email || undefined,
										trn: customerData.trnId || undefined,
										status: statusValue === "active" ? "Active" : "Inactive",
									};
									await updateCustomer.mutateAsync({
										id: customerId,
										payload,
									});
									toast.success(
										t("invoiceProfiles.toast.customers.updateSuccess", {
											name: displayName,
										})
									);
								}
							} else {
								// Create new customer (shouldn't happen from tab, but handle it)
								const payload: CreateCustomerRequest = {
									customer_name: customerData.name || "",
									customer_type: customerData.type || "Individual",
									contact_number: customerData.contactNumber || "",
									email: customerData.email || "",
									trn: customerData.trnId || "",
									status: statusValue === "active" ? "Active" : "Inactive",
								};
								await createCustomer.mutateAsync(payload);
								toast.success(
									t("invoiceProfiles.toast.customers.createSuccess", {
										name: displayName,
									})
								);
							}
							setIsModalOpen(false);
							setSelectedCustomer(null);
						} catch (error) {
							console.error("Error saving customer:", error);
							toast.error(t("invoiceProfiles.toast.customers.saveError"));
						}
					}}
				/>
			)}
			{canDeleteCustomer && (
				<DeleteCustomerModal
					isOpen={isDeleteModalOpen}
					onClose={() => {
						if (deleteModalState === "loading") return;
						setIsDeleteModalOpen(false);
						setCustomersToDelete([]);
						setDeleteModalState("idle");
					}}
					onConfirm={confirmDelete}
					count={customersToDelete.length}
					isLoading={deleteModalState === "loading"}
					isSuccess={deleteModalState === "success"}
				/>
			)}
		</>
	);
}

export default CustomersTab;
