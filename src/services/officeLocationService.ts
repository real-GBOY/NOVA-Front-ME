/** @format */

import apiClient from "../config/axios";
import endPoints from "../config/endPoints";

// Frontend types (camelCase)
export interface OfficeLocation {
	id: number;
	locationId: number;
	name: string;
	logoUrl: string;
	logoId: number | null;
	address: string;
	latitude: number;
	longitude: number;
	radiusMeters: number;
	timeZone: string;
	weekStartDay: string;
	workingDaysMask: number;
	defaultWorkingDays: string[];
	location: {
		latitude: number;
		longitude: number;
		radiusMeters: number;
	};
}

export interface UpdateOfficeLocationRequest {
	name?: string;
	logoUrl?: string;
	logo?: {
		fileId: number;
		token: string;
	};
	address?: string;
	location?: {
		latitude: number;
		longitude: number;
		radiusMeters: number;
	};
	weekStartDay?: string;
	defaultWorkingDays?: string[];
}

// Backend payload types (snake_case)
interface UpdateOfficeLocationPayload {
	location_name?: string;
	logo_url?: string;
	image?: {
		fileId: number;
		token: string;
	};
	address?: string;
	latitude?: number;
	longitude?: number;
	radius_meters?: number;
	week_start_day?: string;
	working_days_mask?: number;
}

// Backend response type (snake_case)
interface OfficeLocationBackendResponse {
	Name: string;
	logo_url: string;
	address: string;
	location: {
		latitude: number;
		longitude: number;
		radiusMeters: number;
	};
	timeZone: string;
	weekStartDay: string;
	defaultWorkingDays: string[];
	id: number;
	location_id: number;
	name: string;
	logo_id: number | null;
	latitude: number;
	longitude: number;
	radius_meters: number;
	time_zone: string;
	week_start_day: string;
	working_days_mask: number;
}

// Convert bitmask to working days array
const bitmaskToWorkingDays = (mask: number): string[] => {
	const dayMap: Record<number, string> = {
		1: "Sunday",
		2: "Monday",
		4: "Tuesday",
		8: "Wednesday",
		16: "Thursday",
		32: "Friday",
		64: "Saturday",
	};

	const days: string[] = [];
	Object.entries(dayMap).forEach(([bit, day]) => {
		if (mask & parseInt(bit)) {
			days.push(day);
		}
	});
	return days;
};

// Transform backend response to frontend format
const transformOfficeLocation = (
	loc: OfficeLocationBackendResponse
): OfficeLocation => ({
	id: loc.id,
	locationId: loc.location_id,
	name: loc.name || loc.Name,
	logoUrl: loc.logo_url || "",
	logoId: loc.logo_id,
	address: loc.address,
	latitude: loc.latitude || loc.location?.latitude || 0,
	longitude: loc.longitude || loc.location?.longitude || 0,
	radiusMeters: loc.radius_meters || loc.location?.radiusMeters || 0,
	// Product requirement: always use Dubai timezone in frontend flows.
	timeZone: "Asia/Dubai",
	weekStartDay: loc.week_start_day || loc.weekStartDay,
	workingDaysMask: loc.working_days_mask,
	defaultWorkingDays:
		loc.defaultWorkingDays || bitmaskToWorkingDays(loc.working_days_mask),
	location: {
		latitude: loc.latitude || loc.location?.latitude || 0,
		longitude: loc.longitude || loc.location?.longitude || 0,
		radiusMeters: loc.radius_meters || loc.location?.radiusMeters || 0,
	},
});

// Convert working days array to bitmask
const workingDaysToBitmask = (days: string[]): number => {
	const dayMap: Record<string, number> = {
		Sunday: 1,
		Monday: 2,
		Tuesday: 4,
		Wednesday: 8,
		Thursday: 16,
		Friday: 32,
		Saturday: 64,
	};

	return days.reduce((mask, day) => mask | (dayMap[day] || 0), 0);
};

// Service functions
export const officeLocationService = {
	// GET - Get office location by ID
	getById: async (id: string | number): Promise<OfficeLocation> => {
		const response = await apiClient.get(endPoints.officeLocations.getById(id));
		return transformOfficeLocation(response.data);
	},

	// GET - List all office locations
	list: async (): Promise<OfficeLocation[]> => {
		const response = await apiClient.get(endPoints.officeLocations.getById(1));
		return response.data ? [transformOfficeLocation(response.data)] : [];
	},

	// PUT - Update office location
	update: async (
		id: string | number,
		payload: UpdateOfficeLocationRequest
	): Promise<OfficeLocation> => {
		// Transform to snake_case for API
		const apiPayload: UpdateOfficeLocationPayload = {};

		if (payload.name !== undefined) apiPayload.location_name = payload.name;
		if (payload.logoUrl !== undefined) apiPayload.logo_url = payload.logoUrl;
		if (payload.logo !== undefined) {
			apiPayload.image = {
				fileId: payload.logo.fileId,
				token: payload.logo.token,
			};
		}
		if (payload.address !== undefined) apiPayload.address = payload.address;
		if (payload.location) {
			apiPayload.latitude = payload.location.latitude;
			apiPayload.longitude = payload.location.longitude;
			apiPayload.radius_meters = payload.location.radiusMeters;
		}
		if (payload.weekStartDay !== undefined)
			apiPayload.week_start_day = payload.weekStartDay;
		if (payload.defaultWorkingDays !== undefined)
			apiPayload.working_days_mask = workingDaysToBitmask(
				payload.defaultWorkingDays
			);

		const response = await apiClient.put(
			endPoints.officeLocations.update(id),
			apiPayload
		);
		return transformOfficeLocation(response.data);
	},
};
