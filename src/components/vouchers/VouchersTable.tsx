/** @format */

import { useMemo, useRef, useState } from "react";
import { ColumnDef, PaginationState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/designSystem/ui/data-table";
import { MoreVertical, WalletClock, Eye, Trash, Check } from "@/Icons";
import Dropdown from "@/designSystem/Dropdown";
import { Badge } from "@/designSystem/ui/badge";
import DirhamLabel from "@/designSystem/DirhamLabel";
import { useTranslation } from "@/hooks/useTranslation";

// Voucher type for table display
type VoucherTableItem = {
	id: number;
	paymentCode: string;
	dateCreated: string;
	from: string;
	to: string;
	amount: number;
	status: string;
	type: "payment" | "receipt";
};

interface VouchersTableProps {
	data: VoucherTableItem[];
	onViewDetails: (voucher: VoucherTableItem) => void;
	onApprove?: (voucher: VoucherTableItem) => void;
	onDelete?: (voucher: VoucherTableItem) => void;
	// Pagination props
	pageCount?: number;
	pagination?: {
		pageIndex: number;
		pageSize: number;
	};
	onPaginationChange?: (updater: Updater<PaginationState>) => void;
}

function VoucherActionsCell({
	voucher,
	onViewDetails,
	onApprove,
	onDelete,
}: {
	voucher: VoucherTableItem;
	onViewDetails: (voucher: VoucherTableItem) => void;
	onApprove?: (voucher: VoucherTableItem) => void;
	onDelete?: (voucher: VoucherTableItem) => void;
}) {
	const { t } = useTranslation("settings");
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);

	const items = [
		{
			id: "view",
			label: t("vouchers.actions.viewDetails"),
			icon: Eye,
			onClick: () => {
				onViewDetails(voucher);
				setIsOpen(false);
			},
		},
		...(voucher.status === "Pending_Approval" && onApprove
			? [
					{
						id: "approve",
						label: "Approve",
						icon: Check,
						onClick: () => {
							onApprove(voucher);
							setIsOpen(false);
						},
					},
			  ]
			: []),
		...(voucher.status === "Cancelled" && onDelete
			? [
					{
						id: "delete",
						label: t("vouchers.actions.delete"),
						icon: Trash,
						variant: "danger" as const,
						onClick: () => {
							onDelete(voucher);
							setIsOpen(false);
						},
					},
			  ]
			: []),
	];

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

export default function VouchersTable({
	data,
	onViewDetails,
	onApprove,
	onDelete,
	pageCount,
	pagination,
	onPaginationChange,
}: VouchersTableProps) {
	const { t } = useTranslation("settings");
	const columns: ColumnDef<VoucherTableItem>[] = useMemo(
		() => [
			{
				accessorKey: "paymentCode",
				header: () => (
					<div className='flex items-center gap-2'>
						<span className='text-xs text-text-soft'>#</span>
						<span className='text-sm'>{t("vouchers.table.paymentCode")}</span>
					</div>
				),
				cell: ({ row }) => (
					<span className='text-sm font-medium text-text-strong'>
						{row.original.paymentCode}
					</span>
				),
				size: 180,
			},
			{
				accessorKey: "from",
				header: () => (
					<span className='text-sm text-text-strong'>
						{t("vouchers.table.from")}
					</span>
				),
				cell: ({ row }) => (
					<span className='text-sm text-text-strong truncate'>
						{row.original.from}
					</span>
				),
				size: 220,
			},
			{
				accessorKey: "to",
				header: () => (
					<span className='text-sm text-text-strong'>
						{t("vouchers.table.to")}
					</span>
				),
				cell: ({ row }) => (
					<span className='text-sm text-text-strong truncate'>
						{row.original.to}
					</span>
				),
				size: 220,
			},
			{
				accessorKey: "dateCreated",
				header: () => (
					<span className='text-sm text-text-strong'>
						{t("vouchers.table.dateCreated")}
					</span>
				),
				cell: ({ row }) => {
				const formatDate = (dateString: string) => {
					try {
						const date = new Date(dateString);
						const day = date.getDate();
						const month = date.toLocaleString("default", { month: "short" });
						const year = date.getFullYear();
						const hours = date.getHours();
						const minutes = date.getMinutes();
						const ampm = hours >= 12 ? "PM" : "AM";
						const displayHours = hours % 12 || 12;
						const displayMinutes = minutes.toString().padStart(2, "0");
						return `${day} ${month} ${year}, ${displayHours}:${displayMinutes} ${ampm}`;
					} catch {
						return dateString;
					}
				};
				
				return (
					<span className='text-sm text-text-sub'>
						{formatDate(row.original.dateCreated)}
					</span>
				);
			},
				size: 180,
			},
			{
				accessorKey: "amount",
				header: () => (
					<div className='flex items-center gap-2'>
						<WalletClock size={16} />
						<span className='text-sm text-text-strong'>
							{t("vouchers.table.amount")}
						</span>
					</div>
				),
				cell: ({ row }) => (
					<div className='text-sm font-medium text-text-strong'>
						<DirhamLabel
							value={row.original.amount.toLocaleString("en-US", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						/>
					</div>
				),
				size: 140,
			},
			{
				accessorKey: "status",
				header: () => (
					<span className='text-sm text-text-strong'>
						{t("vouchers.table.status")}
					</span>
				),
				cell: ({ row }) => {
					const status = row.original.status;
					let label = status;
					let badgeClass = "bg-bg-weak text-text-sub border-border";

					if (status === "Pending_Approval") {
						label = "Pending Approval";
						badgeClass = "bg-warning/10 text-warning border-warning/20";
					} else if (status === "Approved") {
						label = "Approved";
						badgeClass = "bg-success/10 text-success border-success/20";
					} else if (status === "Cancelled") {
						label = "Cancelled";
						badgeClass = "bg-danger/10 text-danger border-danger/20";
					} else if (status === "Draft") {
						label = "Draft";
						badgeClass = "bg-information/10 text-information border-information/20";
					}

					return (
						<Badge variant='outline' className={badgeClass}>
							{label}
						</Badge>
					);
				},
				size: 140,
			},
			{
				id: "actions",
				header: () => <div />,
				cell: ({ row }) => (
					<VoucherActionsCell
						voucher={row.original}
						onViewDetails={onViewDetails}
						onApprove={onApprove}
						onDelete={onDelete}
					/>
				),
				size: 48,
			},
		],
		[t, onViewDetails, onApprove, onDelete]
	);

	return (
		<DataTable
			columns={columns}
			data={data}
			enableRowSelection={false}
			showPagination={true}
			pageSize={20}
			pageCount={pageCount}
			pagination={pagination}
			onPaginationChange={onPaginationChange}
			manualPagination={true}
			onRowClick={onViewDetails}
		/>
	);
}
