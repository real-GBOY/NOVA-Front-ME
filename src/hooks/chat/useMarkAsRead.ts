/** @format */

import { useEffect, useRef } from "react";
import type { Message } from "@/services/chat/types";

/**
 * Hook to automatically mark messages as read when viewing a chat
 *
 * Logic:
 * - Waits 500ms after the last message appears before marking as read
 * - Only marks messages from other users (not own messages)
 * - Prevents duplicate marking by tracking last marked message ID
 * - Cleans up timeouts properly
 */
export const useMarkAsRead = (
	messages: Message[],
	roomId: number | null,
	currentUserId: number | null,
	markAsRead: (messageId: number) => void
) => {
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const lastMarkedMessageIdRef = useRef<number | null>(null);
	const previousRoomIdRef = useRef<number | null>(null);

	useEffect(() => {
		// Clear any pending timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		// Reset tracking only when room changes
		if (previousRoomIdRef.current !== roomId) {
			lastMarkedMessageIdRef.current = null;
			previousRoomIdRef.current = roomId;
		}

		// Early returns for invalid states
		if (!messages.length || !roomId || !currentUserId) {
			return;
		}

		const lastMessage = messages[messages.length - 1];

		// Skip if:
		// - Last message is from current user
		// - Message ID is invalid
		// - Already marked this message
		if (
			lastMessage.sender_id === currentUserId ||
			lastMessage.message_id <= 0 ||
			lastMessage.message_id === lastMarkedMessageIdRef.current
		) {
			return;
		}

		// Set timeout to mark as read after 500ms
		timeoutRef.current = setTimeout(() => {
			// Verify the last message hasn't changed
			const currentLastMessage = messages[messages.length - 1];
			if (
				!currentLastMessage ||
				currentLastMessage.message_id !== lastMessage.message_id ||
				currentLastMessage.sender_id === currentUserId ||
				currentLastMessage.message_id <= 0 ||
				currentLastMessage.message_id === lastMarkedMessageIdRef.current
			) {
				return;
			}

			// Mark as read
			lastMarkedMessageIdRef.current = currentLastMessage.message_id;
			markAsRead(currentLastMessage.message_id);
			timeoutRef.current = null;
		}, 500);

		// Cleanup function
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		};
	}, [messages, roomId, currentUserId, markAsRead]);
};
