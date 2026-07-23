/** @format */

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { requestsService } from "@/services/requestsService";
import type { AttendanceRequestsResponse } from "@/services/requestsService";
import type {
   AdminAttendanceCheckInPayload,
   AdminAttendanceCheckOutPayload,
   AttendanceBreakPayload,
} from "@/services/requestsService";
import type {
   AttendanceDetailResponse,
   OvertimeDetail,
   OvertimeListResponse,
   OvertimeRequest,
   VacationDetail,
   VacationListResponse,
   VacationRequest,
} from "@/types/requests";

const requestKeys = reactQueryKeys.requests;

export const useRequests = () => {
   const queryClient = useQueryClient();
   const mapOvertimeDetailToListItem = (
      detail: OvertimeDetail
   ): OvertimeRequest => ({
      id: detail.id,
      employee: detail.employee,
      date: detail.date,
      start_time: detail.start_time,
      end_time: detail.end_time,
      hours: detail.hours,
      reason: detail.reason,
      status: detail.status,
      created_at: detail.created_at,
   });

   const updateOvertimeCache = (detail: OvertimeDetail) => {
      const listItem = mapOvertimeDetailToListItem(detail);

      queryClient.setQueriesData<OvertimeListResponse>(
         { queryKey: requestKeys.overtime.lists() },
         (current) => {
            if (!current?.data) return current;
            const nextData = current.data.map((item) =>
               item.id === listItem.id ? { ...item, ...listItem } : item
            );
            return { ...current, data: nextData };
         }
      );

      queryClient.setQueryData(requestKeys.overtime.detail(detail.id), detail);
   };

   const mapAttendanceDetailToListItem = (
      detail: AttendanceDetailResponse
   ): AttendanceRequestsResponse["data"][number] => ({
      id: detail.id,
      employee: {
         id: detail.employee.id,
         name: detail.employee.name,
         email: detail.employee.email,
         avatar: detail.employee.avatar,
         job_title: detail.employee.job_title,
      },
      log_date: detail.log_date,
      check_in_time: detail.check_in?.time || "",
      check_out_time: detail.check_out?.time || "",
      status: detail.status,
      created_at: detail.created_at,
   });

   const updateAttendanceCache = (detail: AttendanceDetailResponse) => {
      const listItem = mapAttendanceDetailToListItem(detail);

      queryClient.setQueriesData<AttendanceRequestsResponse>(
         { queryKey: requestKeys.attendance.lists() },
         (current) => {
            if (!current?.data) return current;
            const nextData = current.data.map((item) =>
               item.id === listItem.id
                  ? {
                       ...item,
                       ...listItem,
                       zone_status: item.zone_status,
                       gps_status: item.gps_status,
                    }
                  : item
            );
            return { ...current, data: nextData };
         }
      );

      queryClient.setQueryData(requestKeys.attendance.detail(detail.id), detail);
   };

   const mapTimeOffDetailToListItem = (
      detail: VacationDetail
   ): VacationRequest => ({
      id: detail.id,
      employee: detail.employee,
      vacation_type: detail.vacation_type,
      start_date: detail.start_date,
      end_date: detail.end_date,
      days_requested: detail.days_requested,
      reason: detail.reason,
      status: detail.status,
      has_attachment: Boolean(detail.attachment),
      attachment_filename: detail.attachment?.filename || null,
      created_at: detail.created_at || "",
   });

   const updateTimeOffCache = (detail: VacationDetail) => {
      const listItem = mapTimeOffDetailToListItem(detail);

      queryClient.setQueriesData<VacationListResponse>(
         { queryKey: requestKeys.timeOff.lists() },
         (current) => {
            if (!current?.data) return current;
            const nextData = current.data.map((item) =>
               item.id === listItem.id
                  ? {
                       ...item,
                       ...listItem,
                       created_at: listItem.created_at || item.created_at,
                       attachment_filename:
                          listItem.attachment_filename || item.attachment_filename,
                       has_attachment:
                          listItem.has_attachment ?? item.has_attachment,
                    }
                  : item
            );
            return { ...current, data: nextData };
         }
      );

      queryClient.setQueryData(requestKeys.timeOff.detail(detail.id), detail);
   };

   // GET - Attendance Requests
   const useAttendanceRequests = (
      params?: any,
      options?: { enabled?: boolean }
   ) =>
      useQuery({
         queryKey: requestKeys.attendance.list(params),
         queryFn: async () => {
            const response = await requestsService.getAttendanceRequests(params);
            return response; // Return whole response with data and pagination
         },
         enabled: options?.enabled !== false,
         placeholderData: keepPreviousData,
         staleTime: 5 * 60 * 1000, // 5 minutes
         refetchOnWindowFocus: false,
      });

   // GET - Time Off Requests
   const useTimeOffRequests = (params?: any, options?: { enabled?: boolean }) =>
      useQuery({
         queryKey: requestKeys.timeOff.list(params),
         queryFn: async () => {
            const response = await requestsService.getTimeOffRequests(params);
            return response; // Return whole response with data and pagination
         },
         enabled: options?.enabled !== false,
         placeholderData: keepPreviousData,
         staleTime: 5 * 60 * 1000,
         refetchOnWindowFocus: false,
      });

   // GET - Time Off Stats
   const useTimeOffStats = (options?: { enabled?: boolean }) =>
      useQuery({
         queryKey: requestKeys.timeOff.stats(),
         queryFn: async () => {
            const response = await requestsService.getTimeOffStats();
            return response;
         },
         enabled: options?.enabled !== false,
         staleTime: 2 * 60 * 1000,
         refetchOnWindowFocus: true,
      });

   // ============ Overtime Requests ============

   // GET - Overtime Requests List
   const useOvertimeRequests = (params?: any, options?: { enabled?: boolean }) =>
      useQuery({
         queryKey: requestKeys.overtime.list(params),
         queryFn: async () => {
            const response = await requestsService.getOvertimeRequests(params);
            return response; // Return whole response with data and pagination
         },
         enabled: options?.enabled !== false,
         placeholderData: keepPreviousData,
         staleTime: 5 * 60 * 1000,
         refetchOnWindowFocus: false,
      });

   // GET - Overtime Stats
   const useOvertimeStats = (options?: { enabled?: boolean }) =>
      useQuery({
         queryKey: requestKeys.overtime.stats(),
         queryFn: async () => {
            const response = await requestsService.getOvertimeStats();
            return response;
         },
         enabled: options?.enabled !== false,
         staleTime: 2 * 60 * 1000, // 2 minutes (stats change more frequently)
         refetchOnWindowFocus: true,
      });

   // GET - Single Time Off Request Detail
   const useTimeOffDetail = (id: number, options?: { enabled?: boolean }) =>
      useQuery({
         queryKey: requestKeys.timeOff.detail(id),
         queryFn: async () => {
            const response = await requestsService.getTimeOffById(id);
            return response;
         },
         enabled: options?.enabled !== false && !!id,
         staleTime: 5 * 60 * 1000,
         retry: (failureCount, error: unknown) => {
            // Don't retry on 404 errors
            if (
               error &&
               typeof error === "object" &&
               "response" in error &&
               error.response &&
               typeof error.response === "object" &&
               "status" in error.response &&
               error.response.status === 404
            ) {
               return false;
            }
            return failureCount < 2;
         },
      });

   // GET - Single Overtime Request Detail
   const useOvertimeDetail = (id: number, options?: { enabled?: boolean }) =>
      useQuery({
         queryKey: requestKeys.overtime.detail(id),
         queryFn: async () => {
            const response = await requestsService.getOvertimeById(id);
            return response;
         },
         enabled: options?.enabled !== false && !!id,
         staleTime: 5 * 60 * 1000,
         retry: (failureCount, error: unknown) => {
            // Don't retry on 404 errors
            if (
               error &&
               typeof error === "object" &&
               "response" in error &&
               error.response &&
               typeof error.response === "object" &&
               "status" in error.response &&
               error.response.status === 404
            ) {
               return false;
            }
            return failureCount < 2;
         },
      });

   // POST - Approve Attendance Request
   const useApproveAttendance = () =>
      useMutation({
         mutationKey: requestKeys.attendance.approve(),
         mutationFn: (id: number) => requestsService.approveAttendance(id),
         onSuccess: async (data, variables) => {

            try {
               const updatedDetail = await requestsService.getAttendanceRequestById(
                  variables
               );
               updateAttendanceCache(updatedDetail);
            } catch (error) {
               console.error("❌ Failed to refresh attendance record:", error);
               queryClient.invalidateQueries({
                  queryKey: requestKeys.attendance.lists(),
               });
            }

            queryClient.invalidateQueries({
               queryKey: requestKeys.attendance.stats(),
            });
         },
         onError: (error) => {
            console.error("❌ Error approving attendance:", error);
         },
      });

   // POST - Reject Attendance Request
   const useRejectAttendance = () =>
      useMutation({
         mutationKey: requestKeys.attendance.reject(),
         mutationFn: ({
            id,
            rejectionReason,
         }: {
            id: number;
            rejectionReason: string;
         }) => requestsService.rejectAttendance(id, rejectionReason),
         onSuccess: async (data, variables) => {

            try {
               const updatedDetail = await requestsService.getAttendanceRequestById(
                  variables.id
               );
               updateAttendanceCache(updatedDetail);
            } catch (error) {
               console.error("❌ Failed to refresh attendance record:", error);
               queryClient.invalidateQueries({
                  queryKey: requestKeys.attendance.lists(),
               });
            }

            queryClient.invalidateQueries({
               queryKey: requestKeys.attendance.stats(),
            });
         },
         onError: (error) => {
            console.error("❌ Error rejecting attendance:", error);
         },
      });

   // POST - Admin manual check-in (manage_attendance)
   const useAdminAttendanceCheckIn = () =>
      useMutation({
         mutationKey: [...requestKeys.attendance.all(), "adminCheckIn"],
         mutationFn: ({
            employeeId,
            payload,
         }: {
            employeeId: number | string;
            payload: AdminAttendanceCheckInPayload;
         }) => requestsService.adminCheckIn(payload),
         onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
               queryKey: reactQueryKeys.employees.attendanceTimeline(
                  variables.employeeId
               ),
            });
            queryClient.invalidateQueries({
               queryKey: requestKeys.attendance.lists(),
            });
            queryClient.invalidateQueries({
               queryKey: requestKeys.attendance.stats(),
            });
         },
         onError: (error) => {
            console.error("❌ Error admin check-in:", error);
         },
      });

   // POST - Admin manual check-out (manage_attendance)
   const useAdminAttendanceCheckOut = () =>
      useMutation({
         mutationKey: [...requestKeys.attendance.all(), "adminCheckOut"],
         mutationFn: ({
            employeeId,
            payload,
         }: {
            employeeId: number | string;
            payload: AdminAttendanceCheckOutPayload;
         }) => requestsService.adminCheckOut(payload),
         onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
               queryKey: reactQueryKeys.employees.attendanceTimeline(
                  variables.employeeId
               ),
            });
            queryClient.invalidateQueries({
               queryKey: requestKeys.attendance.lists(),
            });
            queryClient.invalidateQueries({
               queryKey: requestKeys.attendance.stats(),
            });
         },
         onError: (error) => {
            console.error("❌ Error admin check-out:", error);
         },
      });

   // POST - Start break (self-service)
   const useAttendanceBreakStart = () =>
      useMutation({
         mutationKey: [...requestKeys.attendance.all(), "breakStart"],
         mutationFn: (payload: AttendanceBreakPayload) =>
            requestsService.startAttendanceBreak(payload),
         onSuccess: () => {
            queryClient.invalidateQueries({
               queryKey: requestKeys.attendance.lists(),
            });
            queryClient.invalidateQueries({
               queryKey: requestKeys.attendance.stats(),
            });
         },
      });

   // POST - End break (self-service)
   const useAttendanceBreakEnd = () =>
      useMutation({
         mutationKey: [...requestKeys.attendance.all(), "breakEnd"],
         mutationFn: (payload: AttendanceBreakPayload) =>
            requestsService.endAttendanceBreak(payload),
         onSuccess: () => {
            queryClient.invalidateQueries({
               queryKey: requestKeys.attendance.lists(),
            });
            queryClient.invalidateQueries({
               queryKey: requestKeys.attendance.stats(),
            });
         },
      });

   // POST - Approve Time Off Request
   const useApproveTimeOff = () =>
      useMutation({
         mutationKey: requestKeys.timeOff.approve(),
         mutationFn: (id: number) => requestsService.approveTimeOff(id),
         onSuccess: async (data, variables) => {

            try {
               const updatedDetail = await requestsService.getTimeOffById(variables);
               updateTimeOffCache(updatedDetail);
            } catch (error) {
               console.error("❌ Failed to refresh time off record:", error);
               queryClient.invalidateQueries({
                  queryKey: requestKeys.timeOff.lists(),
               });
            }

            queryClient.invalidateQueries({
               queryKey: requestKeys.timeOff.stats(),
            });
            // Invalidate employee time-off summary
            queryClient.invalidateQueries({
               queryKey: [...reactQueryKeys.employees.all, "timeOffSummary"],
            });
         },
         onError: (error) => {
            console.error("❌ Error approving time off:", error);
         },
      });

   // POST - Reject Time Off Request
   const useRejectTimeOff = () =>
      useMutation({
         mutationKey: requestKeys.timeOff.reject(),
         mutationFn: ({
            id,
            rejectionReason,
         }: {
            id: number;
            rejectionReason: string;
         }) => requestsService.rejectTimeOff(id, rejectionReason),
         onSuccess: async (data, variables) => {

            try {
               const updatedDetail = await requestsService.getTimeOffById(variables.id);
               updateTimeOffCache(updatedDetail);
            } catch (error) {
               console.error("❌ Failed to refresh time off record:", error);
               queryClient.invalidateQueries({
                  queryKey: requestKeys.timeOff.lists(),
               });
            }

            queryClient.invalidateQueries({
               queryKey: requestKeys.timeOff.stats(),
            });
            // Invalidate employee time-off summary
            queryClient.invalidateQueries({
               queryKey: [...reactQueryKeys.employees.all, "timeOffSummary"],
            });
         },
         onError: (error) => {
            console.error("❌ Error rejecting time off:", error);
         },
      });

   // POST - Approve Overtime Request
   const useApproveOvertime = () =>
      useMutation({
         mutationKey: requestKeys.overtime.approve(),
         mutationFn: (id: number) => requestsService.approveOvertime(id),
         onSuccess: async (data, variables) => {

            try {
               const updatedDetail = await requestsService.getOvertimeById(variables);
               updateOvertimeCache(updatedDetail);
            } catch (error) {
               console.error("❌ Failed to refresh overtime record:", error);
               queryClient.invalidateQueries({
                  queryKey: requestKeys.overtime.lists(),
               });
            }

            // Invalidate overtime stats
            queryClient.invalidateQueries({
               queryKey: requestKeys.overtime.stats(),
            });
            // Invalidate employee overtime summary
            queryClient.invalidateQueries({
               queryKey: [...reactQueryKeys.employees.all, "overtimeSummary"],
            });
         },
         onError: (error) => {
            console.error("❌ Error approving overtime:", error);
         },
      });

   // POST - Reject Overtime Request
   const useRejectOvertime = () =>
      useMutation({
         mutationKey: requestKeys.overtime.reject(),
         mutationFn: ({
            id,
            rejectionReason,
         }: {
            id: number;
            rejectionReason: string;
         }) => requestsService.rejectOvertime(id, rejectionReason),
         onSuccess: async (data, variables) => {

            try {
               const updatedDetail = await requestsService.getOvertimeById(variables.id);
               updateOvertimeCache(updatedDetail);
            } catch (error) {
               console.error("❌ Failed to refresh overtime record:", error);
               queryClient.invalidateQueries({
                  queryKey: requestKeys.overtime.lists(),
               });
            }

            // Invalidate overtime stats
            queryClient.invalidateQueries({
               queryKey: requestKeys.overtime.stats(),
            });
            // Invalidate employee overtime summary
            queryClient.invalidateQueries({
               queryKey: [...reactQueryKeys.employees.all, "overtimeSummary"],
            });
         },
         onError: (error) => {
            console.error("❌ Error rejecting overtime:", error);
         },
      });

   return {
      useAttendanceRequests,
      useTimeOffRequests,
      useTimeOffStats,
      useTimeOffDetail,
      useOvertimeRequests,
      useOvertimeStats,
      useOvertimeDetail,
      useApproveAttendance,
      useRejectAttendance,
      useAdminAttendanceCheckIn,
      useAdminAttendanceCheckOut,
      useAttendanceBreakStart,
      useAttendanceBreakEnd,
      useApproveTimeOff,
      useRejectTimeOff,
      useApproveOvertime,
      useRejectOvertime,
   };
};
