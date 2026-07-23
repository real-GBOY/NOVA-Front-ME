/** @format */

import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { paymentVoucherService } from "@/services/paymentVoucherService";
import type { PaymentVoucherFilters } from "@/services/paymentVoucherService";

const paymentVoucherKeys = reactQueryKeys.vouchers.payments;

/**
 * GET - Get payment voucher statistics
 */
export const usePaymentVoucherStats = (
	filters?: {
		date_from?: string;
		date_to?: string;
	},
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: paymentVoucherKeys.stats(),
		queryFn: async () => {
			const response = await paymentVoucherService.getStats(filters);
			return response;
		},
		enabled: options?.enabled !== false,
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
	});

/**
 * GET - List payment vouchers
 */
export const useListPaymentVouchers = (
	filters?: PaymentVoucherFilters,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: paymentVoucherKeys.list(filters),
		queryFn: async () => {
			const response = await paymentVoucherService.list(filters);
			return response;
		},
		enabled: options?.enabled !== false,
		staleTime: 0, // Always consider data stale to allow immediate refetch after mutations
		refetchOnMount: true,
		refetchOnWindowFocus: false,
	});

/**
 * GET - Get payment voucher by ID
 */
export const useGetPaymentVoucherById = (
	id: string | number | null | undefined,
	options?: {
		enabled?: boolean;
	}
) => {
	const voucherId = id
		? typeof id === "string"
			? parseInt(id, 10)
			: id
		: null;
	return useQuery({
		queryKey: paymentVoucherKeys.detail(voucherId!),
		queryFn: async () => {
			if (!voucherId || isNaN(voucherId))
				throw new Error("Payment voucher ID is required");
			const response = await paymentVoucherService.getById(voucherId);
			return response;
		},
		enabled: options?.enabled !== false && !!voucherId && !isNaN(voucherId),
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});
};

/**
 * GET - Get payment voucher navigation (previous/next)
 */
export const useGetPaymentVoucherNavigation = (
	id: string | number | null | undefined,
	options?: {
		enabled?: boolean;
	}
) => {
	const voucherId = id
		? typeof id === "string"
			? parseInt(id, 10)
			: id
		: null;
	return useQuery({
		queryKey: paymentVoucherKeys.navigation(voucherId!),
		queryFn: async () => {
			if (!voucherId || isNaN(voucherId))
				throw new Error("Payment voucher ID is required");
			const response = await paymentVoucherService.getNavigation(voucherId);
			return response;
		},
		enabled: options?.enabled !== false && !!voucherId && !isNaN(voucherId),
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});
};
