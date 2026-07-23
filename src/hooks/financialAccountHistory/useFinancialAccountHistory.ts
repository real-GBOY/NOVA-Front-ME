/** @format */

import { useGetFinancialAccountHistory } from "./financialAccountHistory.queries";

export const useFinancialAccountHistory = () => {
	return {
		useGetFinancialAccountHistory,
	};
};

// Also export hooks directly for convenience
export { useGetFinancialAccountHistory } from "./financialAccountHistory.queries";

// Re-export types
export type {
	HistoryTransaction,
	ActivityLog,
	HistoryFilters,
	HistoryListResponse,
	SourceType,
	TransactionType,
} from "@/services/financialAccountHistoryService";
