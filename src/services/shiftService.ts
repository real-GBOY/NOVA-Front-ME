/** @format */

import apiClient from "../config/axios";
import endPoints from "../config/endPoints";

// Types
export interface ShiftSegment {
   segment_id?: number;
   shift_id?: number;
   weekday: number; // 0-6 (Sunday-Saturday)
   start_time: string; // HH:mm:ss or HH:mm
   end_time: string; // HH:mm:ss or HH:mm
   break_minutes: number | null;
   created_at?: string;
   updated_at?: string;
}

export interface ShiftAssignment {
   assignment_id: number;
   assignment_type: "Employee" | "Team" | "OfficeLocation";
   employee_id: number | null;
   team_id: number | null;
}

export interface Shift {
   shift_id: number;
   name: string;
   description: string | null;
   timezone: string;
   working_days_mask: number;
   office_location_id: number | null;
   is_default: boolean;
   created_by: number;
   archived_at: string | null;
   created_at: string;
   updated_at: string;
   segments: ShiftSegment[];
   assignments?: ShiftAssignment[];
}

export interface CreateShiftRequest {
   name: string;
   description?: string;
   timezone: string;
   working_days_mask?: number;
   office_location_id: number;
   is_default: boolean;
   segments: Array<{
      weekday: number;
      start_time: string;
      end_time: string;
      break_minutes: number | null;
   }>;
}

export interface UpdateShiftRequest {
   name?: string;
   description?: string;
   segments?: Array<{
      weekday: number;
      start_time: string;
      end_time: string;
      break_minutes: number | null;
   }>;
}

export interface AssignEmployeesRequest {
   employeeIds: number[];
}

export interface AssignedEmployee {
   employee_id: number;
   first_name: string;
   last_name: string;
   avatar: string | null;
   effective_from: string;
   effective_to: string | null;
}

export interface ShiftListResponse {
   data: Shift[];
}

export interface ShiftResponse {
   data: Shift;
}

export interface AssignedEmployeesResponse {
   data: AssignedEmployee[];
}

export interface ShiftScheduleParams {
   start_date: string;
   end_date: string;
   employee_id?: number | string;
}

export interface ShiftScheduleResponse {
   data: unknown;
}

// Service functions
export const shiftService = {
   // GET - List shifts
   list: async (filters?: {
      search?: string;
      sort_by?: string;
      order?: "asc" | "desc";
   }): Promise<ShiftListResponse> => {
      // Filter out undefined values to avoid sending them as query params
      const params = Object.fromEntries(
         Object.entries(filters || {}).filter(
            ([_, value]) => value !== undefined,
         ),
      );
      const response = await apiClient.get(endPoints.shifts.getAll, {
         params,
      });
      return response.data;
   },

   // GET - Get shift by ID
   getById: async (id: string | number): Promise<ShiftResponse> => {
      const response = await apiClient.get(endPoints.shifts.getById(id));
      return response.data;
   },

   // POST - Create shift
   create: async (payload: CreateShiftRequest): Promise<ShiftResponse> => {
      const response = await apiClient.post(endPoints.shifts.create, payload);
      return response.data;
   },

   // PUT - Update shift
   update: async (
      id: string | number,
      payload: UpdateShiftRequest,
   ): Promise<ShiftResponse> => {
      const response = await apiClient.put(
         endPoints.shifts.update(id),
         payload,
      );
      return response.data;
   },

   // PUT - Archive shift
   archive: async (id: string | number): Promise<ShiftResponse> => {
      const response = await apiClient.put(endPoints.shifts.archive(id));
      return response.data;
   },

   // POST - Assign employees to shift
   assignEmployees: async (
      id: string | number,
      payload: AssignEmployeesRequest,
   ): Promise<void> => {
      await apiClient.post(endPoints.shifts.assignEmployees(id), payload);
   },

   // GET - Get employees assigned to shift
   getAssignedEmployees: async (
      id: string | number,
   ): Promise<AssignedEmployeesResponse> => {
      const response = await apiClient.get(endPoints.shifts.getEmployees(id));
      return response.data;
   },

   // GET - Shift schedule for date range
   getSchedule: async (
      params: ShiftScheduleParams,
   ): Promise<ShiftScheduleResponse> => {
      const response = await apiClient.get(endPoints.shifts.schedule, {
         params,
      });
      return response.data;
   },

   // GET - Get current user's shift
   getCurrent: async (): Promise<ShiftResponse> => {
      const response = await apiClient.get(endPoints.shifts.getCurrent);
      return response.data;
   },

   // GET - Get shift by employee ID
   getByEmployeeId: async (
      employeeId: string | number,
   ): Promise<ShiftResponse> => {
      const response = await apiClient.get(
         endPoints.shifts.getByEmployeeId(employeeId),
      );
      return response.data;
   },
};
