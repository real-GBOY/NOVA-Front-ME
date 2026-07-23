/** @format */

import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { receiptVoucherService } from "@/services/receiptVoucherService";

const receiptVoucherKeys = reactQueryKeys.receiptVouchers;

/**
 * GET - Get receipt voucher statistics
 */
export const useReceiptVoucherStats = (
	filters?: {
		date_from?: string;
		date_to?: string;
	},
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: receiptVoucherKeys.stats(),
		queryFn: async () => {
			const response = await receiptVoucherService.getStats(filters);
			return response;
		},
		enabled: options?.enabled !== false,
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
	});

/**
 * GET - List receipt vouchers
 */
export const useListReceiptVouchers = (
	filters?: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string;
		date_from?: string;
		date_to?: string;
		sort_by?: string;
		sort_order?: "asc" | "desc";
	},
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: receiptVoucherKeys.list(filters),
		queryFn: async () => {
			const response = await receiptVoucherService.list(filters);
			return response;
		},
		enabled: options?.enabled !== false,
		staleTime: 0, // Always consider data stale to allow immediate refetch after mutations
		refetchOnMount: true,
		refetchOnWindowFocus: false,
	});

/**
 * GET - Get receipt voucher by ID
 */
export const useGetReceiptVoucherById = (
	id: string | number | null | undefined,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: receiptVoucherKeys.detail(id!),
		queryFn: async () => {
			if (!id) throw new Error("Receipt voucher ID is required");
			const response = await receiptVoucherService.getById(id);
			return response;
		},
		enabled: options?.enabled !== false && !!id,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});

/**
 * GET - Get receipt voucher navigation (previous/next)
 */
export const useGetReceiptVoucherNavigation = (
	id: string | number | null | undefined,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: receiptVoucherKeys.navigation(id!),
		queryFn: async () => {
			if (!id) throw new Error("Receipt voucher ID is required");
			const response = await receiptVoucherService.getNavigation(id);
			return response;
		},
		enabled: options?.enabled !== false && !!id,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});
