/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { paymentVoucherService } from "@/services/paymentVoucherService";
import type {
	CreatePaymentVoucherRequest,
	UpdatePaymentVoucherRequest,
} from "@/services/paymentVoucherService";

const paymentVoucherKeys = reactQueryKeys.vouchers.payments;

/**
 * POST - Create a new payment voucher
 */
export const useCreatePaymentVoucher = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: paymentVoucherKeys.create(),
		mutationFn: (payload: CreatePaymentVoucherRequest) =>
			paymentVoucherService.create(payload),
		onSuccess: () => {
			// Invalidate and refetch payment vouchers list and stats
			queryClient.invalidateQueries({
				queryKey: paymentVoucherKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: paymentVoucherKeys.stats(),
			});
		},
		onError: (error) => {
			console.error("Error creating payment voucher:", error);
		},
	});
};

/**
 * PUT - Update payment voucher
 */
export const useUpdatePaymentVoucher = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: paymentVoucherKeys.update(),
		mutationFn: ({
			id,
			payload,
		}: {
			id: string | number;
			payload: UpdatePaymentVoucherRequest;
		}) => paymentVoucherService.update(Number(id), payload),
		onSuccess: (_data, variables) => {
			// Invalidate and refetch payment vouchers list and stats
			queryClient.invalidateQueries({
				queryKey: paymentVoucherKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: paymentVoucherKeys.stats(),
			});
			// Invalidate the specific voucher detail
			queryClient.invalidateQueries({
				queryKey: paymentVoucherKeys.detail(Number(variables.id)),
			});
		},
		onError: (error) => {
			console.error("Error updating payment voucher:", error);
		},
	});
};

/**
 * DELETE - Delete payment voucher
 */
export const useDeletePaymentVoucher = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: paymentVoucherKeys.delete(),
		mutationFn: (id: string | number) =>
			paymentVoucherService.delete(Number(id)),
		onSuccess: () => {
			// Invalidate and refetch payment vouchers list and stats
			queryClient.invalidateQueries({
				queryKey: paymentVoucherKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: paymentVoucherKeys.stats(),
			});
		},
		onError: (error) => {
			console.error("Error deleting payment voucher:", error);
		},
	});
};

/**
 * POST - Approve payment voucher
 */
export const useApprovePaymentVoucher = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: paymentVoucherKeys.approve(),
		mutationFn: (id: string | number) =>
			paymentVoucherService.approve(Number(id)),
		onSuccess: (_data, id) => {
			// Invalidate and refetch payment vouchers list and stats
			queryClient.invalidateQueries({
				queryKey: paymentVoucherKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: paymentVoucherKeys.stats(),
			});
			// Invalidate the specific voucher detail
			queryClient.invalidateQueries({
				queryKey: paymentVoucherKeys.detail(Number(id)),
			});
		},
		onError: (error) => {
			console.error("Error approving payment voucher:", error);
		},
	});
};

/**
 * POST - Link invoice to payment voucher
 */
export const useLinkPaymentVoucherInvoice = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			voucherId,
			invoiceId,
			paymentAmount,
		}: {
			voucherId: string | number;
			invoiceId: string | number;
			paymentAmount?: number;
		}) =>
			paymentVoucherService.linkInvoice(Number(voucherId), {
				invoice_id: Number(invoiceId),
				payment_amount: paymentAmount,
			}),
		onSuccess: (_data, variables) => {
			// Invalidate the specific voucher detail
			queryClient.invalidateQueries({
				queryKey: paymentVoucherKeys.detail(Number(variables.voucherId)),
			});
		},
		onError: (error) => {
			console.error("Error linking invoice to payment voucher:", error);
		},
	});
};

/**
 * DELETE - Unlink invoice from payment voucher
 */
export const useUnlinkPaymentVoucherInvoice = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			voucherId,
			invoiceId,
		}: {
			voucherId: string | number;
			invoiceId: string | number;
		}) =>
			paymentVoucherService.unlinkInvoice(Number(voucherId), Number(invoiceId)),
		onSuccess: (_data, variables) => {
			// Invalidate the specific voucher detail
			queryClient.invalidateQueries({
				queryKey: paymentVoucherKeys.detail(Number(variables.voucherId)),
			});
		},
		onError: (error) => {
			console.error("Error unlinking invoice from payment voucher:", error);
		},
	});
};
