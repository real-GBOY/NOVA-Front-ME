/** @format */

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "../../config/reactQueryKeys";
import { teamService } from "../../services/teamService";

const teamKeys = reactQueryKeys.teams;

export const useListTeams = (
	filters?: {
		page?: number;
		limit?: number;
		search?: string;
		job_title_ids?: number[] | string[];
	},
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: teamKeys.list(filters),
		queryFn: () => teamService.list(filters),
		enabled: options?.enabled !== false,
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

export const useGetTeamById = (
	id: string | number,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: teamKeys.detail(id),
		queryFn: () => teamService.getById(id),
		enabled: options?.enabled !== false && !!id,
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});
