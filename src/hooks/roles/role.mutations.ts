/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "../../config/reactQueryKeys";
import {
	roleService,
	type CreateRoleRequest,
	type UpdateRoleRequest,
	type UpdateRolePermissionsRequest,
} from "../../services/roleService";

const roleKeys = reactQueryKeys.roles;

export const useCreateRole = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateRoleRequest) => roleService.create(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
		},
	});
};

export const useUpdateRole = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string | number;
			payload: UpdateRoleRequest;
		}) => roleService.update(id, payload),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
		},
	});
};

export const useUpdateRolePermissions = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string | number;
			payload: UpdateRolePermissionsRequest;
		}) => roleService.updatePermissions(id, payload),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
		},
	});
};

export const useDeleteRole = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string | number) => roleService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
		},
	});
};

export const useDuplicateRole = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string | number) => roleService.duplicate(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
		},
	});
};
