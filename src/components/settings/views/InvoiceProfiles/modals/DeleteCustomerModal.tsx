/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import ConfirmModal from "@/designSystem/ConfirmModal";

type DeleteCustomerModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	count: number;
	isLoading?: boolean;
	isSuccess?: boolean;
};

function DeleteCustomerModal({
	isOpen,
	onClose,
	onConfirm,
	count,
	isLoading = false,
	isSuccess = false,
}: DeleteCustomerModalProps) {
	const { t } = useTranslation("settings");
	const isMultiple = count > 1;

	return (
		<ConfirmModal
			isOpen={isOpen}
			onClose={onClose}
			onConfirm={onConfirm}
			title={t(
				isMultiple
					? "invoiceProfiles.deleteModal.customers.multipleTitle"
					: "invoiceProfiles.deleteModal.customers.singleTitle"
			)}
			description={t(
				isMultiple
					? "invoiceProfiles.deleteModal.customers.multipleDescription"
					: "invoiceProfiles.deleteModal.customers.singleDescription"
			)}
			confirmText={t(
				isMultiple
					? "invoiceProfiles.deleteModal.customers.confirmMultiple"
					: "invoiceProfiles.deleteModal.customers.confirmSingle"
			)}
			cancelText={t("invoiceProfiles.deleteModal.customers.cancel")}
			variant='error'
			icon='exclamation'
			isLoading={isLoading}
			isSuccess={isSuccess}
		/>
	);
}

export default DeleteCustomerModal;
