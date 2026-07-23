/** @format */

import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { incomeTypeService } from "@/services/incomeTypeService";

const incomeTypeKeys = reactQueryKeys.incomeTypes;

export const useListIncomeTypes = (
	filters?: {
		page?: number;
		limit?: number;
		search?: string;
		sort_by?: string;
		sort_order?: "asc" | "desc";
	},
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: incomeTypeKeys.list(filters),
		queryFn: () => incomeTypeService.list(filters),
		enabled: options?.enabled !== false,
		staleTime: 0, // Always consider data stale to allow immediate refetch after mutations
		refetchOnMount: true,
		refetchOnWindowFocus: false,
	});

export const useGetIncomeTypeById = (
	id: string | number,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: incomeTypeKeys.detail(id),
		queryFn: () => incomeTypeService.getById(id),
		enabled: options?.enabled !== false && !!id,
		staleTime: 5 * 60 * 1000,
	});
