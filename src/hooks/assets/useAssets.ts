/** @format */

import {
	useListAssets,
	useGetAssetById,
	useGetAssetAssignments,
	useAssetDictionary,
	useAvailableAssetDictionary,
} from "./asset.queries";

import {
	useCreateAsset,
	useUpdateAsset,
	useDeleteAsset,
	useAssignAsset,
	useReturnAsset,
	useTransferAsset,
} from "./asset.mutations";

export const useAssets = () => {
	return {
		useListAssets,
		useGetAssetById,
		useGetAssetAssignments,
		useAssetDictionary,
		useAvailableAssetDictionary,
		useCreateAsset,
		useUpdateAsset,
		useDeleteAsset,
		useAssignAsset,
		useReturnAsset,
		useTransferAsset,
	};
};

// Export individual hooks for direct imports
export {
	useListAssets,
	useGetAssetById,
	useGetAssetAssignments,
	useAssetDictionary,
	useAvailableAssetDictionary,
} from "./asset.queries";

export {
	useCreateAsset,
	useUpdateAsset,
	useDeleteAsset,
	useAssignAsset,
	useReturnAsset,
	useTransferAsset,
} from "./asset.mutations";
