/** @format */

import type { Request, OvertimeRequest } from "@/types/requests";
import { formatTime } from "@/utilities/i18n";

const resolveJobTitle = (
   employee: { job_title?: string | null } & Record<string, unknown>
): string | undefined => {
   const jobTitle =
      employee.job_title ??
      (employee as { jobTitle?: string | null }).jobTitle ??
      undefined;

   if (typeof jobTitle !== "string") {
      return undefined;
   }

   const trimmed = jobTitle.trim();
   return trimmed ? trimmed : undefined;
};

const formatTimeValue = (value: string | undefined | null): string => {
   if (!value) return "--:--";
   if (value.includes("T")) {
      return formatTime(value);
   }
   const match = value.match(/^(\d{2}:\d{2})/);
   return match ? match[1] : value;
};

/**
 * Transform overtime API response to Request type for table display
 */
export const transformOvertimeToRequest = (
   overtime: OvertimeRequest
): Request => {
   // Generate a random avatar background color (you can adjust this logic)
   const avatarColors = [
      "bg-primary/10",
      "bg-success/10",
      "bg-warning/10",
      "bg-danger/10",
      "bg-info/10",
   ];
   const randomColor =
      avatarColors[Math.floor(Math.random() * avatarColors.length)];

   return {
      id: overtime.id.toString(),
      memberId: overtime.employee.id.toString(),
      memberName: overtime.employee.name,
      memberAvatar: overtime.employee.avatar || "/icons/defAvatar.png",
      memberAvatarBg: randomColor,
      memberTitle: resolveJobTitle(overtime.employee),
      requestType: "Overtime",
      requestedAt: overtime.created_at,
      status: overtime.status,
      overtimeDate: overtime.date,
      overtimeTimeRange: `${formatTimeValue(overtime.start_time)} - ${formatTimeValue(overtime.end_time)}`,
      duration: formatDuration(overtime.hours),
   };
};

/**
 * Transform multiple overtime requests
 */
export const transformOvertimeList = (
   overtimeList: OvertimeRequest[]
): Request[] => {
   return overtimeList.map(transformOvertimeToRequest);
};

/**
 * Format hours into readable duration string
 * @param hours - Number of hours
 * @returns Formatted duration string (e.g., "2 hours", "1.5 hours")
 */
function formatDuration(hours: number): string {
   if (hours === 1) {
      return "1 hour";
   }
   if (hours % 1 === 0) {
      return `${hours} hours`;
   }
   // Handle decimal hours
   const wholeHours = Math.floor(hours);
   const minutes = Math.round((hours - wholeHours) * 60);

   if (minutes === 0) {
      return `${wholeHours} hours`;
   }
   return `${wholeHours} hours ${minutes} min`;
}

// Time Off Types and Transformers
import type { VacationRequest } from "@/types/requests";

export const transformTimeOffToRequest = (
   item: VacationRequest
): Request => {
   const avatarColors = [
      "bg-primary/10",
      "bg-success/10",
      "bg-warning/10",
      "bg-danger/10",
      "bg-info/10",
   ];
   const randomColor =
      avatarColors[Math.floor(Math.random() * avatarColors.length)];

   return {
      id: item.id.toString(),
      memberId: item.employee.id.toString(),
      memberName: item.employee.name,
      memberAvatar: item.employee.avatar || "/icons/defAvatar.png",
      memberAvatarBg: randomColor,
      memberTitle: resolveJobTitle(item.employee),
      requestType: "Time Off",
      requestedAt: item.created_at,
      status: item.status,
      startDate: item.start_date,
      endDate: item.end_date,
      leaveType: item.vacation_type?.name,
      attachment: item.has_attachment ? {
         url: "", // URL not available in list view
         filename: item.attachment_filename || "attachment",
      } : undefined
   };
};

export const transformTimeOffList = (
   apiData: VacationRequest[]
): Request[] => {
   return apiData.map(transformTimeOffToRequest);
};
