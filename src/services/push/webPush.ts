import apiClient, { getLoginStatus } from "@/config/axios";
import { app } from "@/config/firebaseInit";
import { getRuntimeEnv } from "@/config/runtimeEnv";

export type PushAction = {
	action: string;
	title: string;
	style?: string;
	icon?: string;
};

export type PushMessage = {
	title: string;
	body: string;
	type?: string;
	source_event_key?: string;
	action_protocol_version?: string;
	actions: PushAction[];
	payload: Record<string, unknown> | null;
};

export type PushClickMessage = {
	type: "push_notification_click";
	action: string | null;
	action_protocol_version: string;
	source_event_key?: string | null;
	notification_type?: string | null;
	title?: string | null;
	body?: string | null;
	actions?: PushAction[];
	payload: Record<string, unknown>;
};

export type PushReceivedMessage = {
	type: "push_notification_received";
	title: string;
	body: string;
	notification_type: string | null;
	source_event_key: string | null;
	action_protocol_version: string;
	actions: PushAction[];
	payload: Record<string, unknown>;
	received_at: string;
};

const DEVICE_ID_KEY = "push_device_id";
const LAST_TOKEN_KEY = "push_fcm_token";

function isSecureOrigin() {
	if (typeof window === "undefined") return false;
	if (window.isSecureContext) return true;
	return window.location.hostname === "localhost";
}

function parseJsonMaybe(value: unknown) {
	if (!value || typeof value !== "string") return null;
	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
}

function normalizeActions(actions: unknown): PushAction[] {
	let parsed: unknown = actions;
	if (typeof actions === "string") {
		parsed = parseJsonMaybe(actions);
	}
	if (!Array.isArray(parsed)) return [];
	return parsed
		.filter((a) => a && typeof a === "object")
		.map((a: any) => ({
			action: String(a.action || ""),
			title: String(a.title || ""),
			style: a.style ? String(a.style) : undefined,
			icon: a.icon ? String(a.icon) : undefined,
		}))
		.filter((a) => a.action && a.title)
		.slice(0, 2);
}

function normalizePayload(payload: unknown): Record<string, unknown> | null {
	let parsed: unknown = payload;
	if (typeof payload === "string") {
		parsed = parseJsonMaybe(payload);
	}
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
	return parsed as Record<string, unknown>;
}

function getFirebaseVapidKey() {
	// Check runtime env first (for production builds), then build-time env
	return getRuntimeEnv("VITE_FIREBASE_VAPID_KEY") || import.meta.env.VITE_FIREBASE_VAPID_KEY || "";
}

export function getOrCreateWebPushDeviceId() {
	const existing = localStorage.getItem(DEVICE_ID_KEY);
	if (existing) return existing;

	const id =
		typeof crypto !== "undefined" && "randomUUID" in crypto
			? crypto.randomUUID()
			: `web-${Math.random().toString(16).slice(2)}-${Date.now()}`;

	localStorage.setItem(DEVICE_ID_KEY, id);
	return id;
}

export async function isWebPushSupported() {
	if (typeof window === "undefined") return false;
	if (!isSecureOrigin()) return false;
	if (!("Notification" in window)) return false;
	if (!("serviceWorker" in navigator)) return false;

	const { isSupported } = await import("firebase/messaging");
	return await isSupported();
}

export async function registerFirebaseMessagingServiceWorker() {
	return await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
		scope: "/",
		type: "module",
	});
}

async function getFirebaseMessaging() {
	const { getMessaging } = await import("firebase/messaging");
	return getMessaging(app);
}

function normalizeFcmPayload(payload: any): PushMessage {
	const title = payload?.notification?.title || payload?.data?.title || "Notification";
	const body = payload?.notification?.body || payload?.data?.body || "";
	const type = payload?.data?.type || undefined;
	const source_event_key =
		payload?.data?.source_event_key || payload?.data?.sourceEventKey || undefined;
	const action_protocol_version =
		payload?.data?.action_protocol_version ||
		payload?.data?.actionProtocolVersion ||
		undefined;

	const actions = normalizeActions(payload?.data?.actions);
	const routedPayload = normalizePayload(payload?.data?.payload);

	return {
		title,
		body,
		type,
		source_event_key,
		action_protocol_version,
		actions,
		payload: routedPayload,
	};
}

function normalizeReceivedMessage(msg: any): PushReceivedMessage | null {
	if (!msg || msg.type !== "push_notification_received") return null;
	return {
		type: "push_notification_received",
		title: String(msg.title || "Notification"),
		body: String(msg.body || ""),
		notification_type:
			msg.notification_type != null ? String(msg.notification_type) : null,
		source_event_key:
			msg.source_event_key != null ? String(msg.source_event_key) : null,
		action_protocol_version: String(msg.action_protocol_version || "1"),
		actions: normalizeActions(msg.actions),
		payload:
			msg.payload && typeof msg.payload === "object"
				? (msg.payload as Record<string, unknown>)
				: {},
		received_at: String(msg.received_at || new Date().toISOString()),
	};
}

export async function listenForForegroundPushMessages(
	handler: (message: PushMessage) => void
) {
	if (!(await isWebPushSupported())) return () => {};
	if (Notification.permission !== "granted") return () => {};

	const { onMessage } = await import("firebase/messaging");
	try {
		const messaging = await getFirebaseMessaging();
		return onMessage(messaging, (payload) => handler(normalizeFcmPayload(payload)));
	} catch {
		return () => {};
	}
}

