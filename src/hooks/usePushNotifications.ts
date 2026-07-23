import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
	enqueueTestPush,
	ensureWebPushRegistered,
	getLastWebPushToken,
	getOrCreateWebPushDeviceId,
	isWebPushSupported,
	revokeWebPush,
} from "@/services/push/webPush";
import { getLoginStatus } from "@/config/axios";

type PushUiStatus = {
	supported: boolean;
	loggedIn: boolean;
	permission: NotificationPermission | "unsupported";
	deviceId: string;
};

// Static toast options - no need to memoize inside hook
const notificationToastOptions = { position: "top-center" as const };

export function usePushNotifications() {
	const [supported, setSupported] = useState(false);
	const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
		"unsupported"
	);
	const [busy, setBusy] = useState(false);

	const deviceId = getOrCreateWebPushDeviceId();
	const loggedIn = getLoginStatus();
	const lastToken = getLastWebPushToken();

	const refresh = useCallback(async () => {
		const ok = await isWebPushSupported();
		setSupported(ok);
		setPermission(ok ? Notification.permission : "unsupported");
	}, []);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	const status: PushUiStatus = {
		supported,
		loggedIn,
		permission,
		deviceId,
	};

	const enable = useCallback(async (options?: { forceRegister?: boolean }) => {
		setBusy(true);
		try {
			const result = await ensureWebPushRegistered({ 
				promptPermission: true,
				forceRegister: options?.forceRegister ?? false
			});
			if (!result.ok) {
				if (result.reason === "not_logged_in") {
					toast.error("Login required to enable notifications", notificationToastOptions);
					return;
				}
				if (result.reason === "permission_denied") {
					toast.error("Notification permission denied", notificationToastOptions);
					return;
				}
				if (result.reason === "missing_vapid_key") {
					toast.error(
						"Missing Firebase VAPID key. Please set VITE_FIREBASE_VAPID_KEY in your environment variables. Get it from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates.",
						notificationToastOptions
					);
					return;
				}
				if (result.reason === "sw_registration_failed") {
					toast.error("Failed to register notification service worker", notificationToastOptions);
					return;
				}
				if (result.reason === "token_unavailable") {
					toast.error("Failed to generate a push token", notificationToastOptions);
					return;
				}
				if (result.reason === "unsupported") {
					toast.error("Push notifications not supported in this browser/origin", notificationToastOptions);
					return;
				}
				toast.error("Failed to enable notifications", notificationToastOptions);
				return;
			}

			if (result.backendRegistered) {
				toast.success("Notifications enabled", notificationToastOptions);
			} else {
				toast(
					`Permission granted, but backend registration failed${
						result.backendError ? `: ${result.backendError}` : ""
					}`,
					notificationToastOptions
				);
			}
		} catch (e: any) {
			toast.error(e?.message || "Failed to enable notifications", notificationToastOptions);
		} finally {
			await refresh();
			setBusy(false);
		}
	}, [refresh]);

	const disable = useCallback(async () => {
		setBusy(true);
		try {
			await revokeWebPush();
			toast("Notifications disabled (device revoked)", notificationToastOptions);
		} catch (e: any) {
			toast.error(e?.message || "Failed to disable notifications", notificationToastOptions);
		} finally {
			await refresh();
			setBusy(false);
		}
	}, [refresh]);

	const sendTest = useCallback(async () => {
		setBusy(true);
		try {
			await enqueueTestPush();
			toast.success("Test push queued", notificationToastOptions);
		} catch (e: any) {
			toast.error(
				e?.response?.data?.message ||
					e?.response?.data?.error ||
					e?.message ||
					"Failed to send test push",
				notificationToastOptions
			);
		} finally {
			setBusy(false);
		}
	}, []);

	return { status, busy, refresh, enable, disable, sendTest, lastToken };
}
