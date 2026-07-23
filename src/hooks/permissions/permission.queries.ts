/** @format */

import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "../../config/reactQueryKeys";
import { permissionService } from "../../services/permissionService";

const permissionKeys = reactQueryKeys.permissions;

export const usePermissionsDictionary = (options?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: permissionKeys.dictionary(),
		queryFn: () => permissionService.getDictionary(),
		enabled: options?.enabled !== false,
		staleTime: 10 * 60 * 1000,
	});
};

export const useListPermissions = (
	filters?: {
		page?: number;
		limit?: number;
		search?: string;
	},
	options?: {
		enabled?: boolean;
	}
) => {
	return useQuery({
		queryKey: permissionKeys.list(filters),
		queryFn: () => permissionService.list(filters),
		enabled: options?.enabled !== false,
		staleTime: 5 * 60 * 1000,
	});
};
