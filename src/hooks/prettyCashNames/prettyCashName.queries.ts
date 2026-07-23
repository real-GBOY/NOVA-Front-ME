/** @format */

import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { prettyCashNameService } from "@/services/prettyCashNameService";

const prettyCashNameKeys = reactQueryKeys.prettyCashNames;

export const useListPrettyCashNames = (
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
		queryKey: prettyCashNameKeys.list(filters),
		queryFn: () => prettyCashNameService.list(filters),
		enabled: options?.enabled !== false,
		staleTime: 0, // Always consider data stale to allow immediate refetch after mutations
		refetchOnMount: true,
		refetchOnWindowFocus: false,
	});

export const useGetPrettyCashNameById = (
	id: string | number,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: prettyCashNameKeys.detail(id),
		queryFn: () => prettyCashNameService.getById(id),
		enabled: options?.enabled !== false && !!id,
		staleTime: 5 * 60 * 1000,
	});

