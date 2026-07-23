/** @format */

import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";

interface WorkingDaysModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (selectedDays: string[]) => void;
	initialSelectedDays?: string[];
}

const DAYS_OF_WEEK = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

function WorkingDaysModal({
	isOpen,
	onClose,
	onSave,
	initialSelectedDays = [],
}: WorkingDaysModalProps) {
	const { t } = useTranslation("settings");
	const { t: tCommon } = useTranslation("common");
	const [selectedDays, setSelectedDays] = useState<string[]>(
		initialSelectedDays
	);
	const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setSelectedDays(initialSelectedDays);
		}
	}, [isOpen, initialSelectedDays]);

	const toggleDay = (day: string) => {
		setSelectedDays((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
		);
	};

	const handleSave = () => {
		if (selectedDays.length === 0) {
			return;
		}
		onSave(selectedDays);
		onClose();
	};

	const resetState = () => {
		setSelectedDays(initialSelectedDays);
	};

	const handleRequestClose = () => {
		if (isDirty) {
			setShowDiscardConfirm(true);
			return;
		}
		resetState();
		onClose();
	};

	const handleDiscardChanges = () => {
		setShowDiscardConfirm(false);
		resetState();
		onClose();
	};

	const isDirty = useMemo(() => {
		if (selectedDays.length !== initialSelectedDays.length) return true;
		const selectedSet = new Set(selectedDays);
		return initialSelectedDays.some((day) => !selectedSet.has(day));
	}, [initialSelectedDays, selectedDays]);

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={handleRequestClose}
				title={t("companySettings.workingDays.selectWorkingDays")}
				size="medium">
				<div className="flex flex-col gap-6">
				{/* Days Selection */}
				<div className="space-y-2">
					{DAYS_OF_WEEK.map((day) => (
						<label
							key={day}
							className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-surface-hover">
							<input
								type="checkbox"
								checked={selectedDays.includes(day)}
								onChange={() => toggleDay(day)}
								className="h-5 w-5 rounded border-border bg-surface text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
							/>
							<span className="text-sm font-medium text-text">
								{t(`companySettings.weekDays.${day.toLowerCase()}`)}
							</span>
						</label>
					))}
				</div>

				{/* Info */}
				{selectedDays.length === 0 && (
					<div className="rounded-lg bg-error/10 p-3">
						<p className="text-sm text-error">
							{t("companySettings.workingDays.selectAtLeastOne")}
						</p>
					</div>
				)}

				{/* Selected Count */}
				<div className="text-sm text-text-sub">
					{selectedDays.length}{" "}
					{selectedDays.length === 1
						? t("companySettings.workingDays.daySelected")
						: t("companySettings.workingDays.daysSelected")}
				</div>

				{/* Actions */}
				<div className="flex justify-end gap-3 border-t border-border pt-4">
					<Button variant="secondary" onClick={handleRequestClose}>
						{t("common:actions.cancel")}
					</Button>
					<Button onClick={handleSave} disabled={selectedDays.length === 0}>
						{t("common:actions.save")}
					</Button>
				</div>
			</div>
			</Modal>
			<ConfirmModal
				isOpen={showDiscardConfirm}
				onClose={() => setShowDiscardConfirm(false)}
				onConfirm={handleDiscardChanges}
				title={tCommon("unsavedChanges.title")}
				description={tCommon("unsavedChanges.description")}
				confirmText={tCommon("unsavedChanges.confirm")}
				cancelText={tCommon("unsavedChanges.cancel")}
			/>
		</>
	);
}

export default WorkingDaysModal;
