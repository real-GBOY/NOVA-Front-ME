/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import ConfirmModal from "@/designSystem/ConfirmModal";

type DeleteAgentModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	count: number;
	isLoading?: boolean;
	isSuccess?: boolean;
};

function DeleteAgentModal({
	isOpen,
	onClose,
	onConfirm,
	count,
	isLoading = false,
	isSuccess = false,
}: DeleteAgentModalProps) {
	const { t } = useTranslation("settings");
	const isMultiple = count > 1;

	return (
		<ConfirmModal
			isOpen={isOpen}
			onClose={onClose}
			onConfirm={onConfirm}
			title={t(
				isMultiple
					? "invoiceProfiles.deleteModal.agents.multipleTitle"
					: "invoiceProfiles.deleteModal.agents.singleTitle"
			)}
			description={t(
				isMultiple
					? "invoiceProfiles.deleteModal.agents.multipleDescription"
					: "invoiceProfiles.deleteModal.agents.singleDescription"
			)}
			confirmText={t(
				isMultiple
					? "invoiceProfiles.deleteModal.agents.confirmMultiple"
					: "invoiceProfiles.deleteModal.agents.confirmSingle"
			)}
			cancelText={t("invoiceProfiles.deleteModal.agents.cancel")}
			variant='error'
			icon='exclamation'
			isLoading={isLoading}
			isSuccess={isSuccess}
		/>
	);
}

export default DeleteAgentModal;
