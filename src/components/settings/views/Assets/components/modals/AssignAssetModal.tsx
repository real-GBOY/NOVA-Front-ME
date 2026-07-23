/** @format */

import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/designSystem/Modal";
import DatePicker from "@/designSystem/DatePicker";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import SearchableSelect from "@/components/invoices/SearchableSelect";
import { ArrowDownSLine } from "@/Icons";
import { useEmployeeDictionary } from "@/hooks/employees/useEmployee";
import { employeeService } from "@/services/employeeService";
import type { Asset } from "@/services/assetService";

interface AssignAssetModalProps {
	isOpen: boolean;
	onClose: () => void;
	asset: Asset;
	onConfirm: (data: {
		memberId: string;
		assignedDate: Date;
		condition: string;
		notes: string;
	}) => void;
	zIndex?: string;
}

function AssignAssetModal({
	isOpen,
	onClose,
	onConfirm,
	zIndex,
}: AssignAssetModalProps) {
	const { t } = useTranslation("settings");
	const { t: tCommon } = useTranslation("common");
	const [memberId, setMemberId] = useState<string>("");
	const [assignedDate, setAssignedDate] = useState<Date | undefined>(undefined);
	const [condition, setCondition] = useState<string>("");
	const [notes, setNotes] = useState<string>("");
	const [isConditionDropdownOpen, setIsConditionDropdownOpen] = useState(false);
	const [errors, setErrors] = useState<{
		memberId?: string;
		assignedDate?: string;
		condition?: string;
	}>({});
	const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
	const conditionDropdownRef = useRef<HTMLDivElement>(null);

	// Fetch employees for dropdown
	const { data: employees = [] } =
		useEmployeeDictionary(undefined, { enabled: isOpen });

	const conditionOptions = [
		{ id: "good", label: t("assets.conditions.good") },
		{ id: "damaged", label: t("assets.conditions.damaged") },
		{ id: "needsRepair", label: t("assets.conditions.needsRepair") },
	];

	const fetchEmployeeOptions = async (search: string) => {
		const response = await employeeService.getDictionary({
			page: 1,
			limit: 20,
			search: search || undefined,
		});
		return response.map((emp) => ({
			id: String(emp.id),
			label: emp.label,
			avatarUrl: emp.avatar || undefined,
		}));
	};

	const selectedCondition = conditionOptions.find(
		(opt) => opt.id === condition
	);

	// Reset form when modal closes
	useEffect(() => {
		if (!isOpen) {
			setMemberId("");
			setAssignedDate(undefined);
			setCondition("");
			setNotes("");
			setErrors({});
		}
	}, [isOpen]);

	// Close condition dropdown when clicking outside
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

	const handleConfirm = () => {
		const nextErrors: typeof errors = {};
		if (!memberId) {
			nextErrors.memberId = t("assets.validation.member");
		}
		if (!assignedDate) {
			nextErrors.assignedDate = t("assets.validation.assignedDate");
		}
		if (!condition) {
			nextErrors.condition = t("assets.validation.condition");
		}
		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}
		onConfirm({
			memberId,
			assignedDate: assignedDate!,
			condition,
			notes,
		});
		// Reset form
		setMemberId("");
		setAssignedDate(undefined);
		setCondition("");
		setNotes("");
		setErrors({});
	};

	const isFormValid = memberId && assignedDate && condition;
	const isDirty = useMemo(
		() =>
			Boolean(
				memberId ||
					assignedDate ||
					condition ||
					notes.trim()
			),
		[assignedDate, condition, memberId, notes]
	);

	const handleRequestClose = () => {
		if (isDirty) {
			setShowDiscardConfirm(true);
			return;
		}
		onClose();
	};

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={handleRequestClose}
				title={t("assets.assignModal.title")}
				width="w-[440px]"
				zIndex={zIndex}
				footer={
					<div className="flex items-center justify-end gap-3">
						<Button variant="secondary" onClick={handleRequestClose}>
							{t("assets.assignModal.cancelButton")}
						</Button>
						<Button
							variant="primary"
							onClick={handleConfirm}
							disabled={!isFormValid}
							className={
								!isFormValid
									? "bg-bg-weak text-text-disabled cursor-not-allowed"
									: ""
							}>
							{t("assets.assignModal.confirmButton")}
						</Button>
					</div>
				}>
				<div className="flex flex-col gap-4">
				{/* Member */}
				<div className="flex flex-col gap-1">
					<SearchableSelect
						label={t("assets.assignModal.member")}
						placeholder={t("assets.assignModal.selectMember")}
						value={memberId}
						onChange={(value) => {
							setMemberId(value);
							setErrors((prev) => ({ ...prev, memberId: undefined }));
						}}
						options={employees.map((emp) => ({
							id: emp.id,
							label: emp.label,
							avatarUrl: emp.avatar || undefined,
						}))}
						serverSideSearch={true}
						fetchOptions={fetchEmployeeOptions}
						required={true}
						showTag={true}
					/>
					{errors.memberId && (
						<span className="text-xs text-danger">{errors.memberId}</span>
					)}
				</div>

				{/* Assigned Date */}
				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-text-strong flex items-center gap-1">
						{t("assets.assignModal.assignedDate")}
						<span className="text-primary">*</span>
					</label>
					<DatePicker
						value={assignedDate}
						onChange={(date) => {
							setAssignedDate(date);
							setErrors((prev) => ({ ...prev, assignedDate: undefined }));
						}}
						placeholder={t("assets.assignModal.datePlaceholder")}
						className="w-full"
					/>
					{errors.assignedDate && (
						<span className="text-xs text-danger">
							{errors.assignedDate}
						</span>
					)}
				</div>

				{/* Condition at Handover */}
				<div className="flex flex-col gap-1 relative">
					<label className="text-sm font-medium text-text-strong flex items-center gap-1">
						{t("assets.assignModal.conditionAtHandover")}
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
									: t("assets.assignModal.selectCondition")}
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

				{/* Notes */}
				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-text-strong">
						{t("assets.assignModal.notes")}
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
							placeholder={t("assets.assignModal.notesPlaceholder")}
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

export default AssignAssetModal;
