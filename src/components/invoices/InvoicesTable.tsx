/** @format */

import { useMemo, useRef, useState } from "react";
import { ColumnDef, PaginationState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/designSystem/ui/data-table";
import BadgeTag from "@/designSystem/BadgeTag";
import Checkbox from "@/designSystem/Checkbox";
import {
	MoreVertical,
	Hashtag,
	UserSimpleAlt,
	Calendar,
	DollarCircle,
	Tag,
	Eye,
	PenToSquare,
	Trash,
	MinusCircle,
	ClockTwo,
	Ban,
} from "@/Icons";
import Dropdown from "@/designSystem/Dropdown";
import DirhamLabel from "@/designSystem/DirhamLabel";
import { useTranslation } from "@/hooks/useTranslation";
import { usePermissions } from "@/contexts/PermissionContext";
import type { Invoice } from "./data";
import { formatInvoiceDate } from "./data";

interface InvoicesTableProps {
	data: Invoice[];
	onViewDetails: (invoice: Invoice) => void;
	onEditInvoice?: (invoice: Invoice) => void;
	onDelete?: (invoice: Invoice) => void;
	onRecordPayment?: (invoice: Invoice) => void;
	onCancelInvoice?: (invoice: Invoice) => void;
	onMarkAsPending?: (invoice: Invoice) => void;
	onVoidInvoice?: (invoice: Invoice) => void;
	onRowSelectionChange?: (selectedRows: Invoice[]) => void;
	renderFloatingBar?: (
		selectedCount: number,
		selectedRows: Invoice[]
	) => React.ReactNode;
	resetSelectionSignal?: number;
	pageCount?: number;
	pagination?: {
		pageIndex: number;
		pageSize: number;
	};
	onPaginationChange?: (updater: Updater<PaginationState>) => void;
}

function InvoiceNumberCell({
	invoice,
	onViewDetails,
}: {
	invoice: Invoice;
	onViewDetails: (invoice: Invoice) => void;
}) {
	const { can } = usePermissions();
	const canViewInvoices = can("view_invoices");

	if (!canViewInvoices) {
		return (
			<span className="text-sm font-medium text-text-strong">
				{invoice.invoice_number}
			</span>
		);
	}

	return (
		<button
			type="button"
			onClick={() => onViewDetails(invoice)}
			data-row-click-ignore
			className="text-sm font-medium text-text-strong hover:text-primary transition-colors">
			{invoice.invoice_number}
		</button>
	);
}

function InvoiceActionsCell({
	invoice,
	onViewDetails,
	onEditInvoice,
	onDelete,
	onRecordPayment,
	onCancelInvoice,
	onMarkAsPending,
	onVoidInvoice,
}: {
	invoice: Invoice;
	onViewDetails: (invoice: Invoice) => void;
	onEditInvoice?: (invoice: Invoice) => void;
	onDelete?: (invoice: Invoice) => void;
	onRecordPayment?: (invoice: Invoice) => void;
	onCancelInvoice?: (invoice: Invoice) => void;
	onMarkAsPending?: (invoice: Invoice) => void;
	onVoidInvoice?: (invoice: Invoice) => void;
}) {
	const { t } = useTranslation("settings");
	const { can } = usePermissions();
	const canViewInvoices = can("view_invoices");
	const canUpdateInvoice = can("update_invoice");
	const canDeleteInvoice = can("delete_invoice");
	const canManagePayments = can("manage_invoice_payments");
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);

	const status = invoice.status;
	const canRecordPayment =
		canManagePayments &&
		(status === "Pending" || status === "Partially_Paid");
	const canCancel = canUpdateInvoice && (status === "Draft" || status === "Pending");
	const canMarkPending = canUpdateInvoice && status === "Draft";
	const canDelete = canDeleteInvoice && (status === "Draft" || status === "Cancelled");
	const canEdit =
		canUpdateInvoice &&
		(status === "Draft" || status === "Pending") &&
		Boolean(onEditInvoice);
	const canVoid =
		canUpdateInvoice &&
		["Partially_Paid", "Fully_Paid"].includes(status) &&
		Boolean(onVoidInvoice);

	const items = [
		...(canViewInvoices
			? [
					{
						id: "view",
						label: t("invoices.actions.viewDetails"),
						icon: Eye,
						onClick: () => onViewDetails(invoice),
					},
			  ]
			: []),
		...(canEdit
			? [
					{
						id: "edit",
						label: t("invoices.actions.editInvoice"),
						icon: PenToSquare,
						onClick: () => onEditInvoice?.(invoice),
					},
			  ]
			: []),
		...(canRecordPayment && onRecordPayment
			? [
					{
						id: "record_payment",
						label: "Record Payment",
						icon: DollarCircle,
						onClick: () => onRecordPayment(invoice),
					},
			  ]
			: []),
		...(canMarkPending && onMarkAsPending
			? [
					{
						id: "mark_pending",
						label: "Mark as Pending",
						icon: ClockTwo,
						onClick: () => onMarkAsPending(invoice),
					},
			  ]
			: []),
		...(canCancel && onCancelInvoice
			? [
					{
						id: "cancel",
						label: "Cancel Invoice",
						icon: MinusCircle,
						variant: "danger" as const,
						onClick: () => onCancelInvoice(invoice),
					},
			  ]
			: []),
		...(canVoid && onVoidInvoice
			? [
					{
						id: "void",
						label: t("invoices.actions.voidInvoice"),
						icon: Ban,
						variant: "danger" as const,
						onClick: () => onVoidInvoice(invoice),
					},
			  ]
			: []),
		...(canDelete && onDelete
			? [
					{
						id: "delete",
						label: t("invoices.actions.delete"),
						icon: Trash,
						variant: "danger" as const,
						onClick: () => onDelete(invoice),
					},
			  ]
			: []),
	];

	if (items.length === 0) return null;

	return (
		<>
			<button
				ref={buttonRef}
				onClick={() => setIsOpen(true)}
				data-row-menu-trigger
				className='flex items-center justify-center w-8 h-8 rounded-lg hover:bg-bg-weak'>
				<MoreVertical size={16} />
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

const getInvoiceLineTotal = (item: any) => {
	const total = Number(item?.total);
	if (Number.isFinite(total) && total > 0) return total;
	const unitPrice = Number(item?.unit_price ?? item?.service_charge ?? 0);
	const govFees = Number(item?.government_fee ?? 0);
	const fine = Number(item?.fine_amount ?? 0);
	const discountAmount = Number(item?.discount_amount ?? 0);
	const taxAmount = Number(item?.tax_amount ?? 0);
	const subtotal = unitPrice + govFees + fine - discountAmount;
	const computed = subtotal + taxAmount;
	return Number.isFinite(computed) && computed > 0 ? computed : 0;
};

const resolveInvoiceAmount = (invoice: Invoice) => {
	const itemsTotal = invoice.items?.reduce(
		(sum, item) => sum + getInvoiceLineTotal(item),
		0
	);
	if (itemsTotal && itemsTotal > 0) return itemsTotal;
	const totalAmount = Number((invoice as any).total_amount ?? (invoice as any).total);
	return Number.isFinite(totalAmount) ? totalAmount : 0;
};

export default function InvoicesTable({
	data,
	onViewDetails,
	onEditInvoice,
	onDelete,
	onRecordPayment,
	onCancelInvoice,
	onMarkAsPending,
	onVoidInvoice,
	onRowSelectionChange,
	renderFloatingBar,
	resetSelectionSignal,
	pageCount,
	pagination,
	onPaginationChange,
}: InvoicesTableProps) {
	const { t } = useTranslation("settings");
	const columns: ColumnDef<Invoice>[] = useMemo(
		() => {
			const cols: ColumnDef<Invoice>[] = [];

			if (onRowSelectionChange) {
				cols.push({
					id: "select",
					header: ({ table }) => (
						<Checkbox
							checked={table.getIsAllPageRowsSelected()}
							onChange={(e) =>
								table.toggleAllPageRowsSelected(e.target.checked)
							}
							className="m-0 mb-0.5 me-0.5"
						/>
					),
					cell: ({ row }) => (
						<Checkbox
							checked={row.getIsSelected()}
							onChange={(e) => row.toggleSelected(e.target.checked)}
							className="m-0 me-0.5"
						/>
					),
					size: 40,
					enableSorting: false,
				});
			}

			cols.push(
				{
					accessorKey: "invoice_number",
					header: () => (
						<div className="flex items-center gap-2">
							<Hashtag size={16} />
							<span className="text-sm text-text-strong">
								{t("invoices.table.invoiceNumber")}
							</span>
						</div>
					),
					cell: ({ row }) => (
						<InvoiceNumberCell
							invoice={row.original}
							onViewDetails={onViewDetails}
						/>
					),
					size: 180,
				},
				{
					accessorKey: "customer_name",
					header: () => (
						<div className="flex items-center gap-2">
							<UserSimpleAlt size={16} />
							<span className="text-sm text-text-strong">
								{t("invoices.table.customer")}
							</span>
						</div>
					),
					cell: ({ row }) => (
						<span className="text-sm text-text-strong truncate">
							{row.original.customer_name}
						</span>
					),
					size: 240,
				},
				{
					accessorKey: "created_at",
					header: () => (
						<div className="flex items-center gap-2">
							<Calendar size={16} />
							<span className="text-sm text-text-strong">
								{t("invoices.table.dateCreated")}
							</span>
						</div>
					),
					cell: ({ row }) => (
						<span className="text-sm text-text-sub">
							{formatInvoiceDate(row.original.created_at)}
						</span>
					),
					size: 180,
				},
				{
					accessorKey: "updated_at",
					header: () => (
						<div className="flex items-center gap-2">
							<Calendar size={16} />
							<span className="text-sm text-text-strong">
								{t("invoices.table.lastUpdated")}
							</span>
						</div>
					),
					cell: ({ row }) => (
						<span className="text-sm text-text-sub">
							{formatInvoiceDate(row.original.updated_at)}
						</span>
					),
					size: 180,
				},
				{
					accessorKey: "total",
					header: () => (
						<div className="flex items-center gap-2">
							<DollarCircle size={16} />
							<span className="text-sm text-text-strong">
								{t("invoices.table.amount")}
							</span>
						</div>
					),
					cell: ({ row }) => (
						<div className="text-sm font-medium text-text-strong">
							<DirhamLabel
								value={Number(
									resolveInvoiceAmount(row.original)
								).toLocaleString(
									"en-US",
									{
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									}
								)}
							/>
						</div>
					),
					size: 140,
				},
				{
					accessorKey: "status",
					header: () => (
						<div className="flex items-center gap-2">
							<Tag size={16} />
							<span className="text-sm text-text-strong">
								{t("invoices.table.status")}
							</span>
						</div>
					),
					cell: ({ row }) => {
						const backendStatus = row.original.status;
						const statusKeyMap: Record<string, string> = {
							// Backend statuses
							Draft: "draft",
							Pending: "pending",
							Partially_Paid: "partiallyPaid",
							Fully_Paid: "fullyPaid",
							Cancelled: "cancelled",
							Void: "void",
							// Legacy support
							fullyPaid: "fullyPaid",
							fully_paid: "fullyPaid",
							pending: "pending",
							draft: "draft",
							partiallyPaid: "partiallyPaid",
							partially_paid: "partiallyPaid",
							overdue: "overdue",
							cancelled: "cancelled",
							void: "void",
						};
						const variantMap: Record<
							string,
							"success" | "warning" | "error" | "info"
						> = {
							// Backend statuses
							Draft: "info",
							Pending: "warning",
							Partially_Paid: "warning",
							Fully_Paid: "success",
							Cancelled: "error",
							Void: "error",
							// Legacy support
							fullyPaid: "success",
							fully_paid: "success",
							pending: "warning",
							draft: "info",
							partiallyPaid: "info",
							partially_paid: "info",
							overdue: "error",
							cancelled: "error",
							void: "error",
						};

						const statusKey =
							statusKeyMap[backendStatus] || backendStatus.toLowerCase();
						const label = t(`invoices.status.${statusKey}`) || backendStatus;

						return (
							<BadgeTag
								label={label}
								variant={variantMap[backendStatus] || "info"}
								size="sm"
							/>
						);
					},
					size: 140,
				},
				{
					id: "actions",
					header: () => <div />,
					cell: ({ row }) => (
						<InvoiceActionsCell
							invoice={row.original}
							onViewDetails={onViewDetails}
							onEditInvoice={onEditInvoice}
							onDelete={onDelete}
							onRecordPayment={onRecordPayment}
							onCancelInvoice={onCancelInvoice}
							onMarkAsPending={onMarkAsPending}
							onVoidInvoice={onVoidInvoice}
						/>
					),
					size: 48,
				}
			);

			return cols;
		},
		[
			t,
			onViewDetails,
			onEditInvoice,
			onDelete,
			onRecordPayment,
			onCancelInvoice,
			onMarkAsPending,
			onVoidInvoice,
			onRowSelectionChange,
		]
	);

	return (
		<DataTable
			columns={columns}
			data={data}
			enableRowSelection={Boolean(onRowSelectionChange)}
			onRowSelectionChange={onRowSelectionChange}
			renderFloatingBar={renderFloatingBar}
			resetSelectionSignal={resetSelectionSignal}
			showPagination={true}
			pageSize={pagination?.pageSize ?? 12}
			pageCount={pageCount}
			pagination={pagination}
			onPaginationChange={onPaginationChange}
			manualPagination={Boolean(onPaginationChange)}
			enableRowHover={true}
			className="h-full"
			scrollContainerClassName="max-h-full"
		/>
	);
}
