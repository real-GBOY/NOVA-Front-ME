/** @format */

import {
	useListVoucherTypes,
	useGetVoucherTypeById,
} from "./voucherType.queries";

import {
	useCreateVoucherType,
	useUpdateVoucherType,
	useDeleteVoucherType,
} from "./voucherType.mutations";

export const useVoucherTypes = () => {
	return {
		useListVoucherTypes,
		useGetVoucherTypeById,
		useCreateVoucherType,
		useUpdateVoucherType,
		useDeleteVoucherType,
	};
};

// Export individual hooks for direct imports
export { useListVoucherTypes, useGetVoucherTypeById } from "./voucherType.queries";
export {
	useCreateVoucherType,
	useUpdateVoucherType,
	useDeleteVoucherType,
} from "./voucherType.mutations";


