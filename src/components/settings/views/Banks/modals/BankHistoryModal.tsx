/** @format */

import FinancialHistoryModal from "@/components/settings/shared/FinancialHistoryModal";

interface BankHistoryModalProps {
	isOpen: boolean;
	onClose: () => void;
	bank: {
		id: string | number;
		name: string;
		account_id?: string | number;
	} | null;
}

function BankHistoryModal({ isOpen, onClose, bank }: BankHistoryModalProps) {
	return (
		<FinancialHistoryModal
			isOpen={isOpen}
			onClose={onClose}
			account={bank}
			translationPrefix="banks.history"
		/>
	);
}

export default BankHistoryModal;
