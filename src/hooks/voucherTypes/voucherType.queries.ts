/** @format */

import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { voucherTypeService } from "@/services/voucherTypeService";

const voucherTypeKeys = reactQueryKeys.voucherTypes;

export const useListVoucherTypes = (
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
		queryKey: voucherTypeKeys.list(filters),
		queryFn: () => voucherTypeService.list(filters),
		enabled: options?.enabled !== false,
		staleTime: 0, // Always consider data stale to allow immediate refetch after mutations
		refetchOnMount: true,
		refetchOnWindowFocus: false,
	});

export const useGetVoucherTypeById = (
	id: string | number,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: voucherTypeKeys.detail(id),
		queryFn: () => voucherTypeService.getById(id),
		enabled: options?.enabled !== false && !!id,
		staleTime: 5 * 60 * 1000,
	});
