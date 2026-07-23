/** @format */

import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";

// Frontend types (camelCase)
export interface PrettyCashName {
	petty_cash_id: string | number;
	account_id: string | number;
	name: string;
	account_name: string;
	account_code?: string | null;
	currency: string;
	opening_balance: number;
	current_balance: number;
	status: "Active" | "Inactive";
	is_active: boolean;
	last_reconciled_at?: string | null;
	created_at: string;
	updated_at: string;
	// Legacy fields for backward compatibility
	id?: string | number;
	balance?: string; // Formatted balance string for display
}

export interface PrettyCashNameListResponse {
	success: boolean;
	data: PrettyCashName[];
	pagination: {
		page: string | number;
		limit: string | number;
		total: number;
		total_pages?: number;
	};
}

export interface CreatePrettyCashNameRequest {
	name: string;
	account_id: string | number;
	opening_balance: number;
	currency?: string;
	status: "Active" | "Inactive";
}

export interface UpdatePrettyCashNameRequest {
	name?: string;
	account_id?: string | number;
	opening_balance?: number;
	currency?: string;
	status?: "Active" | "Inactive";
}

// Transform backend response to frontend format
const transformPrettyCashName = (prettyCash: any): PrettyCashName => {
	// Format balance for display: "5000 AED"
	const formattedBalance = `${prettyCash.current_balance || prettyCash.opening_balance || 0} ${prettyCash.currency || "AED"}`;
	
	return {
		...prettyCash,
		// Add legacy fields for backward compatibility
		id: prettyCash.petty_cash_id,
		balance: formattedBalance,
		// Status is kept as backend format in the object, but we'll use lowercase for display in components
	};
};

// Service functions
export const prettyCashNameService = {
	// GET - List pretty cash names
	list: async (filters?: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string | string[];
		sort_by?: string;
		sort_order?: "asc" | "desc";
	}): Promise<PrettyCashNameListResponse> => {
		const response = await apiClient.get(endPoints.prettyCashNames.getAll, {
			params: filters,
		});

		// Backend returns { success: true, data: [...], pagination: {...} }
		const backendData = response.data;
		return {
			success: backendData.success,
			data: backendData.data.map(transformPrettyCashName),
			pagination: backendData.pagination,
		};
	},

	// GET - Get pretty cash name by ID
	getById: async (id: string | number): Promise<PrettyCashName> => {
		const response = await apiClient.get(endPoints.prettyCashNames.getById(id));
		// Backend returns { success: true, data: {...} } or just the pretty cash object
		const prettyCash = response.data?.data || response.data;
		return transformPrettyCashName(prettyCash);
	},

	// POST - Create pretty cash name
	create: async (payload: CreatePrettyCashNameRequest): Promise<PrettyCashName> => {
		const response = await apiClient.post(
			endPoints.prettyCashNames.create,
			payload
		);
		// Backend returns { success: true, data: {...} } or just the pretty cash object
		const prettyCash = response.data?.data || response.data;
		return transformPrettyCashName(prettyCash);
	},

	// PUT - Update pretty cash name
	update: async (
		id: string | number,
		payload: UpdatePrettyCashNameRequest
	): Promise<PrettyCashName> => {
		const response = await apiClient.put(
			endPoints.prettyCashNames.update(id),
			payload
		);
		// Backend returns { success: true, data: {...} } or just the pretty cash object
		const prettyCash = response.data?.data || response.data;
		return transformPrettyCashName(prettyCash);
	},

	// DELETE - Delete pretty cash name
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete(endPoints.prettyCashNames.delete(id));
	},
};
