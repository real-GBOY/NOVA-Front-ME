/** @format */

import {
   createContext,
   useContext,
   useMemo,
   useCallback,
   ReactNode,
} from "react";
import { getAuthToken } from "@/config/axios";
import { decodeToken, JwtPayload, JwtPermission } from "@/config/Jwt";
import { useGetRoleById } from "@/hooks/roles/role.queries";
import { useGetEmployeePermissions } from "@/hooks/employees/employee.queries";
import type { Permission } from "@/services/roleService";

// Permission with scope information
export interface EffectivePermission {
   id: number;
   name: string;
   scope: string;
   source: "role" | "custom";
}

const addPermissionWithAliases = (
   permMap: Map<string, EffectivePermission>,
   permission: EffectivePermission
) => {
   permMap.set(permission.name, permission);
   // Backward-compat: some parts of the app use dot notation (e.g. shift.view)
   // while backend/older configs may use underscores.
   if (permission.name.includes(".")) {
      permMap.set(permission.name.replaceAll(".", "_"), permission);
   }
};

// Context value interface
interface PermissionContextValue {
   /** Map of permission name to permission details */
   permissions: Map<string, EffectivePermission>;
   /** Check if user has a specific permission */
   hasPermission: (name: string) => boolean;
   /** Check if user has ANY of the specified permissions */
   hasAnyPermission: (names: string[]) => boolean;
   /** Check if user has ALL of the specified permissions */
   hasAllPermissions: (names: string[]) => boolean;
   /** Get the scope for a specific permission */
   getPermissionScope: (name: string) => string | null;
   /** True while role permissions are being fetched */
   isLoading: boolean;
   /** Current user ID from token */
   userId: number | null;
   /** Current user's team IDs */
   teamIds: number[];
   /** Role name */
   roleName: string | null;
}

// Default context value
const defaultContextValue: PermissionContextValue = {
   permissions: new Map(),
   hasPermission: () => false,
   hasAnyPermission: () => false,
   hasAllPermissions: () => false,
   getPermissionScope: () => null,
   isLoading: true,
   userId: null,
   teamIds: [],
   roleName: null,
};

// Create context
const PermissionContext =
   createContext<PermissionContextValue>(defaultContextValue);

// Helper to decode and extract JWT payload
function getJwtPayload(): JwtPayload | null {
   const token = getAuthToken();
   if (!token) return null;

   const decoded = decodeToken(token);
   if (!decoded?.payload) return null;

   // Explicitly type the payload to ensure TypeScript recognizes all properties
   return decoded.payload as JwtPayload;
}

// Provider props
interface PermissionProviderProps {
   children: ReactNode;
}

/**
 * PermissionProvider
 *
 * Provides permission context to the app. It:
 * 1. Extracts role.id and permission[] (custom) from JWT token
 * 2. Fetches role permissions via useGetRoleById
 * 3. Unions role permissions + custom permissions (custom adds authority)
 * 4. Provides permission checking methods
 */
