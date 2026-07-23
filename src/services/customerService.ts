/** @format */

import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";

// Frontend types (camelCase)
export interface Customer {
	customer_id: string | number;
	customer_code: string;
	customer_name: string;
	customer_type: "Individual" | "Company";
	company_id?: string | number | null;
	contact_number: string;
	mobile_no?: string;
	email: string;
	trn: string;
	address?: string;
	notes?: string;
	status: "Active" | "Inactive";
	invoices_count?: number;
	total_invoiced?: number;
	total_paid?: number;
	balance_due?: number;
	last_invoice_date?: string | null;
	created_at: string;
	updated_at: string;
	// Legacy fields for backward compatibility
	id?: string | number;
	name?: string;
	type?: "Individual" | "Company";
	trnId?: string;
	contactNumber?: string;
}

export interface CustomerListResponse {
	success: boolean;
	data: Customer[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		total_pages: number;
	};
}

export interface CreateCustomerRequest {
	customer_name: string;
	customer_type: "Individual" | "Company";
	contact_number?: string;
	mobile_no?: string;
	email?: string;
	trn?: string;
	address?: string;
	notes?: string;
	status?: "Active" | "Inactive";
}

export interface UpdateCustomerRequest {
	customer_name?: string;
	customer_type?: "Individual" | "Company";
	contact_number?: string;
	mobile_no?: string;
	email?: string;
	trn?: string;
	address?: string;
	notes?: string;
	status?: "Active" | "Inactive";
}

// Transform backend response to frontend format
const transformCustomer = (customer: any): Customer => {
	return {
		...customer,
		// Add legacy fields for backward compatibility
		id: customer.customer_id,
		name: customer.customer_name,
		type: customer.customer_type,
		trnId: customer.trn,
		contactNumber: customer.contact_number,
	};
};

const normalizeStatusValue = (value: string) => {
	const normalized = value.trim().toLowerCase();
	if (normalized === "active") return "Active";
	if (normalized === "inactive") return "Inactive";
	return value;
};

// Service functions
export const customerService = {
	// GET - List customers
	// GET - List customers
	list: async (filters?: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string | string[];
	}): Promise<CustomerListResponse> => {
		const normalizedFilters = { ...(filters || {}) } as typeof filters;
		if (normalizedFilters?.status) {
			normalizedFilters.status = Array.isArray(normalizedFilters.status)
				? normalizedFilters.status.map(normalizeStatusValue)
				: normalizeStatusValue(normalizedFilters.status);
		}

		const response = await apiClient.get(endPoints.customers.getAll, {
			params: normalizedFilters,
		});

		// Backend returns { success: true, data: [...], pagination: {...} }
		const backendData = response.data;
		const pagination = backendData.pagination || { page: 1, limit: 10, total: 0 };
		
		return {
			success: backendData.success,
			data: (backendData.data || []).map(transformCustomer),
			pagination: {
				...pagination,
				page: Number(pagination.page),
				limit: Number(pagination.limit),
				total_pages: Math.ceil((pagination.total || 0) / (pagination.limit || 10))
			},
		};
	},

	// GET - Get customer by ID
	getById: async (id: string | number): Promise<Customer> => {
		const response = await apiClient.get(endPoints.customers.getById(id));
		// Backend returns { success: true, data: {...} } or just the customer object
		const customer = response.data?.data || response.data;
		return transformCustomer(customer);
	},

	// POST - Create customer
	create: async (payload: CreateCustomerRequest): Promise<Customer> => {
		const response = await apiClient.post(endPoints.customers.create, payload);
		// Backend returns { success: true, data: {...} } or just the customer object
		const customer = response.data?.data || response.data;
		return transformCustomer(customer);
	},

	// PUT - Update customer
	update: async (
		id: string | number,
		payload: UpdateCustomerRequest
	): Promise<Customer> => {
		const response = await apiClient.put(
			endPoints.customers.update(id),
			payload
		);
		// Backend returns { success: true, data: {...} } or just the customer object
		const customer = response.data?.data || response.data;
		return transformCustomer(customer);
	},

	// DELETE - Delete customer
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete(endPoints.customers.delete(id));
	},
};
