/** @format */

import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import {
	paymentVoucherService,
} from "@/services/paymentVoucherService";

export const useListPaymentVouchers = () => {
	return useQuery({
		queryKey: reactQueryKeys.vouchers.payments.lists(),
		queryFn: () => paymentVoucherService.list(),
	});
};

export const useGetPaymentVoucherById = (voucherId: number) => {
	return useQuery({
		queryKey: reactQueryKeys.vouchers.payments.detail(voucherId),
		queryFn: () => paymentVoucherService.getById(voucherId),
		enabled: !!voucherId,
	});
};
