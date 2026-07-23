/** @format */

import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";

// Types
export type SourceType = "PaymentVoucher" | "ReceiptVoucher" | "InvoicePayment";
export type TransactionType = "Credit" | "Debit";

export interface HistoryTransaction {
	history_id: string | number;
	transaction_date: string;
	source_type: SourceType;
	source_id?: string | number;
	source_code?: string;
	description?: string;
	amount: number;
	transaction_type: TransactionType;
	balance_after?: number;
	reference_number?: string;
	notes?: string;
	created_at?: string;
	created_by?: {
		employee_id: string | number;
		name?: string;
	};
}

export interface ActivityLog {
	log_id: string | number;
	action: string;
	description?: string;
	changes?: Record<string, unknown>;
	performed_by?: {
		employee_id: string | number;
		name?: string;
	};
	performed_at: string;
	created_at?: string;
}

export interface HistoryFilters {
	page?: number;
	limit?: number;
	from_date?: string;
	to_date?: string;
	source_type?: SourceType;
	transaction_type?: TransactionType;
}

export interface HistoryListResponse {
	success: boolean;
	data: {
		transactions: HistoryTransaction[];
		activity_logs?: ActivityLog[];
	};
	pagination: {
		total: number;
		page: number;
		limit: number;
		total_pages: number;
	};
}

export const financialAccountHistoryService = {
	// GET - Get financial account history (transactions and activity logs)
	getHistory: async (
		accountId: string | number,
		filters?: HistoryFilters
	): Promise<HistoryListResponse> => {
		const response = await apiClient.get(
			endPoints.financialAccounts.getHistory(accountId),
			{
				params: {
					page: filters?.page || 1,
					limit: filters?.limit || 50,
					from_date: filters?.from_date,
					to_date: filters?.to_date,
					source_type: filters?.source_type,
					transaction_type: filters?.transaction_type,
				},
			}
		);

		// Normalize response structure
		const responseData = response.data?.data || response.data;

		// Handle both array response and object response
		if (Array.isArray(responseData)) {
			return {
				success: true,
				data: {
					transactions: responseData,
					activity_logs: [],
				},
				pagination: response.data?.pagination || {
					total: responseData.length,
					page: filters?.page || 1,
					limit: filters?.limit || 50,
					total_pages: 1,
				},
			};
		}

		return {
			success: response.data?.success ?? true,
			data: {
				transactions: responseData?.transactions || [],
				activity_logs: responseData?.activity_logs || [],
			},
			pagination: response.data?.pagination || {
				total: 0,
				page: filters?.page || 1,
				limit: filters?.limit || 50,
				total_pages: 1,
			},
		};
	},

	// GET - Export financial account history
	exportHistory: async (
		accountId: string | number,
		filters?: Omit<HistoryFilters, "page" | "limit">,
		format: "csv" | "xlsx" = "xlsx"
	): Promise<Blob> => {
		const response = await apiClient.get(
			endPoints.financialAccounts.getHistory(accountId),
			{
				params: {
					format,
					from_date: filters?.from_date,
					to_date: filters?.to_date,
					source_type: filters?.source_type,
					transaction_type: filters?.transaction_type,
				},
				responseType: "blob",
			}
		);

		const blob = response.data as Blob;

		// If the blob is JSON (error response), parse and throw it
		if (blob.type === "application/json") {
			const text = await blob.text();
			try {
				const errorData = JSON.parse(text);
				throw new Error(errorData.message || "Failed to export history");
			} catch {
				throw new Error("Failed to export history");
			}
		}

		return blob;
	},
};

export default financialAccountHistoryService;
