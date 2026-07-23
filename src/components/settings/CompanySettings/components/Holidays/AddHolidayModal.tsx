/** @format */

import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/designSystem/Modal";
import { Input } from "@/designSystem/ui/input";
import Button from "@/designSystem/Button";
import DatePicker from "@/designSystem/DatePicker";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { Holiday } from "@/services/holidayService";
import { useHoliday } from "@/hooks/holidays/useHoliday";

type AddHolidayModalProps = {
	isOpen: boolean;
	onClose: () => void;
	editingHoliday?: Holiday;
};

function AddHolidayModal({
	isOpen,
	onClose,
	editingHoliday,
}: AddHolidayModalProps) {
	const { t } = useTranslation("settings");
	const { t: tCommon } = useTranslation("common");
	const { useCreateHoliday, useUpdateHoliday } = useHoliday();
	const createMutation = useCreateHoliday();
	const updateMutation = useUpdateHoliday();

	const [formData, setFormData] = useState({
		name: "",
		start_date: new Date(),
		end_date: new Date(),
		description: "",
	});
	const [errors, setErrors] = useState<{
		name?: string;
		start_date?: string;
		end_date?: string;
	}>({});
	const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
	const initialFormRef = useRef(formData);

	const [charCount, setCharCount] = useState(0);
	const maxChars = 200;

	useEffect(() => {
		const nextData = editingHoliday
			? {
					name: editingHoliday.name,
					start_date: new Date(editingHoliday.startDate),
					end_date: new Date(editingHoliday.endDate),
					description: editingHoliday.description || "",
			  }
			: {
					name: "",
					start_date: new Date(),
					end_date: new Date(),
					description: "",
			  };
		if (editingHoliday) {
			setCharCount((editingHoliday.description || "").length);
		} else {
			setCharCount(0);
		}
		setFormData(nextData);
		setErrors({});
		initialFormRef.current = nextData;
	}, [editingHoliday, isOpen]);

	const handleSubmit = () => {
		const nextErrors: { name?: string; start_date?: string; end_date?: string } =
			{};
		if (!formData.name.trim()) {
			nextErrors.name = t("companySettings.holidays.modals.validation.name");
		}
		if (!formData.start_date) {
			nextErrors.start_date = t(
				"companySettings.holidays.modals.validation.startDate"
			);
		}
		if (!formData.end_date) {
			nextErrors.end_date = t(
				"companySettings.holidays.modals.validation.endDate"
			);
		}
		if (
			formData.start_date &&
			formData.end_date &&
			formData.end_date < formData.start_date
		) {
			nextErrors.end_date = t(
				"companySettings.holidays.modals.validation.endBeforeStart"
			);
		}
		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		// Format dates to YYYY-MM-DD
		const formatDate = (date: Date) => {
			const y = date.getFullYear();
			const m = String(date.getMonth() + 1).padStart(2, "0");
			const d = String(date.getDate()).padStart(2, "0");
			return `${y}-${m}-${d}`;
		};

		const payload = {
			name: formData.name,
			startDate: formatDate(formData.start_date),
			endDate: formatDate(formData.end_date),
			description: formData.description,
		};

		if (editingHoliday?.id) {
			updateMutation.mutate(
				{ id: editingHoliday.id, data: payload },
				{
					onSuccess: () => {
						onClose();
					},
				}
			);
		} else {
			createMutation.mutate(payload, {
				onSuccess: () => {
					onClose();
				},
			});
		}
	};

	const isLoading = createMutation.isPending || updateMutation.isPending;
	const isDirty = useMemo(() => {
		const initial = initialFormRef.current;
		return (
			formData.name !== initial.name ||
			formData.description !== initial.description ||
			formData.start_date.getTime() !== initial.start_date.getTime() ||
			formData.end_date.getTime() !== initial.end_date.getTime()
		);
	}, [formData]);

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
				title={
					editingHoliday
						? t("companySettings.holidays.modals.editTitle")
						: t("companySettings.holidays.modals.addTitle")
				}
				width="xl">
				<div className="flex flex-col gap-6">
				{/* Name */}
				<div className="flex flex-col gap-1.5">
					<label className="text-sm font-medium text-text-strong">
						{t("companySettings.holidays.modals.fields.name")}
						<span className="text-danger ml-1">*</span>
					</label>
					<Input
						value={formData.name}
						onChange={(e) => {
							setFormData({ ...formData, name: e.target.value });
							setErrors((prev) => ({ ...prev, name: undefined }));
						}}
						placeholder={t("companySettings.holidays.modals.placeholders.name")}
					/>
					{errors.name && (
						<span className="text-xs text-danger">{errors.name}</span>
					)}
				</div>

				{/* Dates */}
				<div className="grid grid-cols-2 gap-4">
					<div className="flex flex-col gap-1.5">
						<label className="text-sm font-medium text-text-strong">
							{t("companySettings.holidays.modals.fields.startDate")}
							<span className="text-danger ml-1">*</span>
						</label>
						<DatePicker
							value={formData.start_date}
							onChange={(date) => {
								setFormData({ ...formData, start_date: date || new Date() });
								setErrors((prev) => ({ ...prev, start_date: undefined }));
							}}
						/>
						{errors.start_date && (
							<span className="text-xs text-danger">{errors.start_date}</span>
						)}
					</div>
					<div className="flex flex-col gap-1.5">
						<label className="text-sm font-medium text-text-strong">
							{t("companySettings.holidays.modals.fields.endDate")}
							<span className="text-danger ml-1">*</span>
						</label>
						<DatePicker
							value={formData.end_date}
							onChange={(date) => {
								setFormData({ ...formData, end_date: date || new Date() });
								setErrors((prev) => ({ ...prev, end_date: undefined }));
							}}
							// Note: DatePicker prop doesn't support minDate, so ignoring for now
						/>
						{errors.end_date && (
							<span className="text-xs text-danger">{errors.end_date}</span>
						)}
					</div>
				</div>

				{/* Description */}
				<div className="flex flex-col gap-1.5">
					<label className="text-sm font-medium text-text-strong">
						{t("companySettings.holidays.modals.fields.description")}
					</label>
					<div className="relative">
						<textarea
							value={formData.description}
							onChange={(e) => {
								if (e.target.value.length <= maxChars) {
									setFormData({ ...formData, description: e.target.value });
									setCharCount(e.target.value.length);
								}
							}}
							placeholder={t(
								"companySettings.holidays.modals.placeholders.description"
							)}
							className="bg-background border border-border rounded-xl px-3 py-2.5 w-full min-h-[100px] text-sm text-text-strong placeholder:text-text-sub focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
						/>
						<div className="flex justify-end mt-1">
							<span className="text-xs text-text-sub">
								{charCount}/{maxChars}
							</span>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
					<Button
						variant="secondary"
						onClick={handleRequestClose}
						disabled={isLoading}>
						{t("common:actions.cancel")}
					</Button>
					<Button onClick={handleSubmit} disabled={isLoading}>
						{isLoading
							? tCommon("status.processing") || "Processing..."
							: editingHoliday
							? t("common:actions.saveChanges")
							: t("common:actions.create")}
					</Button>
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

export default AddHolidayModal;
