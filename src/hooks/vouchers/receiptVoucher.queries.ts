/** @format */

import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import {
	receiptVoucherService,
} from "@/services/receiptVoucherService";

export const useListReceiptVouchers = () => {
	return useQuery({
		queryKey: reactQueryKeys.vouchers.receipts.lists(),
		queryFn: () => receiptVoucherService.list(),
	});
};

export const useGetReceiptVoucherById = (
	receiptId: number,
	options?: { enabled?: boolean }
) => {
	return useQuery({
		queryKey: reactQueryKeys.vouchers.receipts.detail(receiptId),
		queryFn: () => receiptVoucherService.getById(receiptId),
		enabled: !!receiptId,
		...options,
	});
};
