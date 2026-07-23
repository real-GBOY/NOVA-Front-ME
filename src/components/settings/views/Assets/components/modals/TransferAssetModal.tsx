/** @format */

import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/designSystem/Modal";
import DatePicker from "@/designSystem/DatePicker";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { ArrowDownSLine } from "@/Icons";
import { useEmployeeDictionary } from "@/hooks/employees/useEmployee";
import type { Asset } from "@/services/assetService";

interface TransferAssetModalProps {
	isOpen: boolean;
	onClose: () => void;
	asset: Asset;
	onConfirm: (data: {
		toEmployeeId: string;
		transferDate?: Date;
		condition?: string;
		notes?: string;
	}) => void;
	zIndex?: string;
}

function TransferAssetModal({
	isOpen,
	onClose,
	asset,
	onConfirm,
	zIndex,
}: TransferAssetModalProps) {
	const { t } = useTranslation("settings");
	const { t: tCommon } = useTranslation("common");
	const [newMemberId, setNewMemberId] = useState<string>("");
	const [transferDate, setTransferDate] = useState<Date | undefined>(undefined);
	const [condition, setCondition] = useState<string>("");
	const [notes, setNotes] = useState<string>("");
	const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
	const [isConditionDropdownOpen, setIsConditionDropdownOpen] = useState(false);
	const [errors, setErrors] = useState<{ newMemberId?: string }>({});
	const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
	const memberDropdownRef = useRef<HTMLDivElement>(null);
	const conditionDropdownRef = useRef<HTMLDivElement>(null);

	// Fetch employees for dropdown
	const { data: employees = [], isLoading: isLoadingEmployees } =
		useEmployeeDictionary(undefined, { enabled: isOpen });

	// Get current holder from asset
	const currentHolder = asset.assigned_to
		? {
				id: String(asset.assigned_to.id),
				name: asset.assigned_to.name,
				avatar: asset.assigned_to.avatar || "",
		  }
		: null;

	const conditionOptions = [
		{ id: "new", label: t("assets.conditions.new") },
		{ id: "good", label: t("assets.conditions.good") },
		{ id: "fair", label: t("assets.conditions.fair") },
		{ id: "poor", label: t("assets.conditions.poor") },
		{ id: "damaged", label: t("assets.conditions.damaged") },
	];

	const selectedMember = employees.find((e) => e.id === newMemberId);
	const selectedCondition = conditionOptions.find(
		(opt) => opt.id === condition
	);

	// Reset form when modal closes
	useEffect(() => {
		if (!isOpen) {
			setNewMemberId("");
			setTransferDate(undefined);
			setCondition("");
			setNotes("");
			setErrors({});
		}
	}, [isOpen]);

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				memberDropdownRef.current &&
				!memberDropdownRef.current.contains(event.target as Node)
			) {
				setIsMemberDropdownOpen(false);
			}
			if (
				conditionDropdownRef.current &&
				!conditionDropdownRef.current.contains(event.target as Node)
			) {
				setIsConditionDropdownOpen(false);
			}
		};

		if (isMemberDropdownOpen || isConditionDropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isMemberDropdownOpen, isConditionDropdownOpen]);

	const handleConfirm = () => {
		if (!newMemberId) {
			setErrors({ newMemberId: t("assets.validation.newMember") });
			return;
		}
		onConfirm({
			toEmployeeId: newMemberId,
			transferDate: transferDate,
			condition: condition || undefined,
			notes: notes || undefined,
		});
		// Reset form
		setNewMemberId("");
		setTransferDate(undefined);
		setCondition("");
		setNotes("");
		setErrors({});
	};

	const isFormValid = newMemberId;
	const isDirty = useMemo(
		() =>
			Boolean(
				newMemberId ||
					transferDate ||
					condition ||
					notes.trim()
			),
		[newMemberId, transferDate, condition, notes]
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
				title={t("assets.transferModal.title")}
				width="w-[440px]"
				zIndex={zIndex}
				footer={
					<div className="flex items-center justify-end gap-3">
						<Button variant="secondary" onClick={handleRequestClose}>
							{t("assets.transferModal.cancelButton")}
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
							{t("assets.transferModal.confirmButton")}
						</Button>
					</div>
				}>
				<div className="flex flex-col gap-4">
				{/* Current Holder */}
				{currentHolder && (
					<div className="flex flex-col gap-1">
						<label className="text-sm font-medium text-text-strong">
							{t("assets.transferModal.currentHolder")}
						</label>
						<div className="w-full px-3 py-2.5 bg-bg-weak border border-border rounded-lg flex items-center gap-2">
							<div className="w-5 h-5 rounded-full bg-bg-weak flex items-center justify-center">
								{currentHolder.avatar ? (
									<img
										src={currentHolder.avatar}
										alt={currentHolder.name}
										className="w-full h-full rounded-full object-cover"
									/>
								) : (
									<span className="text-xs text-text-sub">
										{currentHolder.name.charAt(0).toUpperCase()}
									</span>
								)}
							</div>
							<span className="text-sm text-text-sub flex-1">
								{currentHolder.name}
							</span>
						</div>
					</div>
				)}

				{/* New Member */}
				<div className="flex flex-col gap-1 relative">
					<label className="text-sm font-medium text-text-strong flex items-center gap-1">
						{t("assets.transferModal.newMember")}
						<span className="text-primary">*</span>
					</label>
					<div className="relative" ref={memberDropdownRef}>
						<button
							type="button"
							onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)}
							className="w-full px-3 py-2.5 bg-background border border-border rounded-[10px] flex items-center justify-between gap-2 hover:border-text-sub focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
							<span
								className={
									selectedMember ? "text-text-strong" : "text-text-sub"
								}>
								{selectedMember
									? selectedMember.label
									: t("assets.transferModal.selectUser")}
							</span>
							<ArrowDownSLine size={20} className="fill-icon-sub shrink-0" />
						</button>
						{isMemberDropdownOpen && (
							<div className="absolute top-full mt-1 start-0 w-full bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
								{isLoadingEmployees ? (
									<div className="px-3 py-2 text-sm text-text-sub">
										{tCommon("common.loading")}
									</div>
								) : (
									<div className="flex flex-col">
										{employees
											.filter(
												(e) => !currentHolder || e.id !== currentHolder.id
											)
											.map((employee) => (
												<button
													key={employee.id}
													type="button"
													onClick={() => {
														setNewMemberId(employee.id);
														setErrors({});
														setIsMemberDropdownOpen(false);
													}}
													className={`px-3 py-2 text-sm text-left transition-colors flex items-center gap-2 ${
														newMemberId === employee.id
															? "bg-primary/10 text-primary"
															: "text-text-strong hover:bg-bg-weak"
													}`}>
													<div className="w-6 h-6 rounded-full bg-bg-weak flex items-center justify-center">
														{employee.subLabel ? (
															<span className="text-xs text-text-sub">
																{employee.label.charAt(0).toUpperCase()}
															</span>
														) : (
															<span className="text-xs text-text-sub">
																{employee.label.charAt(0).toUpperCase()}
															</span>
														)}
													</div>
													<span>{employee.label}</span>
													{employee.subLabel && (
														<span className="text-xs text-text-sub">
															{employee.subLabel}
														</span>
													)}
												</button>
											))}
									</div>
								)}
							</div>
						)}
					</div>
					{errors.newMemberId && (
						<span className="text-xs text-danger">
							{errors.newMemberId}
						</span>
					)}
				</div>

				{/* Transfer Date */}
				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-text-strong">
						{t("assets.transferModal.transferDate")}
					</label>
					<DatePicker
						value={transferDate}
						onChange={setTransferDate}
						placeholder={t("assets.transferModal.datePlaceholder")}
						className="w-full"
					/>
				</div>

				{/* Condition at Transfer */}
				<div className="flex flex-col gap-1 relative">
					<label className="text-sm font-medium text-text-strong">
						{t("assets.transferModal.conditionAtTransfer")}
					</label>
					<div className="relative" ref={conditionDropdownRef}>
						<button
							type="button"
							onClick={() =>
								setIsConditionDropdownOpen(!isConditionDropdownOpen)
							}
							className="w-full px-3 py-2.5 bg-background border border-border rounded-[10px] flex items-center justify-between gap-2 hover:border-text-sub focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
							<span
								className={
									selectedCondition ? "text-text-strong" : "text-text-sub"
								}>
								{selectedCondition
									? selectedCondition.label
									: t("assets.transferModal.selectCondition")}
							</span>
							<ArrowDownSLine size={20} className="fill-icon-sub shrink-0" />
						</button>
						{isConditionDropdownOpen && (
							<div className="absolute top-full mt-1 start-0 w-full bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
								<div className="flex flex-col">
									{conditionOptions.map((option) => (
										<button
											key={option.id}
											type="button"
											onClick={() => {
												setCondition(option.id);
												setIsConditionDropdownOpen(false);
											}}
											className={`px-3 py-2 text-sm text-left transition-colors ${
												condition === option.id
													? "bg-primary/10 text-primary"
													: "text-text-strong hover:bg-bg-weak"
											}`}>
											{option.label}
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Notes */}
				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-text-strong">
						{t("assets.transferModal.notes")}
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
							placeholder={t("assets.transferModal.notesPlaceholder")}
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

export default TransferAssetModal;
