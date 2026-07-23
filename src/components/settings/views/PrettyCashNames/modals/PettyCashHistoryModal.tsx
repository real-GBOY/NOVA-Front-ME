/** @format */

import FinancialHistoryModal from "@/components/settings/shared/FinancialHistoryModal";

interface PettyCashHistoryModalProps {
	isOpen: boolean;
	onClose: () => void;
	pettyCash: {
		id: string | number;
		name: string;
		account_id?: string | number;
	} | null;
}

function PettyCashHistoryModal({
	isOpen,
	onClose,
	pettyCash,
}: PettyCashHistoryModalProps) {
	return (
		<FinancialHistoryModal
			isOpen={isOpen}
			onClose={onClose}
			account={pettyCash}
			translationPrefix="prettyCashNames.history"
		/>
	);
}

export default PettyCashHistoryModal;
