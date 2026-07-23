/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import ConfirmModal from "@/designSystem/ConfirmModal";

type DiscardChangesModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
};

function DiscardChangesModal({
	isOpen,
	onClose,
	onConfirm,
}: DiscardChangesModalProps) {
	const { t } = useTranslation("settings");

	return (
		<ConfirmModal
			isOpen={isOpen}
			onClose={onClose}
			onConfirm={onConfirm}
			title={t("companySettings.modals.discardChanges.title")}
			description={t("companySettings.modals.discardChanges.description")}
			confirmText={t("companySettings.modals.discardChanges.confirm")}
			cancelText={t("companySettings.modals.discardChanges.cancel")}
			variant="error"
			icon="exclamation"
		/>
	);
}

export default DiscardChangesModal;
