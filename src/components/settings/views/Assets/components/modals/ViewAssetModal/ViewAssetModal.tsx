/** @format */

import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import ConfirmModal from "@/designSystem/ConfirmModal";
import {
	ReturnAssetModal,
	TransferAssetModal,
	AssignAssetModal,
} from "../index";
import {
	useGetAssetAssignments,
	useDeleteAsset,
	useReturnAsset,
	useTransferAsset,
	useAssignAsset,
} from "@/hooks/assets/useAssets";
import { getConditionVariant } from "../../../utils";
import { format } from "date-fns";
import { toast } from "sonner";
import type { ViewAssetModalProps, AssignedToData } from "./types";
import ViewAssetModalHeader from "./ViewAssetModalHeader";
import ViewAssetModalAssetHeader from "./ViewAssetModalAssetHeader";
import AssignedToCard from "./AssignedToCard";
import AssetInformationCard from "./AssetInformationCard";
import { usePermissions } from "@/contexts/PermissionContext";

function ViewAssetModal({ isOpen, onClose, asset }: ViewAssetModalProps) {
	const { t } = useTranslation("settings");
	const { can } = usePermissions();
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
	const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
	const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

	const deleteAssetMutation = useDeleteAsset();
	const returnAssetMutation = useReturnAsset();
	const transferAssetMutation = useTransferAsset();
	const assignAssetMutation = useAssignAsset();
	const canAssign = can("assign_asset");
	const canReturn = can("return_asset");
	const canTransfer = canAssign;
	const canDelete = can("delete_asset");

	// Fetch current assignment
	const { data: assignmentsData } = useGetAssetAssignments(
		asset.id,
		{},
		{
			enabled: isOpen && asset.status === "assigned",
		}
	);

	const currentAssignment = assignmentsData?.[0]; // Get the most recent assignment

	const isAssigned = asset.status === "assigned";

	// Get asset image from backend
	const categoryName = asset.category_name || asset.category || "";
	const imagePath = asset.image_url || "";

	// Get assigned to data from asset.assigned_to, asset.assignment, or currentAssignment
	const assignedTo: AssignedToData | null =
		asset.assigned_to ||
		asset.assignment?.employee ||
		currentAssignment?.employee
			? {
					name:
						asset.assigned_to?.name ||
						asset.assignment?.employee?.name ||
						currentAssignment?.employee?.name ||
						"",
					jobTitle:
						asset.assigned_to?.job_title ||
						asset.assignment?.employee?.job_title ||
						currentAssignment?.employee?.job_title ||
						"",
					avatar:
						asset.assigned_to?.avatar ||
						asset.assignment?.employee?.avatar ||
						currentAssignment?.employee?.avatar ||
						"",
					contractName:
						asset.assigned_contract ||
						currentAssignment?.contract_name ||
						asset.assignment?.contract_name ||
						"",
			  }
			: null;

	const assignedDate = currentAssignment?.assigned_date
		? format(new Date(currentAssignment.assigned_date), "dd / MM / yyyy")
		: "";
	const addedDate = asset.created_at
		? format(new Date(asset.created_at), "dd MMM, yyyy")
		: "";
	const notes = currentAssignment?.notes || "";

	const condition = asset.asset_condition || "good";
	const conditionVariant = getConditionVariant(condition);
	const isGoodCondition = conditionVariant === "success";
	const conditionLabel =
		condition === "poor"
			? "Damaged"
			: condition.charAt(0).toUpperCase() + condition.slice(1);

	const status = asset.status || "available";
	const statusLabel =
		status === "assigned"
			? "In-use"
			: status.charAt(0).toUpperCase() + status.slice(1);

	// Handle body overflow
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}

		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	// Handle escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen, onClose]);

	const handleRequestReturn = () => {
		if (!canReturn) return;
		// Only open the ReturnAssetModal, keep ViewAssetModal open
		setIsReturnModalOpen(true);
	};

	const handleDeleteConfirm = async () => {
		try {
			await deleteAssetMutation.mutateAsync(asset.id);
			toast.success("Asset deleted successfully");
			setIsDeleteModalOpen(false);
			onClose();
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

	if (!isOpen) return null;

	return (
		<>
			{/* Backdrop with blur */}
			<div
				className='fixed inset-0 z-60 backdrop-blur-sm bg-overlay'
				onClick={onClose}
			/>

			{/* Right Side Panel */}
			<div
				className={`fixed top-1/2 right-4 -translate-y-1/2 w-[560px] h-[868px] bg-background border-l border-border rounded-[24px] shadow-[0px_16px_32px_-12px_rgba(14,18,27,0.1)] z-70 flex flex-col transition-transform duration-300 ease-in-out ${
					isOpen ? "translate-x-0" : "translate-x-full"
				}`}
				onClick={(e) => e.stopPropagation()}>
				<ViewAssetModalHeader onClose={onClose} />

				<ViewAssetModalAssetHeader
					asset={asset}
					imagePath={imagePath}
					categoryName={categoryName}
					addedDate={addedDate}
					isAssigned={isAssigned}
					onRequestReturn={handleRequestReturn}
					onAssignClick={() => {
						if (!canAssign) return;
						setIsAssignModalOpen(true);
					}}
					onReturnClick={() => {
						if (!canReturn) return;
						setIsReturnModalOpen(true);
					}}
					onTransferClick={() => {
						if (!canTransfer) return;
						setIsTransferModalOpen(true);
					}}
					onDeleteClick={() => {
						if (!canDelete) return;
						setIsDeleteModalOpen(true);
					}}
					canAssign={canAssign}
					canReturn={canReturn}
					canTransfer={canTransfer}
					canDelete={canDelete}
				/>

				{/* Content */}
				<div className='flex-1 overflow-y-auto'>
					<div className='flex flex-col gap-4 p-4'>
						{/* Assigned To Card */}
						{isAssigned && assignedTo && (
							<AssignedToCard assignedTo={assignedTo} />
						)}

						{/* Asset Information Card */}
						<AssetInformationCard
							asset={asset}
							assignedDate={assignedDate}
							notes={notes}
							condition={condition}
							conditionLabel={conditionLabel}
							isGoodCondition={isGoodCondition}
							status={status}
							statusLabel={statusLabel}
						/>
					</div>
				</div>
			</div>

			{/* Modals */}
			{canDelete && (
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
			)}

			{canReturn && (
				<ReturnAssetModal
					isOpen={isReturnModalOpen}
					onClose={() => setIsReturnModalOpen(false)}
					asset={asset}
					onConfirm={handleReturnConfirm}
					zIndex='z-70'
				/>
			)}

			{canTransfer && (
				<TransferAssetModal
					isOpen={isTransferModalOpen}
					onClose={() => setIsTransferModalOpen(false)}
					asset={asset}
					onConfirm={handleTransferConfirm}
					zIndex='z-70'
				/>
			)}

			{canAssign && (
				<AssignAssetModal
					isOpen={isAssignModalOpen}
					onClose={() => setIsAssignModalOpen(false)}
					asset={asset}
					onConfirm={handleAssignConfirm}
					zIndex='z-70'
				/>
			)}
		</>
	);
}

export default ViewAssetModal;
