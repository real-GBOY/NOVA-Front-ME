/** @format */

import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";
import type {
   OvertimeListResponse,
   OvertimeStats,
   OvertimeDetail,
   OvertimeApprovalResponse,
   OvertimeRejectionResponse,
   VacationListResponse,
   VacationDetail,
   VacationApprovalResponse,
   VacationRejectionResponse,
   AttendanceDetailResponse,
   AttendanceStats,
   AttendanceApprovalResponse,
   AttendanceRejectionResponse,
   TimeOffStats,
} from "@/types/requests";

export interface ServiceParams {
   page?: number;
   limit?: number;
   sort_by?: string;
   sort_order?: "asc" | "desc";
   order?: "asc" | "desc";
   search?: string;
   status?: string;
   from_date?: string;
   to_date?: string;
   date_from?: string;
   date_to?: string;
   [key: string]: any;
}

export interface AttendanceRequestsResponse {
   data: Array<{
      id: string;
      employee: {
         id: number;
         name: string;
         email: string;
         avatar?: string | null;
         job_title?: string | null;
      };
      log_date: string;
      check_in_time: string;
      check_out_time: string;
      status: string;
      zone_status?: string | null;
      gps_status?: string | null;
      created_at: string;
   }>;
   pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
   };
}

export interface AdminAttendanceCheckInPayload {
   employee_id: number | string;
   log_date: string;
   check_in_time: string;
   location_id: number;
   comment?: string;
}

export interface AdminAttendanceCheckOutPayload {
   employee_id: number | string;
   log_date: string;
   check_out_time: string;
   location_id: number;
   comment?: string;
}

export interface AttendanceBreakPayload {
   log_date: string;
   break_time: string;
}

export const requestsService = {
   // GET - Fetch attendance requests
   getAttendanceRequests: async (params?: ServiceParams): Promise<AttendanceRequestsResponse> => {
      const response = await apiClient.get(endPoints.requests.attendance.getAll, { params });
      
      const backendData = response.data;
      const pagination = backendData.pagination || { page: 1, limit: 10, total: 0 };
      
      return {
         ...backendData,
         pagination: {
            ...pagination,
            page: Number(pagination.page),
            limit: Number(pagination.limit),
            total: pagination.total,
            total_pages: Math.ceil((pagination.total || 0) / (pagination.limit || 10))
         }
      };
   },

   // GET - Fetch single attendance request by ID
   getAttendanceRequestById: async (id: string | number): Promise<AttendanceDetailResponse> => {
      const response = await apiClient.get(endPoints.requests.attendance.getById(id));
      return response.data;
   },

   // GET - Fetch attendance stats
   getAttendanceStats: async (): Promise<AttendanceStats> => {
      const response = await apiClient.get(endPoints.requests.attendance.stats);
      return response.data;
   },

   // GET - Fetch time off requests (vacations)
   getTimeOffRequests: async (params?: ServiceParams): Promise<VacationListResponse> => {
      const response = await apiClient.get(endPoints.requests.timeOff.getAll, { params });

      const backendData = response.data;
      const pagination = backendData.pagination || { page: 1, limit: 10, total: 0 };
      
      return {
         ...backendData,
         pagination: {
            ...pagination,
            page: Number(pagination.page),
            limit: Number(pagination.limit),
            total: pagination.total,
            total_pages: Math.ceil((pagination.total || 0) / (pagination.limit || 10))
         }
      };
   },

   // GET - Fetch time off stats
   getTimeOffStats: async (): Promise<TimeOffStats> => {
      const response = await apiClient.get(endPoints.requests.timeOff.stats);
      return response.data;
   },

   // GET - Fetch single time off request by ID
   getTimeOffById: async (id: number): Promise<VacationDetail> => {
      const response = await apiClient.get(endPoints.requests.timeOff.getById(id));
      return response.data;
   },

   // ============ Overtime Requests ============

   // GET - Fetch all overtime requests
   getOvertimeRequests: async (params?: ServiceParams): Promise<OvertimeListResponse> => {
      const response = await apiClient.get(endPoints.requests.overtime.getAll, { params });

      const backendData = response.data;
      const pagination = backendData.pagination || { page: 1, limit: 10, total: 0 };
      
      return {
         ...backendData,
         pagination: {
            ...pagination,
            page: Number(pagination.page),
            limit: Number(pagination.limit),
            total: pagination.total,
            total_pages: Math.ceil((pagination.total || 0) / (pagination.limit || 10))
         }
      };
   },

   // GET - Fetch overtime stats
   getOvertimeStats: async (): Promise<OvertimeStats> => {
      const response = await apiClient.get(endPoints.requests.overtime.stats);
      return response.data;
   },

   // GET - Fetch single overtime request by ID
   getOvertimeById: async (id: number): Promise<OvertimeDetail> => {
      const response = await apiClient.get(
         endPoints.requests.overtime.getById(id)
      );
      return response.data;
   },

   // POST - Approve attendance request
   approveAttendance: async (id: number, comments?: string): Promise<AttendanceApprovalResponse> => {
      const response = await apiClient.post(
         endPoints.requests.attendance.approve(id),
         comments ? { comments } : {}
      );
      return response.data;
   },

   // POST - Reject attendance request
   rejectAttendance: async (
      id: number,
      comment: string
   ): Promise<AttendanceRejectionResponse> => {
      const response = await apiClient.post(
         endPoints.requests.attendance.reject(id),
         { comment }
      );
      return response.data;
   },

   // POST - Admin manual check-in (manage_attendance)
   adminCheckIn: async (payload: AdminAttendanceCheckInPayload): Promise<AttendanceDetailResponse> => {
      const response = await apiClient.post(
         endPoints.requests.attendance.adminCheckIn,
         payload
      );
      return response.data;
   },

   // POST - Admin manual check-out (manage_attendance)
   adminCheckOut: async (payload: AdminAttendanceCheckOutPayload): Promise<AttendanceDetailResponse> => {
      const response = await apiClient.post(
         endPoints.requests.attendance.adminCheckOut,
         payload
      );
      return response.data;
   },

   // POST - Start break (self-service)
   startAttendanceBreak: async (payload: AttendanceBreakPayload) => {
      const response = await apiClient.post(
         endPoints.requests.attendance.breakStart,
         payload
      );
      return response.data;
   },

   // POST - End break (self-service)
   endAttendanceBreak: async (payload: AttendanceBreakPayload) => {
      const response = await apiClient.post(
         endPoints.requests.attendance.breakEnd,
         payload
      );
      return response.data;
   },

   // POST - Approve time off request
   approveTimeOff: async (id: number, comments?: string): Promise<VacationApprovalResponse> => {
      const response = await apiClient.post(
         endPoints.requests.timeOff.approve(id),
         comments ? { comments } : {}
      );
      return response.data;
   },

   // POST - Reject time off request
   rejectTimeOff: async (
      id: number,
      rejectionReason: string
   ): Promise<VacationRejectionResponse> => {
      const response = await apiClient.post(
         endPoints.requests.timeOff.reject(id),
         { rejection_reason: rejectionReason }
      );
      return response.data;
   },

   // POST - Approve overtime request
   approveOvertime: async (id: number): Promise<OvertimeApprovalResponse> => {
      const response = await apiClient.post(
         endPoints.requests.overtime.approve(id)
      );
      return response.data;
   },

   // POST - Reject overtime request
   rejectOvertime: async (
      id: number,
      rejectionReason: string
   ): Promise<OvertimeRejectionResponse> => {
      const response = await apiClient.post(
         endPoints.requests.overtime.reject(id),
         { rejection_reason: rejectionReason }
      );
      return response.data;
   },
};
