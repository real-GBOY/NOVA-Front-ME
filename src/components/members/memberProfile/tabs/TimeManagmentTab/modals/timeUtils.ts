/** @format */

const DUBAI_TIME_ZONE = "Asia/Dubai";
const DUBAI_OFFSET = "+04:00";
const pad2 = (value: number) => String(value).padStart(2, "0");

export const getIsoDatePart = (isoString: string): string => isoString.slice(0, 10);

const getDubaiDateParts = (date: Date) => {
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
      parts.find((part) => part.type === type)?.value ?? "";

   return {
      year: getPart("year"),
      month: getPart("month"),
      day: getPart("day"),
      hour: getPart("hour"),
      minute: getPart("minute"),
      second: getPart("second"),
   };
};

export const toLocalIsoString = (date: Date): string => {
   const parts = getDubaiDateParts(date);
   return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${DUBAI_OFFSET}`;
};

export const buildLocalIsoFromLocalDateAndTime = (
   date: Date,
   time: string
): string | null => {
   const [hoursPart, minutesPart] = time.split(":");
   const hours = Number(hoursPart);
   const minutes = Number(minutesPart);

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

   // Keep the selected calendar day/time and pin it to Dubai offset.
   const year = date.getFullYear();
   const month = pad2(date.getMonth() + 1);
   const day = pad2(date.getDate());
   return `${year}-${month}-${day}T${pad2(hours)}:${pad2(minutes)}:00${DUBAI_OFFSET}`;
};
