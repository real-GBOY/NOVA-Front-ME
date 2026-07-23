/** @format */

import {
	useListBanks,
	useGetBankById,
} from "./bank.queries";

import {
	useCreateBank,
	useUpdateBank,
	useDeleteBank,
} from "./bank.mutations";

export const useBanks = () => {
	return {
		useListBanks,
		useGetBankById,
		useCreateBank,
		useUpdateBank,
		useDeleteBank,
	};
};

// Export individual hooks for direct imports
export { useListBanks, useGetBankById } from "./bank.queries";
export {
	useCreateBank,
	useUpdateBank,
	useDeleteBank,
} from "./bank.mutations";


