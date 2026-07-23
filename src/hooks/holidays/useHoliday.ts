/** @format */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	holidayService,
	CreateHolidayRequest,
	UpdateHolidayRequest,
} from "../../services/holidayService";
import { toast } from "@/utilities/toast";

export const useHoliday = () => {
	const queryClient = useQueryClient();

	const useListHolidays = (filters?: {
		page?: number;
		limit?: number;
		search?: string;
		year?: number | number[];
		month?: number | number[];
		sort_by?: string;
		order?: "asc" | "desc";
	}) => {
		return useQuery({
			queryKey: ["holidays", filters],
			queryFn: () => holidayService.list(filters),
		});
	};

	const useGetHolidayById = (
		id: string | number,
		options?: { enabled?: boolean }
	) => {
		return useQuery({
			queryKey: ["holiday", id],
			queryFn: () => holidayService.getById(id),
			enabled: options?.enabled,
		});
	};

	const useCreateHoliday = () => {
		return useMutation({
			mutationFn: (data: CreateHolidayRequest) => holidayService.create(data),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["holidays"] });
				toast.success("Holiday created successfully");
			},
			onError: (error: any) => {
				toast.error(error.response?.data?.message || "Failed to create holiday");
			},
		});
	};

	const useUpdateHoliday = () => {
		return useMutation({
			mutationFn: ({
				id,
				data,
			}: {
				id: string | number;
				data: UpdateHolidayRequest;
			}) => holidayService.update(id, data),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["holidays"] });
				toast.success("Holiday updated successfully");
			},
			onError: (error: any) => {
				toast.error(error.response?.data?.message || "Failed to update holiday");
			},
		});
	};

	const useDeleteHoliday = () => {
		return useMutation({
			mutationFn: (id: string | number) => holidayService.delete(id),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["holidays"] });
				toast.success("Holiday deleted successfully");
			},
			onError: (error: any) => {
				toast.error(error.response?.data?.message || "Failed to delete holiday");
			},
		});
	};

	return {
		useListHolidays,
		useGetHolidayById,
		useCreateHoliday,
		useUpdateHoliday,
		useDeleteHoliday,
	};
};
