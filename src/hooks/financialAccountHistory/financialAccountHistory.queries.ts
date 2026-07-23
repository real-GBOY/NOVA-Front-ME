/** @format */

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import financialAccountHistoryService, {
	type HistoryFilters,
	type HistoryListResponse,
} from "@/services/financialAccountHistoryService";

const historyKeys = reactQueryKeys.financialAccountHistory;

/**
 * GET - Get financial account history (transactions and activity logs)
 * Includes improved caching for better UX
 */
export const useGetFinancialAccountHistory = (
	accountId: string | number | null | undefined,
	filters?: HistoryFilters,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery<HistoryListResponse>({
		queryKey: historyKeys.history(accountId!, filters),
		queryFn: async () => {
			if (!accountId) throw new Error("Account ID is required");
			const response = await financialAccountHistoryService.getHistory(
				accountId,
				filters
			);
			return response;
		},
		enabled: options?.enabled !== false && !!accountId,
		// Cache data for 5 minutes before marking as stale
		staleTime: 5 * 60 * 1000,
		// Keep previous data while fetching new data for smoother pagination
		placeholderData: keepPreviousData,
		// Keep data in cache for 10 minutes after becoming unused
		gcTime: 10 * 60 * 1000,
		// Refetch on window focus for fresh data
		refetchOnWindowFocus: true,
		// Refetch on mount if data is stale
		refetchOnMount: true,
	});

