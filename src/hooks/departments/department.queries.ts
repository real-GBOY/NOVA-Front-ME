/** @format */

import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "../../config/reactQueryKeys";
import { departmentService } from "../../services/departmentService";

const departmentKeys = reactQueryKeys.departments;

export const useListDepartments = (
	filters?: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string | string[];
		sort_by?: string;
		sort_order?: "asc" | "desc";
	},
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: departmentKeys.list(filters),
      queryFn: () => departmentService.list(filters),
      enabled: options?.enabled !== false,
      staleTime: 0, // Always consider data stale to allow immediate refetch after mutations
      refetchOnMount: true, // Refetch when component mounts
      refetchOnWindowFocus: false, // Don't refetch on window focus to avoid unnecessary requests
   });

export const useGetDepartmentById = (
   id: string | number,
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: departmentKeys.detail(id),
      queryFn: () => departmentService.getById(id),
      enabled: options?.enabled !== false && !!id,
      staleTime: 5 * 60 * 1000,
   });
