/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import {
	agentService,
	type CreateAgentRequest,
	type UpdateAgentRequest,
} from "@/services/agentService";

const agentKeys = reactQueryKeys.agents;

export const useCreateAgent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateAgentRequest) => agentService.create(payload),
		onSuccess: () => {
			// Invalidate all agents queries to ensure fresh data
			queryClient.invalidateQueries({ queryKey: agentKeys.all });
		},
	});
};

export const useUpdateAgent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string | number;
			payload: UpdateAgentRequest;
		}) => agentService.update(id, payload),
		onSuccess: (_, { id }) => {
			// Invalidate all agents queries
			queryClient.invalidateQueries({ queryKey: agentKeys.all });
			// Invalidate the specific agent detail
			queryClient.invalidateQueries({ queryKey: agentKeys.detail(id) });
		},
	});
};

export const useDeleteAgent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string | number) => agentService.delete(id),
		onSuccess: () => {
			// Invalidate all agents queries
			queryClient.invalidateQueries({ queryKey: agentKeys.all });
		},
	});
};
