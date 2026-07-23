/** @format */

import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { customerService } from "@/services/customerService";

const customerKeys = reactQueryKeys.customers;

export const useListCustomers = (
	filters?: {
		page?: number;
		limit?: number;
		search?: string;
	},
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: customerKeys.list(filters),
		queryFn: () => customerService.list(filters),
		enabled: options?.enabled !== false,
		staleTime: 0, // Always consider data stale to allow immediate refetch after mutations
		refetchOnMount: true,
		refetchOnWindowFocus: false,
	});

export const useGetCustomerById = (
	id: string | number,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: customerKeys.detail(id),
		queryFn: () => customerService.getById(id),
		enabled: options?.enabled !== false && !!id,
		staleTime: 5 * 60 * 1000,
	});
