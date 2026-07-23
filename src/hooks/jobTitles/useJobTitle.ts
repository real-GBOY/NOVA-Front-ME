/** @format */

import { useListJobTitles, useGetJobTitleById } from "./jobTitle.queries";

import {
	useCreateJobTitle,
	useUpdateJobTitle,
	useDeleteJobTitle,
} from "./jobTitle.mutations";

export const useJobTitle = () => {
	return {
		useListJobTitles,
		useGetJobTitleById,
		useCreateJobTitle,
		useUpdateJobTitle,
		useDeleteJobTitle,
	};
};

// Export individual hooks for direct imports
export { useListJobTitles, useGetJobTitleById } from "./jobTitle.queries";

export {
	useCreateJobTitle,
	useUpdateJobTitle,
	useDeleteJobTitle,
} from "./jobTitle.mutations";
