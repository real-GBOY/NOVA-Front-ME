/** @format */

import {
	useListPaymentVouchers,
	useGetPaymentVoucherById,
	usePaymentVoucherStats,
	useGetPaymentVoucherNavigation,
} from "./paymentVoucher.queries";

import {
	useCreatePaymentVoucher,
	useUpdatePaymentVoucher,
	useDeletePaymentVoucher,
	useApprovePaymentVoucher,
	useLinkPaymentVoucherInvoice,
	useUnlinkPaymentVoucherInvoice,
} from "./paymentVoucher.mutations";

export const usePaymentVoucher = () => {
	return {
		useListPaymentVouchers,
		useGetPaymentVoucherById,
		usePaymentVoucherStats,
		useGetPaymentVoucherNavigation,
		useCreatePaymentVoucher,
		useUpdatePaymentVoucher,
		useDeletePaymentVoucher,
		useApprovePaymentVoucher,
		useLinkPaymentVoucherInvoice,
		useUnlinkPaymentVoucherInvoice,
	};
};

// Export individual hooks for direct imports
export {
	useListPaymentVouchers,
	useGetPaymentVoucherById,
	usePaymentVoucherStats,
	useGetPaymentVoucherNavigation,
} from "./paymentVoucher.queries";

export {
	useCreatePaymentVoucher,
	useUpdatePaymentVoucher,
	useDeletePaymentVoucher,
	useApprovePaymentVoucher,
	useLinkPaymentVoucherInvoice,
	useUnlinkPaymentVoucherInvoice,
} from "./paymentVoucher.mutations";
