/** @format */

import { ReactNode } from "react";
import { usePermissions } from "@/contexts/PermissionContext";

interface PermissionGateProps {
	/** Permission name(s) required */
	permission: string | string[];
	/** 
	 * Mode for multiple permissions:
	 * - 'any': user needs ANY of the permissions (default)
	 * - 'all': user needs ALL of the permissions
	 */
	mode?: "any" | "all";
	/** Content to render if permission check fails */
	fallback?: ReactNode;
	/** Content to render while permissions are loading */
	loadingFallback?: ReactNode;
	/** Content to render if user has permission */
	children: ReactNode;
}

/**
 * PermissionGate
 * 
 * A wrapper component that conditionally renders children based on user permissions.
 * 
 * Usage:
 * ```tsx
 * // Single permission
 * <PermissionGate permission="add_employee">
 *   <Button>Add Member</Button>
 * </PermissionGate>
 * 
 * // Multiple permissions (any)
 * <PermissionGate permission={["read_employee_basic", "read_employee_detailed"]} mode="any">
 *   <MembersTable />
 * </PermissionGate>
 * 
 * // With fallback
 * <PermissionGate permission="create_asset" fallback={<NoPermissionMessage />}>
 *   <AssetForm />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
	permission,
	mode = "any",
	fallback = null,
	loadingFallback = null,
	children,
}: PermissionGateProps) {
	const { can, canAny, canAll, isLoading } = usePermissions();

	// Show loading fallback while permissions are being fetched
	if (isLoading) {
		return <>{loadingFallback}</>;
	}

	// Normalize to array
	const permissions = Array.isArray(permission) ? permission : [permission];

	// Check permissions based on mode
	const hasAccess =
		mode === "all"
			? canAll(permissions)
			: permissions.length === 1
				? can(permissions[0])
				: canAny(permissions);

	// Render children if has access, otherwise fallback
	return <>{hasAccess ? children : fallback}</>;
}

/**
 * useCanAccess
 * 
 * Hook version of PermissionGate for programmatic permission checks
 */
export function useCanAccess(
	permission: string | string[],
	mode: "any" | "all" = "any"
): boolean {
	const { can, canAny, canAll, isLoading } = usePermissions();

	if (isLoading) return false;

	const permissions = Array.isArray(permission) ? permission : [permission];

	if (mode === "all") {
		return canAll(permissions);
	}

	return permissions.length === 1
		? can(permissions[0])
		: canAny(permissions);
}

export default PermissionGate;
