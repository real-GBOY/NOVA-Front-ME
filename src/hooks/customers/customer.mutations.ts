/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import {
	customerService,
	type CreateCustomerRequest,
	type UpdateCustomerRequest,
} from "@/services/customerService";

const customerKeys = reactQueryKeys.customers;

export const useCreateCustomer = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateCustomerRequest) =>
			customerService.create(payload),
		onSuccess: () => {
			// Invalidate all customers queries to ensure fresh data
			queryClient.invalidateQueries({ queryKey: customerKeys.all });
		},
	});
};

export const useUpdateCustomer = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string | number;
			payload: UpdateCustomerRequest;
		}) => customerService.update(id, payload),
		onSuccess: (_, { id }) => {
			// Invalidate all customers queries
			queryClient.invalidateQueries({ queryKey: customerKeys.all });
			// Invalidate the specific customer detail
			queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) });
		},
	});
};

export const useDeleteCustomer = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string | number) => customerService.delete(id),
		onSuccess: () => {
			// Invalidate all customers queries
			queryClient.invalidateQueries({ queryKey: customerKeys.all });
		},
	});
};
