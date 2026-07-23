/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import {
	incomeTypeService,
	type CreateIncomeTypeRequest,
	type UpdateIncomeTypeRequest,
} from "@/services/incomeTypeService";

const incomeTypeKeys = reactQueryKeys.incomeTypes;

export const useCreateIncomeType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateIncomeTypeRequest) =>
			incomeTypeService.create(payload),
		onSuccess: () => {
			// Invalidate all income types queries to ensure fresh data
			queryClient.invalidateQueries({ queryKey: incomeTypeKeys.all });
		},
	});
};

export const useUpdateIncomeType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string | number;
			payload: UpdateIncomeTypeRequest;
		}) => incomeTypeService.update(id, payload),
		onSuccess: (_, { id }) => {
			// Invalidate all income types queries
			queryClient.invalidateQueries({ queryKey: incomeTypeKeys.all });
			// Invalidate the specific income type detail
			queryClient.invalidateQueries({
				queryKey: incomeTypeKeys.detail(id),
			});
		},
	});
};

export const useDeleteIncomeType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string | number) => incomeTypeService.delete(id),
		onSuccess: () => {
			// Invalidate all income types queries
			queryClient.invalidateQueries({ queryKey: incomeTypeKeys.all });
		},
	});
};
