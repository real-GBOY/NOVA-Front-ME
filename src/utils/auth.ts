/** @format */

import { getAuthToken } from "@/config/axios";
import { decodeToken } from "@/config/Jwt";
export const getCurrentUserId = (): number | null => {
	const token = getAuthToken();
	if (!token) return null;
	const decoded = decodeToken(token);
	if (!decoded?.payload) return null;
	const payload = decoded.payload as Record<string, unknown>;
	const rawId =
		payload.employee_id ??
		payload.employeeId ??
		payload.user_id ??
		payload.userId ??
		payload.id ??
		payload.sub;
	if (typeof rawId === "number" && !Number.isNaN(rawId)) {
		return rawId;
	}
	if (typeof rawId === "string") {
		const parsed = parseInt(rawId, 10);
		return Number.isNaN(parsed) ? null : parsed;
	}
	return null;
};

/**
 * Get current user role key from JWT token
 */
export const getCurrentUserRole = (): string | null => {
	const token = getAuthToken();
	if (!token) return null;

	const decoded = decodeToken(token);
	if (!decoded?.payload) return null;

	const payload = decoded.payload as any;
	// Access role.key safely
	return payload.role?.key ?? null;
};
