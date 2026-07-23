/** @format */

import {
	useListReceiptVouchers,
	useGetReceiptVoucherById,
	useReceiptVoucherStats,
	useGetReceiptVoucherNavigation,
} from "./receiptVoucher.queries";

import {
	useCreateReceiptVoucher,
	useUpdateReceiptVoucher,
	useCancelReceiptVoucher,
	useLinkReceiptVoucherInvoice,
	useUnlinkReceiptVoucherInvoice,
} from "./receiptVoucher.mutations";

export const useReceiptVoucher = () => {
	return {
		useListReceiptVouchers,
		useGetReceiptVoucherById,
		useReceiptVoucherStats,
		useGetReceiptVoucherNavigation,
		useCreateReceiptVoucher,
		useUpdateReceiptVoucher,
		useCancelReceiptVoucher,
		useLinkReceiptVoucherInvoice,
		useUnlinkReceiptVoucherInvoice,
	};
};

// Export individual hooks for direct imports
export {
	useListReceiptVouchers,
	useGetReceiptVoucherById,
	useReceiptVoucherStats,
	useGetReceiptVoucherNavigation,
} from "./receiptVoucher.queries";

export {
	useCreateReceiptVoucher,
	useUpdateReceiptVoucher,
	useCancelReceiptVoucher,
	useLinkReceiptVoucherInvoice,
	useUnlinkReceiptVoucherInvoice,
} from "./receiptVoucher.mutations";
