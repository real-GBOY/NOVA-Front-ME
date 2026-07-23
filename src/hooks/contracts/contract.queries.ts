/** @format */

import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "../../config/reactQueryKeys";
import { contractService } from "../../services/contractService";

const contractKeys = reactQueryKeys.contracts;

// GET - List contracts
export const useListContracts = (
	filters?: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string | string[];
		employee_id?: number | number[];
		min_amount?: number;
		max_amount?: number;
		sort_by?: string;
		sort_order?: "asc" | "desc";
	},
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: contractKeys.list(filters),
		queryFn: async () => {
			const response = await contractService.list(filters);
			return response;
		},
		enabled: options?.enabled !== false,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

// GET - Get contract by ID
export const useGetContractById = (
	id: string | number,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: contractKeys.detail(id),
		queryFn: async () => {
			const response = await contractService.getById(id);
			return response.data;
		},
		enabled: options?.enabled !== false && !!id,
		retry: (failureCount, error: unknown) => {
			// Don't retry on 404 errors
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			if ((error as any)?.response?.status === 404) {
				return false;
			}
			return failureCount < 2;
		},
	});
