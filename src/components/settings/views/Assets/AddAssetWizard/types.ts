/** @format */

export type AssetFormData = {
	name: string;
	category: string;
	serial: string;
	condition: string;
	image?: {
		// Required fields for API
		fileId: number;
		token: string;
		purpose: string;
		// UI fields (not sent to API)
		fileUrl?: string;
		fileName?: string;
		fileSize?: number;
		fileType?: string;
	} | null;
};

export type AddAssetWizardProps = {
	onSubmit: (data: AssetFormData) => void;
	onCancel: () => void;
	onFormDataChange?: (data: AssetFormData) => void;
	initialData?: AssetFormData;
	assignedTo?: {
		id: string;
		name: string;
		email?: string;
		avatar?: string;
	};
};

export const STEPS = [
	{ id: 1, title: "Asset Information", key: "info" },
	{ id: 2, title: "Review", key: "review" },
] as const;
