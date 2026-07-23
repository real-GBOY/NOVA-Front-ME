/** @format */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   shiftService,
   CreateShiftRequest,
   UpdateShiftRequest,
   AssignEmployeesRequest,
   ShiftScheduleParams,
} from "../../services/shiftService";
import { toast } from "@/utilities/toast";
import { reactQueryKeys } from "@/config/reactQueryKeys";

export const useShifts = () => {
   const queryClient = useQueryClient();

   const useListShifts = (filters?: {
      search?: string;
      sort_by?: string;
      order?: "asc" | "desc";
   }) => {
      const normalizedFilters = filters || {};
      return useQuery({
         queryKey: ["shifts", normalizedFilters],
         queryFn: () => shiftService.list(normalizedFilters),
      });
   };

   const useGetShiftById = (
      id: string | number,
      options?: { enabled?: boolean },
   ) => {
      return useQuery({
         queryKey: ["shift", id],
         queryFn: () => shiftService.getById(id),
         enabled: options?.enabled,
      });
   };

   const useCreateShift = () => {
      return useMutation({
         mutationFn: (data: CreateShiftRequest) => shiftService.create(data),
         onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shifts"] });
            toast.success("Shift created successfully");
         },
         onError: (error: any) => {
            toast.error(
               error.response?.data?.message || "Failed to create shift",
            );
         },
      });
   };

   const useUpdateShift = () => {
      return useMutation({
         mutationFn: ({
            id,
            data,
         }: {
            id: string | number;
            data: UpdateShiftRequest;
         }) => shiftService.update(id, data),
         onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shifts"] });
            queryClient.invalidateQueries({ queryKey: ["shift"] });
            toast.success("Shift updated successfully");
         },
         onError: (error: any) => {
            toast.error(
               error.response?.data?.message || "Failed to update shift",
            );
         },
      });
   };

   const useArchiveShift = () => {
      return useMutation({
         mutationFn: (id: string | number) => shiftService.archive(id),
         onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shifts"] });
            queryClient.invalidateQueries({ queryKey: ["shift"] });
            toast.success("Shift archived successfully");
         },
         onError: (error: any) => {
            toast.error(
               error.response?.data?.message || "Failed to archive shift",
            );
         },
      });
   };

   const useAssignEmployees = () => {
      return useMutation({
         mutationFn: ({
            id,
            data,
         }: {
            id: string | number;
            data: AssignEmployeesRequest;
         }) => shiftService.assignEmployees(id, data),
         onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["shifts"] });
            queryClient.invalidateQueries({
               queryKey: ["shift", variables.id],
            });
            queryClient.invalidateQueries({
               queryKey: ["shift-employees"],
               exact: false,
            });
            queryClient.invalidateQueries({
               queryKey: ["shift-schedule"],
               exact: false,
            });
            if (variables.data?.employeeIds?.length) {
               variables.data.employeeIds.forEach((employeeId) => {
                  queryClient.invalidateQueries({
                     queryKey:
                        reactQueryKeys.employees.currentShift(employeeId),
                  });
                  queryClient.invalidateQueries({
                     queryKey: ["shift", "employee", employeeId],
                  });
                  queryClient.invalidateQueries({
                     queryKey: reactQueryKeys.employees.detail(employeeId),
                  });
               });
            }
            // Also invalidate employee details to refresh shift assignment
            queryClient.invalidateQueries({
               queryKey: ["employee"],
               exact: false,
            });
            toast.success("Employees assigned successfully");
         },
         onError: (error: any) => {
            toast.error(
               error.response?.data?.message || "Failed to assign employees",
            );
         },
      });
   };

   const useGetShiftEmployees = (
      id: string | number,
      options?: { enabled?: boolean },
   ) => {
      return useQuery({
         queryKey: ["shift-employees", id],
         queryFn: () => shiftService.getAssignedEmployees(id),
         enabled: options?.enabled,
      });
   };

   const useGetShiftSchedule = (
      params: ShiftScheduleParams | undefined,
      options?: { enabled?: boolean },
   ) => {
      return useQuery({
         queryKey: ["shift-schedule", params],
         queryFn: () => shiftService.getSchedule(params as ShiftScheduleParams),
         enabled: options?.enabled && !!params,
      });
   };

   const useGetCurrentUserShift = (options?: { enabled?: boolean }) => {
      return useQuery({
         queryKey: ["shift", "current"],
         queryFn: () => shiftService.getCurrent(),
         enabled: options?.enabled !== false,
      });
   };

   const useGetShiftByEmployeeId = (
      employeeId: string | number | undefined,
      options?: { enabled?: boolean },
   ) => {
      return useQuery({
         queryKey: ["shift", "employee", employeeId],
         queryFn: () =>
            shiftService.getByEmployeeId(employeeId as string | number),
         enabled: options?.enabled !== false && !!employeeId,
      });
   };

   return {
      useListShifts,
      useGetShiftById,
      useCreateShift,
      useUpdateShift,
      useArchiveShift,
      useAssignEmployees,
      useGetShiftEmployees,
      useGetShiftSchedule,
      useGetCurrentUserShift,
      useGetShiftByEmployeeId,
   };
};
