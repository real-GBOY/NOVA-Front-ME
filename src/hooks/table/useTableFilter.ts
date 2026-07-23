/** @format */

import { useState, useCallback } from "react";

interface UseTableFilterOptions<T> {
	initialFilters?: Partial<T>;
	onFilterChange?: (filters: Partial<T>) => void;
}

export function useTableFilter<T extends Record<string, any>>(
	options?: UseTableFilterOptions<T>
) {
	const [filters, setFilters] = useState<Partial<T>>(
		options?.initialFilters || {}
	);

	const updateFilter = useCallback(
		(key: keyof T, value: T[keyof T] | undefined) => {
			setFilters((prev) => {
				const newFilters = { ...prev };
				if (
					value === undefined ||
					value === null ||
					value === "" ||
					(Array.isArray(value) && value.length === 0)
				) {
					delete newFilters[key];
				} else {
					newFilters[key] = value;
				}
				options?.onFilterChange?.(newFilters);
				return newFilters;
			});
		},
		[options]
	);

	const updateFilters = useCallback(
		(newFilters: Partial<T>) => {
			setFilters(newFilters);
			options?.onFilterChange?.(newFilters);
		},
		[options]
	);

	const clearFilters = useCallback(() => {
		setFilters({});
		options?.onFilterChange?.({});
	}, [options]);

	const hasActiveFilters = Object.keys(filters).length > 0;

	return {
		filters,
		updateFilter,
		updateFilters,
		clearFilters,
		setFilters,
		hasActiveFilters,
	};
}
