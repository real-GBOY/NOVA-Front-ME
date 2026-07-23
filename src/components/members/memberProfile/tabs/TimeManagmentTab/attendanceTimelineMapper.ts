import { format } from "date-fns";
import type {
   DayTimelineApi,
   DayTimelineSegmentApi,
} from "@/services/employeeService";
import type { Shift } from "@/services/shiftService";
import type { TimeSlot } from "./types";

export interface NormalizedAttendanceTimelineDay {
   date: string;
   day_label: string;
   clock_in: string | null;
   clock_out: string | null;
   duration_hours: number;
   segments: TimeSlot[];
   hasOvertime: boolean;
   hasDayOff: boolean;
   shift_start: string | null;
   shift_end: string | null;
}

export type ShiftBoundsByDate = Record<
   string,
   { start: string | null; end: string | null } | undefined
>;

const WORKING_TYPES: TimeSlot["type"][] = ["working", "overtime"];
const DUBAI_TIME_ZONE = "Asia/Dubai";

const getDubaiHourMinute = (
   date: Date,
): { hours: number; minutes: number } | null => {
   if (Number.isNaN(date.getTime())) return null;
   const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: DUBAI_TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
   });
   const parts = formatter.formatToParts(date);
   const hourPart = parts.find((part) => part.type === "hour")?.value;
   const minutePart = parts.find((part) => part.type === "minute")?.value;
   if (!hourPart || !minutePart) return null;
   const hours = Number(hourPart);
   const minutes = Number(minutePart);
   if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
   return { hours, minutes };
};

const getDubaiDateKey = (date: Date): string | null => {
   if (Number.isNaN(date.getTime())) return null;
   const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: DUBAI_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
   });
   const parts = formatter.formatToParts(date);
   const year = parts.find((part) => part.type === "year")?.value;
   const month = parts.find((part) => part.type === "month")?.value;
   const day = parts.find((part) => part.type === "day")?.value;
   if (!year || !month || !day) return null;
   return `${year}-${month}-${day}`;
};

const extractDateKey = (value: string): string => {
   const [datePart] = value.split("T");
   return datePart;
};

const parseClockMinutesFromString = (value: string): number | null => {
   // Accept plain clock strings (HH:mm / HH:mm:ss) and datetime-like strings.
   // When multiple clock tokens exist, use the last one as the effective time.
   const matches = [...value.matchAll(/(\d{2}):(\d{2})(?::(\d{2}))?/g)];
   if (!matches.length) return null;

   const [, hh = "", mm = ""] = matches[matches.length - 1] || [];
   const hours = Number(hh);
   const minutes = Number(mm);

   if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
   ) {
      return null;
   }

   return hours * 60 + minutes;
};

const parseMinutesFromTimeLike = (value: string): number | null => {
   // Timeline API returns ISO UTC timestamps (e.g. 2026-02-15T08:00:00.000Z).
   // Convert those to Dubai wall-clock time for display/math.
   if (value.includes("T")) {
      const parsed = new Date(value);
      const dubaiHm = getDubaiHourMinute(parsed);
      if (dubaiHm) {
         return dubaiHm.hours * 60 + dubaiHm.minutes;
      }
   }

   // Shift templates and other sources may provide plain HH:mm or HH:mm:ss.
   return parseClockMinutesFromString(value);
};

const parseShiftClockMinutes = (value: string): number | null => {
   // Some endpoints return plain HH:mm:ss (wall-clock), while others can return
   // ISO datetimes. Convert ISO values to Dubai; keep plain clock values as-is.
   if (value.includes("T")) {
      const parsed = new Date(value);
      const dubaiHm = getDubaiHourMinute(parsed);
      if (dubaiHm) {
         return dubaiHm.hours * 60 + dubaiHm.minutes;
      }
   }

   return parseClockMinutesFromString(value);
};

