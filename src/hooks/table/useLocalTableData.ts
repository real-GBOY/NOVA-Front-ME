/** @format */

import { useMemo } from "react";

interface UseLocalTableDataOptions<T, TSort extends string = string> {
	data: T[];
	searchQuery?: string;
	searchFields?: (keyof T)[];
	sortField?: TSort;
	sortDirection?: "asc" | "desc";
	filters?: Record<string, any>;
	customFilterFn?: (item: T, filters: Record<string, any>) => boolean;
	customSortFn?: (a: T, b: T, field: TSort, direction: "asc" | "desc") => number;
}

/**
 * Hook for processing table data locally (client-side)
 * Use for tables with <1000 rows for instant sorting/filtering
 */
export function useLocalTableData<T, TSort extends string = string>({
	data,
	searchQuery = "",
	searchFields = [],
	sortField,
	sortDirection = "asc",
	filters = {},
	customFilterFn,
	customSortFn,
}: UseLocalTableDataOptions<T, TSort>) {
	const processedData = useMemo(() => {
		let result = [...data];

		// 1. Apply search
		if (searchQuery && searchFields.length > 0) {
			const query = searchQuery.toLowerCase().trim();
			result = result.filter((item) =>
				searchFields.some((field) => {
					const value = item[field];
					if (value === null || value === undefined) return false;
					return String(value).toLowerCase().includes(query);
				})
			);
		}

		// 2. Apply filters
		if (Object.keys(filters).length > 0) {
			result = result.filter((item) => {
				if (customFilterFn) {
					return customFilterFn(item, filters);
				}
				// Default filter logic - exact match
				return Object.entries(filters).every(([key, value]) => {
					if (value === undefined || value === null) return true;
					
					const itemValue = item[key as keyof T];
					
					// Handle array filters (e.g., status in ['active', 'pending'])
					if (Array.isArray(value)) {
						return value.includes(itemValue);
					}
					
					return itemValue === value;
				});
			});
		}

		// 3. Apply sorting
		if (sortField) {
			result.sort((a, b) => {
				if (customSortFn) {
					return customSortFn(a, b, sortField, sortDirection);
				}

				const aVal = a[sortField as unknown as keyof T];
				const bVal = b[sortField as unknown as keyof T];

				// Handle null/undefined
				if (aVal === null || aVal === undefined) return 1;
				if (bVal === null || bVal === undefined) return -1;
				if (aVal === bVal) return 0;

				// Type-aware comparison
				if (typeof aVal === "number" && typeof bVal === "number") {
					return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
				}

				if (aVal instanceof Date && bVal instanceof Date) {
					return sortDirection === "asc"
						? aVal.getTime() - bVal.getTime()
						: bVal.getTime() - aVal.getTime();
				}

				// String comparison
				const comparison = String(aVal).localeCompare(String(bVal));
				return sortDirection === "asc" ? comparison : -comparison;
			});
		}

		return result;
	}, [
		data,
		searchQuery,
		searchFields,
		sortField,
		sortDirection,
		filters,
		customFilterFn,
		customSortFn,
	]);

	return {
		data: processedData,
		totalCount: data.length,
		filteredCount: processedData.length,
		isFiltered: processedData.length !== data.length,
	};
}
