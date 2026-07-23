/** @format */

import apiClient from "../config/axios";
import endPoints from "../config/endPoints";

// Types
export interface Permission {
	id: number;
	name: string;
	category: string;
	description?: string;
	scope?: string;
	scope_default?: string;
	scope_options?: string[];
	permission_id?: number;
}

export interface Role {
	id: number;
	name: string;
	description?: string;
	member_count: number;
	permission_count: number;
	permissions?: Permission[];
	assigned_job_titles?: number[];
	default_for_job_titles?: number[];
	assigned_job_title_count?: number;
	job_titles?: {
		assigned: any[];
		default_for: any[];
		counts: {
			assigned: number;
			default_for: number;
		};
	};
}

export interface CreateRoleRequest {
	role_name: string;
	description?: string;
	permission_ids?: Array<{ permission_id: number; scope?: string }>;
	assigned_job_titles?: number[];
}

export interface UpdateRoleRequest {
	role_name?: string;
	description?: string;
}

export interface UpdateRolePermissionsRequest {
	permission_ids: Array<{ permission_id: number; scope?: string }>;
}

export interface RoleListResponse {
	data: Role[];
	pagination: {
		page: number;
		limit: number;
		total: number;
	};
}

export interface RoleMembersResponse {
	data: Array<{
		id: number;
		name: string;
		email: string;
		avatar?: string | null;
		job_title?: string | null;
		contact?: string | null;
		joined_at?: string;
		permission_status?: string;
		status?: string;
	}>;
	pagination: {
		page: number;
		limit: number;
		total: number;
	};
}

// Import from centralized config
import { 
	PERMISSION_NAMES, 
	getAlwaysRequiredPermissions 
} from "@/config/permissionConfig";

/**
 * Re-export for backward compatibility
 */
export const READ_ROLE_PERMISSION_NAME = PERMISSION_NAMES.READ_ROLE;
export const READ_EMPLOYEE_DETAILED_PERMISSION_NAME = PERMISSION_NAMES.READ_EMPLOYEE_DETAILED;

// Get required permission names from centralized config
const REQUIRED_PERMISSIONS = getAlwaysRequiredPermissions();

// Cache for required permission IDs to avoid repeated API calls
let cachedRequiredPermissionIds: Record<string, number> = {};
let permissionIdFetchPromise: Promise<Record<string, number>> | null = null;

/**
 * Get the required permission IDs from the permissions dictionary.
 * This is cached to avoid repeated API calls.
 */
const getRequiredPermissionIds = async (): Promise<Record<string, number>> => {
	// Return cached value if we have all required permissions
	if (Object.keys(cachedRequiredPermissionIds).length === REQUIRED_PERMISSIONS.length) {
		return cachedRequiredPermissionIds;
	}

	// If already fetching, wait for that promise
	if (permissionIdFetchPromise) {
		return permissionIdFetchPromise;
	}

	// Fetch permissions dictionary and find required permissions
	permissionIdFetchPromise = (async () => {
		try {
			const response = await apiClient.get(endPoints.permissions.getDictionary);
			const data = response.data?.data || [];
			const ids: Record<string, number> = {};
			
			for (const category of data) {
				for (const perm of category.permissions || []) {
					if (REQUIRED_PERMISSIONS.includes(perm.permission_name)) {
						ids[perm.permission_name] = perm.permission_id;
					}
				}
			}
			
			cachedRequiredPermissionIds = ids;
			return ids;
		} catch (error) {
			console.error("Failed to fetch required permission IDs:", error);
			return {};
		} finally {
			permissionIdFetchPromise = null;
		}
	})();

	return permissionIdFetchPromise;
};

/**
 * Helper function to ensure a specific permission is included in the permission list
 * @param permissions - Array of permission objects with permission_id and optional scope
 * @param permissionId - The ID of the permission to ensure
 * @returns Updated permissions array with the permission included if not already present
 */
const ensurePermissionById = (
	permissions: Array<{ permission_id: number; scope?: string }>,
	permissionId: number | null
): Array<{ permission_id: number; scope?: string }> => {
	if (!permissionId) return permissions;
	
	const hasPermission = permissions.some((p) => p.permission_id === permissionId);
	
	if (!hasPermission) {
		return [...permissions, { permission_id: permissionId, scope: "DEFAULT" }];
	}
	
	return permissions;
};

