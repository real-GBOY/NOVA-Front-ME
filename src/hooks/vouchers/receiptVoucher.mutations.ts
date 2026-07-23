/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import {
	receiptVoucherService,
	type CreateReceiptVoucherRequest,
} from "@/services/receiptVoucherService";

export const useCreateReceiptVoucher = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateReceiptVoucherRequest) =>
			receiptVoucherService.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: reactQueryKeys.vouchers.receipts.lists(),
			});
		},
	});
};

export const useUpdateReceiptVoucher = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: number;
			payload: Partial<CreateReceiptVoucherRequest>;
		}) => receiptVoucherService.update(id, payload),
		onSuccess: (_data, variables) => {
			// Invalidate the list so the table updates
			queryClient.invalidateQueries({
				queryKey: reactQueryKeys.vouchers.receipts.lists(),
			});
			// Invalidate the specific voucher detail so the drawer updates
			queryClient.invalidateQueries({
				queryKey: reactQueryKeys.vouchers.receipts.detail(variables.id),
			});
		},
	});
};

export const useApproveReceiptVoucher = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (receiptId: number) => receiptVoucherService.approve(receiptId),
		onSuccess: (_data, receiptId) => {
			// Invalidate the list so the table updates
			queryClient.invalidateQueries({
				queryKey: reactQueryKeys.vouchers.receipts.lists(),
			});
			// Invalidate the specific voucher detail so the drawer updates
			queryClient.invalidateQueries({
				queryKey: reactQueryKeys.vouchers.receipts.detail(receiptId),
			});
		},
	});
};

export const useCancelReceiptVoucher = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ receiptId, remarks }: { receiptId: number; remarks?: string }) =>
			receiptVoucherService.cancel(receiptId, remarks),
		onSuccess: (_data, variables) => {
			// Invalidate the list so the table updates
			queryClient.invalidateQueries({
				queryKey: reactQueryKeys.vouchers.receipts.lists(),
			});
			// Invalidate the specific voucher detail so the drawer updates
			queryClient.invalidateQueries({
				queryKey: reactQueryKeys.vouchers.receipts.detail(variables.receiptId),
			});
		},
	});
};