export async function listenForPushNotificationClicks(
	handler: (msg: PushClickMessage) => void
) {
	if (typeof window === "undefined") return () => {};
	if (!("serviceWorker" in navigator)) return () => {};

	const listener = (event: MessageEvent) => {
		const msg = event?.data;
		if (!msg || msg.type !== "push_notification_click") return;

		handler({
			type: "push_notification_click",
			action: msg.action || null,
			action_protocol_version: String(msg.action_protocol_version || "1"),
			source_event_key:
				msg.source_event_key != null ? String(msg.source_event_key) : null,
			notification_type:
				msg.notification_type != null ? String(msg.notification_type) : null,
			title: msg.title != null ? String(msg.title) : null,
			body: msg.body != null ? String(msg.body) : null,
			actions: normalizeActions(msg.actions),
			payload: (msg.payload && typeof msg.payload === "object" ? msg.payload : {}) as Record<
				string,
				unknown
			>,
		});
	};

	navigator.serviceWorker.addEventListener("message", listener);

	const ready = () =>
		navigator.serviceWorker.ready
			.then((reg) => reg.active?.postMessage({ type: "push_click_ready" }))
			.catch(() => undefined);
	void ready();

	return () => navigator.serviceWorker.removeEventListener("message", listener);
}

export async function listenForPushNotificationReceived(
	handler: (msg: PushReceivedMessage) => void
) {
	if (typeof window === "undefined") return () => {};
	if (!("serviceWorker" in navigator)) return () => {};

	const listener = (event: MessageEvent) => {
		const normalized = normalizeReceivedMessage(event?.data);
		if (!normalized) return;
		handler(normalized);
	};

	navigator.serviceWorker.addEventListener("message", listener);
	return () => navigator.serviceWorker.removeEventListener("message", listener);
}

export async function ensureWebPushRegistered(options?: { promptPermission?: boolean; forceRegister?: boolean }) {
	const promptPermission = options?.promptPermission ?? false;
	const forceRegister = options?.forceRegister ?? false;

	if (!(await isWebPushSupported())) {
		return { ok: false as const, reason: "unsupported" as const };
	}
	if (!getLoginStatus()) {
		return { ok: false as const, reason: "not_logged_in" as const };
	}

	let swRegistration: ServiceWorkerRegistration;
	try {
		swRegistration = await registerFirebaseMessagingServiceWorker();
	} catch {
		return { ok: false as const, reason: "sw_registration_failed" as const };
	}

	let permission = Notification.permission;
	if (permission === "default" && promptPermission) {
		permission = await Notification.requestPermission();
	}
	if (permission !== "granted") {
		return {
			ok: false as const,
			reason: "permission_denied" as const,
			permission,
		};
	}

	const vapidKey = getFirebaseVapidKey();
	if (!vapidKey) {
		return { ok: false as const, reason: "missing_vapid_key" as const };
	}

	const { getToken } = await import("firebase/messaging");
	const messaging = await getFirebaseMessaging();

	const token = await getToken(messaging, {
		vapidKey,
		serviceWorkerRegistration: swRegistration,
	});

	if (!token) {
		return { ok: false as const, reason: "token_unavailable" as const };
	}

	const deviceId = getOrCreateWebPushDeviceId();
	const lastToken = localStorage.getItem(LAST_TOKEN_KEY);

	let backendRegistered = true;
	let backendError: string | null = null;

	if (forceRegister || lastToken !== token) {
		try {
			await apiClient.post("/push/register", { platform: "web", deviceId, token });
			localStorage.setItem(LAST_TOKEN_KEY, token);
		} catch (e: any) {
			backendRegistered = false;
			backendError = e?.response?.data?.error || e?.message || "Failed to register device";
		}
	}

	if (typeof window !== "undefined") {
		window.dispatchEvent(new Event("push:registered"));
	}

	return {
		ok: true as const,
		deviceId,
		token,
		backendRegistered,
		backendError,
	};
}

export async function revokeWebPush() {
	const deviceId = getOrCreateWebPushDeviceId();
	localStorage.removeItem(LAST_TOKEN_KEY);

	let revokeError: unknown = null;
	if (getLoginStatus()) {
		try {
			await apiClient.post("/push/revoke", { platform: "web", deviceId });
		} catch (e) {
			revokeError = e;
		}
	}

	if (await isWebPushSupported()) {
		if (Notification.permission === "granted") {
			try {
				const { deleteToken } = await import("firebase/messaging");
				const messaging = await getFirebaseMessaging();
				await deleteToken(messaging);
			} catch {
				// Best-effort cleanup.
			}
		}

		try {
			const reg = await navigator.serviceWorker.getRegistration("/");
			const subscription = await reg?.pushManager.getSubscription();
			await subscription?.unsubscribe();
		} catch {
			// Best-effort cleanup.
		}
	}

	if (revokeError) {
		throw revokeError;
	}
}

export async function enqueueTestPush(input?: {
	title?: string;
	body?: string;
	type?: string;
	payload?: Record<string, unknown> | null;
	actions?: PushAction[] | null;
	targets?: Array<"web" | "android" | "ios"> | null;
}) {
	if (typeof window === "undefined") return;
	if (!("Notification" in window)) {
		throw new Error("Notifications are not supported in this browser");
	}
	if (Notification.permission !== "granted") {
		throw new Error("Notification permission not granted");
	}

	const title = input?.title || "Test push";
	const body = input?.body || "Hello from Amer";
	const type = input?.type || "test";
	const payload = input?.payload ?? {};
	const actions = input?.actions ?? null;
	const targets = input?.targets ?? ["web"];

	await apiClient.post("/push/test", { title, body, type, payload, actions, targets });
}

export function getLastWebPushToken() {
	return localStorage.getItem(LAST_TOKEN_KEY);
}
