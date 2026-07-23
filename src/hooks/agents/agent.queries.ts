/** @format */

import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { agentService } from "@/services/agentService";

const agentKeys = reactQueryKeys.agents;

export const useListAgents = (
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
		queryKey: agentKeys.list(filters),
		queryFn: () => agentService.list(filters),
		enabled: options?.enabled !== false,
		staleTime: 0, // Always consider data stale to allow immediate refetch after mutations
		refetchOnMount: true,
		refetchOnWindowFocus: false,
	});

export const useGetAgentById = (
	id: string | number,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: agentKeys.detail(id),
		queryFn: () => agentService.getById(id),
		enabled: options?.enabled !== false && !!id,
		staleTime: 5 * 60 * 1000,
	});
