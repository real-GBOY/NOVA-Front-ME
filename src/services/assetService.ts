/** @format */

import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";

// Asset types
export interface Asset {
	id: number;
	name: string;
	description?: string | null;
	serial?: string;
	serial_number?: string;
	asset_condition?: "new" | "good" | "fair" | "poor" | "damaged";
	category_id?: number;
	category_name?: string; // Backend returns category_name
	category?: string; // For backward compatibility, can be derived from category_name
	status?: "available" | "assigned" | "maintenance" | "retired" | "lost";
	image_url?: string | null; // Backend returns image_url directly
	assignment?: {
		id: number;
		employee_id: number;
		employee_name?: string;
		employee_email?: string | null;
		employee_avatar?: string | null;
		employee_job_title?: string | null;
		member_id?: string | null;
		employee?: {
			id: number;
			name: string;
			email: string;
			avatar?: string | null;
			job_title?: string | null;
		};
		assigned_date: string;
		return_date?: string | null;
		condition_at_handover: string;
		condition_on_return?: string | null;
		notes?: string | null;
		contract_name?: string | null;
	} | null;
	assigned_contract?: string | null;
	assigned_to?: {
		id: number;
		name: string;
		email: string;
		avatar?: string | null;
		job_title?: string | null;
	} | null; // Can be derived from assignment.employee
	created_at?: string;
	updated_at?: string;
}

export interface AssetAssignment {
	id: number;
	asset_id: number;
	employee_id: number;
	employee: {
		id: number;
		name: string;
		email: string;
		avatar?: string | null;
		job_title?: string | null;
	};
	assigned_date: string;
	return_date?: string | null;
	condition_at_handover: string;
	condition_on_return?: string | null;
	notes?: string | null;
	contract_name?: string | null;
	created_at: string;
	updated_at: string;
}

export interface AssetDictionaryItem {
	id: string;
	label: string;
	avatar?: string;
	serial?: string;
}

export interface AssetListResponse {
	data: Asset[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		total_pages: number;
	};
}

export interface ApiResponse<T> {
	success: boolean;
	message: string;
	data: T;
}

export interface CreateAssetRequest {
	name: string;
	description?: string;
	serial?: string;
	asset_condition?: "new" | "good" | "fair" | "poor" | "damaged";
	category_id?: number;
	status?: "available" | "assigned" | "maintenance" | "retired" | "lost";
	image?: {
		fileId: number;
		token: string;
		purpose: string;
	};
}

export interface UpdateAssetRequest {
	name?: string;
	description?: string;
	serial?: string;
	asset_condition?: "new" | "good" | "fair" | "poor" | "damaged";
	category_id?: number;
	status?: "available" | "assigned" | "maintenance" | "retired" | "lost";
	image?: {
		fileId: number;
		token: string;
		purpose: string;
	};
}

export interface CreateAssignmentRequest {
	employee_id: number;
	assigned_date: string;
	condition_at_handover: string;
	notes?: string;
}

export interface ReturnAssetRequest {
	return_date: string;
	condition_on_return: string;
	notes?: string;
	send_to_maintenance?: boolean;
}

export interface TransferAssetRequest {
	to_employee_id: number; // Required - ID of employee receiving the asset
	transfer_date?: string; // Optional - ISO date (defaults to current date)
	condition?: string; // Optional - 'new', 'good', 'fair', 'poor', 'damaged'
	notes?: string; // Optional - Transfer notes
}

export interface AssetAssignmentsResponse {
	data: AssetAssignment[];
	pagination?: {
		total: number;
		page: number;
		limit: number;
	};
}

export const assetService = {
	// GET - List all assets
	list: async (filters?: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string | string[];
		category_id?: number | number[];
		employee_id?: number | number[];
	}): Promise<AssetListResponse> => {
		try {
			const response = await apiClient.get(endPoints.assets.getAll, {
				params: filters,
			});

			// Transform { rows, count } or { data, meta } to standard format
			const rawData = response.data;
			if (rawData.rows) {
				const limit = filters?.limit || 20;
				const total = rawData.count || 0;
				return {
					data: rawData.rows,
					pagination: {
						total,
						page: filters?.page || 1,
						limit,
						total_pages: Math.ceil(total / limit)
					}
				};
			}
			return rawData;
		} catch (error) {
			console.error("Error in assetService.list:", error);
			throw error;
		}
	},

	// GET - Get asset by ID
	getById: async (id: string | number): Promise<ApiResponse<Asset>> => {
		const response = await apiClient.get(endPoints.assets.getById(id));
		return response.data;
	},

	// POST - Create asset
	create: async (payload: CreateAssetRequest): Promise<ApiResponse<Asset>> => {
		const response = await apiClient.post(endPoints.assets.create, payload);
		return response.data;
	},

	// PUT - Update asset
	update: async (
		id: string | number,
		payload: UpdateAssetRequest
	): Promise<ApiResponse<Asset>> => {
		const response = await apiClient.put(endPoints.assets.update(id), payload);
		return response.data;
	},

	// DELETE - Delete asset
	delete: async (id: string | number): Promise<ApiResponse<void>> => {
		const response = await apiClient.delete(endPoints.assets.delete(id));
		return response.data;
	},

	// GET - List asset assignments
	listAssignments: async (
		id: string | number,
		filters?: {
			page?: number;
			limit?: number;
		}
	): Promise<AssetAssignmentsResponse> => {
		const response = await apiClient.get(endPoints.assets.listAssignments(id), {
			params: filters,
		});
		return response.data;
	},

	// POST - Assign asset to employee
	assign: async (
		id: string | number,
		payload: CreateAssignmentRequest
	): Promise<ApiResponse<AssetAssignment>> => {
		const response = await apiClient.post(endPoints.assets.assign(id), payload);
		return response.data;
	},

	// POST - Return asset
	return: async (
		id: string | number,
		payload: ReturnAssetRequest
	): Promise<ApiResponse<AssetAssignment>> => {
		const response = await apiClient.post(endPoints.assets.return(id), payload);
		return response.data;
	},

	// POST - Transfer asset
	transfer: async (
		id: string | number,
		payload: TransferAssetRequest
	): Promise<ApiResponse<AssetAssignment>> => {
		const response = await apiClient.post(
			endPoints.assets.transfer(id),
			payload
		);
		return response.data;
	},

	// GET - Get assets as dictionary (for dropdowns)
	getDictionary: async (): Promise<AssetDictionaryItem[]> => {
		const response = await apiClient.get(endPoints.assets.getAll);
		const assets: Asset[] = response.data?.data || response.data || [];

		// Transform to dictionary format
		return assets.map((asset) => ({
			id: String(asset.id),
			label: asset.name,
			avatar: asset.image_url || undefined,
			serial: asset.serial || asset.serial_number || undefined,
		}));
	},

	// GET - Get only available assets as dictionary (for contracts)
	getAvailableDictionary: async (): Promise<AssetDictionaryItem[]> => {
		const response = await apiClient.get(endPoints.assets.getAll);
		const allAssets: Asset[] = response.data?.data || response.data || [];

		// Filter only available assets and transform to dictionary format
		const availableAssets = allAssets.filter(
			(asset) => asset.status === "available"
		);

		return availableAssets.map((asset) => ({
			id: String(asset.id),
			label: asset.name,
			avatar: asset.image_url || undefined,
			serial: asset.serial || asset.serial_number || undefined,
		}));
	},
};
