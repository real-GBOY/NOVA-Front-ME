/** @format */

import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import { reactQueryKeys } from "../../config/reactQueryKeys";
import { employeeService } from "../../services/employeeService";
import { AxiosError } from "axios";

const employeeKeys = reactQueryKeys.employees;

// GET - List employees
export const useListEmployees = (
	filters?: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string | string[];
		role_id?: number | number[];
		team_id?: number;
		teamId?: number;
		job_title_id?: number | number[];
		permission_status?: "Role" | "Override";
		joined_at_from?: string;
		joined_at_to?: string;
		sort_by?: string;
		sort_order?: "asc" | "desc";
	},
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: employeeKeys.list(filters),
      queryFn: async () => {
         const response = await employeeService.list(filters);
         return response;
      },
      enabled: options?.enabled !== false,
      staleTime: 5 * 60 * 1000, // 5 minutes
   });

// GET - Get employee by ID (basic info)
export const useGetEmployeeById = (
   id: string | number,
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: employeeKeys.detail(id),
      queryFn: async () => {
         const response = await employeeService.getById(id);
         return response;
      },
      enabled: options?.enabled !== false && !!id,
      retry: (failureCount, error: unknown) => {
         // Don't retry on 404 errors
         if (error instanceof AxiosError && error.response?.status === 404) {
            return false;
         }
         return failureCount < 2;
      },
   });

// GET - Get employee details by ID
export const useGetEmployeeDetails = (
   id: string | number,
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: [...employeeKeys.detail(id), "details"],
      queryFn: async () => {
         const response = await employeeService.getByIdDetails(id);
         return response;
      },
      enabled: options?.enabled !== false && !!id,
      staleTime: 1000 * 60 * 5, // 5 minutes - use prefetched data without refetching
      retry: (failureCount, error: unknown) => {
         // Don't retry on 404 errors
         if (error instanceof AxiosError && error.response?.status === 404) {
            return false;
         }
         return failureCount < 2;
      },
   });

// GET - Get employee contract by ID
export const useGetEmployeeContract = (
   id: string | number,
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: employeeKeys.contract(id),
      queryFn: async () => {
         const response = await employeeService.getContract(id);
         return response;
      },
      enabled: options?.enabled !== false && !!id,
      retry: (failureCount, error: unknown) => {
         // Don't retry on 404 errors
         if (error instanceof AxiosError && error.response?.status === 404) {
            return false;
         }
         return failureCount < 2;
      },
   });

// GET - Get employee documents by ID
export const useGetEmployeeDocuments = (
   id: string | number,
   params?: any,
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: [...employeeKeys.documents(id), params],
      queryFn: async () => {
         const response = await employeeService.getDocuments(id, params);
         return response;
      },
      enabled: options?.enabled !== false && !!id,
      retry: (failureCount, error: unknown) => {
         if (error instanceof AxiosError && error.response?.status === 404) {
            return false;
         }
         return failureCount < 2;
      },
   });

// GET - Get employees dictionary (for dropdowns)
export const useEmployeeDictionary = (
   filters?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      role_id?: number;
      team_id?: number;
      teamId?: number;
   },
   options?: { enabled?: boolean }
) =>
   useQuery({
      queryKey: [...employeeKeys.all, "dictionary", filters],
      queryFn: () => employeeService.getDictionary(filters),
      enabled: options?.enabled !== false,
      placeholderData: keepPreviousData,
      staleTime: 5 * 60 * 1000, // 5 minutes
   });

// GET - Get attendance timeline
export const useGetAttendanceTimeline = (
   id: string | number,
   params?: Record<string, unknown>,
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: [...employeeKeys.attendanceTimeline(id), params],
      queryFn: async () => {
         const response = await employeeService.getAttendanceTimeline(id, params);
         return response;
      },
      enabled: options?.enabled !== false && !!id,
      retry: (failureCount, error: unknown) => {
         // Don't retry on 404 errors
         if (error instanceof AxiosError && error.response?.status === 404) {
            return false;
         }
         return failureCount < 2;
      },
      staleTime: 0, // Always consider data stale to refetch after mutations
      refetchOnMount: true, // Refetch when component mounts
   });

