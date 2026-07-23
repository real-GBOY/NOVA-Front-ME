/** @format */

import type { DashboardTimePeriod } from "@/types/dashboard";

const pad2 = (value: number) => value.toString().padStart(2, "0");

const formatDate = (date: Date) => {
	const year = date.getFullYear();
	const month = pad2(date.getMonth() + 1);
	const day = pad2(date.getDate());
	return `${year}-${month}-${day}`;
};

const getWeekStart = (date: Date) => {
	const day = date.getDay();
	const diff = (day + 6) % 7; // Monday as week start
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() - diff);
};

export const getDateRangeForPeriod = (
	period: DashboardTimePeriod,
	referenceDate = new Date()
) => {
	const baseDate = new Date(
		referenceDate.getFullYear(),
		referenceDate.getMonth(),
		referenceDate.getDate()
	);
	let start: Date;
	let end: Date;

	switch (period) {
		case "lastWeek": {
			const currentWeekStart = getWeekStart(baseDate);
			start = new Date(
				currentWeekStart.getFullYear(),
				currentWeekStart.getMonth(),
				currentWeekStart.getDate() - 7
			);
			end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
			break;
		}
		case "thisMonth": {
			start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
			end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
			break;
		}
		case "lastMonth": {
			start = new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1);
			end = new Date(baseDate.getFullYear(), baseDate.getMonth(), 0);
			break;
		}
		case "thisWeek":
		default: {
			start = getWeekStart(baseDate);
			end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
			break;
		}
	}

	return {
		from_date: formatDate(start),
		to_date: formatDate(end),
	};
};
