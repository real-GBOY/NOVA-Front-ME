/** @format */
const DUBAI_TIME_ZONE = "Asia/Dubai";

const getDubaiParts = (date: Date) => {
	const formatter = new Intl.DateTimeFormat("en-US", {
		timeZone: DUBAI_TIME_ZONE,
		year: "numeric",
		month: "short",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
	const parts = formatter.formatToParts(date);
	const getPart = (type: Intl.DateTimeFormatPartTypes) =>
		parts.find((part) => part.type === type)?.value ?? "";
	return {
		day: String(Number(getPart("day"))),
		month: getPart("month"),
		year: getPart("year"),
		hour: getPart("hour"),
		minute: getPart("minute"),
		dayPeriod: getPart("dayPeriod"),
	};
};

/**
 * Validates if a date is a valid Date object
 */
export const isValidDate = (date: Date): boolean => {
	return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Parses a date string into a Date object, returns null if invalid
 */
export const parseDate = (dateString: string | undefined): Date | null => {
	if (!dateString) return null;
	const date = new Date(dateString);
	return isValidDate(date) ? date : null;
};

/**
 * Format date as "5 Jun, 2025"
 */
export const formatDate = (date: Date | null): string => {
	if (!date) return "";
	const parts = getDubaiParts(date);
	return `${parts.day} ${parts.month}, ${parts.year}`;
};

/**
 * Format date as "12 Feb, 2025" (same as formatDate, kept for compatibility)
 */
export const formatDurationDate = formatDate;

/**
 * Format requestedAt to show time and date as "3 Jun, 2025"
 * Handles various input formats including "08:57 AM • 29 Nov" and "29 Nov"
 */
export const formatRequestedDate = (dateString: string | undefined): string => {
	if (!dateString) return "-";

	try {
		// If already in the format "3 Jun, 2025", return as-is
		if (dateString.match(/^\d{1,2} \w{3}, \d{4}$/)) {
			return dateString;
		}

		// Handle format like "08:57 AM • 29 Nov" - extract the date part
		let datePart = dateString;
		if (dateString.includes("•")) {
			const parts = dateString.split("•");
			datePart = parts[parts.length - 1].trim(); // Get the date part after the bullet
		}

		// Try to parse the date
		let date: Date | null = null;

		// First try parsing the full string
		date = parseDate(dateString);

		// If that fails, try parsing just the date part
		if (!date && datePart !== dateString) {
			date = parseDate(datePart);
		}

		// If still no date, try to parse formats like "29 Nov" (without year)
		if (!date) {
			const monthNames = [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec",
			];

			// Try to match "DD MMM" format
			const match = datePart.match(/(\d+)\s+([A-Za-z]{3})/);
			if (match) {
				const day = parseInt(match[1], 10);
				const monthName = match[2];
				const monthIndex = monthNames.findIndex(
					(m) => String(m || "").toLowerCase() === String(monthName || "").toLowerCase()
				);

				if (monthIndex !== -1) {
					// Use current year if year is not specified
					const currentYear = Number(getDubaiParts(new Date()).year);
					date = new Date(currentYear, monthIndex, day);
					if (!isValidDate(date)) {
						date = null;
					}
				}
			}
		}

		if (!date) {
			return dateString; // Return original if can't parse
		}

		return formatDate(date);
	} catch {
		return dateString; // Return original if formatting fails
	}
};

/**
 * Format requestedAt to show time and date as "08:57 AM • 29 Nov"
 */
export const formatRequestedAtWithTime = (dateString: string): string => {
	try {
		// If already in the format "08:57 AM • 29 Nov", return as-is
		if (dateString.includes("•")) {
			return dateString;
		}

		// Try to parse the date string
		const date = parseDate(dateString);
		if (!date) {
			return dateString;
		}

		const parts = getDubaiParts(date);
		const timeString = `${parts.hour}:${parts.minute} ${parts.dayPeriod}`;
		const formattedDate = `${parts.day} ${parts.month}`;

		return `${timeString} • ${formattedDate}`;
	} catch {
		// If already in the format "08:57 AM • 29 Nov", return as-is
		if (dateString.includes("•")) {
			return dateString;
		}
		return dateString;
	}
};

/**
 * Calculate duration in days between two dates
 */
export const getDurationDays = (
	startDate: Date | null,
	endDate: Date | null
): number => {
	if (!startDate || !endDate) return 0;
	const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
	return diffDays;
};
