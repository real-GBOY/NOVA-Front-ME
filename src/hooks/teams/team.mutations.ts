/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "../../config/reactQueryKeys";
import {
	teamService,
	type CreateTeamRequest,
	type UpdateTeamRequest,
} from "../../services/teamService";

const teamKeys = reactQueryKeys.teams;

export const useCreateTeam = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateTeamRequest) => teamService.create(payload),
		onSuccess: () => {
			// Invalidate all teams queries to ensure fresh data
			queryClient.invalidateQueries({ queryKey: teamKeys.all });
		},
	});
};

export const useUpdateTeam = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string | number;
			payload: UpdateTeamRequest;
		}) => teamService.update(id, payload),
		onSuccess: (_, { id }) => {
			// Invalidate all teams queries
			queryClient.invalidateQueries({ queryKey: teamKeys.all });
			// Invalidate the specific team detail
			queryClient.invalidateQueries({ queryKey: teamKeys.detail(id) });
		},
	});
};

export const useDeleteTeam = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string | number) => teamService.delete(id),
		onSuccess: () => {
			// Invalidate all teams queries
			queryClient.invalidateQueries({ queryKey: teamKeys.all });
		},
	});
};
