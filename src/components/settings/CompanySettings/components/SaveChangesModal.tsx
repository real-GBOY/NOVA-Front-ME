/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import ConfirmModal from "@/designSystem/ConfirmModal";

type SaveChangesModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	isLoading?: boolean;
	isSuccess?: boolean;
};

function SaveChangesModal({
	isOpen,
	onClose,
	onConfirm,
	isLoading = false,
	isSuccess = false,
}: SaveChangesModalProps) {
	const { t } = useTranslation("settings");

	return (
		<ConfirmModal
			isOpen={isOpen}
			onClose={onClose}
			onConfirm={onConfirm}
			title={t("companySettings.modals.saveChanges.title")}
			description={t("companySettings.modals.saveChanges.description")}
			confirmText={t("companySettings.modals.saveChanges.confirm")}
			cancelText={t("common:actions.cancel")}
			variant="primary"
			icon="info"
			isLoading={isLoading}
			isSuccess={isSuccess}
		/>
	);
}

export default SaveChangesModal;
