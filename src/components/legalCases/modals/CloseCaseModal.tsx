/** @format */

import ConfirmModal from "@/designSystem/ConfirmModal";
import { useTranslation } from "@/hooks/useTranslation";

interface CloseCaseModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	caseTitle: string;
}

export default function CloseCaseModal({
	isOpen,
	onClose,
	onConfirm,
	caseTitle,
}: CloseCaseModalProps) {
	const { t } = useTranslation("settings");

	return (
		<ConfirmModal
			isOpen={isOpen}
			onClose={onClose}
			onConfirm={onConfirm}
			title={t("legalCases.closeCaseModal.title")}
			description={t("legalCases.closeCaseModal.description", {
				caseTitle,
			})}
			confirmText={t("legalCases.closeCaseModal.confirm")}
			cancelText={t("legalCases.closeCaseModal.cancel")}
			variant="danger"
		/>
	);
}
