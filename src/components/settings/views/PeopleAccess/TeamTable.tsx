/** @format */

import { useMemo, useRef, useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/designSystem/ui/data-table";
import Dropdown from "@/designSystem/Dropdown";
import Checkbox from "@/designSystem/Checkbox";
import { MoreVertical, PenToSquare, Trash } from "@/Icons";
import { usePermissions } from "@/contexts/PermissionContext";
import type { Updater } from "@tanstack/react-table";

export type Team = {
	id: number;
	title: string;
	description: string;
	membersCount: number;
	jobTitles?: string[];
};

type TeamTableProps = {
	teams: Team[];
	onEdit?: (teamTitle: string) => void;
	onDuplicate?: (teamTitle: string) => void;
	onDelete?: (teamTitle: string) => void;
	onMembersClick?: (teamTitle: string) => void;
};

// Actions Cell Component
function ActionCell({
	team,
	onEdit,
	onDuplicate,
	onDelete,
}: {
	team: Team;
	onEdit?: (title: string) => void;
	onDuplicate?: (title: string) => void;
	onDelete?: (title: string) => void;
}) {
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

		// Edit requires update_team permission
		if (onEdit && can("update_team")) {
			items.push({
				id: "edit",
				label: "Edit",
				icon: PenToSquare,
				onClick: () => {
					onEdit(team.title);
					setIsDropdownOpen(false);
				},
			});
		}



		// Delete requires delete_team permission
		if (onDelete && can("delete_team")) {
			items.push({
				id: "delete",
				label: "Delete",
				icon: Trash,
				variant: "danger",
				onClick: () => {
					onDelete(team.title);
					setIsDropdownOpen(false);
				},
			});
		}

		return items;
	}, [can, onEdit, onDuplicate, onDelete, team.title]);

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

function TeamTable({
	teams,
	onEdit,
	onDuplicate,
	onDelete,
	onMembersClick,
}: TeamTableProps) {
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 7,
	});

	// Reset to first page when data changes significantly
	useEffect(() => {
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	}, [teams.length]);

	const handlePaginationChange = (updater: Updater<typeof pagination>) => {
		setPagination((prev) => {
			if (typeof updater === "function") {
				return updater(prev);
			}
			return updater;
		});
	};

	const columns: ColumnDef<Team>[] = useMemo(
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
				header: "Team Name",
				cell: ({ row }) => (
					<span className='text-sm font-normal text-text-strong'>
						{row.original.title}
					</span>
				),
			},
			{
				accessorKey: "description",
				header: "Description",
				cell: ({ row }) => (
					<p className='text-sm font-normal text-text-strong truncate max-w-md'>
						{row.original.description}
					</p>
				),
			},
			{
				accessorKey: "jobTitles",
				header: "Job Titles",
				cell: ({ row }) => (
					<div className='flex flex-wrap gap-2 items-center'>
						{row.original.jobTitles?.slice(0, 3).map((jobTitle, idx) => (
							<div
								key={idx}
								className='px-2 py-1 bg-background border border-border rounded-lg'>
								<span className='text-xs font-medium text-text-sub'>
									{jobTitle}
								</span>
							</div>
						))}
						{row.original.jobTitles && row.original.jobTitles.length > 3 && (
							<div className='px-2 py-1 bg-background border border-border rounded-lg'>
								<span className='text-xs font-medium text-text-sub'>
									+{row.original.jobTitles.length - 3}
								</span>
							</div>
						)}
					</div>
				),
				size: 400,
				enableSorting: false,
			},
			{
				accessorKey: "membersCount",
				header: "No. Members",
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
						team={row.original}
						onEdit={onEdit}
						onDuplicate={onDuplicate}
						onDelete={onDelete}
					/>
				),
				size: 64,
				enableSorting: false,
			},
		],
		[onEdit, onDuplicate, onDelete, onMembersClick]
	);

	return (
		<DataTable
			columns={columns}
			data={teams}
			pageSize={7}
			enableRowSelection={true}
			showPagination={true}
			pagination={pagination}
			onPaginationChange={handlePaginationChange}
			manualPagination={false}
		/>
	);
}

export default TeamTable;
