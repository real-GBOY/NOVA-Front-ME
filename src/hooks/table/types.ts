/** @format */

export interface TableSortOption {
	id: string;
	label: string;
	field: string;
}

export interface TableFilterOption {
	id: string;
	label: string;
	value: any;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages?: number;
}

export interface ServerTableParams {
	page: number;
	limit: number;
	sort?: string;
	order?: "asc" | "desc";
	search?: string;
	[key: string]: any;
}
