/** @format */

import { useEffect } from "react";
import { joinRoom, leaveRoom } from "@/services/chat/socketService";

/**
 * Hook for managing active room subscription via Socket.io
 *
 * HYBRID SUBSCRIPTION MODEL:
 * - Personal room (user_{id}): Receives ALL messages from ALL rooms (auto-joined on connection)
 * - Active room (room_{id}): Receives typing, recording, read receipts for current chat only
 *
 * This hook manages the active room subscription (join/leave as user switches chats)
 */
export const useChatRoom = (roomId: number | null) => {
	useEffect(() => {
		if (!roomId) {
			return;
		}

		// Join active room for typing, recording, read receipts
		joinRoom(roomId, (response) => {
			if (!response.success) {
				console.error('❌ [useChatRoom] Failed to join room:', response.error);
			}
		});

		// Leave active room when switching to another chat
		return () => {
			leaveRoom(roomId, (response) => {
				void response;
			});
		};
	}, [roomId]);
};
