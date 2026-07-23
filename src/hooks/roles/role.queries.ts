/** @format */

import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "../../config/reactQueryKeys";
import { roleService } from "../../services/roleService";

const roleKeys = reactQueryKeys.roles;

export const useListRoles = (
	filters?: {
		page?: number;
		limit?: number;
		search?: string;
		sort_by?: string;
		order?: "asc" | "desc";
		job_title_ids?: number[] | string[];
	},
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: roleKeys.list(filters),
		queryFn: () => roleService.list(filters),
		enabled: options?.enabled !== false,
		staleTime: 5 * 60 * 1000,
	});

export const useGetRoleById = (
	id: string | number,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: roleKeys.detail(id),
		queryFn: () => roleService.getById(id),
		enabled: options?.enabled !== false && !!id,
		staleTime: 5 * 60 * 1000,
	});

export const useGetRoleMembers = (
	id: string | number,
	filters?: {
		page?: number;
		limit?: number;
	},
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: roleKeys.members(id),
		queryFn: () => roleService.getMembers(id, filters),
		enabled: options?.enabled !== false && !!id,
		staleTime: 5 * 60 * 1000,
	});
