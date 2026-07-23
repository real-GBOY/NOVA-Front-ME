import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
import { firebaseConfig } from "@/config/firebaseConfig";

function parseJsonMaybe(value) {
   if (!value || typeof value !== "string") return null;
   try {
      return JSON.parse(value);
   } catch {
      return null;
   }
}

function normalizeActions(actions) {
   let parsed = actions;
   if (typeof actions === "string") {
      parsed = parseJsonMaybe(actions);
   }
   if (!Array.isArray(parsed)) return [];
   return parsed
      .filter((a) => a && typeof a === "object")
      .map((a) => ({
         action: String(a.action || ""),
         title: String(a.title || ""),
      }))
      .filter((a) => a.action && a.title)
      .slice(0, 2);
}

function normalizePayload(payload) {
   let parsed = payload;
   if (typeof payload === "string") {
      parsed = parseJsonMaybe(payload);
   }
   if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return null;
   return parsed;
}

async function broadcastToClients(message) {
   try {
      const allClients = await self.clients.matchAll({
         type: "window",
         includeUncontrolled: true,
      });
      for (const client of allClients) {
         client.postMessage(message);
      }
   } catch (e) {
      console.error("[push-sw] Error broadcasting to clients:", e);
   }
}

function getClientPostMessageTarget(event) {
   const source = event?.source;
   if (source && typeof source.postMessage === "function") return source;
   return null;
}

let pendingClickMessage = null;

self.addEventListener("install", (event) => {
   event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
   event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
   const msg = event?.data;
   if (!msg || msg.type !== "push_click_ready") return;

   if (!pendingClickMessage) return;
   const target = getClientPostMessageTarget(event);
   if (!target) return;

   target.postMessage(pendingClickMessage);
   pendingClickMessage = null;
});

try {
   const app = initializeApp(firebaseConfig);
   const messaging = getMessaging(app);

   onBackgroundMessage(messaging, (payload) => {
      const title =
         payload?.notification?.title || payload?.data?.title || "Notification";
      const body = payload?.notification?.body || payload?.data?.body || "";

      const actionProtocolVersion =
         payload?.data?.action_protocol_version ||
         payload?.data?.actionProtocolVersion ||
         "1";

      const actions = normalizeActions(payload?.data?.actions);
      const routedPayload = normalizePayload(payload?.data?.payload);
      const type = payload?.data?.type || null;
      const sourceEventKey =
         payload?.data?.source_event_key ||
         payload?.data?.sourceEventKey ||
         null;
      const url =
         payload?.data?.url ||
         payload?.data?.href ||
         payload?.data?.click_action ||
         null;

      const notificationActions = actions.map((a) => ({
         action: a.action,
         title: a.title,
      }));

      const tag = sourceEventKey || type || undefined;

      const notificationOptions = {
         body,
         tag,
         actions: notificationActions,
         icon: "/icons/icon-192x192.png",
         badge: "/icons/icon-96x96.png",
         data: {
            action_protocol_version: actionProtocolVersion,
            payload: routedPayload,
            actions,
            type,
            source_event_key: sourceEventKey,
            title,
            body,
            url,
         },
      };

      self.registration
         .showNotification(title, notificationOptions)
         .catch((err) =>
            console.error("[push-sw] Failed to show notification:", err)
         );

      const broadcastMessage = {
         type: "push_notification_received",
         title,
         body,
         notification_type: type,
         source_event_key: sourceEventKey,
         action_protocol_version: actionProtocolVersion,
         actions,
         payload: routedPayload || {},
         received_at: new Date().toISOString(),
      };
      broadcastToClients(broadcastMessage);
   });

   self.addEventListener("notificationclick", (event) => {
      event.notification?.close?.();

      const action = event.action || null;
      const data = event.notification?.data || {};
      const payloadUrl =
         data?.url || data?.payload?.url || data?.payload?.href || "/";

      const clickMessage = {
         type: "push_notification_click",
         action,
         action_protocol_version: data.action_protocol_version || "1",
         source_event_key: data.source_event_key || null,
         notification_type: data.type || null,
         title: data.title || null,
         body: data.body || null,
         actions: data.actions || [],
         payload: data.payload || {},
      };

      event.waitUntil(
         (async () => {
            const allClients = await self.clients.matchAll({
               type: "window",
               includeUncontrolled: true,
            });

            const focused = allClients.find((c) => "focus" in c) || null;
            if (focused) {
               await focused.focus();
               focused.postMessage(clickMessage);
               return;
            }

            pendingClickMessage = clickMessage;
            await self.clients.openWindow(payloadUrl);
         })()
      );
   });
} catch (e) {
   console.warn("[push-sw] init failed", e);
}
