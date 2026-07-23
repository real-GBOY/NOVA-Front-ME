/** @format */

export interface Request {
   id: string;
   memberId: string;
   memberName: string;
   memberAvatar: string;
   memberAvatarBg: string;
   memberTitle?: string;
   requestType: "Clock-In" | "Clock-Out" | "Time Off" | "Overtime";
   requestedAt: string;
   gpsStatus?: "In Zone" | "Out of Zone";
   status: "Pending" | "Approved" | "Rejected" | "Cancelled";
   // Time Off specific fields
   startDate?: string;
   endDate?: string;
   leaveType?: string;
   attachment?: {
      filename: string;
      url: string;
      mimeType?: string;
   };
   // Overtime specific fields
   overtimeDate?: string;
   overtimeTimeRange?: string; // e.g., "03:30 PM - 05:30 PM"
   duration?: string; // e.g., "2 hours 45 min"
}

export interface AttendanceStats {
   pending: number;
   approved: number;
   rejected: number;
}

export interface TimeOffStats {
   pending: number;
   approved: number;
   rejected: number;
}

export type RequestTabType = "attendance" | "timeOff" | "overtime";

// ============ Vacation / Time Off API Types ============

export interface VacationType {
   id: number;
   name: string;
   default_days: number | null;
   unit?: "day" | "hour" | "policy" | string;
   balance_managed?: boolean;
   requires_attachment?: boolean;
   default_paid_percent?: number | null;
   policy_code?: string | null;
}

export interface VacationRequest {
   id: number;
   employee: {
      id: number;
      name: string;
      avatar: string | null;
      job_title?: string | null;
      email?: string | null;
      team?: string | null;
   };
   vacation_type: VacationType;
   start_date: string;
   end_date: string;
   days_requested: number;
   calendar_days_requested?: number | null;
   request_unit?: "day" | "hour" | "policy" | string;
   request_date?: string | null;
   start_time?: string | null;
   end_time?: string | null;
   requested_minutes?: number | null;
   reason: string | null;
   status: "Pending" | "Approved" | "Rejected" | "Cancelled";
   has_attachment: boolean;
   attachment_filename: string | null;
   created_at: string;
}

export interface VacationAttachment {
   file_id?: number;
   filename?: string;
   url?: string;
   mime_type?: string;
}

export interface VacationDetail {
   id: number;
   employee: {
      id: number;
      name: string;
      avatar: string | null;
      job_title?: string | null;
      email?: string | null;
      team?: string | null;
   };
   vacation_type: VacationType;
   start_date: string;
   end_date: string;
   days_requested: number;
   calendar_days_requested?: number | null;
   request_unit?: "day" | "hour" | "policy" | string;
   request_date?: string | null;
   start_time?: string | null;
   end_time?: string | null;
   requested_minutes?: number | null;
   reason: string | null;
   status: "Pending" | "Approved" | "Rejected" | "Cancelled";
   attachment?: VacationAttachment | null;
   balance_before?: number | null;
   balance_after?: number | null;
   approved_by?: {
      id: number;
      name: string;
   } | null;
   approver_comments?: string | null;
   approved_at?: string | null;
   request_context?: Record<string, unknown> | null;
   approval_context?: Record<string, unknown> | null;
   rejection_reason?: string | null;
   rejected_by?: {
      id: number;
      name: string;
   } | null;
   rejected_at?: string | null;
   created_at?: string | null;
   updated_at?: string | null;
}

export interface VacationListResponse {
   data: VacationRequest[];
   pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
   };
}

// ============ Overtime API Types ============

export interface OvertimeEmployee {
   id: number;
   name: string;
   avatar: string | null;
   job_title?: string | null;
   email?: string;
   team?: string | null;
   overtime_rate?: number;
}

export interface OvertimeRequest {
   id: number;
   employee: OvertimeEmployee;
   date: string;
   start_time: string;
   end_time: string;
   hours: number;
   reason: string;
   status: "Pending" | "Approved" | "Rejected";
   created_at: string;
}

export interface OvertimeStats {
   pending: number;
   approved: number;
   rejected: number;
}

export interface CalculatedCompensation {
   base_hourly_rate: number;
   overtime_multiplier: number;
   total_amount: number;
   currency: string;
}

export interface OvertimeDetail {
   id: number;
   employee: OvertimeEmployee;
   date: string;
   start_time: string;
   end_time: string;
   hours: number;
   reason: string;
   status: "Pending" | "Approved" | "Rejected";
   calculated_compensation: CalculatedCompensation;
   approved_by: {
      id: number;
      name: string;
   } | null;
   approved_at: string | null;
   rejection_reason: string | null;
   comments: string | null;
   created_at: string;
   updated_at: string;
}

export interface OvertimeApprovalResponse {
   message: string;
   data: {
      id: number;
      status: "Approved";
      approved_by: {
         id: number;
         name: string;
      };
      approved_at: string;
      hours_approved: number;
      compensation_amount: number;
   };
}

export interface OvertimeRejectionResponse {
   message: string;
   data: {
      id: number;
      status: "Rejected";
      rejected_by: {
         id: number;
         name: string;
      };
      rejected_at: string;
      rejection_reason: string;
   };
}

export interface OvertimeListResponse {
   data: OvertimeRequest[];
   pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
   };
}

// ============ Attendance Detail API Types ============

export interface AttendanceCheckPoint {
   time: string | null;
   latitude: number | null;
   longitude: number | null;
   verification_method: "geofence" | "manual" | null;
   verification_file: string | null;
}

export interface AttendanceLocation {
   id: number;
   name: string;
   address: string;
   latitude: number;
   longitude: number;
   radius_meters: number;
}

export interface AttendanceDetailResponse {
   id: string;
   employee: {
      id: number;
      name: string;
      avatar: string | null;
      email: string;
      job_title: string;
      team: string;
   };
   log_date: string;
   check_in: AttendanceCheckPoint;
   check_out: AttendanceCheckPoint;
   location: AttendanceLocation;
   total_hours: number | null;
   zone_status?: string | null;
   gps_status?: string | null;
   status: "Pending" | "Approved" | "Rejected";
   reviewed_by: {
      id: number;
      name: string;
   } | null;
   reviewed_at: string | null;
   comment: string | null;
   created_at: string;
}

export interface AttendanceApprovalResponse {
   message?: string;
   data?: {
      id: string | number;
      status: "Approved";
      reviewed_by?: {
         id: number;
         name: string;
      };
      reviewed_at?: string;
      comments?: string | null;
   };
}

export interface AttendanceRejectionResponse {
   message?: string;
   data?: {
      id: string | number;
      status: "Rejected";
      reviewed_by?: {
         id: number;
         name: string;
      };
      reviewed_at?: string;
      comment?: string | null;
   };
}

export interface VacationApprovalResponse {
   id: number;
   previous_status: string;
   new_status: string;
   approved_by: {
      id: number;
      name: string;
   } | null;
   approved_at: string | null;
   comments: string | null;
   balance_deducted?: number;
   new_balance?: number;
}

export interface VacationRejectionResponse {
   id: number;
   status: string;
   rejected_by: {
      id: number;
      name: string;
   } | null;
   rejected_at: string | null;
   rejection_reason: string | null;
}
