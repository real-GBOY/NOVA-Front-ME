/** @format */

import { useMemo } from "react";
import { useQuery, UseQueryOptions, keepPreviousData } from "@tanstack/react-query";

interface PaginatedResponse<T> {
	data: T[];
	total?: number;
	pagination?: {
		total: number;
		page: number;
		limit: number;
		total_pages: number;
	};
	page?: number;
	limit?: number;
	totalPages?: number;
}

interface ServerTableParams {
	page: number;
	limit: number;
	sort?: string;
	order?: "asc" | "desc";
	search?: string;
	[key: string]: unknown;
}

interface UseServerTableDataOptions<T> {
	queryKey: string[];
	queryFn: (params: ServerTableParams) => Promise<PaginatedResponse<T>>;
	page?: number;
	pageSize?: number;
	sortField?: string;
	sortDirection?: "asc" | "desc";
	filters?: Record<string, unknown>;
	searchQuery?: string;
	enabled?: boolean;
	staleTime?: number;
	queryOptions?: Omit<
		UseQueryOptions<PaginatedResponse<T>>,
		"queryKey" | "queryFn"
	>;
}

/**
 * Hook for fetching table data from server with pagination, sorting, and filtering
 * Use for tables with >1000 rows to handle large datasets efficiently
 */
export function useServerTableData<T>({
	queryKey,
	queryFn,
	page = 1,
	pageSize = 10,
	sortField,
	sortDirection = "asc",
	filters = {},
	searchQuery = "",
	enabled = true,
	staleTime = 2 * 60 * 1000, // 2 minutes default
	queryOptions,
}: UseServerTableDataOptions<T>) {
	const params: ServerTableParams = useMemo(
		() => ({
			page,
			limit: pageSize,
			...(sortField && { sort_by: sortField, sort_order: sortDirection }),
			...(searchQuery && { search: searchQuery }),
			...filters,
		}),
		[page, pageSize, sortField, sortDirection, searchQuery, filters]
	);

	const query = useQuery({
		queryKey: [...queryKey, params],
		queryFn: () => queryFn(params),
		enabled,
		staleTime,
		placeholderData: keepPreviousData,
		...queryOptions,
	});

	const response = query.data;
	const pagination = response?.pagination;

	const totalCount = pagination?.total ?? response?.total ?? 0;
	const currentPage = pagination?.page ?? response?.page ?? page;
	const currentLimit = pagination?.limit ?? response?.limit ?? pageSize;
	const totalPages =
		pagination?.total_pages ??
		response?.totalPages ??
		Math.ceil(totalCount / currentLimit) ??
		0;

	return {
		data: response?.data || [],
		totalCount,
		page: currentPage,
		pageSize: currentLimit,
		totalPages,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}
