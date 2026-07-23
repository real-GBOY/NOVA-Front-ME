/** @format */

import apiClient from "../config/axios";
import endPoints from "../config/endPoints";

// Types
export interface Holiday {
	id: number;
	name: string;
	startDate: string;
	endDate: string;
	durationDays: number;
	locationId: number | null;
	isPublic: boolean;
	isRecurring: boolean;
	description?: string;
}

export interface CreateHolidayRequest {
	name: string;
	startDate: string;
	endDate: string;
	description?: string;
}

export interface UpdateHolidayRequest {
	name?: string;
	startDate?: string;
	endDate?: string;
	description?: string;
}

export interface HolidayListResponse {
	items: Holiday[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
}

// Service functions
export const holidayService = {
	// GET - List holidays
	list: async (filters?: {
		page?: number;
		limit?: number;
		search?: string;
		year?: number | number[];
		month?: number | number[];
		sort_by?: string;
		order?: "asc" | "desc";
		sort_order?: "asc" | "desc";
	}): Promise<HolidayListResponse> => {
		const params: Record<string, unknown> = {};
		if (filters?.page) params.page = filters.page;
		if (filters?.limit) params.pageSize = filters.limit;
		if (filters?.search) params.search = filters.search;
		if (filters?.sort_by) params.sortBy = filters.sort_by;
		if (filters?.order) params.sortDir = filters.order;
		if (filters?.sort_order) params.sortDir = filters.sort_order;

		const response = await apiClient.get(endPoints.holidays.getAll, {
			params,
		});
		return response.data;
	},

	// GET - Get holiday by ID
	getById: async (id: string | number): Promise<Holiday> => {
		const response = await apiClient.get(endPoints.holidays.getById(id));
		return response.data;
	},

	// POST - Create holiday
	create: async (payload: CreateHolidayRequest): Promise<Holiday> => {
		const response = await apiClient.post(endPoints.holidays.create, payload);
		return response.data;
	},

	// PUT - Update holiday
	update: async (
		id: string | number,
		payload: UpdateHolidayRequest
	): Promise<Holiday> => {
		const response = await apiClient.put(endPoints.holidays.update(id), payload);
		return response.data;
	},

	// DELETE - Delete holiday
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete(endPoints.holidays.delete(id));
	},
};
