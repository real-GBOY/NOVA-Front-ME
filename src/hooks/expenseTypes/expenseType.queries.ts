/** @format */

import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { expenseTypeService } from "@/services/expenseTypeService";

const expenseTypeKeys = reactQueryKeys.expenseTypes;

export const useListExpenseTypes = (
	filters?: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string | string[];
		sort_by?: string;
		sort_order?: "asc" | "desc";
	},
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: expenseTypeKeys.list(filters),
		queryFn: () => expenseTypeService.list(filters),
		enabled: options?.enabled !== false,
		staleTime: 0, // Always consider data stale to allow immediate refetch after mutations
		refetchOnMount: true,
		refetchOnWindowFocus: false,
	});

export const useGetExpenseTypeById = (
	id: string | number,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: expenseTypeKeys.detail(id),
		queryFn: () => expenseTypeService.getById(id),
		enabled: options?.enabled !== false && !!id,
		staleTime: 5 * 60 * 1000,
	});
