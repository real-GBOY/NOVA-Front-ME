/** @format */

import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "../../config/reactQueryKeys";
import { serviceService } from "../../services/serviceService";

const serviceKeys = reactQueryKeys.services;

export const useListServices = (
	filters?: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string | string[];
		category_ids?: number[] | string[];
		sort_by?: string;
		sort_order?: "asc" | "desc";
	},
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: serviceKeys.list(filters),
      queryFn: () => serviceService.list(filters),
      enabled: options?.enabled !== false,
      staleTime: 0, // Always consider data stale to allow immediate refetch after mutations
      refetchOnMount: true, // Refetch when component mounts
      refetchOnWindowFocus: false, // Don't refetch on window focus to avoid unnecessary requests
   });

export const useGetServiceById = (
   id: string | number,
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: serviceKeys.detail(id),
      queryFn: () => serviceService.getById(id),
      enabled: options?.enabled !== false && !!id,
      staleTime: 5 * 60 * 1000,
   });
