/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import {
	voucherTypeService,
	type CreateVoucherTypeRequest,
	type UpdateVoucherTypeRequest,
} from "@/services/voucherTypeService";

const voucherTypeKeys = reactQueryKeys.voucherTypes;

export const useCreateVoucherType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateVoucherTypeRequest) =>
			voucherTypeService.create(payload),
		onSuccess: () => {
			// Invalidate all voucher types queries to ensure fresh data
			queryClient.invalidateQueries({ queryKey: voucherTypeKeys.all });
		},
	});
};

export const useUpdateVoucherType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string | number;
			payload: UpdateVoucherTypeRequest;
		}) => voucherTypeService.update(id, payload),
		onSuccess: (_, { id }) => {
			// Invalidate all voucher types queries
			queryClient.invalidateQueries({ queryKey: voucherTypeKeys.all });
			// Invalidate the specific voucher type detail
			queryClient.invalidateQueries({
				queryKey: voucherTypeKeys.detail(id),
			});
		},
	});
};

export const useDeleteVoucherType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string | number) => voucherTypeService.delete(id),
		onSuccess: () => {
			// Invalidate all voucher types queries
			queryClient.invalidateQueries({ queryKey: voucherTypeKeys.all });
		},
	});
};