export function PermissionProvider({ children }: PermissionProviderProps) {
   // Get JWT payload
   const jwtPayload = useMemo(() => getJwtPayload(), []);

   const roleId = jwtPayload?.role?.id ?? null;
   const roleName = jwtPayload?.role?.name ?? null;
   const customPermissions = useMemo(
      () => jwtPayload?.permission ?? [],
      [jwtPayload]
   );
   const userId = jwtPayload?.userId ?? null;
   const teamIds = useMemo(() => jwtPayload?.teamIds ?? [], [jwtPayload]);

   // Super Admin has all permissions (check by role ID: 1)
   const isSuperAdmin = roleId === 1;

   // Fetch role permissions with infinite staleTime (cache forever until logout)
   const { data: roleData, isLoading: isRoleLoading } = useGetRoleById(
      roleId ?? 0,
      {
         enabled: !!roleId,
      }
   );

   // Fetch employee effective permissions (includes overrides + removals)
   const {
      data: employeePermissions,
      isLoading: isEmployeePermissionsLoading,
   } = useGetEmployeePermissions(userId ?? 0, {
      enabled: !!userId,
   });

   // Compute effective permissions (role + custom union)
   const permissions = useMemo(() => {
      const permMap = new Map<string, EffectivePermission>();

      // Prefer backend-calculated effective permissions when available.
      // This keeps role permissions and overrides fully synchronized.
      if (employeePermissions?.effective_permissions?.length) {
         employeePermissions.effective_permissions.forEach((perm) => {
            const effective: EffectivePermission = {
               id: perm.id,
               name: perm.name,
               scope: perm.scope || "DEFAULT",
               // We can't reliably distinguish role vs custom here; treat as custom
               // (it's the effective set after applying overrides).
               source: "custom",
            };
            addPermissionWithAliases(permMap, effective);
         });

         return permMap;
      }

      // 1. Add role permissions first
      if (roleData?.permissions) {
         roleData.permissions.forEach((perm) => {
            // Type assertion to access optional properties
            const permission = perm as Permission & {
               permission_id?: number;
               permission_name?: string;
               permission?: { name?: string; permission_name?: string };
               scope?: string;
               scope_default?: string;
            };
            // Handle both permission_id and id properties
            const permId = permission.id ?? permission.permission_id ?? 0;
            const permName =
               permission.name ||
               permission.permission_name ||
               permission.permission?.name ||
               permission.permission?.permission_name ||
               (permission.permission_id
                  ? String(permission.permission_id)
                  : "") ||
               "";
            if (!permName) return;
            addPermissionWithAliases(permMap, {
               id: permId,
               name: permName,
               scope: permission.scope ?? permission.scope_default ?? "DEFAULT",
               source: "role",
            });
         });
      }

      // 2. Add custom permissions (these ADD authority, don't override)
      customPermissions.forEach((perm: JwtPermission) => {
         const permName = perm.name;
         if (permName && !permMap.has(permName)) {
            // Only add if not already present from role
            addPermissionWithAliases(permMap, {
               id: perm.id,
               name: permName,
               scope: perm.scope || "DEFAULT",
               source: "custom",
            });
         } else if (permName && permMap.has(permName)) {
            // If already exists, custom can override the scope
            const existing = permMap.get(permName)!;
            addPermissionWithAliases(permMap, {
               ...existing,
               scope: perm.scope || existing.scope,
               source: "custom", // Mark as custom since it was overridden
            });
         }
      });

      return permMap;
   }, [
      employeePermissions?.effective_permissions,
      roleData?.permissions,
      customPermissions,
   ]);

   // Permission check methods - Super Admin bypasses all checks
   const hasPermission = useCallback(
      (name: string): boolean => {
         if (isSuperAdmin) return true;
         return permissions.has(name);
      },
      [permissions, isSuperAdmin]
   );

   const hasAnyPermission = useCallback(
      (names: string[]): boolean => {
         if (isSuperAdmin) return true;
         return names.some((name) => permissions.has(name));
      },
      [permissions, isSuperAdmin]
   );

   const hasAllPermissions = useCallback(
      (names: string[]): boolean => {
         if (isSuperAdmin) return true;
         return names.every((name) => permissions.has(name));
      },
      [permissions, isSuperAdmin]
   );

   const getPermissionScope = useCallback(
      (name: string): string | null => {
         if (isSuperAdmin) return "ALL";
         const perm = permissions.get(name);
         return perm?.scope ?? null;
      },
      [permissions, isSuperAdmin]
   );

   // Loading state: role + employee effective permissions
   const isLoading =
      !isSuperAdmin &&
      ((roleId !== null && isRoleLoading) ||
         (userId !== null && isEmployeePermissionsLoading));

   const contextValue = useMemo<PermissionContextValue>(
      () => ({
         permissions,
         hasPermission,
         hasAnyPermission,
         hasAllPermissions,
         getPermissionScope,
         isLoading,
         userId,
         teamIds,
         roleName,
      }),
      [
         permissions,
         hasPermission,
         hasAnyPermission,
         hasAllPermissions,
         getPermissionScope,
         isLoading,
         userId,
         teamIds,
         roleName,
      ]
   );

   return (
      <PermissionContext.Provider value={contextValue}>
         {children}
      </PermissionContext.Provider>
   );
}

/**
 * usePermissionContext
 *
 * Hook to access the full permission context
 */
export function usePermissionContext(): PermissionContextValue {
   return useContext(PermissionContext);
}

/**
 * usePermissions
 *
 * Convenience hook for common permission checks
 */
export function usePermissions() {
   const context = useContext(PermissionContext);

   return {
      /** Check if user has a specific permission */
      can: context.hasPermission,
      /** Check if user has ANY of the specified permissions */
      canAny: context.hasAnyPermission,
      /** Check if user has ALL of the specified permissions */
      canAll: context.hasAllPermissions,
      /** Get the scope for a specific permission */
      getScope: context.getPermissionScope,
      /** True while permissions are loading */
      isLoading: context.isLoading,
      /** Current user ID */
      userId: context.userId,
      /** Current user's team IDs */
      teamIds: context.teamIds,
      /** Role name */
      roleName: context.roleName,
   };
}

export default PermissionContext;
