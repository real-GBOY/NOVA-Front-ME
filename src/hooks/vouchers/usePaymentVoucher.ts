/** @format */

export * from "./paymentVoucher.queries";
export * from "./paymentVoucher.mutations";

import * as queries from "./paymentVoucher.queries";
import * as mutations from "./paymentVoucher.mutations";

export const usePaymentVoucher = () => {
	return {
		...queries,
		...mutations,
	};
};
