/** @format */

export * from "./receiptVoucher.queries";
export * from "./receiptVoucher.mutations";

import * as queries from "./receiptVoucher.queries";
import * as mutations from "./receiptVoucher.mutations";

export const useReceiptVoucher = () => {
	return {
		...queries,
		...mutations,
	};
};
