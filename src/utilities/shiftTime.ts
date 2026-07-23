/** @format */

type TimeParts = { hours: number; minutes: number; seconds: number } | null;

type DateParts = { year: number; month: number; day: number };

const parseTimeParts = (
   value: string,
   options?: { allow24Hour?: boolean },
): TimeParts => {
   const match = value
      .trim()
      .match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
   if (!match) return null;
   let hours = Number(match[1]);
   const minutes = Number(match[2]);
   const seconds = match[3] ? Number(match[3]) : 0;
   const meridiem = match[4]?.toUpperCase();

   if (meridiem) {
      if (hours < 1 || hours > 12) return null;
      if (meridiem === "AM") {
         hours = hours === 12 ? 0 : hours;
      } else {
         hours = hours === 12 ? 12 : hours + 12;
      }
   }

   const allow24Hour = options?.allow24Hour ?? false;
   if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      Number.isNaN(seconds) ||
      hours < 0 ||
      hours > (allow24Hour ? 24 : 23) ||
      minutes < 0 ||
      minutes > 59 ||
      seconds < 0 ||
      seconds > 59 ||
      (hours === 24 && (minutes !== 0 || seconds !== 0))
   ) {
      return null;
   }
   return { hours, minutes, seconds };
};

const formatHHmm = (hours: number, minutes: number) =>
   `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

const getTimeZoneOffsetMinutes = (timeZone: string, date: Date): number => {
   const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
   });
   const parts = dtf.formatToParts(date);
   const partMap: Record<string, number> = {};
   parts.forEach((part) => {
      if (part.type === "literal") return;
      partMap[part.type] = Number(part.value);
   });
   const utcFromZoned = Date.UTC(
      partMap.year,
      (partMap.month || 1) - 1,
      partMap.day || 1,
      partMap.hour || 0,
      partMap.minute || 0,
      partMap.second || 0,
   );
   return (utcFromZoned - date.getTime()) / 60000;
};

const getZonedDateParts = (timeZone: string, reference: Date): DateParts => {
   const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
   });
   const parts = dtf.formatToParts(reference);
   const partMap: Record<string, number> = {};
   parts.forEach((part) => {
      if (part.type === "literal") return;
      partMap[part.type] = Number(part.value);
   });
   return {
      year: partMap.year,
      month: partMap.month,
      day: partMap.day,
   };
};

const formatTimeInZone = (date: Date, timeZone: string): string => {
   const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
   });
   const parts = dtf.formatToParts(date);
   const partMap: Record<string, number> = {};
   parts.forEach((part) => {
      if (part.type === "literal") return;
      partMap[part.type] = Number(part.value);
   });
   return formatHHmm(partMap.hour || 0, partMap.minute || 0);
};

export const toUtcTime = (
   localTime: string,
   timeZone: string,
   reference: Date = new Date(),
): string => {
   const parts = parseTimeParts(localTime, { allow24Hour: true });
   if (!parts) return localTime;

   const { year, month, day } = getZonedDateParts(timeZone, reference);
   const dayOffset = parts.hours === 24 ? 1 : 0;
   const normalizedHours = parts.hours === 24 ? 0 : parts.hours;
   const localAsUtc = new Date(
      Date.UTC(
         year,
         month - 1,
         day + dayOffset,
         normalizedHours,
         parts.minutes,
         parts.seconds,
      ),
   );
   const offsetMinutes = getTimeZoneOffsetMinutes(timeZone, localAsUtc);
   const utcDate = new Date(localAsUtc.getTime() - offsetMinutes * 60000);
   return formatHHmm(utcDate.getUTCHours(), utcDate.getUTCMinutes());
};

export const fromUtcTime = (
   utcTime: string,
   timeZone: string,
   reference: Date = new Date(),
): string => {
   const parts = parseTimeParts(utcTime);
   if (!parts) return utcTime;
   const utcDate = new Date(
      Date.UTC(
         reference.getUTCFullYear(),
         reference.getUTCMonth(),
         reference.getUTCDate(),
         parts.hours,
         parts.minutes,
         parts.seconds,
      ),
   );
   return formatTimeInZone(utcDate, timeZone);
};

export const shiftTimeToMinutes = (
   value: string,
   options?: { allow24Hour?: boolean },
): number | null => {
   const parts = parseTimeParts(value, options);
   if (!parts) return null;
   return parts.hours * 60 + parts.minutes;
};
