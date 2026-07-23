/** @format */

import { useMemo, useRef, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/designSystem/ui/data-table";
import Checkbox from "@/designSystem/Checkbox";
import Dropdown from "@/designSystem/Dropdown";
import { MoreVertical, Eye, UserPlusCircleAlt, Edit, Trash } from "@/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import type { ViewShift } from "./types";

type ShiftsTableProps = {
	shifts: ViewShift[];
	onViewDetails?: (shift: ViewShift) => void;
	onEdit?: (shift: ViewShift) => void;
	onArchive?: (shift: ViewShift) => void;
	onAssignEmployees?: (shift: ViewShift) => void;
	onViewAssignments?: (shift: ViewShift) => void;
	globalFilter?: string;
};

// Actions Cell Component
function ActionCell({
	shift,
	onViewDetails,
	onEdit,
	onArchive,
	onAssignEmployees,
}: {
	shift: ViewShift;
	onViewDetails?: (shift: ViewShift) => void;
	onEdit?: (shift: ViewShift) => void;
	onArchive?: (shift: ViewShift) => void;
	onAssignEmployees?: (shift: ViewShift) => void;
}) {
	const menuButtonRef = useRef<HTMLButtonElement>(null);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const { t } = useTranslation("settings");

	const dropdownItems = [];

	if (onViewDetails) {
		dropdownItems.push({
			id: "view",
			label: t("companySettings.shifts.actions.viewDetails"),
			icon: Eye,
			onClick: () => {
				onViewDetails(shift);
				setIsDropdownOpen(false);
			},
		});
	}

	if (onEdit) {
		dropdownItems.push({
			id: "edit",
			label: t("companySettings.shifts.actions.edit"),
			icon: Edit,
			onClick: () => {
				onEdit(shift);
				setIsDropdownOpen(false);
			},
		});
	}

	if (onAssignEmployees) {
		dropdownItems.push({
			id: "assign",
			label: t("companySettings.shifts.actions.assignEmployees"),
			icon: UserPlusCircleAlt,
			onClick: () => {
				onAssignEmployees(shift);
				setIsDropdownOpen(false);
			},
		});
	}

	if (onArchive) {
		dropdownItems.push({
			id: "archive",
			label: t("companySettings.shifts.actions.archive"),
			icon: Trash,
			onClick: () => {
				onArchive(shift);
				setIsDropdownOpen(false);
			},
		});
	}

	if (dropdownItems.length === 0) return null;

	return (
		<div className='relative flex justify-end gap-2' data-row-click-ignore>
			{onAssignEmployees && (
				<button
					onClick={() => onAssignEmployees(shift)}
					className='flex items-center justify-center p-1.5 bg-background border border-border rounded-lg shrink-0 transition-colors hover:bg-bg-weak'
					aria-label={t("companySettings.shifts.actions.assignEmployees")}>
					<UserPlusCircleAlt size={20} className='fill-icon-sub' />
				</button>
			)}
			<button
				ref={menuButtonRef}
				onClick={() => setIsDropdownOpen(!isDropdownOpen)}
				data-row-menu-trigger
				className={`flex items-center justify-center p-1.5 bg-background border border-border rounded-lg shrink-0 transition-colors hover:bg-bg-weak ${
					isDropdownOpen ? "bg-bg-weak" : ""
				}`}
				aria-label={t("companySettings.shifts.actions.more")}>
				<MoreVertical size={20} className='fill-icon-sub' />
			</button>
			<Dropdown
				items={dropdownItems}
				isOpen={isDropdownOpen}
				onClose={() => setIsDropdownOpen(false)}
				anchorRef={menuButtonRef}
			/>
		</div>
	);
}

function ShiftsTable({
	shifts,
	onViewDetails,
	onEdit,
	onArchive,
	onAssignEmployees,
	onViewAssignments,
	globalFilter = "",
}: ShiftsTableProps) {
	const { t } = useTranslation("settings");
	const hasActions = Boolean(onViewDetails || onEdit || onArchive || onAssignEmployees);

	const columns: ColumnDef<ViewShift>[] = useMemo(() => {
		const baseColumns: ColumnDef<ViewShift>[] = [
			{
				id: "select",
				header: ({ table }) => (
					<Checkbox
						checked={table.getIsAllPageRowsSelected()}
						onChange={(e) =>
							table.toggleAllPageRowsSelected(e.target.checked)
						}
					/>
				),
				cell: ({ row }) => (
					<Checkbox
						checked={row.getIsSelected()}
						onChange={(e) => row.toggleSelected(e.target.checked)}
					/>
				),
				size: 40,
				enableSorting: false,
			},
			{
				accessorKey: "name",
				header: () => (
					<div className='flex items-center gap-2'>
						<span>{t("companySettings.shifts.table.name")}</span>
					</div>
				),
				cell: ({ row }) => (
					<span className='text-sm font-normal text-text-strong'>
						{row.original.name}
					</span>
				),
				enableSorting: true,
			},
			{
				accessorKey: "description",
				header: () => (
					<div className='flex items-center gap-2'>
						<span>{t("companySettings.shifts.table.description")}</span>
					</div>
				),
				cell: ({ row }) => (
					<span className='text-sm font-normal text-text-sub'>
						{row.original.description || "—"}
					</span>
				),
				enableSorting: false,
			},
			{
				accessorKey: "timezone",
				header: () => (
					<div className='flex items-center gap-2'>
						<span>{t("companySettings.shifts.table.timezone")}</span>
					</div>
				),
				cell: ({ row }) => (
					<span className='text-sm font-normal text-text-strong'>
						{row.original.timezone}
					</span>
				),
				enableSorting: true,
			},
			{
				accessorKey: "workingDaysCount",
				header: () => (
					<div className='flex items-center gap-2'>
						<span>{t("companySettings.shifts.table.workingDays")}</span>
					</div>
				),
				cell: ({ row }) => (
					<span className='text-sm font-normal text-text-strong'>
						{row.original.workingDaysCount}{" "}
						{row.original.workingDaysCount === 1
							? t("companySettings.shifts.table.day")
							: t("companySettings.shifts.table.days")}
					</span>
				),
				enableSorting: true,
			},
			{
				accessorKey: "isDefault",
				header: () => (
					<div className='flex items-center gap-2'>
						<span>{t("companySettings.shifts.table.isDefault")}</span>
					</div>
				),
				cell: ({ row }) => (
					<span
						className={`text-sm font-normal ${
							row.original.isDefault ? "text-primary" : "text-text-sub"
						}`}>
						{row.original.isDefault
							? t("companySettings.shifts.table.yes")
							: t("companySettings.shifts.table.no")}
					</span>
				),
				enableSorting: true,
			},
		];

		if (hasActions) {
			baseColumns.push({
				id: "actions",
				header: "",
				cell: ({ row }) => (
					<ActionCell
						shift={row.original}
						onViewDetails={onViewDetails}
						onEdit={onEdit}
						onArchive={onArchive}
						onAssignEmployees={onAssignEmployees}
					/>
				),
				size: 120,
				enableSorting: false,
			});
		}

		return baseColumns;
	}, [t, onViewDetails, onEdit, onArchive, onAssignEmployees, hasActions]);

	return (
		<DataTable
			columns={columns}
			data={shifts}
			pageSize={7}
			globalFilter={globalFilter}
			enableRowSelection={true}
			translationNamespace='settings'
			onRowClick={onViewAssignments}
		/>
	);
}

export default ShiftsTable;
