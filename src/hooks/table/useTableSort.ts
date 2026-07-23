/** @format */

import { useState, useCallback } from "react";

export interface SortConfig<T> {
	field: keyof T | string;
	direction: "asc" | "desc";
}

interface UseTableSortOptions<T> {
	initialSort?: SortConfig<T>;
	onSortChange?: (config: SortConfig<T> | null) => void;
}

export function useTableSort<T>(options?: UseTableSortOptions<T>) {
	const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(
		options?.initialSort || null
	);

	const handleSort = useCallback(
		(field: keyof T | string) => {
			setSortConfig((prev) => {
				const newConfig: SortConfig<T> | null =
					prev?.field === field && prev.direction === "asc"
						? { field, direction: "desc" as const }
						: prev?.field === field && prev.direction === "desc"
						? null // Clear sort on third click
						: { field, direction: "asc" as const };

				options?.onSortChange?.(newConfig);
				return newConfig;
			});
		},
		[options]
	);

	const clearSort = useCallback(() => {
		setSortConfig(null);
		options?.onSortChange?.(null);
	}, [options]);

	return { sortConfig, handleSort, setSortConfig, clearSort };
}
