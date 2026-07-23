/** @format */

import { Navigate, Outlet, useParams } from "react-router-dom";
import { usePermissions } from "@/contexts/PermissionContext";
import  Loader  from "@/designSystem/Loader";
import { getCurrentUserId } from "@/utils/auth";

interface PermissionRouteProps {
	permission?: string | string[];
	redirectPath?: string;
	children?: React.ReactNode;
	allowOwnProfile?: boolean;
}

const PermissionRoute = ({
	permission,
	redirectPath = "/403",
	children,
	allowOwnProfile = false,
}: PermissionRouteProps) => {
	const { can, canAll, isLoading } = usePermissions();
	const params = useParams<{ id: string }>();
	const currentUserId = getCurrentUserId();

	if (isLoading) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<Loader label="Checking permissions..." />
			</div>
		);
	}

	// Allow users to view their own profile
	if (allowOwnProfile && params.id && currentUserId) {
		const isOwnProfile = params.id === currentUserId.toString();
		if (isOwnProfile) {
			return children ? <>{children}</> : <Outlet />;
		}
	}

	if (permission) {
		const hasAccess = Array.isArray(permission)
			? canAll(permission)
			: can(permission);
		if (!hasAccess) {
			return <Navigate to={redirectPath} replace />;
		}
	}

	return children ? <>{children}</> : <Outlet />;
};

export default PermissionRoute;
