/** @format */

import { isValidDate } from "./dateUtils";

/**
 * Generate mock overtime date based on request ID
 */
export const getMockOvertimeDate = (requestId: string): Date => {
	try {
		const id = requestId || "0";
		const lastTwoChars = id.slice(-2) || "0";
		const daysOffset = (parseInt(lastTwoChars, 16) || 0) % 60;
		const date = new Date();
		date.setDate(date.getDate() + daysOffset);
		if (!isValidDate(date)) {
			return new Date();
		}
		return date;
	} catch {
		return new Date();
	}
};

/**
 * Generate mock overtime time range based on request ID
 */
export const getMockOvertimeTimeRange = (requestId: string): string => {
	const timeRanges = [
		"05:00 PM - 09:00 PM",
		"03:30 PM - 05:30 PM",
		"04:00 PM - 06:00 PM",
		"06:15 PM - 08:15 PM",
		"02:45 PM - 04:45 PM",
		"01:00 PM - 03:00 PM",
		"07:00 PM - 09:00 PM",
		"08:30 PM - 10:30 PM",
		"12:00 PM - 02:00 PM",
		"09:00 AM - 11:00 AM",
		"10:15 AM - 12:15 PM",
	];
	try {
		const id = requestId || "0";
		const lastChar = id.slice(-1) || "0";
		const index = (parseInt(lastChar, 16) || 0) % timeRanges.length;
		return timeRanges[index];
	} catch {
		return timeRanges[0];
	}
};

/**
 * Generate mock duration based on request ID
 */
export const getMockDuration = (requestId: string): string => {
	const durations = [
		"4 hours",
		"2 hours 45 min",
		"4 hours",
		"1 hour 30 min",
		"5 hours",
		"6 hours 15 min",
		"2 hours",
		"3 hours 20 min",
		"1 hour",
		"7 hours",
		"8 hours 30 min",
	];
	try {
		const id = requestId || "0";
		const lastChar = id.slice(-1) || "0";
		const index = (parseInt(lastChar, 16) || 0) % durations.length;
		return durations[index];
	} catch {
		return durations[0];
	}
};

/**
 * Generate mock start date for time off requests
 */
export const getMockStartDate = (requestId: string): Date => {
	try {
		const id = requestId || "0";
		const lastTwoChars = id.slice(-2) || "0";
		const daysOffset = (parseInt(lastTwoChars, 16) || 0) % 30;
		const date = new Date();
		date.setDate(date.getDate() + daysOffset + 7);

		if (!isValidDate(date)) {
			return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
		}
		return date;
	} catch {
		return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	}
};

/**
 * Generate mock end date for time off requests
 */
export const getMockEndDate = (requestId: string, startDate?: Date): Date => {
	try {
		let baseDate: Date;
		if (startDate && isValidDate(startDate)) {
			baseDate = new Date(startDate);
		} else {
			baseDate = getMockStartDate(requestId);
		}

		const id = requestId || "0";
		const lastChar = id.slice(-1) || "0";
		const daysOffset = (parseInt(lastChar, 16) || 0) % 5;
		const date = new Date(baseDate);
		date.setDate(date.getDate() + daysOffset + 3);

		if (!isValidDate(date)) {
			const fallbackDate = new Date(baseDate);
			fallbackDate.setDate(fallbackDate.getDate() + 5);
			return fallbackDate;
		}
		return date;
	} catch {
		const base =
			startDate && isValidDate(startDate)
				? startDate
				: getMockStartDate(requestId);
		const fallbackDate = new Date(base);
		fallbackDate.setDate(fallbackDate.getDate() + 5);
		return fallbackDate;
	}
};

/**
 * Generate mock leave type based on request ID
 */
export const getMockLeaveType = (requestId: string): string => {
	const leaveTypes = [
		"Sick Leave",
		"Annual Leave",
		"Emergency Leave",
		"Unpaid Leave",
		"Personal Leave",
		"Maternity Leave",
		"Paternity Leave",
	];

	try {
		const id = requestId || "0";
		const lastChar = id.slice(-1) || "0";
		const index = (parseInt(lastChar, 16) || 0) % leaveTypes.length;
		return leaveTypes[index];
	} catch {
		return leaveTypes[0]; // Default to "Sick Leave"
	}
};

/**
 * Generate mock attachment based on request ID, leave type, and start date
 */
export const getMockAttachment = (
	requestId: string,
	leaveType?: string,
	startDate?: Date
): { filename: string; url: string; mimeType?: string } => {
	try {
		// Get leave type or generate one
		const type = leaveType || getMockLeaveType(requestId);

		// Convert leave type to filename format (lowercase, replace spaces with hyphens)
		const typeSlug = String(type || "").toLowerCase().replace(/\s+/g, "-");

		// Get date for filename
		const date = startDate || getMockStartDate(requestId);
		const monthNames = [
			"jan",
			"feb",
			"mar",
			"apr",
			"may",
			"jun",
			"jul",
			"aug",
			"sep",
			"oct",
			"nov",
			"dec",
		];
		const month = monthNames[date.getMonth()];
		const year = date.getFullYear().toString().slice(-2); // Last 2 digits

		const filename = `${typeSlug}-${month}${year}.pdf`;

		return {
			filename,
			url: "#", // Mock URL
			mimeType: "application/pdf",
		};
	} catch {
		// Fallback attachment
		return {
			filename: "attachment.pdf",
			url: "#",
			mimeType: "application/pdf",
		};
	}
};
