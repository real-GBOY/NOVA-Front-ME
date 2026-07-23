/** @format */

import { getSocket } from "@/services/socket/socket";
import type {
	SocketJoinRoomPayload,
	SocketSendMessagePayload,
	SocketSendMessageResponse,
	SocketTypingPayload,
	SocketMessageReadPayload,
	SocketReceiveMessagePayload,
	SocketUserTypingPayload,
	SocketUserPresencePayload,
	SocketUnreadTotalPayload,
	SocketMessageReadReceiptPayload,
	SocketRateLimitPayload,
} from "./types";
import type { SocketNotificationEvent } from "@/services/notifications/notificationEvents";

/**
 * Socket Service
 * Handles all Socket.io event emissions and listeners
 * Always clean up event listeners (Best Practice #2)
 */

// ==================== Room Management ====================

/**
 * Join a room via socket
 * FIXED: Waits for socket connection if socket exists but is disconnected
 */
export const joinRoom = (
	roomId: number,
	callback?: (response: {
		success: boolean;
		roomId?: number;
		error?: string;
	}) => void
): void => {
	const socket = getSocket();
	if (!socket) {
		callback?.({ success: false, error: "Socket not available" });
		return;
	}

	// If socket is connected, emit immediately
	if (socket.connected) {
		socket.emit("join_room", { roomId } as SocketJoinRoomPayload, callback);
		return;
	}

	// If socket exists but is not connected, wait for connection
	// This prevents errors and ensures room is joined after reconnection
	const connectHandler = () => {
		socket.off("connect", connectHandler);
		socket.emit("join_room", { roomId } as SocketJoinRoomPayload, callback);
	};

	socket.once("connect", connectHandler);

	// Set a timeout in case connection takes too long
	setTimeout(() => {
		socket.off("connect", connectHandler);
		if (!socket.connected) {
			callback?.({ success: false, error: "Socket connection timeout" });
		}
	}, 10000); // 10 second timeout
};

/**
 * Leave a room via socket
 * FIXED: Handles disconnected sockets gracefully
 */
export const leaveRoom = (
	roomId: number,
	callback?: (response: {
		success: boolean;
		roomId?: number;
		error?: string;
	}) => void
): void => {
	const socket = getSocket();
	if (!socket) {
		// If socket doesn't exist, consider it already left
		callback?.({ success: true, roomId });
		return;
	}

	// If socket is connected, emit immediately
	if (socket.connected) {
		socket.emit("leave_room", { roomId } as SocketJoinRoomPayload, callback);
		return;
	}

	// If socket is disconnected, consider room already left
	// No need to wait for reconnection to leave a room
	callback?.({ success: true, roomId });
};

// ==================== Messaging ====================

export const sendMessageViaSocket = (
	payload: SocketSendMessagePayload,
	callback?: (response: SocketSendMessageResponse) => void
): void => {
	const socket = getSocket();
	if (!socket) {
		callback?.({ success: false, error: "Socket not connected" });
		return;
	}

	socket.emit("send_message", payload, callback);
};

// ==================== Typing Indicators ====================

export const emitTyping = (roomId: number): void => {
	const socket = getSocket();
	if (!socket) return;

	socket.emit("typing", { roomId } as SocketTypingPayload);
};

export const emitStopTyping = (roomId: number): void => {
	const socket = getSocket();
	if (!socket) return;

	socket.emit("stop_typing", { roomId } as SocketTypingPayload);
};

// ==================== Recording Indicators ====================

export const emitRecording = (roomId: number): void => {
	const socket = getSocket();
	if (!socket) return;

	socket.emit("recording", { roomId } as SocketTypingPayload);
};

export const emitStopRecording = (roomId: number): void => {
	const socket = getSocket();
	if (!socket) return;

	socket.emit("stop_recording", { roomId } as SocketTypingPayload);
};

// ==================== Read Receipts ====================

export const markMessageAsReadViaSocket = (
	roomId: number,
	lastMessageId: number,
	callback?: (response: { success: boolean; error?: string }) => void
): void => {
	const socket = getSocket();
	if (!socket) {
		callback?.({ success: false, error: "Socket not connected" });
		return;
	}

	socket.emit(
		"message_read",
		{ roomId, lastMessageId } as SocketMessageReadPayload,
		callback
	);
};

// ==================== Presence ====================

export const getOnlineUsers = (
	callback?: (response: { success: boolean; error?: string }) => void
): void => {
	const socket = getSocket();
	if (!socket) return;

	socket.emit("get_online_users", {}, callback);
};

export const sendHeartbeat = (
	callback?: (response: { success: boolean; timestamp?: string }) => void
): void => {
	const socket = getSocket();
	if (!socket) return;

	socket.emit("heartbeat", {}, callback);
};

// ==================== Event Listeners ====================

/**
 * Generic socket listener factory
 * Creates a socket event listener with automatic cleanup
 * Reduces boilerplate code for 12+ listener functions
 */
const createSocketListener = <T = any>(eventName: string) => 
	(handler: (data: T) => void): (() => void) => {
		const socket = getSocket();
		if (!socket) return () => {};
		
		const socketRef = socket;
		socketRef.off(eventName, handler);
		socketRef.on(eventName, handler);
		
		return () => {
			if (socketRef) {
				socketRef.off(eventName, handler);
			}
		};
	};

/**
 * Register event listener with automatic cleanup support
 * Always clean up event listeners (Best Practice #2)
 *
 * FIXED: Stores socket reference to ensure cleanup uses same instance
 */
export const onReceiveMessage = (
	handler: (message: SocketReceiveMessagePayload) => void
): (() => void) => {
	const socket = getSocket();
	if (!socket) {
		console.warn('⚠️ [socketService.onReceiveMessage] No socket available');
		return () => {};
	}

	// Store reference to this specific socket instance
	const socketRef = socket;

	// Remove any existing listener with the same handler to prevent duplicates
	socketRef.off("receive_message", handler);

	// Wrap the handler to add logging
	const wrappedHandler = (message: SocketReceiveMessagePayload) => {
		handler(message);
	};

	socketRef.on("receive_message", wrappedHandler);

	// Return cleanup function that uses the stored socket reference
	return () => {
		if (socketRef) {
			socketRef.off("receive_message", wrappedHandler);
		}
	};
};

// Typing indicators
export const onUserTyping = createSocketListener<SocketUserTypingPayload>("user_typing");

export const onUserStopTyping = createSocketListener<SocketUserTypingPayload>("user_stop_typing");

// Recording indicators
export const onUserRecording = createSocketListener<SocketUserTypingPayload>("user_recording");

export const onUserStopRecording = createSocketListener<SocketUserTypingPayload>("user_stop_recording");

// Read receipts
export const onMessageReadReceipt = createSocketListener<SocketMessageReadReceiptPayload>("message_read_receipt");

// Presence
export const onUserOnline = createSocketListener<SocketUserPresencePayload>("user_online");

export const onUserOffline = createSocketListener<SocketUserPresencePayload>("user_offline");

export const onOnlineUsersList = createSocketListener<{ userIds: string[] }>("online_users_list");

export const onUnreadTotal = createSocketListener<SocketUnreadTotalPayload>("unread_total");

export const onRateLimitExceeded = createSocketListener<SocketRateLimitPayload>("rate_limit_exceeded");

// Connection events
export const onConnect = createSocketListener<void>("connect");

export const onDisconnect = createSocketListener<string>("disconnect");

export const onConnectError = createSocketListener<Error>("connect_error");

// Notification events
export const onNotification = createSocketListener<SocketNotificationEvent>("notification");
