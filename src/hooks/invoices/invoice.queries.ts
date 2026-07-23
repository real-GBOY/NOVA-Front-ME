/** @format */

import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { invoiceService } from "@/services/invoiceService";
import type { Invoice, InvoiceListResponse } from "@/services/invoiceService";

const invoiceKeys = reactQueryKeys.invoices;

type InvoiceListFilters = {
	page?: number;
	limit?: number;
	search?: string;
	status?: string | string[];
	customer_id?: string | number | Array<string | number>;
	agent_id?: string | number | Array<string | number>;
	date_from?: string;
	date_to?: string;
	sort_by?: string;
	sort_order?: "asc" | "desc";
};

const toDateValue = (value?: string) => {
	if (!value) return 0;
	const parsed = Date.parse(value);
	return Number.isNaN(parsed) ? 0 : parsed;
};

const getSortableValue = (invoice: Invoice, sortBy?: string) => {
	switch (sortBy) {
		case "invoice_code":
			return String(invoice.invoice_code ?? invoice.invoice_number ?? "");
		case "invoice_date":
			return toDateValue(invoice.invoice_date ?? invoice.issue_date);
		case "total_amount":
			return Number(invoice.total_amount ?? invoice.total ?? 0);
		case "status":
			return String(invoice.status ?? "");
		case "updated_at":
			return toDateValue(invoice.updated_at);
		case "created_at":
		default:
			return toDateValue(invoice.created_at);
	}
};

const sortInvoices = (
	invoices: Invoice[],
	sortBy?: string,
	sortOrder: "asc" | "desc" = "desc"
) => {
	const direction = sortOrder === "asc" ? 1 : -1;
	return [...invoices].sort((a, b) => {
		const aValue = getSortableValue(a, sortBy);
		const bValue = getSortableValue(b, sortBy);

		if (typeof aValue === "string" && typeof bValue === "string") {
			return direction * aValue.localeCompare(bValue);
		}

		if (aValue < bValue) return -1 * direction;
		if (aValue > bValue) return 1 * direction;
		return 0;
	});
};

const fetchAllInvoicesByStatus = async (
	status: string | undefined,
	filters: Omit<InvoiceListFilters, "status" | "page">
) => {
	const collected: Invoice[] = [];
	let page = 1;
	let totalPages = 1;

	do {
		const response = await invoiceService.list({
			...filters,
			status,
			page,
		});
		const data = response?.data || [];
		collected.push(...data);
		totalPages = response?.pagination?.total_pages || 1;
		page += 1;
	} while (page <= totalPages);

	return collected;
};

const listInvoicesWithStatuses = async (
	filters: InvoiceListFilters,
	statuses: string[]
): Promise<InvoiceListResponse> => {
	const {
		page = 1,
		limit,
		sort_by,
		sort_order = "desc",
		status: _status,
		...restFilters
	} = filters;

	const uniqueStatuses = Array.from(
		new Set(statuses.filter((status) => status))
	);
	const statusResults = await Promise.all(
		uniqueStatuses.map((status) =>
			fetchAllInvoicesByStatus(status, {
				...restFilters,
				limit,
				sort_by,
				sort_order,
			})
		)
	);

	const merged = new Map<string | number, Invoice>();
	statusResults.flat().forEach((invoice) => {
		const key = invoice.invoice_id ?? invoice.id ?? invoice.invoice_code;
		if (key !== undefined && key !== null && !merged.has(key)) {
			merged.set(key, invoice);
		}
	});

	const combinedData = Array.from(merged.values());
	const sortedData = sortInvoices(combinedData, sort_by, sort_order);
	const effectiveLimit =
		typeof limit === "number" && limit > 0 ? limit : sortedData.length || 1;
	const total = sortedData.length;
	const totalPages = Math.max(1, Math.ceil(total / effectiveLimit));
	const startIndex = (page - 1) * effectiveLimit;
	const pagedData = sortedData.slice(startIndex, startIndex + effectiveLimit);

	return {
		success: true,
		data: pagedData,
		pagination: {
			total,
			page,
			limit: effectiveLimit,
			total_pages: totalPages,
		},
	};
};

const normalizeCustomerIds = (
	value: InvoiceListFilters["customer_id"]
): number[] => {
	if (!Array.isArray(value)) return [];
	return value
		.map((id) => Number(id))
		.filter((id) => Number.isFinite(id));
};

