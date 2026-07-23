/** @format */

export type TimeTransformDirection = "toUtc" | "toLocal";

export type TimeTransformOptions = {
   direction: TimeTransformDirection;
   dateOnlyMode?: "keep" | "utc";
   exactKeys?: string[];
   suffixes?: string[];
};

const DEFAULT_EXACT_KEYS = [
   "from_date",
   "to_date",
   "start_date",
   "end_date",
   "created_at",
   "updated_at",
];

const DEFAULT_SUFFIXES = ["_at", "_date", "_time"];
const DUBAI_TIME_ZONE = "Asia/Dubai";
const DUBAI_OFFSET_MINUTES = 4 * 60;

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_WITH_TZ_REGEX =
   /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;
const DATE_TIME_NO_TZ_REGEX =
   /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/;
const TIME_ONLY_REGEX = /^\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/;

const pad2 = (value: number) => String(value).padStart(2, "0");
const pad3 = (value: number) => String(value).padStart(3, "0");

const getDubaiParts = (date: Date) => {
   const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: DUBAI_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
   });
   const parts = formatter.formatToParts(date);
   const getPart = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((part) => part.type === type)?.value ?? 0);
   return {
      year: getPart("year"),
      month: getPart("month"),
      day: getPart("day"),
      hour: getPart("hour"),
      minute: getPart("minute"),
      second: getPart("second"),
   };
};

export const formatDubaiDate = (date: Date): string => {
   const parts = getDubaiParts(date);
   return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
};

const formatLocalIsoWithOffset = (date: Date) => {
   const parts = getDubaiParts(date);
   const ms = date.getMilliseconds();
   const sign = "+";
   const offsetHours = pad2(Math.floor(DUBAI_OFFSET_MINUTES / 60));
   const offsetMins = pad2(DUBAI_OFFSET_MINUTES % 60);
   const msPart = ms ? `.${pad3(ms)}` : "";
   return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}T${pad2(parts.hour)}:${pad2(parts.minute)}:${pad2(parts.second)}${msPart}${sign}${offsetHours}:${offsetMins}`;
};

const formatUtcDateOnly = (date: Date) => {
   const year = date.getUTCFullYear();
   const month = pad2(date.getUTCMonth() + 1);
   const day = pad2(date.getUTCDate());
   return `${year}-${month}-${day}`;
};

const parseDateTimeParts = (value: string) => {
   const [datePart, timePart] = value.split(/[T ]/);
   const [year, month, day] = datePart.split("-").map(Number);
   let hours = 0;
   let minutes = 0;
   let seconds = 0;
   let ms = 0;
   if (timePart) {
      const [hms, msPart] = timePart.split(".");
      const [h, m, s] = hms.split(":").map(Number);
      hours = h || 0;
      minutes = m || 0;
      seconds = s || 0;
      ms = msPart ? Number(msPart.padEnd(3, "0").slice(0, 3)) : 0;
   }
   return { year, month, day, hours, minutes, seconds, ms };
};

const parseLocalDateTime = (value: string) => {
   const { year, month, day, hours, minutes, seconds, ms } = parseDateTimeParts(value);
   const utcMillis =
      Date.UTC(
         year,
         (month || 1) - 1,
         day || 1,
         hours,
         minutes,
         seconds,
         ms
      ) -
      DUBAI_OFFSET_MINUTES * 60 * 1000;
   return new Date(utcMillis);
};

const parseUtcDateTime = (value: string) => {
   const { year, month, day, hours, minutes, seconds, ms } = parseDateTimeParts(value);
   return new Date(Date.UTC(year, (month || 1) - 1, day || 1, hours, minutes, seconds, ms));
};

const parseDateObjectAsDubai = (value: Date): Date => {
   const utcMillis =
      Date.UTC(
         value.getFullYear(),
         value.getMonth(),
         value.getDate(),
         value.getHours(),
         value.getMinutes(),
         value.getSeconds(),
         value.getMilliseconds()
      ) -
      DUBAI_OFFSET_MINUTES * 60 * 1000;
   return new Date(utcMillis);
};

const shouldTransformKey = (key: string, options: TimeTransformOptions) => {
   const exactKeys = options.exactKeys || DEFAULT_EXACT_KEYS;
   const suffixes = options.suffixes || DEFAULT_SUFFIXES;
   if (exactKeys.includes(key)) return true;
   return suffixes.some((suffix) => key.endsWith(suffix));
};

const transformDateString = (
   value: string,
   options: TimeTransformOptions
) => {
   if (TIME_ONLY_REGEX.test(value)) {
      return value;
   }

   const dateOnlyMode = options.dateOnlyMode || "keep";

   if (DATE_ONLY_REGEX.test(value)) {
      if (dateOnlyMode === "keep") return value;
      const localDate = parseLocalDateTime(value);
      return options.direction === "toUtc"
         ? formatUtcDateOnly(localDate)
         : value;
   }

   if (DATE_TIME_WITH_TZ_REGEX.test(value)) {
      const date = new Date(value);
      return options.direction === "toUtc"
         ? date.toISOString()
         : formatLocalIsoWithOffset(date);
   }

   if (DATE_TIME_NO_TZ_REGEX.test(value)) {
      const date =
         options.direction === "toUtc"
            ? parseLocalDateTime(value)
            : parseUtcDateTime(value);
      return options.direction === "toUtc"
         ? date.toISOString()
         : formatLocalIsoWithOffset(date);
   }

   return value;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
   !!value && typeof value === "object" && value.constructor === Object;

const transformNestedOnly = <T>(
   payload: T,
   options: TimeTransformOptions
): T => {
   if (payload == null) return payload;
   if (Array.isArray(payload)) {
      return payload.map((item) => transformNestedOnly(item, options)) as T;
   }
   if (!isPlainObject(payload)) return payload;

   const result: Record<string, unknown> = {};
   for (const [key, value] of Object.entries(payload)) {
      if (shouldTransformKey(key, options)) {
         result[key] = transformTimePayload(value, options);
      } else {
         result[key] = transformNestedOnly(value, options);
      }
   }
   return result as T;
};

export const transformTimePayload = <T>(
   payload: T,
   options: TimeTransformOptions
): T => {
   if (payload == null) return payload;
   if (payload instanceof Date) {
      const dubaiDate = parseDateObjectAsDubai(payload);
      return (options.direction === "toUtc"
         ? dubaiDate.toISOString()
         : formatLocalIsoWithOffset(dubaiDate)) as T;
   }

   if (typeof payload === "string") {
      return transformDateString(payload, options) as T;
   }

   if (Array.isArray(payload)) {
      return payload.map((item) => transformTimePayload(item, options)) as T;
   }

   if (!isPlainObject(payload)) {
      return payload;
   }

   const result: Record<string, unknown> = {};
   for (const [key, value] of Object.entries(payload)) {
      if (shouldTransformKey(key, options)) {
         result[key] = transformTimePayload(value, options);
      } else {
         result[key] = transformNestedOnly(value, options);
      }
   }
   return result as T;
};
