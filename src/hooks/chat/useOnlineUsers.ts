/** @format */

import { useState, useEffect, useCallback } from "react";
import {
	onUserOnline,
	onUserOffline,
	onOnlineUsersList,
	getOnlineUsers,
	onConnect,
} from "@/services/chat/socketService";
import { getSocket } from "@/services/socket/socket";
import type {
	SocketUserPresencePayload,
	SocketOnlineUsersListPayload,
} from "@/services/chat/types";

/**
 * Hook to track online users in real-time
 * Listens to user_online and user_offline socket events
 */
export const useOnlineUsers = () => {
	const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());

	useEffect(() => {
		// Handle initial online users list
		const cleanupList = onOnlineUsersList(
			(data: SocketOnlineUsersListPayload) => {
				setOnlineUsers(new Set(data.userIds.map((id) => Number(id))));
			}
		);

		// Handle user coming online
		const cleanupOnline = onUserOnline((data: SocketUserPresencePayload) => {
			setOnlineUsers((prev) => {
				const updated = new Set(prev);
				updated.add(data.userId);
				return updated;
			});
		});

		// Handle user going offline
		const cleanupOffline = onUserOffline((data: SocketUserPresencePayload) => {
			setOnlineUsers((prev) => {
				const updated = new Set(prev);
				updated.delete(data.userId);
				return updated;
			});
		});

		// Request initial list immediately if connected
		const socket = getSocket();
		if (socket?.connected) {
			getOnlineUsers();
		}

		// Listen for connection event to request list
		const cleanupConnect = onConnect(() => {
			getOnlineUsers();
		});

		// Cleanup listeners on unmount
		return () => {
			cleanupList();
			cleanupOnline();
			cleanupOffline();
			cleanupConnect();
		};
	}, []);

	/**
	 * Check if a user is online
	 */
	const isUserOnline = useCallback(
		(userId: number | null | undefined): boolean => {
			if (userId === null || userId === undefined) return false;
			return onlineUsers.has(Number(userId));
		},
		[onlineUsers]
	);

	return {
		onlineUsers,
		isUserOnline,
	};
};
