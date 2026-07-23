/** @format */

import { Navigate, Outlet } from "react-router-dom";
import { getLoginStatus } from "@/config/axios";

interface ProtectedRouteProps {
	children?: React.ReactNode;
	redirectPath?: string;
}

const ProtectedRoute = ({
	children,
	redirectPath = "/login",
}: ProtectedRouteProps) => {
	// Check authentication status synchronously (reads from localStorage)
	const isAuthenticated = getLoginStatus();

	if (!isAuthenticated) {
		return <Navigate to={redirectPath} replace />;
	}

	return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