/**
 * Helper function to ensure read_role permission is included in the permission list
 * @param permissions - Array of permission objects with permission_id and optional scope
 * @param readRolePermissionId - The ID of the read_role permission
 * @returns Updated permissions array with read_role included if not already present
 */
export const ensureReadRolePermission = (
	permissions: Array<{ permission_id: number; scope?: string }>,
	readRolePermissionId: number | null
): Array<{ permission_id: number; scope?: string }> => {
	return ensurePermissionById(permissions, readRolePermissionId);
};

/**
 * Helper function to ensure all required permissions are included in the permission list
 * @param permissions - Array of permission objects with permission_id and optional scope
 * @param requiredIds - Record of permission names to IDs
 * @returns Updated permissions array with all required permissions included
 */
const ensureRequiredPermissions = (
	permissions: Array<{ permission_id: number; scope?: string }>,
	requiredIds: Record<string, number>
): Array<{ permission_id: number; scope?: string }> => {
	let result = [...permissions];
	
	for (const permName of REQUIRED_PERMISSIONS) {
		const permId = requiredIds[permName];
		if (permId) {
			result = ensurePermissionById(result, permId);
		}
	}
	
	return result;
};

// Service functions
export const roleService = {
	// GET - List roles
	list: async (filters?: {
		page?: number;
		limit?: number;
		search?: string;
		sort_by?: string;
		order?: "asc" | "desc";
		job_title_ids?: number[] | string[];
	}): Promise<RoleListResponse> => {
		const response = await apiClient.get(endPoints.roles.getAll, {
			params: filters,
		});
		return response.data;
	},

	// GET - Get role by ID
	getById: async (id: string | number): Promise<Role> => {
		const response = await apiClient.get(endPoints.roles.getById(id));
		return response.data;
	},

	// POST - Create role (automatically includes required permissions)
	create: async (payload: CreateRoleRequest): Promise<Role> => {
		const finalPayload = { ...payload };
		
		// Ensure required permissions are included if permission_ids are provided
		if (finalPayload.permission_ids && finalPayload.permission_ids.length > 0) {
			const requiredIds = await getRequiredPermissionIds();
			if (Object.keys(requiredIds).length > 0) {
				finalPayload.permission_ids = ensureRequiredPermissions(
					finalPayload.permission_ids,
					requiredIds
				);
			}
		}
		
		const response = await apiClient.post(endPoints.roles.create, finalPayload);
		return response.data;
	},

	// PUT - Update role
	update: async (
		id: string | number,
		payload: UpdateRoleRequest
	): Promise<Role> => {
		const response = await apiClient.put(endPoints.roles.update(id), payload);
		return response.data;
	},

	// PUT - Update role permissions (automatically includes required permissions)
	updatePermissions: async (
		id: string | number,
		payload: UpdateRolePermissionsRequest
	): Promise<void> => {
		const finalPayload = { ...payload };
		
		// Ensure required permissions are included
		if (finalPayload.permission_ids && finalPayload.permission_ids.length > 0) {
			const requiredIds = await getRequiredPermissionIds();
			if (Object.keys(requiredIds).length > 0) {
				finalPayload.permission_ids = ensureRequiredPermissions(
					finalPayload.permission_ids,
					requiredIds
				);
			}
		}
		
		await apiClient.put(endPoints.roles.updatePermissions(id), finalPayload);
	},

	// DELETE - Delete role
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete(endPoints.roles.delete(id));
	},

	// POST - Duplicate role
	duplicate: async (
		id: string | number
	): Promise<{ id: number; name: string }> => {
		const response = await apiClient.post(endPoints.roles.duplicate(id));
		return response.data;
	},

	// GET - Get role members
	getMembers: async (
		id: string | number,
		filters?: {
			page?: number;
			limit?: number;
		}
	): Promise<RoleMembersResponse> => {
		const response = await apiClient.get(endPoints.roles.getMembers(id), {
			params: filters,
		});
		return response.data;
	},
};
