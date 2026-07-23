/** @format */

import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";

// Frontend types (camelCase)
export interface VoucherType {
	voucher_type_id: string | number;
	voucher_type_name: string;
	direction: string;
	description?: string;
	status: "Active" | "Inactive";
	usage_count?: number;
	last_used_at?: string | null;
	created_at: string;
	updated_at: string;
	// Legacy fields for backward compatibility
	id?: string | number;
	name?: string;
}

export interface VoucherTypeListResponse {
	success: boolean;
	data: VoucherType[];
	pagination: {
		page: string | number;
		limit: string | number;
		total: number;
		total_pages?: number;
	};
}

export interface CreateVoucherTypeRequest {
	voucher_type_name: string;
	direction: string;
	description?: string;
	status: "Active" | "Inactive";
}

export interface UpdateVoucherTypeRequest {
	voucher_type_name?: string;
	direction?: string;
	description?: string;
	status?: "Active" | "Inactive";
}

// Helper function to map backend direction to frontend format
const mapDirectionToFrontend = (direction: string): string => {
	const dir = direction?.trim() || "";
	if (dir === "To (Receiver)" || dir.includes("To (Receiver)")) {
		return "to";
	}
	if (dir === "From (Source)" || dir.includes("From (Source)")) {
		return "from";
	}
	if (dir === "Both") {
		return "both";
	}
	// If already in frontend format, return as is
	if (dir === "to" || dir === "from" || dir === "both") {
		return dir;
	}
	return dir.toLowerCase();
};

// Helper function to map frontend direction to backend format
const mapDirectionToBackend = (direction: string): string => {
	if (direction === "to") {
		return "To (Receiver)";
	}
	if (direction === "from") {
		return "From (Source)";
	}
	if (direction === "both") {
		return "Both";
	}
	return direction;
};

// Transform backend response to frontend format
const transformVoucherType = (voucherType: any): VoucherType => {
	const frontendDirection = mapDirectionToFrontend(voucherType.direction);
	const frontendStatus = (voucherType.status || "Inactive").toLowerCase() as "active" | "inactive";
	
	return {
		...voucherType,
		// Add legacy fields for backward compatibility
		id: voucherType.voucher_type_id,
		name: voucherType.voucher_type_name,
		direction: frontendDirection,
		status: frontendStatus,
	};
};

// Service functions
export const voucherTypeService = {
	// GET - List voucher types
	list: async (filters?: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string | string[];
		sort_by?: string;
		sort_order?: "asc" | "desc";
	}): Promise<VoucherTypeListResponse> => {
		const response = await apiClient.get(endPoints.voucherTypes.getAll, {
			params: filters,
		});

		// Backend returns { success: true, data: [...], pagination: {...} }
		const backendData = response.data;
		return {
			success: backendData.success,
			data: backendData.data.map(transformVoucherType),
			pagination: backendData.pagination,
		};
	},

	// GET - Get voucher type by ID
	getById: async (id: string | number): Promise<VoucherType> => {
		const response = await apiClient.get(endPoints.voucherTypes.getById(id));
		// Backend returns { success: true, data: {...} } or just the voucher type object
		const voucherType = response.data?.data || response.data;
		return transformVoucherType(voucherType);
	},

	// POST - Create voucher type
	create: async (payload: CreateVoucherTypeRequest): Promise<VoucherType> => {
		// Transform direction to backend format
		const apiPayload = {
			...payload,
			direction: mapDirectionToBackend(payload.direction),
		};
		const response = await apiClient.post(
			endPoints.voucherTypes.create,
			apiPayload
		);
		// Backend returns { success: true, data: {...} } or just the voucher type object
		const voucherType = response.data?.data || response.data;
		return transformVoucherType(voucherType);
	},

	// PUT - Update voucher type
	update: async (
		id: string | number,
		payload: UpdateVoucherTypeRequest
	): Promise<VoucherType> => {
		// Transform direction to backend format if provided
		const apiPayload = {
			...payload,
			...(payload.direction && { direction: mapDirectionToBackend(payload.direction) }),
		};
		const response = await apiClient.put(
			endPoints.voucherTypes.update(id),
			apiPayload
		);
		// Backend returns { success: true, data: {...} } or just the voucher type object
		const voucherType = response.data?.data || response.data;
		return transformVoucherType(voucherType);
	},

	// DELETE - Delete voucher type
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete(endPoints.voucherTypes.delete(id));
	},
};
