/** @format */

import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/designSystem/Modal";
import DatePicker from "@/designSystem/DatePicker";
import Checkbox from "@/designSystem/Checkbox";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { ArrowDownSLine } from "@/Icons";
import type { Asset } from "@/services/assetService";

interface ReturnAssetModalProps {
	isOpen: boolean;
	onClose: () => void;
	asset: Asset;
	onConfirm: (data: {
		returnDate: Date;
		condition: string;
		notes: string;
		sendToMaintenance: boolean;
	}) => void;
	zIndex?: string;
}

function ReturnAssetModal({
	isOpen,
	onClose,
	onConfirm,
	zIndex,
}: ReturnAssetModalProps) {
	const { t } = useTranslation("settings");
	const { t: tCommon } = useTranslation("common");
	const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
	const [condition, setCondition] = useState<string>("");
	const [notes, setNotes] = useState<string>("");
	const [sendToMaintenance, setSendToMaintenance] = useState(false);
	const [isConditionDropdownOpen, setIsConditionDropdownOpen] = useState(false);
	const conditionDropdownRef = useRef<HTMLDivElement>(null);
	const [errors, setErrors] = useState<{
		returnDate?: string;
		condition?: string;
	}>({});
	const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

	// Reset form when modal closes
	useEffect(() => {
		if (!isOpen) {
			setReturnDate(undefined);
			setCondition("");
			setNotes("");
			setSendToMaintenance(false);
			setErrors({});
		}
	}, [isOpen]);

	// Close dropdown when clicking outside
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

	const conditionOptions = [
		{ id: "good", label: t("assets.conditions.good") },
		{ id: "damaged", label: t("assets.conditions.damaged") },
		{ id: "needsRepair", label: t("assets.conditions.needsRepair") },
	];

	const selectedCondition = conditionOptions.find(
		(opt) => opt.id === condition
	);

	const handleConfirm = () => {
		const nextErrors: typeof errors = {};
		if (!returnDate) {
			nextErrors.returnDate = t("assets.validation.returnDate");
		}
		if (!condition) {
			nextErrors.condition = t("assets.validation.condition");
		}
		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}
		onConfirm({
			returnDate,
			condition,
			notes,
			sendToMaintenance,
		});
		// Reset form
		setReturnDate(undefined);
		setCondition("");
		setNotes("");
		setSendToMaintenance(false);
		setErrors({});
	};

	const isFormValid = returnDate && condition;
	const isDirty = useMemo(
		() =>
			Boolean(
				returnDate ||
					condition ||
					notes.trim() ||
					sendToMaintenance
			),
		[condition, notes, returnDate, sendToMaintenance]
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
				title={t("assets.returnModal.title")}
				width="w-[440px]"
				zIndex={zIndex}
				footer={
					<div className="flex items-center justify-end gap-3">
						<Button variant="secondary" onClick={handleRequestClose}>
							{t("assets.returnModal.cancelButton")}
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
							{t("assets.returnModal.confirmButton")}
						</Button>
					</div>
				}>
				<div className="flex flex-col gap-4">
				{/* Return Date */}
				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-text-strong flex items-center gap-1">
						{t("assets.returnModal.returnDate")}
						<span className="text-primary">*</span>
					</label>
					<DatePicker
						value={returnDate}
						onChange={(date) => {
							setReturnDate(date);
							setErrors((prev) => ({ ...prev, returnDate: undefined }));
						}}
						placeholder={t("assets.returnModal.datePlaceholder")}
						className="w-full"
					/>
					{errors.returnDate && (
						<span className="text-xs text-danger">{errors.returnDate}</span>
					)}
				</div>

				{/* Condition on Return */}
				<div className="flex flex-col gap-1 relative">
					<label className="text-sm font-medium text-text-strong flex items-center gap-1">
						{t("assets.returnModal.conditionOnReturn")}
						<span className="text-primary">*</span>
					</label>
					<div className="relative" ref={conditionDropdownRef}>
						<Button
							variant="secondary"
							type="button"
							onClick={() =>
								setIsConditionDropdownOpen(!isConditionDropdownOpen)
							}
							className="w-full !px-3 !py-2.5 !rounded-xl !justify-between hover:!border-text-sub">
							<span
								className={
									selectedCondition ? "text-text-strong" : "text-text-sub"
								}>
								{selectedCondition
									? selectedCondition.label
									: t("assets.returnModal.selectCondition")}
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
						{t("assets.returnModal.notes")}
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
							placeholder={t("assets.returnModal.notesPlaceholder")}
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

				{/* Send to Maintenance */}
				<Checkbox
					label={t("assets.returnModal.sendToMaintenance")}
					checked={sendToMaintenance}
					onChange={(e) => setSendToMaintenance(e.target.checked)}
				/>
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

export default ReturnAssetModal;
