/** @format */

import { useMemo, useState, useEffect } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import PhoneInput from "@/designSystem/ui/PhoneInput";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { useTranslation } from "@/hooks/useTranslation";

type NewMobileNumberModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onContinue: (newPhone: string, confirmPhone: string) => void;
};

function NewMobileNumberModal({
	isOpen,
	onClose,
	onContinue,
}: NewMobileNumberModalProps) {
	const { t } = useTranslation("settings");
	const { t: tCommon } = useTranslation("common");
	const [newPhone, setNewPhone] = useState("");
	const [confirmPhone, setConfirmPhone] = useState("");
	const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleContinue = () => {
		if (newPhone && confirmPhone) {
			if (newPhone !== confirmPhone) {
				setError(t("generalSettingsModals.newMobile.validation.mismatch"));
				return;
			}
			onContinue(newPhone, confirmPhone);
		}
	};

	useEffect(() => {
		if (!isOpen) {
			setNewPhone("");
			setConfirmPhone("");
			setError(null);
		}
	}, [isOpen]);

	const isFormValid = newPhone.trim() && confirmPhone.trim();
	const isDirty = useMemo(
		() => Boolean(newPhone.trim() || confirmPhone.trim()),
		[newPhone, confirmPhone]
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
				title={t("generalSettingsModals.newMobile.title")}
				width="max-w-md"
				footer={
					<div className="flex items-center justify-end gap-3">
						<Button variant="secondary" onClick={handleRequestClose}>
							{t("generalSettingsModals.newMobile.cancel")}
						</Button>
						<Button
							onClick={handleContinue}
							disabled={!isFormValid}
							className="disabled:opacity-50 disabled:cursor-not-allowed">
							{t("generalSettingsModals.newMobile.continue")}
						</Button>
					</div>
				}>
				<div className="flex flex-col gap-4">
					<p className="text-sm text-text-sub">
						{t("generalSettingsModals.newMobile.description")}
					</p>

					<div className="flex flex-col gap-1">
						<label className="text-sm font-medium text-text-sub">
							{t("generalSettingsModals.newMobile.newLabel")}
						</label>
						<PhoneInput
							value={newPhone}
							onChange={(value) => {
								setNewPhone(value || "");
								setError(null);
							}}
							placeholder={t("generalSettingsModals.newMobile.placeholder")}
						/>
					</div>

					<div className="flex flex-col gap-1">
						<label className="text-sm font-medium text-text-sub">
							{t("generalSettingsModals.newMobile.confirmLabel")}
						</label>
						<PhoneInput
							value={confirmPhone}
							onChange={(value) => {
								setConfirmPhone(value || "");
								setError(null);
							}}
							placeholder={t("generalSettingsModals.newMobile.placeholder")}
						/>
					</div>
					{error && <span className="text-xs text-danger">{error}</span>}
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

export default NewMobileNumberModal;
