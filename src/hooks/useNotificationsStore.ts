import { useSyncExternalStore } from "react";
import {
	filterByCategory,
	getState,
	getUnreadCount,
	subscribe,
	type InAppNotification,
} from "@/services/notifications/notificationsStore";

export function useNotificationsStore(category: "all" | "requests" | "contracts" | "messages" | "system") {
	const state = useSyncExternalStore(subscribe, getState, getState);
	const unreadCount = useSyncExternalStore(subscribe, getUnreadCount, getUnreadCount);

	const items: InAppNotification[] = filterByCategory(state.items, category);
	return { items, unreadCount };
}

