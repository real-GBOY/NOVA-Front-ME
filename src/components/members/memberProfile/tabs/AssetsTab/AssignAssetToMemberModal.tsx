/** @format */

import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import DatePicker from "@/designSystem/DatePicker";
import SearchableSelect from "@/components/invoices/SearchableSelect";
import { ArrowDownSLine } from "@/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { useAvailableAssetDictionary, useAssignAsset } from "@/hooks/assets/useAssets";
import { assetService } from "@/services/assetService";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { useQueryClient } from "@tanstack/react-query";

interface AssignAssetToMemberModalProps {
	isOpen: boolean;
	onClose: () => void;
	employeeId: string;
}

const conditionOptions = [
	{ id: "good", label: "Good" },
	{ id: "damaged", label: "Damaged" },
	{ id: "needsRepair", label: "Needs Repair" },
];

function AssignAssetToMemberModal({
	isOpen,
	onClose,
	employeeId,
}: AssignAssetToMemberModalProps) {
	const { t } = useTranslation("members");
	const { t: tCommon } = useTranslation("common");
	const queryClient = useQueryClient();
	const [assetId, setAssetId] = useState("");
	const [assignedDate, setAssignedDate] = useState<Date | undefined>(undefined);
	const [condition, setCondition] = useState("");
	const [notes, setNotes] = useState("");
	const [errors, setErrors] = useState<{
		assetId?: string;
		assignedDate?: string;
		condition?: string;
	}>({});
	const [isConditionDropdownOpen, setIsConditionDropdownOpen] = useState(false);
	const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
	const conditionDropdownRef = useRef<HTMLDivElement>(null);

	const { data: availableAssets = [], isLoading: isAssetsLoading } =
		useAvailableAssetDictionary({ enabled: isOpen });
	const assignAssetMutation = useAssignAsset();

	const selectedCondition = conditionOptions.find(
		(option) => option.id === condition
	);

	const fetchAssetOptions = async (search: string) => {
		const response = await assetService.list({
			page: 1,
			limit: 50,
			search: search || undefined,
			status: "available",
		});
		return (response.data || []).map((asset) => ({
			id: String(asset.id),
			label: asset.name,
			avatarUrl: asset.image_url || undefined,
			searchText: asset.serial || asset.serial_number || undefined,
		}));
	};

	const isDirty = useMemo(
		() =>
			Boolean(assetId || assignedDate || condition || notes.trim()),
		[assetId, assignedDate, condition, notes]
	);

	useEffect(() => {
		if (!isOpen) {
			setAssetId("");
			setAssignedDate(undefined);
			setCondition("");
			setNotes("");
			setErrors({});
		}
	}, [isOpen]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				conditionDropdownRef.current &&
				!conditionDropdownRef.current.contains(event.target as Node)
			) {
				setIsConditionDropdownOpen(false);
			}
		};

		if (isConditionDropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isConditionDropdownOpen]);

	const handleRequestClose = () => {
		if (isDirty) {
			setShowDiscardConfirm(true);
			return;
		}
		onClose();
	};

	const handleConfirm = async () => {
		const nextErrors: typeof errors = {};
		if (!assetId) {
			nextErrors.assetId = t(
				"profile.assets.assignModal.assetRequired",
				"Please select an asset."
			);
		}
		if (!assignedDate) {
			nextErrors.assignedDate = t(
				"profile.assets.assignModal.assignedDate",
				"Please select an assigned date."
			);
		}
		if (!condition) {
			nextErrors.condition = t(
				"profile.assets.assignModal.condition",
				"Please select a condition."
			);
		}

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		try {
			await assignAssetMutation.mutateAsync({
				id: assetId,
				payload: {
					employee_id: Number(employeeId),
					assigned_date: assignedDate!.toISOString().split("T")[0],
					condition_at_handover: condition,
					notes: notes.trim() || undefined,
				},
			});

			queryClient.invalidateQueries({
				queryKey: reactQueryKeys.employees.assets(employeeId),
				exact: false,
			});

			toast.success(
				t("profile.assets.assignModal.success", "Asset assigned successfully.")
			);
			onClose();
		} catch (error) {
			console.error("Error assigning asset:", error);
			toast.error(
				t("profile.assets.assignModal.error", "Failed to assign asset.")
			);
		}
	};

	const isFormValid = assetId && assignedDate && condition;

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={handleRequestClose}
				title={t("profile.assets.assignModal.title", "Assign Asset")}
				width="w-[440px]"
				footer={
					<div className="flex items-center justify-end gap-3">
						<Button variant="secondary" onClick={handleRequestClose}>
							{t("profile.assets.assignModal.cancel", "Cancel")}
						</Button>
						<Button
							variant="primary"
							onClick={handleConfirm}
							disabled={!isFormValid || assignAssetMutation.isPending}
							className={
								!isFormValid
									? "bg-bg-weak text-text-disabled cursor-not-allowed"
									: ""
							}>
							{assignAssetMutation.isPending
								? t("profile.assets.assignModal.saving", "Assigning...")
								: t("profile.assets.assignModal.confirm", "Assign")}
						</Button>
					</div>
				}>
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-1">
						<SearchableSelect
							label={t("profile.assets.assignModal.asset", "Asset")}
							placeholder={
								isAssetsLoading
									? t("profile.assets.assignModal.loading", "Loading assets...")
									: t("profile.assets.assignModal.selectAsset", "Select asset")
							}
							value={assetId}
							onChange={(value) => {
								setAssetId(value);
								setErrors((prev) => ({ ...prev, assetId: undefined }));
							}}
							options={availableAssets.map((asset) => ({
								id: asset.id,
								label: asset.label,
								avatarUrl: asset.avatar || undefined,
								searchText: asset.serial ? String(asset.serial) : undefined,
							}))}
							serverSideSearch={true}
							fetchOptions={fetchAssetOptions}
							required={true}
							showTag={true}
							disabled={isAssetsLoading || availableAssets.length === 0}
						/>
						{!isAssetsLoading && availableAssets.length === 0 && (
							<span className="text-xs text-text-sub">
								{t(
									"profile.assets.assignModal.noAssets",
									"No available assets to assign."
								)}
							</span>
						)}
						{errors.assetId && (
							<span className="text-xs text-danger">{errors.assetId}</span>
						)}
					</div>

					<div className="flex flex-col gap-1">
						<label className="text-sm font-medium text-text-strong flex items-center gap-1">
							{t("profile.assets.assignModal.assignedDateLabel", "Assigned Date")}
							<span className="text-primary">*</span>
						</label>
						<DatePicker
							value={assignedDate}
							onChange={(date) => {
								setAssignedDate(date);
								setErrors((prev) => ({ ...prev, assignedDate: undefined }));
							}}
							placeholder={t(
								"profile.assets.assignModal.datePlaceholder",
								"Select a date"
							)}
							className="w-full"
						/>
						{errors.assignedDate && (
							<span className="text-xs text-danger">
								{errors.assignedDate}
							</span>
						)}
					</div>

					<div className="flex flex-col gap-1 relative">
						<label className="text-sm font-medium text-text-strong flex items-center gap-1">
							{t(
								"profile.assets.assignModal.conditionLabel",
								"Condition at handover"
							)}
							<span className="text-primary">*</span>
						</label>
						<div className="relative" ref={conditionDropdownRef}>
							<Button
								variant="secondary"
								type="button"
								onClick={() =>
									setIsConditionDropdownOpen(!isConditionDropdownOpen)
								}
								className="w-full !px-3 !py-2.5 !rounded-[10px] !justify-between hover:!border-text-sub">
								<span
									className={
										selectedCondition ? "text-text-strong" : "text-text-sub"
									}>
									{selectedCondition
										? selectedCondition.label
										: t(
												"profile.assets.assignModal.selectCondition",
												"Select condition"
											)}
								</span>
								<ArrowDownSLine size={20} className="fill-icon-sub shrink-0" />
							</Button>
							{isConditionDropdownOpen && (
								<div className="absolute top-full mt-1 start-0 w-full bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
									<div className="flex flex-col">
										{conditionOptions.map((option) => (
											<Button
												key={option.id}
												variant="secondary"
												type="button"
												onClick={() => {
													setCondition(option.id);
													setErrors((prev) => ({
														...prev,
														condition: undefined,
													}));
													setIsConditionDropdownOpen(false);
												}}
												className={`!px-3 !py-2 !text-sm !text-left !justify-start !w-full !min-w-0 ${
													condition === option.id
														? "!bg-primary/10 !text-primary !border-0"
														: "!border-0 hover:!bg-bg-weak"
												}`}>
												{option.label}
											</Button>
										))}
									</div>
								</div>
							)}
						</div>
						{errors.condition && (
							<span className="text-xs text-danger">{errors.condition}</span>
						)}
					</div>

					<div className="flex flex-col gap-1">
						<label className="text-sm font-medium text-text-strong">
							{t("profile.assets.assignModal.notes", "Notes")}
						</label>
						<div className="relative">
							<textarea
								value={notes}
								onChange={(e) => {
									const value = e.target.value;
									if (value.length <= 200) {
										setNotes(value);
									}
								}}
								placeholder={t(
									"profile.assets.assignModal.notesPlaceholder",
									"Add a note (optional)"
								)}
								className="w-full px-3 py-2.5 bg-background border border-border rounded-2xl min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm text-text-strong placeholder:text-text-soft"
								rows={5}
							/>
							<div className="absolute bottom-3 end-3 flex items-center gap-1.5">
								<span className="text-[11px] font-medium text-text-soft uppercase tracking-wide">
									{notes.length}/200
								</span>
							</div>
						</div>
					</div>
				</div>
			</Modal>

			<ConfirmModal
				isOpen={showDiscardConfirm}
				onClose={() => setShowDiscardConfirm(false)}
				onConfirm={() => {
					setShowDiscardConfirm(false);
					onClose();
				}}
				title={tCommon("unsavedChanges.title")}
				description={tCommon("unsavedChanges.description")}
				confirmText={tCommon("unsavedChanges.confirm")}
				cancelText={tCommon("unsavedChanges.cancel")}
			/>
		</>
	);
}

export default AssignAssetToMemberModal;
