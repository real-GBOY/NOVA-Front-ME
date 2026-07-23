/** @format */

import { useState } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { useTranslation } from "@/hooks/useTranslation";

type VerifyIdentityModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onSendCode: (email: string) => void;
};

function VerifyIdentityModal({
	isOpen,
	onClose,
	onSendCode,
}: VerifyIdentityModalProps) {
	const { t } = useTranslation("settings");
	const { t: tCommon } = useTranslation("common");
	const [email, setEmail] = useState("");
	const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

	const handleSendCode = () => {
		if (email.trim()) {
			onSendCode(email);
			setEmail("");
		}
	};

	const isDirty = Boolean(email.trim());

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
				title={t("generalSettingsModals.verifyIdentity.title")}
				width="max-w-md"
				footer={
					<div className="flex items-center justify-end gap-3">
						<Button variant="secondary" onClick={handleRequestClose}>
							{t("generalSettingsModals.verifyIdentity.cancel")}
						</Button>
						<Button
							onClick={handleSendCode}
							disabled={!email.trim()}
							className="disabled:opacity-50 disabled:cursor-not-allowed">
							{t("generalSettingsModals.verifyIdentity.sendCode")}
						</Button>
					</div>
				}>
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-1">
						<label className="text-sm font-medium text-text-sub">
							{t("generalSettingsModals.verifyIdentity.emailLabel")}
						</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder={t(
								"generalSettingsModals.verifyIdentity.emailPlaceholder"
							)}
							className="w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-sm text-text-sub placeholder:text-text-soft focus:outline-none"
						/>
					</div>
					<p className="text-sm text-text-sub">
						{t("generalSettingsModals.verifyIdentity.description")}
					</p>
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

export default VerifyIdentityModal;
