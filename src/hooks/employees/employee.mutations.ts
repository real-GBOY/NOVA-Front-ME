/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "../../config/reactQueryKeys";
import {
   employeeService,
   type AddAttendanceRequest,
   type AddHourLeaveRequest,
   type AddOvertimeRequest,
   type AddTimeOffRequest,
   type ExtendContractRequest,
   type UploadEmployeeDocumentRequest,
   type UpdateEmployeeRequest,
} from "../../services/employeeService";

const employeeKeys = reactQueryKeys.employees;

// POST - Add attendance log
export const useAddAttendance = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         id,
         payload,
      }: {
         id: string | number;
         payload: AddAttendanceRequest;
      }) => employeeService.addAttendance(id, payload),
      onSuccess: (_, { id }) => {
         // Invalidate employee details to refresh attendance data
         queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
         // Invalidate attendance timeline to refresh the timeline view
         queryClient.invalidateQueries({
            queryKey: employeeKeys.attendanceTimeline(id),
         });
         // Invalidate requests dashboard attendance list to show the new request
         queryClient.invalidateQueries({
            queryKey: reactQueryKeys.requests.attendance.lists(),
         });
         // Invalidate attendance stats
         queryClient.invalidateQueries({
            queryKey: reactQueryKeys.requests.attendance.stats(),
         });
      },
   });
};

// POST - Add overtime
export const useAddOvertime = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         id,
         payload,
      }: {
         id: string | number;
         payload: AddOvertimeRequest;
      }) => employeeService.addOvertime(id, payload),
      onSuccess: (_, { id }) => {
         // Invalidate employee details to refresh overtime data
         queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
         // Invalidate attendance timeline to refresh the timeline view (overtime appears there too)
         queryClient.invalidateQueries({
            queryKey: employeeKeys.attendanceTimeline(id),
         });
         // Invalidate overtime summary to refresh the overtime tab
         queryClient.invalidateQueries({
            queryKey: employeeKeys.overtimeSummary(id),
         });
         // Invalidate requests dashboard overtime list to show the new request
         queryClient.invalidateQueries({
            queryKey: reactQueryKeys.requests.overtime.lists(),
         });
         // Invalidate overtime stats
         queryClient.invalidateQueries({
            queryKey: reactQueryKeys.requests.overtime.stats(),
         });
      },
   });
};

// POST - Add time-off
export const useAddTimeOff = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         id,
         payload,
      }: {
         id: string | number;
         payload: AddTimeOffRequest;
      }) => employeeService.addTimeOff(id, payload),
      onSuccess: (_, { id }) => {
         // Invalidate employee details to refresh time-off data
         queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
         // Invalidate attendance timeline to refresh the timeline view
         queryClient.invalidateQueries({
            queryKey: employeeKeys.attendanceTimeline(id),
         });
         // Invalidate time-off summary to refresh the time-off tab
         queryClient.invalidateQueries({
            queryKey: employeeKeys.timeOffSummary(id),
         });
         // Invalidate requests dashboard time-off list to show the new request
         queryClient.invalidateQueries({
            queryKey: reactQueryKeys.requests.timeOff.lists(),
         });
         // Invalidate time-off stats
         queryClient.invalidateQueries({
            queryKey: reactQueryKeys.requests.timeOff.stats(),
         });
      },
   });
};

// POST - Add hour leave (admin on behalf)
export const useAddHourLeave = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         id,
         payload,
      }: {
         id: string | number;
         payload: AddHourLeaveRequest;
      }) => employeeService.addHourLeave(id, payload),
      onSuccess: (_, { id }) => {
         queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
         queryClient.invalidateQueries({
            queryKey: employeeKeys.attendanceTimeline(id),
         });
         queryClient.invalidateQueries({
            queryKey: employeeKeys.timeOffSummary(id),
         });
         queryClient.invalidateQueries({
            queryKey: reactQueryKeys.requests.timeOff.lists(),
         });
         queryClient.invalidateQueries({
            queryKey: reactQueryKeys.requests.timeOff.stats(),
         });
      },
   });
};

