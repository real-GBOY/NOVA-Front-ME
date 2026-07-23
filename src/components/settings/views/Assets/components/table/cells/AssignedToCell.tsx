/** @format */

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Button from "@/designSystem/Button";
import { AssignAssetModal } from "../../modals";
import { useAssignAsset } from "@/hooks/assets/useAssets";
import type { Asset } from "@/services/assetService";
import { toast } from "sonner";
import MemberTag2 from "@/components/requests/ui/MemberTag2";
import { usePermissions } from "@/contexts/PermissionContext";

interface AssignedToCellProps {
	asset: Asset;
}

function AssignedToCell({ asset }: AssignedToCellProps) {
	const { t } = useTranslation("settings");
	const { can } = usePermissions();
	const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
	const assignAssetMutation = useAssignAsset();
	const isAssigned = asset.status === "assigned";
	const canAssign = can("assign_asset");

	// Get assigned user from assigned_to, assignment.employee, or derive from assignment
	const assignedUser =
		asset.assigned_to ||
		asset.assignment?.employee ||
		(asset.assignment?.employee_id
			? {
					id: asset.assignment.employee_id,
					name:
						asset.assignment.employee?.name ||
						asset.assignment.employee_name ||
						"",
					email:
						asset.assignment.employee?.email ||
						asset.assignment.employee_email ||
						"",
					avatar:
						asset.assignment.employee?.avatar ||
						asset.assignment.employee_avatar ||
						null,
					job_title:
						asset.assignment.employee?.job_title ||
						asset.assignment.employee_job_title ||
						null,
			  }
			: null);

	if (isAssigned && assignedUser) {
		const avatar = assignedUser.avatar || "/icons/defAvatar.png";
		const userName = assignedUser.name;

		return (
			<div className='pr-5 py-3'>
				<MemberTag2 avatar={avatar} name={userName} />
			</div>
		);
	}

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
			<Button
				variant='secondary'
				onClick={() => {
					if (!canAssign) return;
					setIsAssignModalOpen(true);
				}}
				disabled={!canAssign}
				className='!text-sm !text-primary hover:!cursor-pointer !cursor-pointer !border-0 disabled:!cursor-not-allowed disabled:!text-text-soft'>
				+ {t("assets.assign")}
			</Button>

			{canAssign && (
				<AssignAssetModal
					isOpen={isAssignModalOpen}
					onClose={() => setIsAssignModalOpen(false)}
					asset={asset}
					onConfirm={handleAssignConfirm}
				/>
			)}
		</>
	);
}

export default AssignedToCell;
