/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import {
	expenseTypeService,
	type CreateExpenseTypeRequest,
	type UpdateExpenseTypeRequest,
} from "@/services/expenseTypeService";

const expenseTypeKeys = reactQueryKeys.expenseTypes;

export const useCreateExpenseType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateExpenseTypeRequest) =>
			expenseTypeService.create(payload),
		onSuccess: () => {
			// Invalidate all expense types queries to ensure fresh data
			queryClient.invalidateQueries({ queryKey: expenseTypeKeys.all });
		},
	});
};

export const useUpdateExpenseType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string | number;
			payload: UpdateExpenseTypeRequest;
		}) => expenseTypeService.update(id, payload),
		onSuccess: (_, { id }) => {
			// Invalidate all expense types queries
			queryClient.invalidateQueries({ queryKey: expenseTypeKeys.all });
			// Invalidate the specific expense type detail
			queryClient.invalidateQueries({
				queryKey: expenseTypeKeys.detail(id),
			});
		},
	});
};

export const useDeleteExpenseType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string | number) => expenseTypeService.delete(id),
		onSuccess: () => {
			// Invalidate all expense types queries
			queryClient.invalidateQueries({ queryKey: expenseTypeKeys.all });
		},
	});
};