// POST - Extend contract
export const useExtendContract = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         id,
         payload,
      }: {
         id: string | number;
         payload: ExtendContractRequest;
      }) => employeeService.extendContract(id, payload),
      onSuccess: (_, { id }) => {
         // Invalidate contract to refresh contract data
         queryClient.invalidateQueries({
            queryKey: employeeKeys.contract(id),
         });
      },
   });
};

// POST - Upload employee document
export const useUploadEmployeeDocument = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         id,
         payload,
      }: {
         id: string | number;
         payload: UploadEmployeeDocumentRequest;
      }) => employeeService.addDocument(id, payload),
      onSuccess: (_, { id }) => {
         queryClient.invalidateQueries({
            queryKey: employeeKeys.documents(id),
         });
      },
   });
};

// PATCH - Rename employee document
export const useRenameEmployeeDocument = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         employeeId,
         documentId,
         name,
      }: {
         employeeId: string | number;
         documentId: string | number;
         name: string;
      }) => employeeService.renameDocument(employeeId, documentId, name),
      onSuccess: (_, { employeeId }) => {
         queryClient.invalidateQueries({
            queryKey: employeeKeys.documents(employeeId),
         });
      },
   });
};

// DELETE - Delete employee document
export const useDeleteEmployeeDocument = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         employeeId,
         documentId,
      }: {
         employeeId: string | number;
         documentId: string | number;
      }) => employeeService.deleteDocument(employeeId, documentId),
      onSuccess: (_, { employeeId }) => {
         queryClient.invalidateQueries({
            queryKey: employeeKeys.documents(employeeId),
         });
         queryClient.invalidateQueries({
            queryKey: employeeKeys.detail(employeeId),
         });
         queryClient.invalidateQueries({
            queryKey: [...employeeKeys.detail(employeeId), "details"],
         });
      },
   });
};

// DELETE - Deactivate employee
export const useDeleteEmployee = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (id: string | number) => employeeService.delete(id),
      onSuccess: (_, id) => {
         // Refresh employee list and detail cache
         queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
         queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
      },
   });
};

// PATCH - Reset permissions
export const useResetEmployeePermissions = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (id: string | number) => employeeService.resetPermissions(id),
      onSuccess: (_, id) => {
         queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
         queryClient.invalidateQueries({
            queryKey: [...employeeKeys.detail(id), "permissions"],
         });
         queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      },
   });
};

// PUT - Update employee permissions
export const useUpdateEmployeePermissions = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         id,
         payload,
      }: {
         id: string | number;
         payload: {
            add_permission_ids?: number[];
            add_permissions?: Array<{ permission_id: number; scope?: string }>;
            remove_permission_ids?: number[];
         };
      }) => employeeService.updatePermissions(id, payload),
      onSuccess: (_, { id }) => {
         queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
         queryClient.invalidateQueries({
            queryKey: [...employeeKeys.detail(id), "permissions"],
         });
         queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      },
   });
};

// PUT - Update employee
export const useUpdateEmployee = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         id,
         payload,
      }: {
         id: string | number;
         payload: UpdateEmployeeRequest;
      }) => employeeService.update(id, payload),
      onSuccess: (_, { id }) => {
         queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
         queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      },
   });
};

// PUT - Update residency permit
export const useUpdateResidency = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         permitId,
         payload,
      }: {
         permitId: string | number;
         payload: {
            permit_number: string;
            permit_type: string | null;
            issue_date: string;
            expiration_date: string;
            country: string | null;
            status: string;
            document_file_id?: number | null;
            residency_documents?: Array<{
               fileId: number;
               token: string;
               purpose?: string;
               fileName?: string;
               fileSize?: number;
               fileType?: string;
               fileUrl?: string;
               key?: string;
            }>;
            residency_document_ids?: number[];
         };
         employeeId: string | number;
      }) => employeeService.updateResidency(permitId, payload),
      onSuccess: (_, { employeeId }) => {
         queryClient.invalidateQueries({
            queryKey: [...employeeKeys.detail(employeeId), "details"],
         });
      },
   });
};