const fetchInvoicesByCustomerIds = async (
	filters: InvoiceListFilters,
	customerIds: number[],
	statusList?: string[]
): Promise<InvoiceListResponse> => {
	const {
		page = 1,
		limit,
		sort_by,
		sort_order = "desc",
		status,
		customer_id: _customer,
		...restFilters
	} = filters;

	const normalizedIds = Array.from(new Set(customerIds));
	const statusValue =
		typeof status === "string"
			? status
			: Array.isArray(status) && status.length === 1
			? status[0]
			: undefined;

	const collected = new Map<string | number, Invoice>();

	for (const customerId of normalizedIds) {
		let currentPage = 1;
		let totalPages = 1;

		do {
			const response = await invoiceService.list({
				...restFilters,
				status: statusValue,
				customer_id: customerId,
				page: currentPage,
			});

			(response.data || []).forEach((invoice) => {
				const key = invoice.invoice_id ?? invoice.id ?? invoice.invoice_code;
				if (key !== undefined && key !== null && !collected.has(key)) {
					collected.set(key, invoice);
				}
			});

			totalPages = response.pagination?.total_pages ?? 1;
			currentPage += 1;
		} while (currentPage <= totalPages);
	}

	let combinedData = Array.from(collected.values());
	if (statusList && statusList.length > 0 && !statusValue) {
		const allowed = new Set(statusList);
		combinedData = combinedData.filter((invoice) =>
			allowed.has(String(invoice.status))
		);
	}

	const sortedData = sortInvoices(combinedData, sort_by, sort_order);
	const effectiveLimit =
		typeof limit === "number" && limit > 0 ? limit : sortedData.length || 1;
	const total = sortedData.length;
	const totalPages = Math.max(1, Math.ceil(total / effectiveLimit));
	const startIndex = (page - 1) * effectiveLimit;
	const pagedData = sortedData.slice(startIndex, startIndex + effectiveLimit);

	return {
		success: true,
		data: pagedData,
		pagination: {
			total,
			page,
			limit: effectiveLimit,
			total_pages: totalPages,
		},
	};
};

/**
 * GET - Get invoice statistics
 */
export const useInvoiceStats = (
	filters?: {
		date_from?: string;
		date_to?: string;
		customer_id?: string | number;
		agent_id?: string | number;
	},
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: invoiceKeys.stats(),
		queryFn: async () => {
			const response = await invoiceService.getStats(filters);
			return response;
		},
		enabled: options?.enabled !== false,
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
	});

/**
 * GET - List invoices
 */
export const useListInvoices = (
	filters?: InvoiceListFilters,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: invoiceKeys.list(filters),
		queryFn: async () => {
			if (!filters) {
				return invoiceService.list();
			}

			const customerIds = normalizeCustomerIds(filters.customer_id);
			if (customerIds.length > 0) {
				const statusList = Array.isArray(filters.status)
					? filters.status.filter(Boolean)
					: undefined;
				return fetchInvoicesByCustomerIds(filters, customerIds, statusList);
			}

			if (Array.isArray(filters.status)) {
				if (filters.status.length > 1) {
					return listInvoicesWithStatuses(filters, filters.status);
				}
				const [singleStatus] = filters.status;
				return invoiceService.list({
					...filters,
					status: singleStatus,
				});
			}

			return invoiceService.list({ ...filters, status: filters.status });
		},
		enabled: options?.enabled !== false,
		staleTime: 0, // Always consider data stale to allow immediate refetch after mutations
		refetchOnMount: true,
		refetchOnWindowFocus: false,
	});

/**
 * GET - Get invoice by ID
 */
export const useGetInvoiceById = (
	id: string | number | null | undefined,
	options?: {
		enabled?: boolean;
		include_items?: boolean;
		include_history?: boolean;
	}
) =>
	useQuery({
		queryKey: invoiceKeys.detail(id!),
		queryFn: async () => {
			if (!id) throw new Error("Invoice ID is required");
			const response = await invoiceService.getById(id, {
				include_items: options?.include_items,
				include_history: options?.include_history,
			});
			return response;
		},
		enabled: options?.enabled !== false && !!id,
		staleTime: 0, // Always refetch to ensure fresh data after edits
		refetchOnWindowFocus: false,
	});

/**
 * GET - Get invoice history
 */
export const useGetInvoiceHistory = (
	id: string | number | null | undefined,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: invoiceKeys.history(id!),
		queryFn: async () => {
			if (!id) throw new Error("Invoice ID is required");
			const response = await invoiceService.getHistory(id);
			return response;
		},
		enabled: options?.enabled !== false && !!id,
		staleTime: 0, // Always refetch to ensure fresh data after edits
		refetchOnWindowFocus: false,
	});

/**
 * GET - Lookup customers
 */
export const useLookupCustomers = (
	search?: string,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: [...invoiceKeys.lookup.customers(), { search }],
		queryFn: async () => {
			const response = await invoiceService.lookupCustomers(search);
			return response;
		},
		enabled: options?.enabled !== false,
		staleTime: 10 * 60 * 1000, // 10 minutes
		refetchOnWindowFocus: false,
	});

/**
 * GET - Lookup agents
 */
export const useLookupAgents = (
	search?: string,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: [...invoiceKeys.lookup.agents(), { search }],
		queryFn: async () => {
			const response = await invoiceService.lookupAgents(search);
			return response;
		},
		enabled: options?.enabled !== false,
		staleTime: 10 * 60 * 1000,
		refetchOnWindowFocus: false,
	});

/**
 * GET - Lookup services
 */
export const useLookupServices = (
	search?: string,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: [...invoiceKeys.lookup.services(), { search }],
		queryFn: async () => {
			const response = await invoiceService.lookupServices(search);
			return response;
		},
		enabled: options?.enabled !== false,
		staleTime: 10 * 60 * 1000,
		refetchOnWindowFocus: false,
	});

/**
 * GET - Lookup employees
 */
export const useLookupEmployees = (
	search?: string,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: [...invoiceKeys.lookup.employees(), { search }],
		queryFn: async () => {
			const response = await invoiceService.lookupEmployees(search);
			return response;
		},
		enabled: options?.enabled !== false,
		staleTime: 10 * 60 * 1000,
		refetchOnWindowFocus: false,
	});
