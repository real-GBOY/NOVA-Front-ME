/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import ConfirmModal from "@/designSystem/ConfirmModal";

type DeleteDepartmentModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	isLoading?: boolean;
	isSuccess?: boolean;
};

function DeleteDepartmentModal({
	isOpen,
	onClose,
	onConfirm,
	isLoading = false,
	isSuccess = false,
}: DeleteDepartmentModalProps) {
	const { t } = useTranslation("settings");

	return (
		<ConfirmModal
			isOpen={isOpen}
			onClose={onClose}
			onConfirm={onConfirm}
			title={t("serviceCatalog.modal.deleteDepartmentTitle")}
			description={t("serviceCatalog.modal.deleteDepartmentDescription")}
			confirmText={t("serviceCatalog.modal.deleteDepartmentButton")}
			cancelText={t("serviceCatalog.modal.cancel")}
			variant="error"
			icon="exclamation"
			isLoading={isLoading}
			isSuccess={isSuccess}
		/>
	);
}

export default DeleteDepartmentModal;
