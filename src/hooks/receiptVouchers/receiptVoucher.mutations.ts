/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { receiptVoucherService } from "@/services/receiptVoucherService";
import type {
	CreateReceiptVoucherRequest,
	UpdateReceiptVoucherRequest,
} from "@/services/receiptVoucherService";

const receiptVoucherKeys = reactQueryKeys.receiptVouchers;

/**
 * POST - Create a new receipt voucher
 */
export const useCreateReceiptVoucher = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: receiptVoucherKeys.create(),
		mutationFn: (payload: CreateReceiptVoucherRequest) =>
			receiptVoucherService.create(payload),
		onSuccess: () => {
			// Invalidate and refetch receipt vouchers list and stats
			queryClient.invalidateQueries({
				queryKey: receiptVoucherKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: receiptVoucherKeys.stats(),
			});
		},
		onError: (error) => {
			console.error("Error creating receipt voucher:", error);
		},
	});
};

/**
 * PUT - Update receipt voucher
 */
export const useUpdateReceiptVoucher = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: receiptVoucherKeys.update(),
		mutationFn: ({
			id,
			payload,
		}: {
			id: string | number;
			payload: UpdateReceiptVoucherRequest;
		}) => receiptVoucherService.update(id, payload),
		onSuccess: (_data, variables) => {
			// Invalidate and refetch receipt vouchers list and stats
			queryClient.invalidateQueries({
				queryKey: receiptVoucherKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: receiptVoucherKeys.stats(),
			});
			// Invalidate the specific receipt voucher detail
			queryClient.invalidateQueries({
				queryKey: receiptVoucherKeys.detail(variables.id),
			});
		},
		onError: (error) => {
			console.error("Error updating receipt voucher:", error);
		},
	});
};

/**
 * POST - Cancel receipt voucher
 */
export const useCancelReceiptVoucher = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: receiptVoucherKeys.cancel(),
		mutationFn: (id: string | number) => receiptVoucherService.cancel(id),
		onSuccess: (_data, id) => {
			// Invalidate and refetch receipt vouchers list and stats
			queryClient.invalidateQueries({
				queryKey: receiptVoucherKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: receiptVoucherKeys.stats(),
			});
			// Invalidate the specific receipt voucher detail
			queryClient.invalidateQueries({
				queryKey: receiptVoucherKeys.detail(id),
			});
		},
		onError: (error) => {
			console.error("Error cancelling receipt voucher:", error);
		},
	});
};

/**
 * POST - Link invoice to receipt voucher
 */
export const useLinkReceiptVoucherInvoice = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			receiptId,
			invoiceId,
		}: {
			receiptId: string | number;
			invoiceId: string | number;
		}) => receiptVoucherService.linkInvoice(receiptId, invoiceId),
		onSuccess: (_data, variables) => {
			// Invalidate the specific receipt voucher detail
			queryClient.invalidateQueries({
				queryKey: receiptVoucherKeys.detail(variables.receiptId),
			});
		},
		onError: (error) => {
			console.error("Error linking invoice to receipt voucher:", error);
		},
	});
};

/**
 * DELETE - Unlink invoice from receipt voucher
 */
export const useUnlinkReceiptVoucherInvoice = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			receiptId,
			invoiceId,
		}: {
			receiptId: string | number;
			invoiceId: string | number;
		}) => receiptVoucherService.unlinkInvoice(receiptId, invoiceId),
		onSuccess: (_data, variables) => {
			// Invalidate the specific receipt voucher detail
			queryClient.invalidateQueries({
				queryKey: receiptVoucherKeys.detail(variables.receiptId),
			});
		},
		onError: (error) => {
			console.error("Error unlinking invoice from receipt voucher:", error);
		},
	});
};
