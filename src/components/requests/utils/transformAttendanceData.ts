/** @format */

import type { Request } from "@/types/requests";
const DUBAI_TIME_ZONE = "Asia/Dubai";

export type ApiAttendanceRequest = {
   id: string;
   employee: {
      id: number;
      name: string;
      email: string;
      avatar?: string | null;
      job_title?: string | null;
   };
   check_in_time: string;
   check_out_time: string;
   status: string;
   zone_status?: string | null;
   gps_status?: string | null;
   log_date: string;
   created_at: string;
};

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

const formatDateTime = (date: Date) => {
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
   const displayHours = getPart("hour");
   const displayMinutes = getPart("minute");
   const ampm = getPart("dayPeriod");
   const day = String(Number(getPart("day")));
   const month = getPart("month") || monthNames[date.getMonth()];
   const year = getPart("year");
   return `${displayHours}:${displayMinutes} ${ampm} • ${day} ${month}, ${year}`;
};

export const mapGpsStatus = (
   status?: string | null
): "In Zone" | "Out of Zone" | undefined => {
   if (!status) return undefined;

   const normalized = status.toLowerCase();
   if (
      normalized === "in_zone" ||
      normalized === "in zone" ||
      normalized === "geofence"
   ) {
      return "In Zone";
   }
   return "Out of Zone";
};

export const transformAttendanceData = (
   apiData: ApiAttendanceRequest[]
): Request[] => {
   return apiData.map((item) => {
      const requestedTime = new Date(item.created_at);
      let formattedRequestedAt = "Invalid Date";
      if (!Number.isNaN(requestedTime.getTime())) {
         formattedRequestedAt = formatDateTime(requestedTime);
      }

      return {
         id: item.id,
         memberId: item.employee.id.toString(),
         memberName: item.employee.name,
         memberAvatar: item.employee.avatar || "/icons/defAvatar.png",
         memberAvatarBg: "bg-bg-weak",
         memberTitle: item.employee.job_title || undefined,
         requestType: "Clock-In",
         requestedAt: formattedRequestedAt,
         gpsStatus: mapGpsStatus(item.zone_status || item.gps_status),
         status:
            item.status === "Pending"
               ? "Pending"
               : item.status === "Approved"
               ? "Approved"
               : "Rejected",
      };
   });
};
