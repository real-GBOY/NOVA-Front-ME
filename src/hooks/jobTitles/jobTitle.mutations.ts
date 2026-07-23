/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "../../config/reactQueryKeys";
import {
	jobTitleService,
	type CreateJobTitleRequest,
	type UpdateJobTitleRequest,
} from "../../services/jobTitleService";

const jobTitleKeys = reactQueryKeys.jobTitles;

export const useCreateJobTitle = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateJobTitleRequest) =>
			jobTitleService.create(payload),
		onSuccess: () => {
			// Invalidate all job titles queries to ensure fresh data
			queryClient.invalidateQueries({ queryKey: jobTitleKeys.all });
			// Also invalidate roles since job titles can be assigned to roles
			queryClient.invalidateQueries({ queryKey: ["roles"] });
		},
	});
};

export const useUpdateJobTitle = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string | number;
			payload: UpdateJobTitleRequest;
		}) => jobTitleService.update(id, payload),
		onSuccess: (_, { id }) => {
			// Invalidate all job titles queries
			queryClient.invalidateQueries({ queryKey: jobTitleKeys.all });
			// Invalidate the specific job title detail
			queryClient.invalidateQueries({ queryKey: jobTitleKeys.detail(id) });
			// Also invalidate roles since job titles can be assigned to roles
			queryClient.invalidateQueries({ queryKey: ["roles"] });
		},
	});
};

export const useDeleteJobTitle = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string | number) => jobTitleService.delete(id),
		onSuccess: () => {
			// Invalidate all job titles queries
			queryClient.invalidateQueries({ queryKey: jobTitleKeys.all });
			// Also invalidate roles since job titles can be assigned to roles
			queryClient.invalidateQueries({ queryKey: ["roles"] });
		},
	});
};
