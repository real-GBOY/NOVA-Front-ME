/** @format */

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "@/hooks/useTranslation";
import { Briefcase, UserSimpleAlt, Hashtag } from "@/Icons";
import {
	ActionCell,
	AssetNameCell,
	CategoryCell,
	StatusCell,
	AssignedToCell,
	ConditionCell,
	SerialNumberCell,
} from "./cells";
import type { Asset } from "@/services/assetService";

export function useAssetsTableColumns(): ColumnDef<Asset>[] {
	const { t } = useTranslation("settings");

	return useMemo(
		() => [
			{
				accessorKey: "name",
				header: () => (
					<div className='flex items-center gap-2 ps-4'>
						<Briefcase size={16} />
						<span>{t("assets.table.assetName")}</span>
					</div>
				),
				cell: ({ row }) => <AssetNameCell asset={row.original} />,
				size: 254,
			},
			{
				accessorKey: "category",
				header: () => (
					<div className='flex items-center gap-2'>
						<UserSimpleAlt size={16} />
						<span>{t("assets.table.category")}</span>
					</div>
				),
				cell: ({ row }) => <CategoryCell asset={row.original} />,
				size: 168,
			},
			{
				accessorKey: "status",
				header: () => (
					<div className='flex items-center gap-2'>
						<UserSimpleAlt size={16} />
						<span>{t("assets.table.status")}</span>
					</div>
				),
				cell: ({ row }) => <StatusCell asset={row.original} />,
				size: 168,
			},
			{
				accessorKey: "assigned_to",
				header: () => (
					<div className='flex items-center gap-2'>
						<UserSimpleAlt size={16} />
						<span>{t("assets.table.assignedTo")}</span>
					</div>
				),
				cell: ({ row }) => <AssignedToCell asset={row.original} />,
				size: 180,
			},
			{
				accessorKey: "asset_condition",
				header: () => (
					<div className='flex items-center gap-2'>
						<UserSimpleAlt size={16} />
						<span>{t("assets.table.condition")}</span>
					</div>
				),
				cell: ({ row }) => <ConditionCell asset={row.original} />,
				size: 168,
			},
			{
				accessorKey: "serial",
				header: () => (
					<div className='flex items-center gap-2'>
						<Hashtag size={16} />
						<span>{t("assets.table.serialNumber")}</span>
					</div>
				),
				cell: ({ row }) => <SerialNumberCell asset={row.original} />,
				size: 150,
			},
			{
				id: "actions",
				header: "",
				cell: ({ row }) => <ActionCell asset={row.original} />,
				size: 64,
				enableSorting: false,
			},
		],
		[t]
	);
}
