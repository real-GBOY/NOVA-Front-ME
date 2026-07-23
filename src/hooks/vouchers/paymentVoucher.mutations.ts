/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import {
	paymentVoucherService,
	type CreatePaymentVoucherRequest,
} from "@/services/paymentVoucherService";

export const useCreatePaymentVoucher = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreatePaymentVoucherRequest) =>
			paymentVoucherService.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: reactQueryKeys.vouchers.payments.lists(),
			});
		},
	});
};

export const useDeletePaymentVoucher = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (voucherId: number) => paymentVoucherService.delete(voucherId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: reactQueryKeys.vouchers.payments.lists(),
			});
		},
	});
};
