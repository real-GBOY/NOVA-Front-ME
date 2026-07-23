/** @format */

import { useEffect, ReactNode } from "react";
import { getSocket } from "./socket";
import { getLoginStatus } from "@/config/axios";
import {
	onConnect,
	onDisconnect,
	onConnectError,
	onUnreadTotal,
	onUserOnline,
	onUserOffline,
	onReceiveMessage,
	onNotification,
} from "@/services/chat/socketService";
import { addNotification } from "@/services/notifications/notificationsStore";
import { transformEventToNotification } from "@/services/notifications/notificationEvents";
import { toast } from "sonner";
import type { Room } from "@/services/chat/types";
import { useQueryClient } from "@tanstack/react-query";
import { sendHeartbeat } from "@/services/chat/socketService";
import { getCurrentUserId } from "@/utils/auth";

interface SocketProviderProps {
	children: ReactNode;
}

// Global heartbeat interval reference to prevent duplicates
let globalHeartbeatInterval: ReturnType<typeof setInterval> | null = null;
// Session ID to prevent old intervals from sending heartbeats after HMR
let currentSessionId = Math.random().toString(36).substring(7);

/**
 * SocketProvider - Initializes socket connection at the highest level (Best Practice #14)
 * This prevents reconnecting every time a component mounts
 */
export const SocketProvider = ({ children }: SocketProviderProps) => {
	const queryClient = useQueryClient();

	useEffect(() => {
		// Only initialize socket if user is logged in
		if (!getLoginStatus()) {
			return;
		}

		// Initialize socket connection
		const socket = getSocket();
		if (!socket) {
			return;
		}

		// Set up connection event handlers (Best Practice #5: Error handling)
		const cleanupConnect = onConnect(() => {
		});

		const cleanupDisconnect = onDisconnect(() => {
		});

		const cleanupError = onConnectError((error) => {
			console.error("Socket connection error:", error.message);
		});

		// Listen for unread total updates
		const cleanupUnreadTotal = onUnreadTotal((data) => {
			queryClient.setQueryData(["chat", "unread-total"], data);
		});

		// Listen for user presence updates
		const cleanupUserOnline = onUserOnline(() => {
		});

		const cleanupUserOffline = onUserOffline(() => {
		});

		const currentUserId = getCurrentUserId();
		const currentUserIdNum = currentUserId ? Number(currentUserId) : null;

		// Listen for new messages globally to update rooms cache and unread counts
		// This ensures the unread badge updates even when user is not in the chat page
		const cleanupReceiveMessage = onReceiveMessage((message) => {
			const isOwnMessage =
				currentUserIdNum !== null && message.sender_id === currentUserIdNum;

			// Update all possible room query keys (with and without search)
			const roomsQueries = queryClient.getQueryCache().findAll({
				queryKey: ["chat", "rooms"],
			});

			roomsQueries.forEach((query) => {
				const queryKey = query.queryKey;
				queryClient.setQueryData<{ data: Room[]; total: number }>(
					queryKey,
					(old) => {
						if (!old) return old;

						return {
							...old,
							data: old.data.map((room) => {
								if (room.room_id === message.room_id) {
									const currentUnreadCount =
										typeof room.unread_count === "number"
											? room.unread_count
											: 0;
									const nextUnreadCount = isOwnMessage
										? currentUnreadCount
										: currentUnreadCount + 1;

									return {
										...room,
										last_message_at: message.timestamp,
										last_message: {
											message_id: message.message_id,
											message_text: message.message_text,
											timestamp: message.timestamp,
											sender_id: message.sender_id,
											sender_name: null,
											has_attachment: !!message.attachment_file_id,
											attachment_mime_type: message.attachment?.mime_type || null,
										},
										has_unread: isOwnMessage ? room.has_unread : true,
										unread_count: nextUnreadCount,
									};
								}
								return room;
							}),
						};
					}
				);
			});

			// Invalidate unread total to refetch the latest count
			if (!isOwnMessage) {
				queryClient.invalidateQueries({
					queryKey: ["chat", "unread-total"],
					refetchType: "active",
				});
			}
		});

		// Listen for notification events from backend
		const cleanupNotification = onNotification((event) => {
			const notification = transformEventToNotification(event);
			addNotification(notification);
			// Show a toast for real-time feedback
			toast(notification.title, {
				description: notification.body,
				position: "top-center",
			});
		});

		// Set up heartbeat interval (Best Practice: Maintain online presence)
		// Backend allows 1 heartbeat per 25 seconds
		// We use 30 seconds to stay safely within the limit (5 second buffer)
		// Clear any existing interval first (HMR safety)
		if (globalHeartbeatInterval) {
			clearInterval(globalHeartbeatInterval);
			globalHeartbeatInterval = null;
		}

		// Generate new session ID to invalidate old intervals
		const sessionId = Math.random().toString(36).substring(7);
		currentSessionId = sessionId;

		// Create new heartbeat interval
		globalHeartbeatInterval = setInterval(() => {
			// Only send heartbeat if this is the current session (prevents old intervals)
			if (sessionId !== currentSessionId) {
				return;
			}

			const currentSocket = getSocket();
			if (currentSocket?.connected) {
				sendHeartbeat((response) => {
					if (!response.success) {
						console.error("Heartbeat failed:", response);
					}
				});
			}
		}, 30000); // Every 30 seconds (backend limit: 1 per 25s, 5s safety buffer)

		// Cleanup on unmount
		// FIXED: Don't disconnect socket on unmount - it should persist across the app
		// Only cleanup event listeners, not the socket connection itself
		return () => {
			cleanupConnect();
			cleanupDisconnect();
			cleanupError();
			cleanupUnreadTotal();
			cleanupUserOnline();
			cleanupUserOffline();
			cleanupReceiveMessage();
			cleanupNotification();
			// Clear global heartbeat interval
			if (globalHeartbeatInterval) {
				clearInterval(globalHeartbeatInterval);
				globalHeartbeatInterval = null;
			}
			// Removed disconnectSocket() - socket should persist
		};
	}, [queryClient]);

	return <>{children}</>;
};
