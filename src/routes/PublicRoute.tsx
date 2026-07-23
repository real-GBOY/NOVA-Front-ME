/** @format */

import { Navigate, Outlet } from "react-router-dom";
import { getLoginStatus } from "@/config/axios";

interface PublicRouteProps {
	children?: React.ReactNode;
	redirectPath?: string;
}

const PublicRoute = ({
	children,
	redirectPath = "/dashboard",
}: PublicRouteProps) => {
	// Check authentication status synchronously (reads from localStorage)
	const isAuthenticated = getLoginStatus();

	// If authenticated, redirect to dashboard
	if (isAuthenticated) {
		return <Navigate to={redirectPath} replace />;
	}

	return children ? <>{children}</> : <Outlet />;
};

export default PublicRoute;

