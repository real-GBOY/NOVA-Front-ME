import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getLoginStatus } from "@/config/axios";
import { addNotification, markRead } from "@/services/notifications/notificationsStore";
import {
	ensureWebPushRegistered,
	listenForForegroundPushMessages,
	listenForPushNotificationClicks,
	listenForPushNotificationReceived,
	type PushClickMessage,
	type PushMessage,
} from "@/services/push/webPush";

function routeFromPayload(navigate: ReturnType<typeof useNavigate>, payload: any) {
	const url = payload?.url || payload?.href;
	if (typeof url === "string" && url) {
		window.location.assign(url);
		return;
	}

	const path = payload?.path || payload?.route;
	if (typeof path === "string" && path) {
		navigate(path);
	}
}

function handleClick(navigate: ReturnType<typeof useNavigate>, msg: PushClickMessage) {
	toast(`Notification click${msg.action ? `: ${msg.action}` : ""}`, {
		position: "top-center",
	});
	if (msg.source_event_key) markRead(String(msg.source_event_key));
	routeFromPayload(navigate, msg.payload);
}

function handleForegroundMessage(msg: PushMessage) {
	addNotification({
		title: msg.title,
		body: msg.body,
		notificationType: msg.type || null,
		sourceEventKey: msg.source_event_key || null,
		actionProtocolVersion: msg.action_protocol_version || "1",
		actions: msg.actions || [],
		payload: msg.payload || {},
		createdAt: new Date().toISOString(),
	});
	toast(`${msg.title}${msg.body ? ` — ${msg.body}` : ""}`, {
		position: "top-center",
	});
}

export default function PushNotificationsBootstrap() {
	const navigate = useNavigate();

	useEffect(() => {
		if (!getLoginStatus()) return;
		void ensureWebPushRegistered({ promptPermission: false }).catch(() => undefined);
	}, []);

	useEffect(() => {
		let unsub = () => {};
		void listenForPushNotificationClicks((msg) => handleClick(navigate, msg)).then(
			(fn) => (unsub = fn)
		).catch(() => undefined);
		return () => unsub();
	}, [navigate]);

	useEffect(() => {
		let unsub = () => {};

		const setup = async () => {
			unsub();
			unsub = () => {};

			if (!getLoginStatus()) return;
			if (typeof window === "undefined") return;
			if (!("Notification" in window)) return;
			if (Notification.permission !== "granted") return;

			unsub = await listenForForegroundPushMessages((msg) => handleForegroundMessage(msg));
		};

		void setup();

		const onRegistered = () => void setup();
		window.addEventListener("push:registered", onRegistered);

		let permStatus: PermissionStatus | null = null;
		const maybeBindPermissionsChange = async () => {
			try {
				if (!navigator.permissions?.query) return;
				permStatus = await navigator.permissions.query({
					// TS DOM doesn't always include 'notifications' in PermissionName depending on lib versions
					name: "notifications" as any,
				});
				permStatus.onchange = () => void setup();
			} catch {
				// ignore
			}
		};

		void maybeBindPermissionsChange();

		return () => {
			unsub();
			window.removeEventListener("push:registered", onRegistered);
			if (permStatus) permStatus.onchange = null;
		};
	}, []);

	useEffect(() => {
		let unsub = () => {};
		void listenForPushNotificationReceived((msg) => {
			addNotification({
				title: msg.title,
				body: msg.body,
				notificationType: msg.notification_type || null,
				sourceEventKey: msg.source_event_key || null,
				actionProtocolVersion: msg.action_protocol_version || "1",
				actions: msg.actions || [],
				payload: msg.payload || {},
				createdAt: msg.received_at,
			});
		}).then((fn) => (unsub = fn));
		return () => unsub();
	}, []);

	return null;
}
