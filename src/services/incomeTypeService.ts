/** @format */

import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";

// Frontend types (camelCase)
export interface IncomeType {
	income_type_id: string | number;
	type_name: string;
	income_code?: string;
	// category: string; // Backend model doesn't seem to have category, check backend model
	gl_code?: string;
	// status: "Active" | "Inactive"; // Backend model doesn't seem to have status, check backend model
	created_at?: string;
	updated_at?: string;
	// Legacy fields for backward compatibility
	id?: string | number;
	name?: string;
}

export interface IncomeTypeListResponse {
	success: boolean;
	data: IncomeType[];
	pagination?: {
		page: string | number;
		limit: string | number;
		total: number;
		total_pages?: number;
	};
}

export interface CreateIncomeTypeRequest {
	type_name: string;
	gl_code?: string;
}

export interface UpdateIncomeTypeRequest {
	type_name?: string;
	gl_code?: string;
}

// Transform backend response to frontend format
const transformIncomeType = (incomeType: any): IncomeType => {
	return {
		...incomeType,
		income_code: incomeType.income_code ?? incomeType.gl_code,
		gl_code: incomeType.gl_code ?? incomeType.income_code,
		// Add legacy fields for backward compatibility
		id: incomeType.income_type_id,
		name: incomeType.type_name,
	};
};

// Service functions
export const incomeTypeService = {
	// GET - List income types
	list: async (filters?: {
		page?: number;
		limit?: number;
		search?: string;
		sort_by?: string;
		sort_order?: "asc" | "desc";
	}): Promise<IncomeTypeListResponse> => {
		const response = await apiClient.get(endPoints.incomeTypes.getAll, {
			params: filters,
		});

		// Backend returns { success: true, data: [...], pagination: {...} }
		const backendData = response.data;
		return {
			success: backendData.success,
			data: backendData.data.map(transformIncomeType),
			pagination: backendData.pagination,
		};
	},

	// GET - Get income type by ID
	getById: async (id: string | number): Promise<IncomeType> => {
		const response = await apiClient.get(endPoints.incomeTypes.getById(id));
		// Backend returns { success: true, data: {...} } or just the income type object
		const incomeType = response.data?.data || response.data;
		return transformIncomeType(incomeType);
	},

	// POST - Create income type
	create: async (payload: CreateIncomeTypeRequest): Promise<IncomeType> => {
		const response = await apiClient.post(
			endPoints.incomeTypes.create,
			payload
		);
		// Backend returns { success: true, data: {...} } or just the income type object
		const incomeType = response.data?.data || response.data;
		return transformIncomeType(incomeType);
	},

	// PUT - Update income type
	update: async (
		id: string | number,
		payload: UpdateIncomeTypeRequest
	): Promise<IncomeType> => {
		const response = await apiClient.put(
			endPoints.incomeTypes.update(id),
			payload
		);
		// Backend returns { success: true, data: {...} } or just the income type object
		const incomeType = response.data?.data || response.data;
		return transformIncomeType(incomeType);
	},

	// DELETE - Delete income type
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete(endPoints.incomeTypes.delete(id));
	},
};