const formatMinutesToHHmm = (minutes: number): string => {
   const normalized = ((Math.round(minutes) % 1440) + 1440) % 1440;
   const hours = Math.floor(normalized / 60);
   const mins = normalized % 60;
   return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const normalizeToSameTimelineDay = (
   minutes: number,
   referenceStart: number,
): number => {
   let normalized = minutes;
   while (normalized < referenceStart) {
      normalized += 1440;
   }
   return normalized;
};

const sortSegments = (
   segments: DayTimelineSegmentApi[],
): DayTimelineSegmentApi[] => {
   return [...segments].sort((a, b) => {
      const aTs = Date.parse(a.start_time);
      const bTs = Date.parse(b.start_time);

      if (!Number.isNaN(aTs) && !Number.isNaN(bTs)) {
         return aTs - bTs;
      }

      const aMinutes = parseMinutesFromTimeLike(a.start_time) ?? 0;
      const bMinutes = parseMinutesFromTimeLike(b.start_time) ?? 0;
      return aMinutes - bMinutes;
   });
};

const mapSegmentTypeToUiType = (
   segment: DayTimelineSegmentApi,
): TimeSlot["type"] => {
   switch (segment.segment_type) {
      case "Working":
         return "working";
      case "Late":
         return "late";
      case "Break":
         return "break";
      case "Overtime":
         return "overtime";
      case "Absence":
      case "Idle":
         return "absence";
      case "Vacation":
         return "dayOff";
      case "Unpaid":
         return segment.metadata?.role === "early_leave"
            ? "earlyLeave"
            : "absence";
      default:
         return "absence";
   }
};

const hasFinalWorkingAfter = (
   segments: DayTimelineSegmentApi[],
   currentIndex: number,
): boolean => {
   return segments
      .slice(currentIndex + 1)
      .some(
         (segment) =>
            segment.segment_type === "Working" &&
            segment.metadata?.role === "working_final",
      );
};

export const getTimelineDates = (days: DayTimelineApi[]): string[] => {
   const dates = new Set<string>();
   days.forEach((day) => {
      dates.add(extractDateKey(day.date));
   });
   return [...dates];
};

export const getShiftBoundsForDate = (
   shift: Shift | null | undefined,
   date: string,
): { start: string | null; end: string | null } => {
   if (!shift?.segments?.length) {
      return { start: null, end: null };
   }

   const dateKey = extractDateKey(date);
   const weekday = new Date(`${dateKey}T12:00:00Z`).getUTCDay();
   const weekdayCandidates = Array.from(
      new Set([
         weekday, // 0-6 (Sunday-Saturday)
         weekday === 0 ? 7 : weekday, // 1-7 (Monday-Sunday)
         weekday + 1, // 1-7 (Sunday-Saturday)
      ]),
   );

   // Some backends return weekday with different index conventions.
   // Try matching in a deterministic order before giving up.
   let daySegments: Shift["segments"] = [];
   for (const weekdayCandidate of weekdayCandidates) {
      const matched = shift.segments.filter(
         (segment) => segment.weekday === weekdayCandidate,
      );
      if (matched.length > 0) {
         daySegments = matched;
         break;
      }
   }

   if (!daySegments.length) {
      return { start: null, end: null };
   }

   let minStartMinutes: number | null = null;
   let maxEndMinutes: number | null = null;

   daySegments.forEach((segment) => {
      const start = parseShiftClockMinutes(segment.start_time);
      const end = parseShiftClockMinutes(segment.end_time);

      if (start == null || end == null) {
         return;
      }

      minStartMinutes =
         minStartMinutes == null ? start : Math.min(minStartMinutes, start);

      const adjustedEnd = end < start ? end + 1440 : end;
      maxEndMinutes =
         maxEndMinutes == null
            ? adjustedEnd
            : Math.max(maxEndMinutes, adjustedEnd);
   });

   return {
      start:
         minStartMinutes == null ? null : formatMinutesToHHmm(minStartMinutes),
      end: maxEndMinutes == null ? null : formatMinutesToHHmm(maxEndMinutes),
   };
};

export const normalizeAttendanceTimeline = (
   days: DayTimelineApi[],
   shiftBoundsByDate: ShiftBoundsByDate,
): NormalizedAttendanceTimelineDay[] => {
   const now = new Date();
   const todayDubaiDateKey = getDubaiDateKey(now);
   const nowDubaiHm = getDubaiHourMinute(now);

   return days.map((day) => {
      const dateKey = extractDateKey(day.date);
      const dayShiftBounds = shiftBoundsByDate[dateKey];
      const shiftEndMinutes = parseMinutesFromTimeLike(
         dayShiftBounds?.end || "",
      );
      const nowMinutesForDay =
         todayDubaiDateKey &&
         nowDubaiHm &&
         dateKey === todayDubaiDateKey
            ? nowDubaiHm.hours * 60 + nowDubaiHm.minutes
            : null;
      const sortedSegments = sortSegments(day.segments || []);

      const mappedSegments: TimeSlot[] = sortedSegments
         .map((segment, index) => {
            let startMinutes = parseMinutesFromTimeLike(segment.start_time);
            if (startMinutes == null) {
               return null;
            }

            const nextSegment = sortedSegments[index + 1];
            const nextStartMinutes = nextSegment
               ? parseMinutesFromTimeLike(nextSegment.start_time)
               : null;

            let endMinutes: number | null = null;

            if (segment.segment_type === "Late" && nextStartMinutes != null) {
               endMinutes = nextStartMinutes;
            } else if (typeof segment.duration_minutes === "number") {
               endMinutes = startMinutes + segment.duration_minutes;
            } else if (nextStartMinutes != null) {
               endMinutes = nextStartMinutes;
            } else if (
               segment.segment_type === "Working" &&
               nowMinutesForDay != null
            ) {
               endMinutes = normalizeToSameTimelineDay(
                  nowMinutesForDay,
                  startMinutes,
               );
            } else if (shiftEndMinutes != null) {
               endMinutes = shiftEndMinutes;
            }

            const isWorkingPlaceholder =
               segment.segment_type === "Working" &&
               segment.metadata?.role === "working_placeholder";

            if (
               isWorkingPlaceholder &&
               !hasFinalWorkingAfter(sortedSegments, index)
            ) {
               if (nowMinutesForDay != null) {
                  endMinutes = normalizeToSameTimelineDay(
                     nowMinutesForDay,
                     startMinutes,
                  );
               } else if (shiftEndMinutes != null) {
                  endMinutes = normalizeToSameTimelineDay(
                     shiftEndMinutes,
                     startMinutes,
                  );
               }
            }

            if (endMinutes == null) {
               endMinutes = startMinutes;
            }

            const isEarlyLeave =
               segment.segment_type === "Unpaid" &&
               segment.metadata?.role === "early_leave";
            if (isEarlyLeave && shiftEndMinutes != null) {
               const normalizedShiftEnd = normalizeToSameTimelineDay(
                  shiftEndMinutes,
                  startMinutes,
               );
               endMinutes = Math.min(endMinutes, normalizedShiftEnd);
            }

            if (endMinutes < startMinutes) {
               endMinutes += 1440;
            }

            return {
               type: mapSegmentTypeToUiType(segment),
               startTime: formatMinutesToHHmm(startMinutes),
               endTime: formatMinutesToHHmm(endMinutes),
               durationMinutes: Math.max(0, endMinutes - startMinutes),
            } satisfies TimeSlot;
         })
         .filter((segment): segment is TimeSlot => Boolean(segment));

      const workingSlots = mappedSegments.filter((segment) =>
         WORKING_TYPES.includes(segment.type),
      );
      const totalWorkingMinutes = workingSlots.reduce(
         (sum, segment) => sum + (segment.durationMinutes || 0),
         0,
      );

      return {
         date: dateKey,
         day_label: format(new Date(`${dateKey}T12:00:00Z`), "EEEE, MMM d"),
         clock_in: workingSlots[0]?.startTime || null,
         clock_out: workingSlots[workingSlots.length - 1]?.endTime || null,
         duration_hours: Number((totalWorkingMinutes / 60).toFixed(2)),
         segments: mappedSegments,
         hasOvertime: mappedSegments.some(
            (segment) => segment.type === "overtime",
         ),
         hasDayOff: mappedSegments.some((segment) => segment.type === "dayOff"),
         shift_start: dayShiftBounds?.start || null,
         shift_end: dayShiftBounds?.end || null,
      };
   });
};
