/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	legalCasesService,
	type CreateLegalCaseRequest,
	type CreateLegalCaseTypeRequest,
} from "@/services/legalCasesService";
import { reactQueryKeys } from "@/config/reactQueryKeys";

const legalCaseKeys = reactQueryKeys.legalCases;

export const useCreateLegalCase = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateLegalCaseRequest) =>
			legalCasesService.create(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: legalCaseKeys.lists() });
		},
	});
};

export const useDeleteLegalCase = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: legalCaseKeys.delete(),
		mutationFn: (id: string | number) => legalCasesService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: legalCaseKeys.lists() });
		},
	});
};

export const useCreateLegalCaseType = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateLegalCaseTypeRequest) =>
			legalCasesService.createType(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: legalCaseKeys.types() });
		},
	});
};
