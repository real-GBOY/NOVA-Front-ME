/** @format */

import apiClient from "../config/axios";
import endPoints from "../config/endPoints";
import { setAuthToken, setRefreshToken, setLoginStatus } from "../config/axios";

// Types
export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	accessToken: string;
	refreshToken: string;
}

export interface RegisterRequest {
	email: string;
	password: string;
	first_name?: string;
	last_name?: string;
}

export interface RefreshTokenRequest {
	refreshToken: string;
}

export interface CompleteSignupRequest {
	employeeId: number;
	inviteToken: string;
	password: string;
}

export interface PasswordResetRequestPayload {
	email: string;
	resetUrl: string;
	clientUrl: string;
	ttlMinutes?: number;
	supportEmail?: string;
}

export interface PasswordResetConfirmPayload {
	email: string;
	token: string;
	newPassword: string;
}

export interface ChangePasswordPayload {
	currentPassword: string;
	newPassword: string;
}

// Service functions
export const authService = {
	// POST - Login
	login: async (payload: LoginRequest): Promise<LoginResponse> => {
		const response = await apiClient.post(endPoints.auth.login, payload);
		const {
			accessToken,
			refreshToken = response.data?.refresh_token,
		} = response.data;

		// Store tokens and set login status
		setAuthToken(accessToken);
		setRefreshToken(refreshToken);
		setLoginStatus(true);

		// Register silently on login; permission prompts should be user-initiated.
		// Force registration to ensure token is sent to backend even if it hasn't changed
		import("./push/webPush")
			.then(({ ensureWebPushRegistered }) =>
				ensureWebPushRegistered({ promptPermission: false, forceRegister: true })
			)
			.catch(() => undefined);

		return response.data;
	},

	// POST - Register (Not currently implemented in backend)
	// register: async (payload: RegisterRequest): Promise<LoginResponse> => {
	// 	const response = await apiClient.post(endPoints.auth.register, payload);
	// 	const { accessToken, refreshToken } = response.data;

	// 	// Store tokens and set login status
	// 	setAuthToken(accessToken);
	// 	setRefreshToken(refreshToken);
	// 	setLoginStatus(true);

	// 	import("./push/webPush")
	// 		.then(({ ensureWebPushRegistered }) =>
	// 			ensureWebPushRegistered({ promptPermission: false })
	// 		)
	// 		.catch(() => undefined);

	// 	return response.data;
	// },

	// POST - Refresh token
	refresh: async (
		payload: RefreshTokenRequest
	): Promise<{ accessToken: string; refreshToken?: string }> => {
		const response = await apiClient.post(endPoints.auth.refresh, payload);
		return response.data;
	},

	// POST - Complete Signup (does NOT auto-login - user must login separately)
	completeSignup: async (
		payload: CompleteSignupRequest
	): Promise<{ message: string }> => {
		const response = await apiClient.post(
			endPoints.auth.completeSignup,
			payload
		);
		// Do NOT store tokens - user should login manually after password setup
		return response.data;
	},

	// POST - Logout
	logout: async (): Promise<void> => {
		try {
			// Call logout endpoint if needed
			// await apiClient.post(endPoints.auth.logout);
			await import("./push/webPush")
				.then(({ revokeWebPush }) => revokeWebPush())
				.catch(() => undefined);
		} finally {
			// Always clear tokens and login status
			setAuthToken(null);
			setRefreshToken(null);
			setLoginStatus(false);
		}
	},

	// POST - Request Password Reset (sends email with reset link)
	requestPasswordReset: async (
		payload: PasswordResetRequestPayload
	): Promise<{ message: string }> => {
		const response = await apiClient.post(
			endPoints.auth.passwordReset.request,
			payload
		);
		return response.data;
	},

	// POST - Confirm Password Reset (sets new password using token from email)
	confirmPasswordReset: async (
		payload: PasswordResetConfirmPayload
	): Promise<{ message: string }> => {
		const response = await apiClient.post(
			endPoints.auth.passwordReset.confirm,
			payload
		);
		return response.data;
	},

	// POST - Change Password (for authenticated users)
	changePassword: async (
		payload: ChangePasswordPayload
	): Promise<{ message: string }> => {
		const response = await apiClient.post(
			endPoints.auth.changePassword,
			payload
		);
		return response.data;
	},
};
