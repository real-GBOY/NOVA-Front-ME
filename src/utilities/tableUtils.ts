/** @format */

/**
 * Utility functions for table operations
 */

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout | null = null;

	return function executedFunction(...args: Parameters<T>) {
		const later = () => {
			timeout = null;
			func(...args);
		};

		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(later, wait);
	};
}

/**
 * Format sort field for display
 */
export function formatSortLabel(field: string, direction: "asc" | "desc"): string {
	const directionLabel = direction === "asc" ? "↑" : "↓";
	return `${field} ${directionLabel}`;
}

/**
 * Check if value matches filter
 */
export function matchesFilter(value: unknown, filterValue: unknown): boolean {
	if (filterValue === undefined || filterValue === null || filterValue === "") {
		return true;
	}

	if (Array.isArray(filterValue)) {
		return filterValue.includes(value);
	}

	if (typeof filterValue === "string" && typeof value === "string") {
		return value.toLowerCase().includes(filterValue.toLowerCase());
	}

	return value === filterValue;
}

/**
 * Safe string comparison for sorting
 */
export function compareStrings(a: string, b: string, direction: "asc" | "desc"): number {
	const comparison = a.localeCompare(b, undefined, { sensitivity: "base" });
	return direction === "asc" ? comparison : -comparison;
}

/**
 * Safe number comparison for sorting
 */
export function compareNumbers(a: number, b: number, direction: "asc" | "desc"): number {
	return direction === "asc" ? a - b : b - a;
}

/**
 * Safe date comparison for sorting
 */
export function compareDates(a: Date, b: Date, direction: "asc" | "desc"): number {
	return direction === "asc"
		? a.getTime() - b.getTime()
		: b.getTime() - a.getTime();
}
