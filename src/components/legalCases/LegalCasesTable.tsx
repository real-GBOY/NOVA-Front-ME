/** @format */

import { useMemo, useRef, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/designSystem/ui/data-table";
import type { PaginationState, Updater } from "@tanstack/react-table";
import {
	MoreVertical,
	Hashtag,
	Calendar,
	Tag,
	Eye,
	Page,
	CheckCircle,
	Dot,
	FolderOpen,
} from "@/Icons";
import Dropdown from "@/designSystem/Dropdown";
import { useTranslation } from "@/hooks/useTranslation";
import type { LegalCase } from "./data";
import {
	formatLegalCaseDate,
	getLegalCaseStatusLabel,
	getLegalCaseStatusVariant,
} from "./data";

interface LegalCasesTableProps {
	data: LegalCase[];
	onViewDetails: (legalCase: LegalCase) => void;
	onChangeStatus?: (legalCase: LegalCase) => void;
	onRowSelectionChange?: (selectedRows: LegalCase[]) => void;
	renderFloatingBar?: (
		selectedCount: number,
		selectedRows: LegalCase[]
	) => React.ReactNode;
	pagination: PaginationState;
	onPaginationChange: (updater: Updater<PaginationState>) => void;
	pageCount: number;
}

function LegalCaseActionsCell({
	legalCase,
	onViewDetails,
	onChangeStatus,
}: {
	legalCase: LegalCase;
	onViewDetails: (legalCase: LegalCase) => void;
	onChangeStatus?: (legalCase: LegalCase) => void;
}) {
	const { t } = useTranslation("settings");
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);

	const items = [
		{
			id: "view",
			label: t("legalCases.actions.viewDetails"),
			icon: Eye,
			onClick: () => onViewDetails(legalCase),
		},
		...(onChangeStatus
			? [
					{
						id: "change-status",
						label: t("legalCases.actions.changeStatus"),
						icon: Tag,
						onClick: () => onChangeStatus(legalCase),
					},
			  ]
			: []),
	];

	return (
		<>
			<button
				ref={buttonRef}
				onClick={(e) => {
					e.stopPropagation();
					setIsOpen(true);
				}}
				data-row-menu-trigger
				className='flex items-center justify-center w-8 h-8 rounded-lg hover:bg-bg-weak cursor-pointer'>
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

function LegalCaseStatusCell({ status }: { status: string }) {
	const { t } = useTranslation("settings");
	const normalizedStatus = status.toLowerCase();
	const statusKey = getLegalCaseStatusLabel(status);
	const label = t(`legalCases.status.${statusKey}`) || status;
	const variant = getLegalCaseStatusVariant(status);

	// Closed status uses checkmark, others use dot
	const isClosed = normalizedStatus === "closed";

	return (
		<div
			className={`inline-flex items-center gap-1.5 rounded-md font-medium border transition-colors whitespace-nowrap w-fit ${
				variant === "success"
					? "bg-success/10 text-success border-success/15"
					: variant === "warning"
					? "bg-warning/10 text-warning border-warning/15"
					: variant === "error"
					? "bg-error/10 text-error border-error/15"
					: "bg-information/10 text-information border-information/15"
			} ps-0.5 pe-2 py-0.5`}>
			{isClosed ? (
				<CheckCircle
					size={16}
					className={
						variant === "success" ? "fill-success" : "fill-information"
					}
				/>
			) : (
				<Dot
					size={16}
					className={
						variant === "success"
							? "fill-success"
							: variant === "warning"
							? "fill-warning"
							: variant === "error"
							? "fill-error"
							: "fill-information"
					}
				/>
			)}
			<span className='text-xs leading-4'>{label}</span>
		</div>
	);
}

export default function LegalCasesTable({
	data,
	onViewDetails,
	onChangeStatus,
	onRowSelectionChange,
	renderFloatingBar,
	pagination,
	onPaginationChange,
	pageCount,
}: LegalCasesTableProps) {
	const { t } = useTranslation("settings");
	const shouldShowActions = Boolean(onChangeStatus);
	const columns: ColumnDef<LegalCase>[] = useMemo(
		() => {
			const cols: ColumnDef<LegalCase>[] = [
			// TODO: Re-enable row selection when bulk actions are implemented
			// {
			// 	id: "select",
			// 	header: ({ table }) => (
			// 		<Checkbox
			// 			checked={table.getIsAllPageRowsSelected()}
			// 			onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
			// 			className='m-0 mb-0.5 me-0.5'
			// 		/>
			// 	),
			// 	cell: ({ row }) => (
			// 		<Checkbox
			// 			checked={row.getIsSelected()}
			// 			onChange={(e) => row.toggleSelected(e.target.checked)}
			// 			className='m-0 me-0.5'
			// 		/>
			// 	),
			// 	size: 40,
			// 	enableSorting: false,
			// },
			{
				accessorKey: "case_number",
				header: () => (
					<div className='flex items-center gap-2'>
						<Hashtag size={16} />
						<span className='text-sm text-text-strong'>
							{t("legalCases.table.caseNo")}
						</span>
					</div>
				),
				cell: ({ row }) => (
					<span className='text-sm font-medium text-text-strong'>
						{row.original.case_number}
					</span>
				),
				meta: { className: "hidden sm:table-cell" },
				size: 113,
			},
			{
				accessorKey: "title",
				header: () => (
					<div className='flex items-center gap-2'>
						<Page size={16} />
						<span className='text-sm text-text-strong'>
							{t("legalCases.table.caseTitle")}
						</span>
					</div>
				),
				cell: ({ row }) => (
					<span className='text-sm text-text-strong block truncate max-w-full'>
						{row.original.title}
					</span>
				),
				size: 285,
			},
			{
				accessorKey: "type",
				header: () => (
					<div className='flex items-center gap-2'>
						<FolderOpen size={16} />
						<span className='text-sm text-text-strong'>
							{t("legalCases.table.type")}
						</span>
					</div>
				),
				cell: ({ row }) => (
					<span className='text-sm text-text-sub'>
						{row.original.type || "-"}
					</span>
				),
				meta: { className: "hidden lg:table-cell" },
				size: 186,
			},
			{
				accessorKey: "created_at",
				header: () => (
					<div className='flex items-center gap-2'>
						<Calendar size={16} />
						<span className='text-sm text-text-strong'>
							{t("legalCases.table.dateCreated")}
						</span>
					</div>
				),
				cell: ({ row }) => (
					<span className='text-sm text-text-sub'>
						{formatLegalCaseDate(row.original.created_at)}
					</span>
				),
				meta: { className: "hidden md:table-cell" },
				size: 186,
			},
			{
				accessorKey: "updated_at",
				header: () => (
					<div className='flex items-center gap-2'>
						<Calendar size={16} />
						<span className='text-sm text-text-strong'>
							{t("legalCases.table.lastUpdated")}
						</span>
					</div>
				),
				cell: ({ row }) => (
					<span className='text-sm text-text-sub'>
						{formatLegalCaseDate(row.original.updated_at)}
					</span>
				),
				meta: { className: "hidden lg:table-cell" },
				size: 186,
			},
			{
				accessorKey: "status",
				header: () => (
					<div className='flex items-center gap-2'>
						<Tag size={16} />
						<span className='text-sm text-text-strong'>
							{t("legalCases.table.status")}
						</span>
					</div>
				),
				cell: ({ row }) => <LegalCaseStatusCell status={row.original.status} />,
				size: 132,
			},
		];

		if (shouldShowActions) {
			cols.push({
				id: "actions",
				header: () => <div />,
				cell: ({ row }) => (
					<LegalCaseActionsCell
						legalCase={row.original}
						onViewDetails={onViewDetails}
						onChangeStatus={onChangeStatus}
					/>
				),
				size: 120,
			});
		}

		return cols;
	},
		[t, onViewDetails, onChangeStatus, shouldShowActions]
	);

	return (
		<DataTable
			columns={columns}
			data={data}
			// TODO: Re-enable row selection when bulk actions are implemented
			enableRowSelection={false}
			onRowSelectionChange={onRowSelectionChange}
			showPagination={true}
			pageSize={pagination.pageSize}
			// renderFloatingBar={renderFloatingBar}
			onRowClick={onViewDetails}
			pagination={pagination}
			onPaginationChange={onPaginationChange}
			manualPagination={true}
			pageCount={pageCount}
		/>
	);
}
