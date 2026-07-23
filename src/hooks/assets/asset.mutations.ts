/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "../../config/reactQueryKeys";
import {
	assetService,
	type CreateAssetRequest,
	type UpdateAssetRequest,
	type CreateAssignmentRequest,
	type ReturnAssetRequest,
	type TransferAssetRequest,
} from "../../services/assetService";

const assetKeys = reactQueryKeys.assets;

export const useCreateAsset = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateAssetRequest) => assetService.create(payload),
		onSuccess: () => {
			// Invalidate and refetch all assets list queries to ensure fresh data
			queryClient.invalidateQueries({
				queryKey: assetKeys.lists(),
				exact: false,
				refetchType: "active", // Refetch active queries immediately
			});
			// Explicitly refetch all active asset list queries
			queryClient.refetchQueries({
				queryKey: assetKeys.lists(),
				exact: false,
			});
			queryClient.invalidateQueries({
				queryKey: assetKeys.dictionary(),
			});
			queryClient.invalidateQueries({
				queryKey: [...assetKeys.all, "available-dictionary"],
			});
		},
		onError: (error) => {
			// Don't show error toast here - let the component handle it
			// This prevents duplicate error messages during retries
			console.error("Asset creation error:", error);
		},
	});
};

export const useUpdateAsset = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string | number;
			payload: UpdateAssetRequest;
		}) => assetService.update(id, payload),
		onSuccess: (_, { id }) => {
			// Invalidate asset detail and list
			queryClient.invalidateQueries({
				queryKey: assetKeys.detail(id),
			});
			queryClient.invalidateQueries({
				queryKey: assetKeys.lists(),
				exact: false,
			});
			queryClient.invalidateQueries({
				queryKey: assetKeys.dictionary(),
			});
			queryClient.invalidateQueries({
				queryKey: [...assetKeys.all, "available-dictionary"],
			});
		},
	});
};

export const useDeleteAsset = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string | number) => assetService.delete(id),
		onSuccess: () => {
			// Invalidate assets list and dictionary
			queryClient.invalidateQueries({
				queryKey: assetKeys.lists(),
				exact: false,
			});
			queryClient.invalidateQueries({
				queryKey: assetKeys.dictionary(),
			});
			queryClient.invalidateQueries({
				queryKey: [...assetKeys.all, "available-dictionary"],
			});
		},
	});
};

export const useAssignAsset = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string | number;
			payload: CreateAssignmentRequest;
		}) => assetService.assign(id, payload),
		onSuccess: (_, { id }) => {
			// Invalidate asset detail, assignments, and list
			queryClient.invalidateQueries({
				queryKey: assetKeys.detail(id),
			});
			queryClient.invalidateQueries({
				queryKey: [...assetKeys.detail(id), "assignments"],
			});
			queryClient.invalidateQueries({
				queryKey: assetKeys.lists(),
				exact: false,
			});
			queryClient.invalidateQueries({
				queryKey: [...assetKeys.all, "available-dictionary"],
			});
		},
	});
};

export const useReturnAsset = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string | number;
			payload: ReturnAssetRequest;
		}) => assetService.return(id, payload),
		onSuccess: (_, { id }) => {
			// Invalidate asset detail, assignments, and list
			queryClient.invalidateQueries({
				queryKey: assetKeys.detail(id),
			});
			queryClient.invalidateQueries({
				queryKey: [...assetKeys.detail(id), "assignments"],
			});
			queryClient.invalidateQueries({
				queryKey: assetKeys.lists(),
				exact: false,
			});
			queryClient.invalidateQueries({
				queryKey: [...assetKeys.all, "available-dictionary"],
			});
		},
	});
};

export const useTransferAsset = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string | number;
			payload: TransferAssetRequest;
		}) => assetService.transfer(id, payload),
		onSuccess: (_, { id }) => {
			// Invalidate asset detail, assignments, and list
			queryClient.invalidateQueries({
				queryKey: assetKeys.detail(id),
			});
			queryClient.invalidateQueries({
				queryKey: [...assetKeys.detail(id), "assignments"],
			});
			queryClient.invalidateQueries({
				queryKey: assetKeys.lists(),
				exact: false,
			});
			queryClient.invalidateQueries({
				queryKey: [...assetKeys.all, "available-dictionary"],
			});
		},
	});
};
