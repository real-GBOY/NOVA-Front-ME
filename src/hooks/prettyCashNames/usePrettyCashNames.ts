/** @format */

import {
	useListPrettyCashNames,
	useGetPrettyCashNameById,
} from "./prettyCashName.queries";

import {
	useCreatePrettyCashName,
	useUpdatePrettyCashName,
	useDeletePrettyCashName,
} from "./prettyCashName.mutations";

export const usePrettyCashNames = () => {
	return {
		useListPrettyCashNames,
		useGetPrettyCashNameById,
		useCreatePrettyCashName,
		useUpdatePrettyCashName,
		useDeletePrettyCashName,
	};
};

// Export individual hooks for direct imports
export { useListPrettyCashNames, useGetPrettyCashNameById } from "./prettyCashName.queries";
export {
	useCreatePrettyCashName,
	useUpdatePrettyCashName,
	useDeletePrettyCashName,
} from "./prettyCashName.mutations";


