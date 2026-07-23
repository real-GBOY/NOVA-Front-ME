/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import {
	prettyCashNameService,
	type CreatePrettyCashNameRequest,
	type UpdatePrettyCashNameRequest,
} from "@/services/prettyCashNameService";

const prettyCashNameKeys = reactQueryKeys.prettyCashNames;

export const useCreatePrettyCashName = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreatePrettyCashNameRequest) =>
			prettyCashNameService.create(payload),
		onSuccess: () => {
			// Invalidate all pretty cash names queries to ensure fresh data
			queryClient.invalidateQueries({ queryKey: prettyCashNameKeys.all });
		},
	});
};

export const useUpdatePrettyCashName = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string | number;
			payload: UpdatePrettyCashNameRequest;
		}) => prettyCashNameService.update(id, payload),
		onSuccess: (_, { id }) => {
			// Invalidate all pretty cash names queries
			queryClient.invalidateQueries({ queryKey: prettyCashNameKeys.all });
			// Invalidate the specific pretty cash name detail
			queryClient.invalidateQueries({
				queryKey: prettyCashNameKeys.detail(id),
			});
		},
	});
};

export const useDeletePrettyCashName = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string | number) => prettyCashNameService.delete(id),
		onSuccess: () => {
			// Invalidate all pretty cash names queries
			queryClient.invalidateQueries({ queryKey: prettyCashNameKeys.all });
		},
	});
};


