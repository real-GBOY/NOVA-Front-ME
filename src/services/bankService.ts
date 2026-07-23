/** @format */

import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";

// Frontend types (camelCase)
export interface Bank {
	bank_id: string | number;
	account_id: string | number;
	bank_name: string;
	account_name: string;
	account_code: string | null;
	account_number?: string;
	iban?: string;
	swift_code?: string;
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
	name?: string;
	shortCode?: string;
	balance?: string; // Formatted balance string for display
}

export interface BankListResponse {
	success: boolean;
	data: Bank[];
	pagination: {
		page: string | number;
		limit: string | number;
		total: number;
		total_pages?: number;
	};
}

export interface BankResponse {
	success: boolean;
	data: Bank;
}

export interface CreateBankRequest {
	bank_name: string;
	account_id?: string | number; // Optional in create request
	account_code?: string | null; // Backend expects account_code in request
	account_number?: string;
	iban?: string;
	swift_code?: string;
	branch?: string;
	currency?: string;
	opening_balance: number;
	status: "Active" | "Inactive";
}

export interface UpdateBankRequest {
	bank_name?: string;
	account_id?: string | number;
	account_code?: string | null;
	account_number?: string;
	iban?: string;
	swift_code?: string;
	currency?: string;
	opening_balance?: number;
	status?: "Active" | "Inactive";
}

// Transform backend response to frontend format
const transformBank = (bank: any): Bank => {
	// Format balance for display: "100000 AED"
	const formattedBalance = `${
		bank.current_balance || bank.opening_balance || 0
	} ${bank.currency || "AED"}`;

	return {
		...bank,
		// Add legacy fields for backward compatibility
		id: bank.bank_id,
		name: bank.bank_name,
		shortCode: bank.account_code || "", // Keep shortCode for UI compatibility
		balance: formattedBalance,
	};
};

// Service functions
export const bankService = {
	// GET - List banks
	list: async (filters?: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string | string[];
		sort_by?: string;
		sort_order?: "asc" | "desc";
	}): Promise<BankListResponse> => {
		const response = await apiClient.get(endPoints.banks.getAll, {
			params: filters,
		});

		// Backend returns { success: true, data: [...], pagination: {...} }
		const backendData = response.data;
		return {
			success: backendData.success,
			data: backendData.data.map(transformBank),
			pagination: backendData.pagination,
		};
	},

	// GET - Get bank by ID
	getById: async (id: string | number): Promise<Bank> => {
		const response = await apiClient.get<BankResponse>(
			endPoints.banks.getById(id)
		);
		// Backend returns { success: true, data: {...} }
		const bank = response.data.data;
		return transformBank(bank);
	},

	// POST - Create bank
	create: async (payload: CreateBankRequest): Promise<Bank> => {

		const response = await apiClient.post<BankResponse>(
			endPoints.banks.create,
			payload
		);

		// Backend returns { success: true, data: {...} }
		const bank = response.data.data;
		return transformBank(bank);
	},

	// PUT - Update bank
	update: async (
		id: string | number,
		payload: UpdateBankRequest
	): Promise<Bank> => {
		const response = await apiClient.put<BankResponse>(
			endPoints.banks.update(id),
			payload
		);
		// Backend returns { success: true, data: {...} }
		const bank = response.data.data;
		return transformBank(bank);
	},

	// DELETE - Delete bank
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete(endPoints.banks.delete(id));
	},
};
