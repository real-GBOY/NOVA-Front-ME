/** @format */

import { useState, useRef, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Dropdown from "@/designSystem/Dropdown";
import ConfirmModal from "@/designSystem/ConfirmModal";
import {
	ReturnAssetModal,
	TransferAssetModal,
	AssignAssetModal,
	ViewAssetModal,
} from "../../modals";
import {
	MoreVertical,
	Trash,
	AddLine,
	Eye,
	ArrowRotateLeft,
	LaptopExchange,
} from "@/Icons";
import {
	useDeleteAsset,
	useReturnAsset,
	useTransferAsset,
	useAssignAsset,
} from "@/hooks/assets/useAssets";
import type { Asset } from "@/services/assetService";
import { toast } from "sonner";
import { usePermissions } from "@/contexts/PermissionContext";

interface ActionCellProps {
	asset: Asset;
}

function ActionCell({ asset }: ActionCellProps) {
	const { t } = useTranslation("settings");
	const { can } = usePermissions();
	const menuButtonRef = useRef<HTMLButtonElement>(null);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
	const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
	const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);

	const deleteAssetMutation = useDeleteAsset();
	const returnAssetMutation = useReturnAsset();
	const transferAssetMutation = useTransferAsset();
	const assignAssetMutation = useAssignAsset();

	const isAssigned = asset.status === "assigned";

	// Build dropdown items based on asset assignment status and permissions
	const dropdownItems = useMemo(() => {
		type DropdownItemType = {
			id: string;
			label: string;
			icon: typeof Eye;
			variant?: "primary" | "danger";
			onClick: () => void;
		};
		
		const items: DropdownItemType[] = [];

		// Assign to Member - only show if asset is NOT assigned and has permission
		if (!isAssigned && can("assign_asset")) {
			items.push({
				id: "assign",
				label: t("assets.actions.assignToMember"),
				icon: AddLine,
				variant: "primary",
				onClick: () => {
					setTimeout(() => {
						setIsAssignModalOpen(true);
					}, 0);
				},
			});
		}

		// View Asset - always show (read permission assumed if can see table)
		items.push({
			id: "view",
			label: t("assets.actions.viewAsset"),
			icon: Eye,
			onClick: () => {
				setTimeout(() => {
					setIsViewModalOpen(true);
				}, 0);
			},
		});

		// Mark as Returned - require return_asset permission
		if (can("return_asset")) {
			items.push({
				id: "return",
				label: t("assets.actions.markAsReturned"),
				icon: ArrowRotateLeft,
				onClick: () => {
					setTimeout(() => {
						setIsReturnModalOpen(true);
					}, 0);
				},
			});
		}

		// Transfer Asset - only show if asset IS assigned and has permission
		if (isAssigned && can("assign_asset")) {
			items.push({
				id: "transfer",
				label: t("assets.actions.transferAsset"),
				icon: LaptopExchange,
				onClick: () => {
					setTimeout(() => {
						setIsTransferModalOpen(true);
					}, 0);
				},
			});
		}

		// Delete Asset - require delete_asset permission
		if (can("delete_asset")) {
			items.push({
				id: "delete",
				label: t("assets.actions.deleteAsset"),
				icon: Trash,
				variant: "danger",
				onClick: () => {
					setTimeout(() => {
						setIsDeleteModalOpen(true);
					}, 0);
				},
			});
		}

		return items;
	}, [t, can, isAssigned]);

	const handleDeleteConfirm = async () => {
		try {
			await deleteAssetMutation.mutateAsync(asset.id);
			toast.success("Asset deleted successfully");
			setIsDeleteModalOpen(false);
		} catch (error) {
			console.error("Error deleting asset:", error);
			toast.error("Failed to delete asset");
		}
	};

	const handleReturnConfirm = async (data: {
		returnDate: Date;
		condition: string;
		notes: string;
		sendToMaintenance: boolean;
	}) => {
		try {
			await returnAssetMutation.mutateAsync({
				id: asset.id,
				payload: {
					return_date: data.returnDate.toISOString().split("T")[0],
					condition_on_return: data.condition,
					notes: data.notes || undefined,
					send_to_maintenance: data.sendToMaintenance,
				},
			});
			toast.success("Asset returned successfully");
			setIsReturnModalOpen(false);
		} catch (error) {
			console.error("Error returning asset:", error);
			toast.error("Failed to return asset");
		}
	};

	const handleTransferConfirm = async (data: {
		toEmployeeId: string;
		transferDate?: Date;
		condition?: string;
		notes?: string;
	}) => {
		try {
			await transferAssetMutation.mutateAsync({
				id: asset.id,
				payload: {
					to_employee_id: Number(data.toEmployeeId),
					transfer_date: data.transferDate
						? data.transferDate.toISOString().split("T")[0]
						: undefined,
					condition: data.condition,
					notes: data.notes,
				},
			});
			toast.success("Asset transferred successfully");
			setIsTransferModalOpen(false);
		} catch (error) {
			console.error("Error transferring asset:", error);
			toast.error("Failed to transfer asset");
		}
	};

	const handleAssignConfirm = async (data: {
		memberId: string;
		assignedDate: Date;
		condition: string;
		notes: string;
	}) => {
		try {
			await assignAssetMutation.mutateAsync({
				id: asset.id,
				payload: {
					employee_id: Number(data.memberId),
					assigned_date: data.assignedDate.toISOString().split("T")[0],
					condition_at_handover: data.condition,
					notes: data.notes || undefined,
				},
			});
			toast.success("Asset assigned successfully");
			setIsAssignModalOpen(false);
		} catch (error) {
			console.error("Error assigning asset:", error);
			toast.error("Failed to assign asset");
		}
	};

	return (
		<>
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

			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				onConfirm={handleDeleteConfirm}
				title={t("assets.deleteConfirm.title")}
				description={t("assets.deleteConfirm.description")}
				confirmText={t("assets.deleteConfirm.confirmButton")}
				cancelText={t("assets.deleteConfirm.cancelButton")}
				variant='error'
				icon='exclamation'
			/>

			<ReturnAssetModal
				isOpen={isReturnModalOpen}
				onClose={() => setIsReturnModalOpen(false)}
				asset={asset}
				onConfirm={handleReturnConfirm}
			/>

			<TransferAssetModal
				isOpen={isTransferModalOpen}
				onClose={() => setIsTransferModalOpen(false)}
				asset={asset}
				onConfirm={handleTransferConfirm}
			/>

			<AssignAssetModal
				isOpen={isAssignModalOpen}
				onClose={() => setIsAssignModalOpen(false)}
				asset={asset}
				onConfirm={handleAssignConfirm}
			/>

			<ViewAssetModal
				isOpen={isViewModalOpen}
				onClose={() => setIsViewModalOpen(false)}
				asset={asset}
				onRequestReturn={() => {
					setIsViewModalOpen(false);
					setTimeout(() => {
						setIsReturnModalOpen(true);
					}, 0);
				}}
			/>
		</>
	);
}

export default ActionCell;
