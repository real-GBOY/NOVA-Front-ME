/** @format */

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "../../config/reactQueryKeys";
import { jobTitleService } from "../../services/jobTitleService";

const jobTitleKeys = reactQueryKeys.jobTitles;

export const useListJobTitles = (
	filters?: {
		page?: number;
		limit?: number;
		search?: string;
		role_ids?: number[] | string[];
	},
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: jobTitleKeys.list(filters),
		queryFn: () => jobTitleService.list(filters),
		enabled: options?.enabled !== false,
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

export const useGetJobTitleById = (
	id: string | number,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: jobTitleKeys.detail(id),
		queryFn: () => jobTitleService.getById(id),
		enabled: options?.enabled !== false && !!id,
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});
