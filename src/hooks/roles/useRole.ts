/** @format */

import {
	useListRoles,
	useGetRoleById,
	useGetRoleMembers,
} from "./role.queries";

import {
	useCreateRole,
	useUpdateRole,
	useUpdateRolePermissions,
	useDeleteRole,
	useDuplicateRole,
} from "./role.mutations";

export const useRole = () => {
	return {
		useListRoles,
		useGetRoleById,
		useGetRoleMembers,
		useCreateRole,
		useUpdateRole,
		useUpdateRolePermissions,
		useDeleteRole,
		useDuplicateRole,
	};
};

// Export individual hooks for direct imports
export {
	useListRoles,
	useGetRoleById,
	useGetRoleMembers,
} from "./role.queries";

export {
	useCreateRole,
	useUpdateRole,
	useUpdateRolePermissions,
	useDeleteRole,
	useDuplicateRole,
} from "./role.mutations";
