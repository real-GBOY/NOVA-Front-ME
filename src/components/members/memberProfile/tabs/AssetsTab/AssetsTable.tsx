/** @format */

import { useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/designSystem/ui/data-table";
import { useTranslation } from "@/hooks/useTranslation";
import { CalendarSimpleCheck, LaptopMobile, IdBadge } from "@/Icons";
import { RequestStatusCell, RequestActions } from "../TimeManagmentTab/shared";
import { usePermissions } from "@/contexts/PermissionContext";

export interface Asset {
	id: string;
	assetName: string;
	assignedDate: string;
	assetType: string;
	serialNumber?: string;
	imageUrl?: string;
	status: "active" | "inactive" | "returned" | "pending";
}

interface AssetsTableProps {
	data: Asset[];
	onApprove?: (id: string) => void;
	onReject?: (id: string) => void;
	onRowClick?: (asset: Asset) => void;
}

// Actions Cell Component
function ActionsCell({
	asset,
	onApprove,
	onReject,
}: {
	asset: Asset;
	onApprove: (id: string) => void;
	onReject: (id: string) => void;
}) {
	const { t } = useTranslation("members");
	const { can } = usePermissions();
	const canManageAssets =
		can("manage_assets") || can("assign_asset") || can("update_asset");

	// Show action buttons for pending assets
	if (asset.status === "pending") {
		if (!canManageAssets) {
			return (
				<RequestStatusCell
					status="pending"
					label={t("profile.assets.status.pending", "Pending")}
				/>
			);
		}
		return (
			<RequestActions
				id={asset.id}
				onApprove={onApprove}
				onReject={onReject}
				approveLabel={t("profile.assets.actions.approve")}
				rejectAriaLabel={t("profile.assets.actions.reject")}
			/>
		);
	}

	// Show status tag for non-pending assets
	const statusMap: Record<
		Exclude<Asset["status"], "pending">,
		"approved" | "rejected" | "completed"
	> = {
		active: "approved",
		inactive: "rejected",
		returned: "completed",
	};

	return (
		<RequestStatusCell
			status={statusMap[asset.status]}
			label={t(`profile.assets.status.${asset.status}`)}
		/>
	);
}

function AssetsTable({ data, onApprove, onReject, onRowClick }: AssetsTableProps) {
	const { t } = useTranslation("members");

	const handleApprove = useCallback((id: string) => {
		if (onApprove) {
			onApprove(id);
		}
	}, [onApprove]);

	const handleReject = useCallback((id: string) => {
		if (onReject) {
			onReject(id);
		}
	}, [onReject]);

	const columns: ColumnDef<Asset>[] = useMemo(
		() => [
			{
				accessorKey: "assetName",
				header: () => (
					<div className='flex items-center gap-2'>
						<LaptopMobile size={16} />
						<span>{t("profile.assets.table.assetName")}</span>
					</div>
				),
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						{row.original.imageUrl && (
							<img
								src={row.original.imageUrl}
								alt={row.original.assetType || row.original.assetName}
								className="w-5 h-5 object-contain"
							/>
						)}
						<p className='text-sm text-text-strong'>
							{row.original.assetName}
						</p>
					</div>
				),
				size: 250,
				enableSorting: true,
			},
			{
				accessorKey: "assignedDate",
				header: () => (
					<div className='flex items-center gap-2'>
						<CalendarSimpleCheck size={16} />
						<span>{t("profile.assets.table.assignedDate")}</span>
					</div>
				),
				cell: ({ getValue }) => (
					<p className='text-sm text-text-strong'>{getValue() as string}</p>
				),
				size: 200,
				enableSorting: true,
			},
			{
				accessorKey: "assetType",
				header: () => (
					<div className='flex items-center gap-2'>
						<IdBadge size={16} />
						<span>{t("profile.assets.table.assetType")}</span>
					</div>
				),
				cell: ({ getValue }) => (
					<p className='text-sm text-text-strong'>{getValue() as string}</p>
				),
				size: 200,
			},
			{
				accessorKey: "serialNumber",
				header: () => (
					<div className='flex items-center gap-2'>
						<span>{t("profile.assets.table.serialNumber")}</span>
					</div>
				),
				cell: ({ getValue }) => {
					const serialNumber = getValue() as string | undefined;
					return (
						<p className='text-sm text-text-strong'>{serialNumber || "-"}</p>
					);
				},
				size: 200,
			},
			{
				id: "actions",
				header: "",
				cell: ({ row }) => (
					<ActionsCell
						asset={row.original}
						onApprove={handleApprove}
						onReject={handleReject}
					/>
				),
				size: 100,
			},
		],
		[t, handleApprove, handleReject]
	);

	return (
		<div className='r-table-scroll xl:mx-0'>
			<DataTable
				columns={columns}
				data={data}
				enableRowSelection={false}
				showPagination={true}
				pageSize={7}
				translationNamespace='members'
				className='w-full'
				onRowClick={onRowClick}
			/>
		</div>
	);
}

export default AssetsTable;
