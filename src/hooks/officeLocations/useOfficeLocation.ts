/** @format */

import {
	useQuery,
	useMutation,
	useQueryClient,
	type UseQueryOptions,
} from "@tanstack/react-query";
import {
	officeLocationService,
	UpdateOfficeLocationRequest,
} from "../../services/officeLocationService";
import { toast } from "@/utilities/toast";

export const useOfficeLocation = () => {
	const queryClient = useQueryClient();

	const useListOfficeLocations = () => {
		return useQuery({
			queryKey: ["officeLocations"],
			queryFn: () => officeLocationService.list(),
		});
	};

	type OfficeLocationQueryOptions = UseQueryOptions<
		OfficeLocation,
		unknown,
		OfficeLocation,
		[string, string | number]
	>;

	const useGetOfficeLocationById = (
		id: string | number,
		options?: OfficeLocationQueryOptions
	) => {
		const { enabled = true, ...queryOptions } = options ?? {};
		return useQuery({
			queryKey: ["officeLocation", id],
			queryFn: () => officeLocationService.getById(id),
			enabled,
			...queryOptions,
		});
	};

	const useUpdateOfficeLocation = () => {
		return useMutation({
			mutationFn: ({
				id,
				data,
			}: {
				id: string | number;
				data: UpdateOfficeLocationRequest;
			}) => officeLocationService.update(id, data),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["officeLocations"] });
				queryClient.invalidateQueries({ queryKey: ["officeLocation"] });
				toast.success("Company settings updated successfully");
			},
			onError: (error: any) => {
				toast.error(
					error.response?.data?.message || "Failed to update company settings"
				);
			},
		});
	};

	return {
		useListOfficeLocations,
		useGetOfficeLocationById,
		useUpdateOfficeLocation,
	};
};