// GET - Get employee current shift (with assignment metadata)
export const useGetEmployeeCurrentShift = (
   id: string | number,
   params?: {
      date?: string;
   },
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: employeeKeys.currentShift(id, params),
      queryFn: async () => {
         const response = await employeeService.getCurrentShift(id, params);
         return response;
      },
      enabled: options?.enabled !== false && !!id,
      retry: (failureCount, error: unknown) => {
         // Don't retry on 404 errors
         if (error instanceof AxiosError && error.response?.status === 404) {
            return false;
         }
         return failureCount < 2;
      },
      staleTime: 0,
   });

// GET - Get time off summary
export const useGetTimeOffSummary = (
   id: string | number,
   params?: Record<string, unknown>,
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: [...employeeKeys.timeOffSummary(id), params],
      queryFn: async () => {
         const response = await employeeService.getTimeOffSummary(id, params);
         return response;
      },
      enabled: options?.enabled !== false && !!id,
      retry: (failureCount, error: unknown) => {
         // Don't retry on 404 errors
         if (error instanceof AxiosError && error.response?.status === 404) {
            return false;
         }
         return failureCount < 2;
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
   });

// GET - Get overtime summary
export const useGetOvertimeSummary = (
   id: string | number,
   params?: Record<string, unknown>,
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: [...employeeKeys.overtimeSummary(id), params],
      queryFn: async () => {
         const response = await employeeService.getOvertimeSummary(id, params);
         return response;
      },
      enabled: options?.enabled !== false && !!id,
      retry: (failureCount, error: unknown) => {
         // Don't retry on 404 errors
         if (error instanceof AxiosError && error.response?.status === 404) {
            return false;
         }
         return failureCount < 2;
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
   });

// GET - Get employee stats
export const useGetEmployeeStats = (options?: { enabled?: boolean }) =>
   useQuery({
      queryKey: [...employeeKeys.all, "stats"],
      queryFn: () => employeeService.getStats(),
      enabled: options?.enabled !== false,
      staleTime: 5 * 60 * 1000, // 5 minutes
   });

// GET - Get employee assets
export const useGetEmployeeAssets = (
   id: string | number,
   params?: Record<string, unknown>,
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: [...employeeKeys.assets(id), params],
      queryFn: async () => {
         const response = await employeeService.getAssets(id, params);
         return response;
      },
      enabled: options?.enabled !== false && !!id,
      retry: (failureCount, error: unknown) => {
         // Don't retry on 404 errors
         if (error instanceof AxiosError && error.response?.status === 404) {
            return false;
         }
         return failureCount < 2;
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
   });

// GET - Get employee permissions
export const useGetEmployeePermissions = (
   id: string | number,
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: [...employeeKeys.detail(id), "permissions"],
      queryFn: async () => {
         const response = await employeeService.getPermissions(id);
         return response;
      },
      enabled: options?.enabled !== false && !!id,
      retry: (failureCount, error: unknown) => {
         if (error instanceof AxiosError && error.response?.status === 404) {
            return false;
         }
         return failureCount < 2;
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
   });

// PUT - Update employee profile
export const useUpdateEmployeeProfile = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         id,
         payload,
      }: {
         id: string | number;
         payload: Record<string, unknown>;
      }) => employeeService.updateProfile(id, payload),
      onSuccess: (_, { id }) => {
         queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
      },
   });
};

// POST - Request contact update
export const useRequestContactUpdate = () => {
   return useMutation({
      mutationFn: ({
         id,
         payload,
      }: {
         id: string | number;
         payload: Record<string, unknown>;
      }) => employeeService.requestContactUpdate(id, payload),
   });
};

// POST - Verify contact update
export const useVerifyContactUpdate = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         id,
         payload,
      }: {
         id: string | number;
         payload: Record<string, unknown>;
      }) => employeeService.verifyContactUpdate(id, payload),
      onSuccess: (_, { id }) => {
         queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
      },
   });
};
