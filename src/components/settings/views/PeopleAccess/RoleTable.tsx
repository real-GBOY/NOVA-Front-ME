/** @format */

import { useMemo, useRef, useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/designSystem/ui/data-table";
import Dropdown from "@/designSystem/Dropdown";
import Checkbox from "@/designSystem/Checkbox";
import { MoreVertical, PenToSquare, Trash } from "@/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import { usePermissions } from "@/contexts/PermissionContext";
import type { Updater } from "@tanstack/react-table";

export type Role = {
	id?: number | string;
	title: string;
	description: string;
	membersCount: number;
	jobTitles?: string[];
};

type RoleTableProps = {
	roles: Role[];
	onEdit?: (roleTitle: string) => void;
	onDuplicate?: (roleTitle: string) => void;
	onDelete?: (roleTitle: string) => void;
	onMembersClick?: (roleTitle: string) => void;
};

// Actions Cell Component
function ActionCell({
	role,
	onEdit,
	onDuplicate,
	onDelete,
}: {
	role: Role;
	onEdit?: (title: string) => void;
	onDuplicate?: (title: string) => void;
	onDelete?: (title: string) => void;
}) {
	const { t } = useTranslation("settings");
	const { can } = usePermissions();
	const menuButtonRef = useRef<HTMLButtonElement>(null);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const dropdownItems = useMemo(() => {
		const items: Array<{
			id: string;
			label: string;
			icon: typeof PenToSquare;
			variant?: "danger";
			onClick: () => void;
		}> = [];

		// Edit requires update_role permission
		if (onEdit && can("update_role")) {
			items.push({
				id: "edit",
				label: t("rolesPermissions.actions.edit"),
				icon: PenToSquare,
				onClick: () => {
					onEdit(role.title);
					setIsDropdownOpen(false);
				},
			});
		}



		// Delete requires delete_role permission
		if (onDelete && can("delete_role")) {
			items.push({
				id: "delete",
				label: t("rolesPermissions.actions.delete"),
				icon: Trash,
				variant: "danger" as const,
				onClick: () => {
					onDelete(role.title);
					setIsDropdownOpen(false);
				},
			});
		}

		return items;
	}, [t, can, onEdit, onDuplicate, onDelete, role.title]);

	if (dropdownItems.length === 0) return null;

	return (
      <div className='relative flex justify-end'>
         <button
            ref={menuButtonRef}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            data-row-menu-trigger
            className={`flex items-center justify-center p-1.5 bg-background border border-border rounded-lg shrink-0 transition-colors hover:bg-bg-weak ${
               isDropdownOpen ? "bg-bg-weak" : ""
            }`}>
				<MoreVertical size={20} />
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

function RoleTable({
	roles,
	onEdit,
	onDuplicate,
	onDelete,
	onMembersClick,
}: RoleTableProps) {
	const { t } = useTranslation("settings");
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 7,
	});

	// Reset to first page when data changes significantly
	useEffect(() => {
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	}, [roles.length]);

	const handlePaginationChange = (updater: Updater<typeof pagination>) => {
		setPagination((prev) => {
			if (typeof updater === "function") {
				return updater(prev);
			}
			return updater;
		});
	};

	const columns: ColumnDef<Role>[] = useMemo(
		() => [
			{
				id: "select",
				header: ({ table }) => (
					<Checkbox
						checked={table.getIsAllPageRowsSelected()}
						onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
						className='m-0 mb-0.5 me-0.5'
					/>
				),
				cell: ({ row }) => (
					<Checkbox
						checked={row.getIsSelected()}
						onChange={(e) => row.toggleSelected(e.target.checked)}
						className='m-0 me-0.5'
					/>
				),
				size: 40,
				enableSorting: false,
			},
			{
				accessorKey: "title",
				header: t("rolesPermissions.table.roleName"),
				cell: ({ row }) => (
					<span className='text-sm font-normal text-text-strong'>
						{row.original.title}
					</span>
				),
			},
			{
				accessorKey: "description",
				header: t("rolesPermissions.table.description"),
				cell: ({ row }) => (
					<p className='text-sm font-normal text-text-strong truncate max-w-md'>
						{row.original.description}
					</p>
				),
			},
			{
				accessorKey: "jobTitles",
				header: t("rolesPermissions.table.jobTitles"),
				cell: ({ row }) => (
					<div className='flex flex-wrap gap-2 items-center'>
						{row.original.jobTitles?.slice(0, 2).map((jobTitle, idx) => (
							<div
								key={idx}
								className='px-2 py-1 bg-bg-weak border border-border rounded-lg'>
								<span className='text-xs font-medium text-text-sub'>
									{jobTitle}
								</span>
							</div>
						))}
						{row.original.jobTitles && row.original.jobTitles.length > 2 && (
							<div className='px-2 py-1 bg-bg-weak border border-border rounded-lg'>
								<span className='text-xs font-medium text-text-sub'>
									+{row.original.jobTitles.length - 2}
								</span>
							</div>
						)}
					</div>
				),
				enableSorting: false,
				size: 400,
			},
			{
				accessorKey: "membersCount",
				header: t("rolesPermissions.table.noMembers"),
				cell: ({ row }) => (
					<button
						onClick={() => onMembersClick?.(row.original.title)}
						className='text-sm font-normal text-primary hover:underline cursor-pointer'>
						{row.original.membersCount}
					</button>
				),
			},
			{
				id: "actions",
				header: "",
				cell: ({ row }) => (
					<ActionCell
						role={row.original}
						onEdit={onEdit}
						onDuplicate={onDuplicate}
						onDelete={onDelete}
					/>
				),
				size: 64,
				enableSorting: false,
			},
		],
		[onEdit, onDuplicate, onDelete, onMembersClick, t]
	);

	return (
		<DataTable
			columns={columns}
			data={roles}
			pageSize={7}
			enableRowSelection={true}
			showPagination={true}
			pagination={pagination}
			onPaginationChange={handlePaginationChange}
			manualPagination={false}
		/>
	);
}

export default RoleTable;
