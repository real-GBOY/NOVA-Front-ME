/** @format */

export type Holiday = {
	id: string;
	name: string;
	startDate: Date;
	endDate: Date;
	duration: number; // in days
};

export type SortOption = "name" | "startDate" | "endDate" | "duration";

