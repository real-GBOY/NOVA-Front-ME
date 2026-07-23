/** @format */

import { Shift } from "@/services/shiftService";

export interface ViewShift {
	id: string;
	name: string;
	description: string | null;
	timezone: string;
	workingDaysCount: number;
	isDefault: boolean;
	segments: Array<{
		weekday: number;
		start_time: string;
		end_time: string;
		break_minutes: number | null;
	}>;
}

export type SortOption = "name" | "timezone" | "workingDaysCount";

export interface ShiftsFilters {
	timezone?: string[];
	isDefault?: boolean[];
}

export interface ShiftSegmentForm {
	weekday: number;
	enabled: boolean;
	start_time: string;
	end_time: string;
	break_minutes: number | null;
}

// Transform backend shift to view shift
export const transformShiftToView = (shift: Shift): ViewShift => ({
	id: String(shift.shift_id),
	name: shift.name,
	description: shift.description,
	timezone: shift.timezone,
	workingDaysCount: shift.segments.length,
	isDefault: shift.is_default,
	segments: shift.segments.map((seg) => ({
		weekday: seg.weekday,
		start_time: seg.start_time,
		end_time: seg.end_time,
		break_minutes: seg.break_minutes,
	})),
});
