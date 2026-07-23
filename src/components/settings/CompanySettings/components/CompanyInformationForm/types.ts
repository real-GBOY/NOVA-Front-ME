/** @format */

export type DateFormatOption = "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy-mm-dd";
export type WeekStartDayOption = "sunday" | "monday" | "saturday";
export type TimeFormatOption = "12h" | "24h";
export type WorkingDaysOption = "weekdays" | "all" | "custom";

export type DropdownOption<T extends string> = {
	id: T;
	label: string;
};
