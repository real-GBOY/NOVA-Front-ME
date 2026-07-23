type NotificationCategory = "all" | "requests" | "contracts" | "messages" | "system";

export type InAppNotificationAction = {
	action: string;
	title: string;
	style?: string;
	icon?: string;
};

export type InAppNotification = {
	id: string;
	title: string;
	body: string;
	notificationType: string | null;
	sourceEventKey: string | null;
	actionProtocolVersion: string;
	actions: InAppNotificationAction[];
	payload: Record<string, unknown>;
	createdAt: string;
	readAt: string | null;
	// Additional fields for richer UI
	categoryTag?: string;
	avatarUrl?: string;
	iconType?: "warning" | "info" | "success" | "error" | "pending" | "asset";
	reasonText?: string;
};

type State = {
	items: InAppNotification[];
};

const STORAGE_KEY = "in_app_notifications_v1";
const MAX_ITEMS = 50;

let state: State = {
	items: load(),
};

const listeners = new Set<() => void>();

function emit() {
	for (const l of listeners) l();
}

function load(): InAppNotification[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(Boolean).slice(0, MAX_ITEMS);
	} catch {
		return [];
	}
}

function persist() {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items.slice(0, MAX_ITEMS)));
	} catch {
		// ignore
	}
}

function newId(sourceEventKey: string | null) {
	if (sourceEventKey) return sourceEventKey;
	return `n_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function subscribe(listener: () => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function getState() {
	return state;
}

export function addNotification(input: {
	title: string;
	body: string;
	notificationType?: string | null;
	sourceEventKey?: string | null;
	actionProtocolVersion?: string | null;
	actions?: InAppNotificationAction[] | null;
	payload?: Record<string, unknown> | null;
	createdAt?: string | null;
	categoryTag?: string;
	avatarUrl?: string;
	iconType?: "warning" | "info" | "success" | "error" | "pending" | "asset";
	reasonText?: string;
}) {
	const createdAt = input.createdAt || new Date().toISOString();
	const sourceEventKey = input.sourceEventKey ?? null;
	const id = newId(sourceEventKey);

	const existingIdx = state.items.findIndex((n) => n.id === id);
	const next: InAppNotification = {
		id,
		title: String(input.title || "Notification"),
		body: String(input.body || ""),
		notificationType: input.notificationType ?? null,
		sourceEventKey,
		actionProtocolVersion: String(input.actionProtocolVersion || "1"),
		actions: Array.isArray(input.actions) ? input.actions : [],
		payload: input.payload && typeof input.payload === "object" ? input.payload : {},
		createdAt,
		readAt: null,
		categoryTag: input.categoryTag,
		avatarUrl: input.avatarUrl,
		iconType: input.iconType,
		reasonText: input.reasonText,
	};

	if (existingIdx >= 0) {
		const copy = state.items.slice();
		copy[existingIdx] = { ...copy[existingIdx], ...next };
		state = { items: copy };
	} else {
		state = { items: [next, ...state.items].slice(0, MAX_ITEMS) };
	}

	persist();
	emit();
}

export function markRead(id: string) {
	const idx = state.items.findIndex((n) => n.id === id);
	if (idx < 0) return;
	if (state.items[idx].readAt) return;

	const copy = state.items.slice();
	copy[idx] = { ...copy[idx], readAt: new Date().toISOString() };
	state = { items: copy };
	persist();
	emit();
}

export function markAllRead() {
	const now = new Date().toISOString();
	state = { items: state.items.map((n) => ({ ...n, readAt: n.readAt || now })) };
	persist();
	emit();
}

export function clearAll() {
	state = { items: [] };
	persist();
	emit();
}

export function clearByCategory(category: NotificationCategory) {
	if (category === "all") {
		clearAll();
		return;
	}
	
	state = { items: state.items.filter((n) => categoryForType(n.notificationType) !== category) };
	persist();
	emit();
}

export function getUnreadCount() {
	return state.items.filter((n) => !n.readAt).length;
}

function categoryForType(notificationType: string | null): Exclude<NotificationCategory, "all"> {
	const t = (notificationType || "").toLowerCase();
	// Contracts
	if (t.includes("contract")) return "contracts";
	// Requests (vacation, overtime, time off)
	if (
		t.includes("request") ||
		t.includes("timeoff") ||
		t.includes("overtime") ||
		t.includes("vacation")
	)
		return "requests";
	// Messages and Chat
	if (t.includes("message") || t.includes("chat")) return "messages";
	// Everything else goes to system: onboarding, support, asset, payroll, attendance, shift, profile
	return "system";
}

export function filterByCategory(
	items: InAppNotification[],
	category: NotificationCategory
) {
	if (category === "all") return items;
	return items.filter((n) => categoryForType(n.notificationType) === category);
}

