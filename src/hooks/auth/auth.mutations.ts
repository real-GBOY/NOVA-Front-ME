/** @format */

import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import {
	authService,
	type LoginRequest,
	type CompleteSignupRequest,
	type PasswordResetRequestPayload,
	type PasswordResetConfirmPayload,
} from "@/services/authService";
import { toast } from "@/utilities/toast";
import { ensureWebPushRegistered } from "@/services/push/webPush";
import { setLoginWarning } from "@/components/auth/LoginWarningModal";

const authKeys = reactQueryKeys.auth;
const getErrorMessage = (error: unknown, fallback: string) => {
	if (typeof error === "object" && error !== null) {
		const err = error as { response?: { data?: { message?: string } }; message?: string };
		return err.response?.data?.message || err.message || fallback;
	}
	return fallback;
};

/**
 * POST - Login user
 */
export const useLogin = () => {
	return useMutation({
		mutationKey: authKeys.login(),
		mutationFn: (payload: LoginRequest) => authService.login(payload),
		onSuccess: async () => {
			toast.success("Login successful");
			
			// Set flag to show login warning modal
			setLoginWarning();
			
			// Register for push notifications before redirecting
			// Suppress all errors - don't show toasts for registration failures
			try {
				const result = await ensureWebPushRegistered({ 
					promptPermission: true, 
					forceRegister: true 
				});
				// Silently handle backend registration failures - don't show error toasts
				if (result && !result.ok) {
					console.warn("Push notification registration failed:", result.reason);
				} else if (result && !result.backendRegistered) {
					console.warn("Push notification backend registration failed:", result.backendError);
				}
			} catch (error) {
				// Silently fail - don't show any error toasts
				console.warn("Push notification registration error:", error);
			}
			
			// Full page refresh to ensure all state is fresh with new token
			window.location.href = "/dashboard";
		},
		onError: (error: unknown) => {
			toast.error(
				getErrorMessage(
					error,
					"Failed to login. Please check your credentials."
				)
			);
		},
	});
};


/**
 * POST - Complete password setup (for employee invitation)
 * Does NOT auto-login - redirects to login page after password creation
 */
export const useCompletePassword = () => {
	const navigate = useNavigate();

	return useMutation({
		mutationKey: [...authKeys.all, "completeSignup"] as const,
		mutationFn: (payload: CompleteSignupRequest) =>
			authService.completeSignup(payload),
		onSuccess: () => {
			toast.success("Password created successfully. Please login with your new password.");
			// Redirect to login page after successful password creation
			navigate("/login", { replace: true });
		},
		onError: (error: unknown) => {
			toast.error(
				getErrorMessage(error, "Failed to create password. Please try again.")
			);
		},
	});
};

/**
 * POST - Logout user
 */
export const useLogout = () => {
	const navigate = useNavigate();

	return useMutation({
		mutationKey: authKeys.logout(),
		mutationFn: () => authService.logout(),
		onSuccess: () => {
			toast.success("Logged out successfully");
			// Redirect to login page after logout
			navigate("/login", { replace: true });
		},
		onError: (error: unknown) => {
			toast.error(getErrorMessage(error, "Failed to logout"));
		},
	});
};

/**
 * POST - Request password reset (sends email with reset link)
 */
export const useRequestPasswordReset = () => {
	const navigate = useNavigate();

	return useMutation({
		mutationKey: [...authKeys.all, "passwordResetRequest"] as const,
		mutationFn: (payload: PasswordResetRequestPayload) =>
			authService.requestPasswordReset(payload),
		onSuccess: (_, variables) => {
			toast.success("Password reset email sent. Please check your inbox.");
			// Navigate to verification page with email
			navigate(
				`/verification-code?email=${encodeURIComponent(variables.email)}&mode=reset`,
				{ replace: true }
			);
		},
		onError: (error: unknown) => {
			toast.error(
				getErrorMessage(
					error,
					"Failed to send password reset email. Please try again."
				)
			);
		},
	});
};

/**
 * POST - Confirm password reset (sets new password using token from email)
 */
export const useConfirmPasswordReset = () => {
	const navigate = useNavigate();

	return useMutation({
		mutationKey: [...authKeys.all, "passwordResetConfirm"] as const,
		mutationFn: (payload: PasswordResetConfirmPayload) =>
			authService.confirmPasswordReset(payload),
		onSuccess: () => {
			toast.success("Password reset successfully. Please login with your new password.");
			// Redirect to login page
			navigate("/login", { replace: true });
		},
		onError: (error: unknown) => {
			toast.error(
				getErrorMessage(
					error,
					"Failed to reset password. The link may have expired."
				)
			);
		},
	});
};
