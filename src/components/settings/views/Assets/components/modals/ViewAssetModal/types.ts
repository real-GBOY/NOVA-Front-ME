/** @format */

import type { Asset } from "@/services/assetService";

export interface AssignedToData {
	name: string;
	jobTitle: string;
	avatar: string;
	contractName: string;
}

export interface ViewAssetModalProps {
	isOpen: boolean;
	onClose: () => void;
	asset: Asset;
	onRequestReturn?: () => void;
}

export interface ViewAssetModalHeaderProps {
	onClose: () => void;
}

export interface ViewAssetModalAssetHeaderProps {
	asset: Asset;
	imagePath: string;
	categoryName: string;
	addedDate: string;
	isAssigned: boolean;
	onRequestReturn: () => void;
	onAssignClick: () => void;
	onReturnClick: () => void;
	onTransferClick: () => void;
	onDeleteClick: () => void;
	canAssign?: boolean;
	canReturn?: boolean;
	canTransfer?: boolean;
	canDelete?: boolean;
}

export interface AssignedToCardProps {
	assignedTo: AssignedToData;
}

export interface AssetInformationCardProps {
	asset: Asset;
	assignedDate: string;
	notes: string;
	condition: string;
	conditionLabel: string;
	isGoodCondition: boolean;
	status: string;
	statusLabel: string;
}
