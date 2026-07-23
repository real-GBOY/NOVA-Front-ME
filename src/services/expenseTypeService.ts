/** @format */

import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";

// Frontend types (camelCase)
export interface ExpenseType {
	expense_type_id: string | number;
	type_name: string;
	category: string;
	status: "Active" | "Inactive";
	description?: string;
	usage_count?: number;
	created_at: string;
	updated_at: string;
	// Legacy fields for backward compatibility
	id?: string | number;
	name?: string;
}

export interface ExpenseTypeListResponse {
	success: boolean;
	data: ExpenseType[];
	pagination: {
		page: string | number;
		limit: string | number;
		total: number;
		total_pages?: number;
	};
}

export interface CreateExpenseTypeRequest {
	type_name: string;
	category: string;
	status: "Active" | "Inactive";
	description?: string;
}

export interface UpdateExpenseTypeRequest {
	type_name?: string;
	category?: string;
	status?: "Active" | "Inactive";
	description?: string;
}

// Transform backend response to frontend format
const transformExpenseType = (expenseType: any): ExpenseType => {
	return {
		...expenseType,
		// Add legacy fields for backward compatibility
		id: expenseType.expense_type_id,
		name: expenseType.type_name,
	};
};

// Service functions
export const expenseTypeService = {
	// GET - List expense types
	list: async (filters?: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string | string[];
		sort_by?: string;
		sort_order?: "asc" | "desc";
	}): Promise<ExpenseTypeListResponse> => {
		const response = await apiClient.get(endPoints.expenseTypes.getAll, {
			params: filters,
		});

		// Backend returns { success: true, data: [...], pagination: {...} }
		const backendData = response.data;
		return {
			success: backendData.success,
			data: backendData.data.map(transformExpenseType),
			pagination: backendData.pagination,
		};
	},

	// GET - Get expense type by ID
	getById: async (id: string | number): Promise<ExpenseType> => {
		const response = await apiClient.get(endPoints.expenseTypes.getById(id));
		// Backend returns { success: true, data: {...} } or just the expense type object
		const expenseType = response.data?.data || response.data;
		return transformExpenseType(expenseType);
	},

	// POST - Create expense type
	create: async (payload: CreateExpenseTypeRequest): Promise<ExpenseType> => {
		const response = await apiClient.post(
			endPoints.expenseTypes.create,
			payload
		);
		// Backend returns { success: true, data: {...} } or just the expense type object
		const expenseType = response.data?.data || response.data;
		return transformExpenseType(expenseType);
	},

	// PUT - Update expense type
	update: async (
		id: string | number,
		payload: UpdateExpenseTypeRequest
	): Promise<ExpenseType> => {
		const response = await apiClient.put(
			endPoints.expenseTypes.update(id),
			payload
		);
		// Backend returns { success: true, data: {...} } or just the expense type object
		const expenseType = response.data?.data || response.data;
		return transformExpenseType(expenseType);
	},

	// DELETE - Delete expense type
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete(endPoints.expenseTypes.delete(id));
	},
};
