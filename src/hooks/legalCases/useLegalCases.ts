/** @format */

export {
	useListLegalCases,
	useGetLegalCaseById,
} from "./legalCase.queries";
export { useCreateLegalCase } from "./legalCase.mutations";

import {
	useListLegalCases as _useListLegalCases,
	useGetLegalCaseById as _useGetLegalCaseById,
} from "./legalCase.queries";
import { useCreateLegalCase as _useCreateLegalCase } from "./legalCase.mutations";

export const useLegalCases = () => ({
	useListLegalCases: _useListLegalCases,
	useGetLegalCaseById: _useGetLegalCaseById,
	useCreateLegalCase: _useCreateLegalCase,
});

