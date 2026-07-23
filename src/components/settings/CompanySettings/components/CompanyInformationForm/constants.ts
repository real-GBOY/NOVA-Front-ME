/** @format */

import type {
	DateFormatOption,
	WeekStartDayOption,
	TimeFormatOption,
	WorkingDaysOption,
	DropdownOption,
} from "./types";

export const getDateFormatOptions = (): DropdownOption<DateFormatOption>[] => [
	{ id: "dd/mm/yyyy", label: "DD/MM/YYYY" },
	{ id: "mm/dd/yyyy", label: "MM/DD/YYYY" },
	{ id: "yyyy-mm-dd", label: "YYYY-MM-DD" },
];

export const getWeekStartDayOptions = (
	t: (key: string) => string
): DropdownOption<WeekStartDayOption>[] => [
	{ id: "sunday", label: t("companySettings.weekDays.sunday") },
	{ id: "monday", label: t("companySettings.weekDays.monday") },
	{ id: "saturday", label: t("companySettings.weekDays.saturday") },
];

export const getTimeFormatOptions = (): DropdownOption<TimeFormatOption>[] => [
	{ id: "12h", label: "12-hour format" },
	{ id: "24h", label: "24-hour format" },
];

export const getWorkingDaysOptions = (
	t: (key: string) => string
): DropdownOption<WorkingDaysOption>[] => [
	{ id: "weekdays", label: t("companySettings.workingDays.weekdays") },
	{ id: "all", label: t("companySettings.workingDays.all") },
	{ id: "custom", label: t("companySettings.workingDays.custom") },
];
