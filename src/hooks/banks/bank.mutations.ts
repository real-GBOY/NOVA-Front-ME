/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import {
	bankService,
	type CreateBankRequest,
	type UpdateBankRequest,
} from "@/services/bankService";

const bankKeys = reactQueryKeys.banks;

export const useCreateBank = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateBankRequest) =>
			bankService.create(payload),
		onSuccess: () => {
			// Invalidate all banks queries to ensure fresh data
			queryClient.invalidateQueries({ queryKey: bankKeys.all });
		},
	});
};

export const useUpdateBank = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string | number;
			payload: UpdateBankRequest;
		}) => bankService.update(id, payload),
		onSuccess: (_, { id }) => {
			// Invalidate all banks queries
			queryClient.invalidateQueries({ queryKey: bankKeys.all });
			// Invalidate the specific bank detail
			queryClient.invalidateQueries({
				queryKey: bankKeys.detail(id),
			});
		},
	});
};

export const useDeleteBank = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string | number) => bankService.delete(id),
		onSuccess: () => {
			// Invalidate all banks queries
			queryClient.invalidateQueries({ queryKey: bankKeys.all });
		},
	});
};


